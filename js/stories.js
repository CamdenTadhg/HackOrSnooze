"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;
let favoritesList;
let myStoriesList;

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
    console.log(event.target.parentElement.parentElement.id);
    currentUser.deleteStory(event.target.parentElement.parentElement.id);
  }
});

function addFavorite(event){
  //get storyId from parent
  const storyId = event.target.parentElement.parentElement.id;
  //change open star to solid star
  event.target.parentElement.innerHTML = '<i class="fas fa-star"></i>'
  //run currentUser.favorite
  currentUser.favorite(storyId);
}

function removeFavorite(event){
  //get storyId from parent
  const storyId = event.target.parentElement.parentElement.id;
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
    $allStoriesList.append($story);
  }
  $allStoriesList.show();
}

function generateFavoritesMarkup(story){
  const hostName = story.getHostName();
  return $(`
  <li id="${story.storyId}">
    <container class="story-container>
    <span class="favorite"><i class="fas fa-star"></i></span>
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
    $allStoriesList.append($story);
  }
  $allStoriesList.show();
}