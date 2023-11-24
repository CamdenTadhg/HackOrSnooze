"use strict";

// So we don't have to keep re-finding things on page, find DOM elements once:

const $body = $("body");

const $storiesLoadingMsg = $("#stories-loading-msg");
const $allStoriesList = $("#all-stories-list");

const $loginForm = $("#login-form");
const $signupForm = $("#signup-form");

const $newStoryForm = $("#story-form");

const $navHome = $('#navbar-brand');
const $navSubmit = $("#nav-submit");
const $navFavorites = $("#nav-favs");
const $navMyStories = $('#nav-stories');
const $navLogin = $("#nav-login");
const $navUserProfile = $("#nav-user-profile");
const $navLogOut = $("#nav-logout");


/** To make it easier for individual components to show just themselves, this
 * is a useful function that hides pretty much everything on the page. After
 * calling this, individual components can re-show just what they want.
 */

function hidePageComponents() {
  const components = [
    $allStoriesList,
    $loginForm,
    $signupForm,
    $newStoryForm,
  ];
  components.forEach(c => c.hide());
}

/** Overall function to kick off the app. */

async function start() {

  // "Remember logged-in user" and log in, if credentials in localStorage
  await checkForRememberedUser();
    //if we don't have a logged-in user, hide certain components
    if (currentUser) {
      $navSubmit.show();
      $navFavorites.show();
      $navMyStories.show();
    }
  await getAndShowStoriesOnStart();

  // if we got a logged-in user
  if (currentUser) updateUIOnUserLogin();


}

// Once the DOM is entirely loaded, begin the app
$(start);




//Allow editing stories created by user
  //need something to click for editing
  //send request to edit story
  //update story in user interface
//Add user profile to change name and password
//style for mobile devices
//Add infinite scroll
//add time since post
//make the host name a link
//clicking on user name gives you a list of the user's stories
//add sort by most favorites