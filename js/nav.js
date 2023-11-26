"use strict";

/******************************************************************************
 * Handling navbar clicks and updating navbar
 */

/** Show main list of all stories when click site name */

async function navAllStories(evt) {
  hidePageComponents();
  mainStoryList = await StoryList.getStories();
  putStoriesOnPage(mainStoryList, $allStoriesList);
  offsetCounter = 0;
}

$body.on("click", "#nav-all", navAllStories);

/** Show login/signup on click on "login" */

function navLoginClick(evt) {
  hidePageComponents();
  $loginForm.show();
  $signupForm.show();
}

$navLogin.on("click", navLoginClick);

/** When a user first logins in, update the navbar to reflect that. */

function updateNavOnLogin() {
  $(".main-nav-links").show();
  $navLogin.hide();
  $loginForm.hide();
  $signupForm.hide();
  $navLogOut.show();
  $navSubmit.show();
  $navFavorites.show();
  $navMyStories.show();
  $navUserProfile.text(`${currentUser.username}`).show();
}

// show new story form on click on "submit"

function navSubmitClick() {
  $newStoryForm.show();
}

$navSubmit.on("click", navSubmitClick);

function navFavoritesClick(){
  showFavorites();
}

$navFavorites.on("click", navFavoritesClick);

function navMyStoriesClick(){
  showMyStories();
}

$navMyStories.on("click", navMyStoriesClick);

function navUserProfileClick(){
  fillUserProfile();
}

$navUserProfile.on("click", navUserProfileClick);
