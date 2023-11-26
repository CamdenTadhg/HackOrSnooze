"use strict";

// This is the global list of the stories, an instance of StoryList
let mainStoryList;
let favoritesList;
let myStoriesList;
let offsetCounter = 0;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  mainStoryList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage(mainStoryList, $allStoriesList);
}



/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) {
  const hostName = story.getHostName();
  const timeSince = story.calculateTime();
  const star = getStar(story);
  return $(`
  <li id="${story.storyId}">
    <container class="story-container">
    <div class="one">
      ${star}
    </div>
    <div class="two">
    <a href="${story.url}" target="a_blank" class="story-link">
      ${story.title}
    </a>
    <small class="story-hostname">(${hostName})</small>
    <span class="story-author">by ${story.author}</span>
    <span class="story-user">posted by ${story.username}</span>
    <small class="time-since">(${timeSince})</small>
    </div>
    </container>
    <hr>
  </li>
`);
}


function getStar(story) {
  if (currentUser === undefined){
    return '<span class="favorite"><i class="far fa-star"></i></span>';
  }
  else if (currentUser.favorites.filter(e => e.storyId === story.storyId).length > 0 ) {
    return "<span class='favorite'><i class='fas fa-star'></i></span>";
  } else {
    return '<span class="favorite"><i class="far fa-star"></i></span>';
  }
}



/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage(storyList, targetList) {
  hidePageComponents();
  targetList.empty();
  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    targetList.append($story);
  }
  targetList.show();
}

//appends additional stories without clearing the existing story list
function putMoreStoriesOnPage(storyList, targetList) {
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    targetList.append($story);
  }
}

//using the submit form to submit a new story. 
async function submitNewStory(event) {
  event.preventDefault();
  const author = $("#story-author").val();
  const title = $("#story-title").val();
  const url = $("#story-url").val();
  const username = currentUser.username
  const newStory = {author: author, title: title, url: url, username: username};
  await mainStoryList.addStory(currentUser, newStory);
  putStoriesOnPage(mainStoryList, $allStoriesList);
  $("#story-author").val('');
  $("#story-title").val('');
  $("#story-url").val('');
  $newStoryForm.hide();
  offsetCounter = 0;
}

$newStoryForm.on("submit", submitNewStory);

//use event delegation to add event listeners to story lists
$allStoriesList.on('click', function(event){
  if(currentUser === undefined) {
    return;
  }
  if(event.target.classList.contains('far') && event.target.classList.contains('fa-star')){
    addFavorite(event);
  }
  if (event.target.classList.contains('fas') && event.target.classList.contains('fa-star')){
    removeFavorite(event);
  }
  if (event.target.classList.contains('story-hostname')){
    showHostNameList(event);
  }
  if (event.target.classList.contains('story-user')){
    showUsernameList(event);
  }
});

$favoritesList.on('click', function(event){
  if(event.target.classList.contains('far') && event.target.classList.contains('fa-star')){
    addFavorite(event);
  }
  if (event.target.classList.contains('fas') && event.target.classList.contains('fa-star')){
    removeFavorite(event);
  }
  if (event.target.classList.contains('story-hostname')){
    showHostNameList(event);
  }
  if (event.target.classList.contains('story-user')){
    showUsernameList(event);
  }
})

$myStoriesList.on('click', function(event){
  if(event.target.classList.contains('far') && event.target.classList.contains('fa-star')){
    addFavorite(event);
  }
  if (event.target.classList.contains('fas') && event.target.classList.contains('fa-star')){
    removeFavorite(event);
  }
  if (event.target.classList.contains('fa-trash-alt')){
    let storyId = event.target.parentElement.parentElement.parentElement.parentElement.id;
    currentUser.deleteStory(storyId);
  }
  if (event.target.classList.contains('fa-pencil-alt')){
    let storyId = event.target.parentElement.parentElement.parentElement.parentElement.id;
    editStoryForm(storyId);
  }
  if (event.target.classList.contains('story-hostname')){
    showHostNameList(event);
  }
  if (event.target.classList.contains('story-user')){
    showUsernameList(event);
  }
})

$hostNameList.on('click', function(event){
  if(event.target.classList.contains('far') && event.target.classList.contains('fa-star')){
    addFavorite(event);
  }
  if (event.target.classList.contains('fas') && event.target.classList.contains('fa-star')){
    removeFavorite(event);
  }
  if (event.target.classList.contains('story-hostname')){
    showHostNameList(event);
  }
  if (event.target.classList.contains('story-user')){
    showUsernameList(event);
  }
})

$usernameList.on('click', function(event){
  if(event.target.classList.contains('far') && event.target.classList.contains('fa-star')){
    addFavorite(event);
  }
  if (event.target.classList.contains('fas') && event.target.classList.contains('fa-star')){
    removeFavorite(event);
  }
  if (event.target.classList.contains('story-hostname')){
    showHostNameList(event);
  }
  if (event.target.classList.contains('story-user')){
    showUsernameList(event);
  }
})

function addFavorite(event){
  //get storyId from parent
  const storyId = event.target.parentElement.parentElement.parentElement.parentElement.id;
  //change open star to solid star
  event.target.parentElement.innerHTML = '<i class="fas fa-star"></i>'
  //run currentUser.favorite
  currentUser.favorite(storyId);
}

function removeFavorite(event){
  //get storyId from parent
  const storyId = event.target.parentElement.parentElement.parentElement.parentElement.id;
    //change solid star to open star
  event.target.parentElement.innerHTML = '<i class="far fa-star"></i>'
  //run currentUser.unfavorite
  currentUser.unfavorite(storyId);
}

  //display favoritesList instance
