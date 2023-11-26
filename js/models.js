"use strict";

const BASE_URL = "https://hack-or-snooze-v3.herokuapp.com";

/******************************************************************************
 * Story: a single story in the system
 */

class Story {

  /** Make instance of Story from data object about story:
   *   - {title, author, url, username, storyId, createdAt}
   */

  constructor({ storyId, title, author, url, username, createdAt }) {
    this.storyId = storyId;
    this.title = title;
    this.author = author;
    this.url = url;
    this.username = username;
    this.createdAt = createdAt;
  }

  /** Parses hostname out of URL and returns it. */

  getHostName() {
    let url = this.url;
    let index1 = url.indexOf('//') + 2;
    let hostname = url.slice(index1);
    if (hostname.indexOf('/') !== -1){
      let index2 = hostname.indexOf('/');
      hostname=hostname.slice(0, index2);
    }
    return hostname;
  }

//calculates time since posting
  calculateTime(){
    let postTime = new Date(this.createdAt);
    let currentTime = new Date();
    let timeElapsed = currentTime - postTime;
    let hoursElapsed = Math.floor((timeElapsed % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    if (hoursElapsed < 1) {
      let minutesElapsed = Math.floor((timeElapsed % (1000 * 60 * 60)) / (1000 * 60));
      return `${minutesElapsed} minutes ago`;
    } else if (hoursElapsed >= 24) {
      let daysElapsed = Math.floor(timeElapsed / (1000 * 60 * 60 *24));
      return `${daysElapsed} days ago`;
    } else {
      return `${hoursElapsed} hours ago`;
    }
  }
}

/******************************************************************************
 * List of Story instances: used by UI to show story lists in DOM.
 */

class StoryList {
  constructor(stories) {
    this.stories = stories;
  }

  /** Generate a new StoryList. It:
   *
   *  - calls the API
   *  - builds an array of Story instances
   *  - makes a single StoryList instance out of that
   *  - returns the StoryList instance.
   */

  static async getStories() {
    // query the /stories endpoint (no auth required)
    const response = await axios({
      url: `${BASE_URL}/stories`,
      method: "GET",
    });
    // turn plain old story objects from API into instances of Story class
    const stories = response.data.stories.map(story => new Story(story));

    // build an instance of our own class using the new array of stories
    return new StoryList(stories);
  }

  //Generate a new StoryList with an offset to continue the infinite scroll
  static async getMoreStories() {
    const response = await axios({
      url: `${BASE_URL}/stories?skip=${offsetCounter}`,
      method: "GET"
    })
    const stories = response.data.stories.map(story => new Story(story));
    return new StoryList(stories);
  }

  /** Adds story data to API, makes a Story instance, adds it to story list.
   * - user - the current instance of User who will post the story
   * - obj of {title, author, url}
   *
   * Returns the new Story instance
   */

  async addStory(user, {author, title, url}) {
    console.log('entering addStory');
    //add story data to API
    const token = user.loginToken;
    const response = await axios({
      method: "POST",
      url: `${BASE_URL}/stories`,
      data: {token: token, story: {author, title, url}}
    })
    //make a story instance
    const storyInstance = new Story(response.data.story);
    //add to story list
    mainStoryList.stories.unshift(storyInstance);
    putStoriesOnPage(mainStoryList, $allStoriesList);
    //return new story instance
    return storyInstance;
  }
}


/******************************************************************************
 * User: a user in the system (only used to represent the current user)
 */

class User {
  /** Make user instance from obj of user data and a token:
   *   - {username, name, createdAt, favorites[], ownStories[]}
   *   - token
   */

  constructor({
                username,
                name,
                createdAt,
                favorites = [],
                ownStories = []
              },
              token) {
    this.username = username;
    this.name = name;
    this.createdAt = createdAt;

    // instantiate Story instances for the user's favorites and ownStories
    this.favorites = favorites.map(s => new Story(s));
    this.ownStories = ownStories.map(s => new Story(s));

    // store the login token on the user so it's easy to find for API calls.
    this.loginToken = token;
  }

  /** Register new user in API, make User instance & return it.
   *
   * - username: a new username
   * - password: a new password
   * - name: the user's full name
   */

  static async signup(username, password, name) {
    const response = await axios({
      url: `${BASE_URL}/signup`,
      method: "POST",
      data: { user: { username, password, name } },
    }).catch(function(error){
      if (error.response.status === 409){
        //error handling for existing username
        const $username = $('.signup-username');
        const $errormessage = $("<span class='error'>User name is taken. Please try again.</span>");
        $username.append($errormessage);
      }
    });
    let { user } = response.data

    return new User(
      {
        username: user.username,
        name: user.name,
        createdAt: user.createdAt,
        favorites: user.favorites,
        ownStories: user.stories
      },
      response.data.token
    );
  }

  /** Login in user with API, make User instance & return it.

   * - username: an existing user's username
   * - password: an existing user's password
   */

  static async login(username, password) {
    const response = await axios({
      url: `${BASE_URL}/login`,
      method: "POST",
      data: { user: { username, password } },
    }).catch(function(error){
      //error handling for incorrect username and incorrect password
      if (error.response.status === 404){
        const $username = $('.login-username');
        const $errormessage = $('<span class="error">User name does not exist. Please try again.</span>')
        $username.append($errormessage);
      }
      if (error.response.status === 401){
        const $password = $('.login-password');
        const $errormessage = $('<span class="error">Password is incorrect. Please try again.</span>');
        $password.append($errormessage);
      }
    });

    let { user } = response.data;

    return new User(
      {
        username: user.username,
        name: user.name,
        createdAt: user.createdAt,
        favorites: user.favorites,
        ownStories: user.stories
      },
      response.data.token
    );
  }

  /** When we already have credentials (token & username) for a user,
   *   we can log them in automatically. This function does that.
   */

  static async loginViaStoredCredentials(token, username) {
    try {
      const response = await axios({
        url: `${BASE_URL}/users/${username}`,
        method: "GET",
        params: { token },
      });

      let { user } = response.data;

      return new User(
        {
          username: user.username,
          name: user.name,
          createdAt: user.createdAt,
          favorites: user.favorites,
          ownStories: user.stories
        },
        token
      );
    } catch (err) {
      console.error("loginViaStoredCredentials failed", err);
      return null;
    }
  }

  // Method to add an article to your favorites array
  async favorite(storyId){
    console.log('entering favorite');
    console.log(storyId);
    const response = await axios ({
      url: `${BASE_URL}/users/${this.username}/favorites/${storyId}`,
      method: "POST", 
      params: {token: this.loginToken}
    });
    await currentUser.getFavorites();
  }

  //Method to remove an article from the favorites array
  async unfavorite(storyId){
    const response = await axios ({
      url: `${BASE_URL}/users/${this.username}/favorites/${storyId}`,
      method: "DELETE",
      params: {token: this.loginToken}
    });
    await currentUser.getFavorites();
  }

  //create instance of StoryList from favorites array
  async getFavorites(){
    const response = await axios ({
      url: `${BASE_URL}/users/${this.username}`,
      method: "GET", 
      params: {token: this.loginToken}
    });
    this.favorites = response.data.user.favorites.map(story => new Story(story));
    return new StoryList(this.favorites);
  }

  //method to retrieve stories associated with a user account
  async getMyStories(){
    const response = await axios ({
      url: `${BASE_URL}/users/${this.username}`,
      method: "GET",
      params: {token: this.loginToken}
    })
    this.ownStories = response.data.user.stories.map(story => new Story(story));
    return new StoryList(this.ownStories);
  }

//method to delete a story added by the user
  async deleteStory(storyId){
    const response = await axios ({
      url: `${BASE_URL}/stories/${storyId}`,
      method: "DELETE",
      params: {token: this.loginToken}
    })
    myStoriesList = await StoryList.getStories();
    showMyStories();
  }

//method to edit a story added by the user
  async edit(storyId, storyData){
    const response = await axios ({
      url: `${BASE_URL}/stories/${storyId}`,
      method: "PATCH",
      data: {token: this.loginToken, story: storyData}
    })
  }

//method to edit user's name
  async patchName(name){
    const response = await axios ({
      url: `${BASE_URL}/users/${this.username}`,
      method: "PATCH", 
      data: {token: this.loginToken, user: {name: name, password: this.password, username: this.username}}
    })
  }

//method to edit user's password
  async patchPassword(password) {
    const response = await axios ({
      url: `${BASE_URL}/users/${this.username}`,
      method: "PATCH",
      data: {token: this.loginToken, user: {name: this.name, password: password, username: this.username}}
    })
  }
}