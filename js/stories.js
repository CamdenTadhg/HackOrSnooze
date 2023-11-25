"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;
let favoritesList;
let myStoriesList;
let offsetCounter = 0;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}



/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) {
  const hostName = story.getHostName();
  const star = getStar(story);
  return $(`
  <li id="${story.storyId}">
    <container class="story-container">
    ${star}
    <div class="two">
    <a href="${story.url}" target="a_blank" class="story-link">
      ${story.title}
    </a>
    <small class="story-hostname">(${hostName})</small>
    <span class="story-author">by ${story.author}</span>
    <span class="story-user">posted by ${story.username}</span>
    </div>
    </container>
    <hr>
  </li>
`);
}


function getStar(story) {
  if (currentUser === undefined){
    return '<span class="favorite one"><i class="far fa-star"></i></span>';
  }
  else if (currentUser.favorites.filter(e => e.storyId === story.storyId).length > 0 ) {
    return "<span class='favorite one'><i class='fas fa-star'></i></span>";
  } else {
    return '<span class="favorite one"><i class="far fa-star"></i></span>';
  }
}



/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }
  $allStoriesList.show();
}

//appends additional stories from infinite scroll function
function putMoreStoriesOnPage(newStories) {
  for (let story of newStories.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
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
  await storyList.addStory(currentUser, newStory);
  putStoriesOnPage();
  $("#story-author").val('');
  $("#story-title").val('');
  $("#story-url").val('');
  $newStoryForm.hide();
}

$newStoryForm.on("submit", submitNewStory);

//use event delegation to add an event listener for favorites & deleting
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
  if (event.target.classList.contains('fa-trash-alt')){
    let storyId = event.target.parentElement.parentElement.parentElement.parentElement.id;
    currentUser.deleteStory(storyId);
  }
  if (event.target.classList.contains('fa-pencil-alt')){
    let storyId = event.target.parentElement.parentElement.parentElement.parentElement.id;
    editStoryForm(storyId);
  }
});

function addFavorite(event){
  console.log('entering addFavorite');
  //get storyId from parent
  const storyId = event.target.parentElement.parentElement.parentElement.id;
  //change open star to solid star
  event.target.parentElement.innerHTML = '<i class="fas fa-star"></i>'
  //run currentUser.favorite
  currentUser.favorite(storyId);
}

function removeFavorite(event){
  //get storyId from parent
  const storyId = event.target.parentElement.parentElement.parentElement.id;
    //change solid star to open star
  event.target.parentElement.innerHTML = '<i class="far fa-star"></i>'
  //run currentUser.unfavorite
  currentUser.unfavorite(storyId);
}

  //display favoritesList instance
  async function showFavorites(){
  favoritesList = await currentUser.getFavorites();
  $allStoriesList.empty();
  for (let favorite of favoritesList.stories)  {
    const $story = generateFavoritesMarkup(favorite);
    $allStoriesList.prepend($story);
  }
  $allStoriesList.show();
}

function generateFavoritesMarkup(story){
  const hostName = story.getHostName();
  return $(`
  <li id="${story.storyId}">
    <container class="story-container">
    <span class="favorite one"><i class="fas fa-star"></i></span>
    <div class="two">
    <a href="${story.url}" target="a_blank" class="story-link">
      ${story.title}
    </a>
    <small class="story-hostname">(${hostName})</small>
    <span class="story-author">by ${story.author}</span>
    <span class="story-user">posted by ${story.username}</span>
    </div>
    </container>
    <hr>
  </li>
`);
}

function generateMyStoriesMarkup(story){
  const hostName = story.getHostName();
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
      </div>
      </container>
      <hr>
    </li>
  `);
}

async function showMyStories(){
  myStoriesList = await currentUser.getMyStories();
  $allStoriesList.empty();
  for (let story of myStoriesList.stories) {
    const $story = generateMyStoriesMarkup(story);
    $allStoriesList.prepend($story);
  }
  $allStoriesList.show();
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
  storyList = await StoryList.getStories();
  showMyStories();
}

$editStoryForm.on("submit", submitEditForm);

$(window).scroll(infiniteScroll);

async function infiniteScroll(){
  if ($(window).scrollTop() >= $(document).height() - $(window).height() - 1) {
    offsetCounter = offsetCounter + 25;
    const newStories = await StoryList.getMoreStories();
    putMoreStoriesOnPage(newStories);
  }
}

function hideForm(event){
  if (event.target.parentElement.id === "story-form"){
    $newStoryForm.hide();
  }
  if (event.target.parentElement.id === "story-edit"){
    $editStoryForm.hide();
  }
}

$close.on('click', hideForm);