async function showFavorites(){
  $favoritesList.empty();
  favoritesList = await currentUser.getFavorites();
  hidePageComponents();
  for (let favorite of favoritesList.stories)  {
    const $story = generateStoryMarkup(favorite);
    $favoritesList.prepend($story);
  }
  $favoritesList.show();
}

function generateMyStoriesMarkup(story){
  const hostName = story.getHostName();
  const timeSince = story.calculateTime();
  const star = getStar(story);
  return $(`
    <li id="${story.storyId}">
      <container class="my-story-container">
      <div class="one">
        <span class="delete"><i class="fas fa-trash-alt"></i></span>
        <span class="edit"><i class="fas fa-pencil-alt"></i></span>
        ${star}
      </div>
      <div class="two">
      <a href="${story.url}" target="a_blank" class="story-link">
        ${story.title}
      </a>
      <small class="story-hostname">(${hostName})</small>
      <span class="story-author">by ${story.author}</span>
      <span class="story-user">posted by ${story.username}</span>
      <small class="time-since">(${timeSince})</small>
      </div>
      </container>
      <hr>
    </li>
  `);
}

async function showMyStories(){
  $myStoriesList.empty();
  myStoriesList = await currentUser.getMyStories();
  hidePageComponents();
  for (let story of myStoriesList.stories) {
    const $story = generateMyStoriesMarkup(story);
    $myStoriesList.prepend($story);
  }
  $myStoriesList.show();
}


async function showHostNameList(event){
  hidePageComponents();
  //save host name to a variable
  let hostNameVar = event.target.innerText;
  hostNameVar = hostNameVar.slice(1, -1);
  //get a list of stories
  let searchableList = await StoryList.getStories();
  let searchedStories = [];
  let searchList = {};
  //filter stories by the selected hostname
  for (let story of searchableList.stories){
    if (hostNameVar === story.getHostName()){
      searchedStories.push(story);
    }
  }
  searchList.stories = searchedStories;
  //display the filtered stories
  $hostNameList.empty();
  putStoriesOnPage(searchList, $hostNameList);
  $hostNameList.show();
  offsetCounter = 0;
  //start a while loop to filter remaining stories
  while (searchableList.stories.length > 0){
    offsetCounter += 25;
    searchableList = await StoryList.getMoreStories();
    searchedStories = [];
    searchList = {};
    for (let story of searchableList.stories){
      if(hostNameVar === story.getHostName()) {
        searchedStories.push(story);
      }
    }
    searchList.stories = searchedStories;
    putMoreStoriesOnPage(searchList, $hostNameList);
  }
  offsetCounter = 0;
}

async function showUsernameList(event){
  hidePageComponents();
  //save username to a variable
  let usernameVar = event.target.innerText;
  usernameVar = usernameVar.slice(10);
  //get a list of stories
  let searchableList = await StoryList.getStories();
  let searchedStories = [];
  let searchList = {};
  //filter stories by the selected username
  for (let story of searchableList.stories){
    if (usernameVar === story.username){
      searchedStories.push(story);
    }
  }
  searchList.stories = searchedStories;
  //display the filtered stories
  $usernameList.empty();
  putStoriesOnPage(searchList, $usernameList);
  $usernameList.show();
  offsetCounter = 0;
  //start a while loop to filter remaining stories
  while (searchableList.stories.length > 0){
    offsetCounter += 25;
    searchableList = await StoryList.getMoreStories();
    searchedStories = [];
    searchList = {};
    for (let story of searchableList.stories){
      if (usernameVar === story.username) {
        searchedStories.push(story);
      }
    }
    searchList.stories = searchedStories;
    putMoreStoriesOnPage(searchList, $usernameList);
  }
  offsetCounter = 0;
}

let editStory 

async function editStoryForm(storyId){
  //open an edit form
  $editStoryForm.show();
  //pull the story from the database
  const response = await axios ({
    url: `${BASE_URL}/stories/${storyId}`,
    method: "GET"
  })
  editStory = new Story(response.data.story);
  //and fill in the requisite data
  $('#edit-author').val(editStory.author);
  $('#edit-title').val(editStory.title);
  $('#edit-url').val(editStory.url);
}

async function submitEditForm(event){
  //allow user to edit the data
  event.preventDefault();
  const author = $('#edit-author').val();
  const title = $('#edit-title').val();
  const url = $('#edit-url').val();
  const storyId = editStory.storyId;
  const storyData = {author: author, title: title, url: url};
  //submit the new data 
  await currentUser.edit(storyId, storyData);
  //clear and hide the form
  $("#edit-author").val('');
  $('#edit-title').val('');
  $('#edit-url').val('');
  $editStoryForm.hide();
  //my stories list changes to updated information
  myStoriesList = await StoryList.getStories();
  showMyStories(myStoriesList);
}

$editStoryForm.on("submit", submitEditForm);

$(window).scroll(infiniteScroll);

async function infiniteScroll(){
  if ($(window).scrollTop() >= $(document).height() - $(window).height() - 1) {
    offsetCounter = offsetCounter + 25;
    const newStories = await StoryList.getMoreStories();
    putMoreStoriesOnPage(newStories, $allStoriesList);
  }
}

//allow user to close submit form and edit form
function hideForm(event){
  if (event.target.parentElement.id === "story-form"){
    $newStoryForm.hide();
  }
  if (event.target.parentElement.id === "story-edit"){
    $editStoryForm.hide();
  }
}

$close.on('click', hideForm);