"use strict";

// So we don't have to keep re-finding things on page, find DOM elements once:

const $body = $("body");

const $storiesLoadingMsg = $("#stories-loading-msg");
const $allStoriesList = $("#all-stories-list");

const $loginForm = $("#login-form");
const $signupForm = $("#signup-form");

const $newStoryForm = $("#story-form");
const $editStoryForm = $("#story-edit");

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
  //when the user clicks on the edit icon
  //an edit form opens
  //and fills with the requisite data
  //which can then be edited by the user
  //and they can hit submit which will send the data to the update story link via axios
  //the my stories page will change to the correct information
  //the main stories page will also change to the correct information
//Add user profile to change name and password
//style for mobile devices
//Add infinite scroll
//add time since post
//make the host name a link of stories from that host
//clicking on user name gives you a list of the user's stories
