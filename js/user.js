"use strict";

// global to hold the User instance of the currently-logged-in user
let currentUser;

/******************************************************************************
 * User login/signup/login
 */

/** Handle login form submission. If login ok, sets up the user instance */

async function login(evt) {
  evt.preventDefault();

  // grab the username and password
  const username = $("#login-username").val();
  const password = $("#login-password").val();

  //clear existing error messages
  if ($('.error')){
    const $error = $('.error');
    $error.remove();
  }

  // User.login retrieves user info from API and returns User instance
  // which we'll make the globally-available, logged-in user.
  currentUser = await User.login(username, password);

  $loginForm.trigger("reset");

  saveUserCredentialsInLocalStorage();
  updateUIOnUserLogin();
}

$loginForm.on("submit", login);

/** Handle signup form submission. */

async function signup(evt) {
  evt.preventDefault();

  const name = $("#signup-name").val();
  const username = $("#signup-username").val();
  const password = $("#signup-password").val();

    //clear existing error messages
    if ($('.error')){
      const $error = $('.error');
      $error.remove();
    }

  // User.signup retrieves user info from API and returns User instance
  // which we'll make the globally-available, logged-in user.
  currentUser = await User.signup(username, password, name);

  saveUserCredentialsInLocalStorage();
  updateUIOnUserLogin();

  $signupForm.trigger("reset");
}

$signupForm.on("submit", signup);

/** Handle click of logout button
 *
 * Remove their credentials from localStorage and refresh page
 */

function logout(evt) {
  localStorage.clear();
  location.reload();
}

$navLogOut.on("click", logout);

/******************************************************************************
 * Storing/recalling previously-logged-in-user with localStorage
 */

/** If there are user credentials in local storage, use those to log in
 * that user. This is meant to be called on page load, just once.
 */

async function checkForRememberedUser() {
  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username");
  if (!token || !username) return false;

  // try to log in with these credentials (will be null if login failed)
  currentUser = await User.loginViaStoredCredentials(token, username);
}

/** Sync current user information to localStorage.
 *
 * We store the username/token in localStorage so when the page is refreshed
 * (or the user revisits the site later), they will still be logged in.
 */

function saveUserCredentialsInLocalStorage() {
  if (currentUser) {
    localStorage.setItem("token", currentUser.loginToken);
    localStorage.setItem("username", currentUser.username);
  }
}

/******************************************************************************
 * General UI stuff about users
 */

/** When a user signs up or registers, we want to set up the UI for them:
 *
 * - show the stories list
 * - update nav bar options for logged-in user
 * - generate the user profile part of the page
 * - allow them to change their name and password
 */

function updateUIOnUserLogin() {
  $allStoriesList.show();
  updateNavOnLogin();
}

function fillUserProfile() {
  //fill user profile page with currentUser information
  $profileUsername.text('Username: ' + currentUser.username);
  $profileName.html('Name: ' + currentUser.name);
  const date = new Date(currentUser.createdAt)
  $profileCreated.text(`Account Created: ${date.getMonth()}/${date.getDate()}/${date.getFullYear()}`);
}

async function changeName() {
    //clicking on change links opens a text input to change and a button to submit
  const $changeNameForm = $('<input id="change-name-form" type="text" placeholder="name"><button id="change-name-button">Change</button>')
  $profileName.append($changeNameForm);
  const $changeNameButton = $('#change-name-button');
  //clicking the button submits the new data to the database
  $changeNameButton.on('click', function(){
    const newName = $('#change-name-form').val();
    currentUser.patchName(newName);
    //current instance and profile page update to new name
    currentUser.name = newName
    $profileName.html('Name: '+ currentUser.name);
  })
}

async function changePassword() {
    //clicking on change links opens a text input to change and a button to submit
  const $changePasswordForm = $('<input id="change-password-form" type="password" placeholder="password"><button id="change-password-button">Change</button>');
  $profilePassword.append($changePasswordForm);
  const $changePasswordButton = $('#change-password-button');
  //clicking the button submits the new data to the database
  $changePasswordButton.on('click', function(){
    const newPassword = $('#change-password-form').val();
    currentUser.patchPassword(newPassword);
  })
}

$changeName.on('click', changeName);
$changePassword.on("click", changePassword);