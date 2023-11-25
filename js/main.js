"use strict";

// So we don't have to keep re-finding things on page, find DOM elements once:

const $body = $("body");

const $storiesLoadingMsg = $("#stories-loading-msg");
const $allStoriesList = $("#all-stories-list");

const $loginForm = $("#login-form");
const $signupForm = $("#signup-form");

const $newStoryForm = $("#story-form");
const $editStoryForm = $("#story-edit");
const $userProfile = $("#user-profile");
const $close = $('.close');

const $navHome = $('#navbar-brand');
const $navSubmit = $("#nav-submit");
const $navFavorites = $("#nav-favs");
const $navMyStories = $('#nav-stories');
const $navLogin = $("#nav-login");
const $navUserProfile = $("#nav-user-profile");
const $navLogOut = $("#nav-logout");

const $profileName = $('#profile-name');
const $profileUsername = $('#profile-username');
const $profilePassword = $('#profile-password');
const $profileCreated = $('#profile-created');
const $changeName = $('#change-name');
const $changePassword = $('#change-password');


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


//5. bug: when I add a story, infinite scroll stops working
//4. make the host name a link of stories from that host
  //when click on host name
  //save host name as a variable
  //get stories with a higher associated limit
  //use if statement to only display stories with the correct host
  //ensure infinite scroll continues process
//3. clicking on user name gives you a list of the user's stories
  //when click user name
  //save user name as a variable
  //get stories with a higher associated limit
  //use if statement to only display stories with the correct host
  //ensure infinite scroll continues process
//2. style for mobile devices
  //make home stories list appear like favorites and mystories lists
//1. readMe