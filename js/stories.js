"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

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
  // console.debug("generateStoryMarkup", story);

  const hostName = story.getHostName();
  return $(`
      <li id="${story.storyId}">
        <span class="favorite"><i class="far fa-star"></i></span>
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}



/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }
  $allStoriesList.show();
}


async function submitNewStory(event) {
  event.preventDefault();
  const author = $("#story-author").val();
  const title = $("#story-title").val();
  const url = $("#story-url").val();
  const username = currentUser.username
  const newStory = {author: author, title: title, url: url, username: username};
  await storyList.addStory(currentUser, newStory);
  $("#story-author").val('');
  $("#story-title").val('');
  $("story-url").val('');
  $newStoryForm.hide();
}

$newStoryForm.on("submit", submitNewStory);

//use event delegation to add an event listener for favorites
$allStoriesList.on('click', function(event){
  if(event.target.classList.contains('far')){
    console.log(event.currentTarget.firstChild.id);
    addFavorite(event);
  }
  if (event.target.classList.contains('fas')){
    removeFavorite(event);
  }
});

function addFavorite(star){
  //change open star to solid star
  star.target.parentElement.innerHTML = '<i class="fas fa-star"></i>'
  //get storyId from parent
  const storyId = star.currentTarget.firstChild.id;
  //run currentUser.favorite
  currentUser.favorite(storyId);
}

function removeFavorite(star){
  //change solid star to open star
  star.target.parentElement.innerHTML = '<i class="far fa-star"></i>'
  //get storyId from parent
  const storyId = star.currentTarget.firstChild.id;
  //run currentUser.unfavorite
  currentUser.unfavorite(storyId);
}