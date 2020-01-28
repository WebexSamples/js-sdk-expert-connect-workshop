# Webex JS SDK Expert Connect Workshop

Welcome to the Webex JS SDK Expert Connect Workshop.

In this workshop, you will be creating a front-end and back-end solution that utilizes the Webex Javascript SDK.

## Workshop Guide

### Step 0: Workshop Setup

- Open and login to the Webex Teams desktop or web client <https://teams.webex.com>.
- Clone this git repository with:

```bash
git clone https://github.com/WebexSamples/js-sdk-expert-connect-workshop.git
```

- Change into the repository directory:

```bash
cd js-sdk-expert-connect-workshop
```

- Install package dependencies:

```bash
npm install
```

- Start the server:

```bash
npm start
```

- Open [Postman Application](https://www.getpostman.com/)
- Send a request with Postman to "http://localhost:3000/hello"
  - Verify the response of "Hello World"

### Step 1: Creating a JWT

Throughout this workshop, the end user will be a Webex Teams Guest User.
This user is a dynamically created user that does not require an existing Webex Teams account to utilize Webex Teams services.
To be able to create these Guest Users, you will need to create a "Guest Issuer" account on the Webex for Developers portal.

- Login to the Webex for Developers site at <https://developer.webex.com>

  - Once logged in, click on "My Webex Teams Apps" under your profile at the top
  - Click "Create a New App" button
  - Click "Create a Guest Issuer"
  - Choose a name, example: "Webex Teams SDK Workshop"
  - Note: Free users cannot create guest issuers (request a demo account from your instructor)

Let's update the project "secrets" file.
This file contains secrets to your application and should not be saved in the repo.
(Our `.gitignore` file makes it so that this file will not be saved to our git project.)

- In the project files, copy the `.env.default` file and save it as `.env`

  - Copy the values from the Guest Issuer screen in the developer portal and save them in the `.env` file.
  - Your `.env` file should now have values for `GUEST_ISSUER_ID` and `GUEST_SHARED_SECRET`.

- Return to Postman and send a POST request to <http://localhost:3000/guest>
  - This should return a JSON object with values that we will fix.

You've been provided with a `createUser` function that takes the guest issuer and secret and outputs a JWT.

- Review the [`server/jwt.js` file](./server/jwt.js).
  - This file generates a JWT utilizing your guest issuer.

Let's implement that function in our main file:

- Open the [`server/index.js` file](./server/index.js).

  - Locate the line `const guestJWT = 'Fix me in step 1';` near the end of the file and replace it with:

  ```js
  const guestJWT = await createUser({displayName});
  ```

- In Postman, send another POST request to <http://localhost:3000/guest> to see if your code changes worked.
- Copy the guestJWT value that was generated and paste it into <http://jwt.io> to validate.
  - Notice two things in the decoded JWT:
    - The property "name" has the value "SDK Workshop Guest"
    - The property "iss" (short for issuer) has the value that matches your guest issuer

Postman allows you to modify your requests to the node server.
We are going to be sending JSON to our API, so let's configure Postman to send the data properly:

- Open the Postman application
- Switch to the "Body" section underneath the request
- Choose the "raw" radio button to set the body type
- Change the file type drop down from "Text" to "JSON"

Now our Postman application is ready to send requests.
Let's send our first data request:

- Let's customize our user name by modifying the request in Postman:

  - Add the body json:

  ```json
  {
    "name": "my name"
  }
  ```

  - Send a request with your JSON object.
  - Decode the result on <http://jwt.io> and verify that the name changed to "my name".

### Step 2: Create a Webex Guest User

In order to perform actions on a guest user like adding them to a space (which we will be doing in step 3), we need to get the guest user's user ID from Webex Teams.

We cannot do this with the JWT alone, so we need to actually login to Webex Teams with the JWT and get the details about the guest user.

- Review the [`server/login.js` file](./server/login.js).

  - This file has one function `loginWebexGuest`.
  - The function has two steps:

    1. Gets a Webex access token from our JWT
    2. Sends a request to the [people/me api](https://developer.webex.com/docs/api/v1/people/get-my-own-details) to get details about the guest user.

- Using that function, let's update the [`server/index.js` file](./server/index.js).

  - Find this line: `const guestUser = 'Fix me in step 2';`
  - Replace it with this code:

  ```js
  const guestUser = await loginWebexGuest(guestJWT);
  ```

  - Send a new request via Postman to our `/guest` endpoint.
  - Inspect the new "guestUser" details in the response.

### Step 3: Create a Webex Space

Now that we have our guest user fully created, we need to create a space that we will add our guest user and expert to.

This kind of third party functionality is handled by [Webex Bots](https://developer.webex.com/docs/bots).

Let's create a bot!

- Login to the Webex for Developers site at <https://developer.webex.com>
  - Once logged in, click on "My Webex Teams Apps" under your profile at the top
  - Click "Create a New App" button
  - Click "Create a Bot"
  - Choose a name, example: "Expert Connect Bot"
  - Choose a username, icon, and basic description
  - Click "Add Bot"
  - Copy the bot's access token provided
  - Edit the `.env` file and update the `WEBEX_ACCESS_TOKEN` value with the bot token.

We also need to tell the bot who our expert is. Congratulations, it is you!

- Edit the `.env` file and update the `WEBEX_EXPERT_EMAIL` value with your Webex Teams email address.

Let's utilize the Webex JS SDK on our node server to create a space with our bot:

- Review the [`server/webex.js` file](./server/webex.js).
  - This file has one main function, `prepareSpace`.
  - This function does the following steps:
    1. Creates the space
    2. Adds the expert to the space
    3. Adds the guest to the space
    4. Sends a message to the space
- Using that function, let's update the [`server/index.js` file](./server/index.js).

  - Find this line: `const space = 'Fix me in step 3';`
  - Replace it with this code:

  ```js
  const space = await prepareSpace({title: spaceTitle, email: expertEmail, guest: guestUser.id, message});
  ```

  - Switch over to Postman and update our `/guest` request body to:

  ```json
  {
    "name": "my name",
    "pet": "Dog",
    "details": "Loud barking"
  }
  ```

  - Send a new request via Postman to our `/guest` endpoint.
  - Inspect the new "space" details in the response.

In addition to our response in Postman, you should have seen some activity in Webex Teams!
Your user that was specified by `WEBEX_EXPERT_EMAIL` was added to a new space and now has a message from the bot with our "Dog" and "Loud barking" details.

This concludes our node.js API server work!

### Step 4: Sending Data to the Server

It is time to start modifying the client web server code.
The client code lives in the [`client`](./client) folder and is compiled and served with [Parcel.js](https://parceljs.org/).

- The web project has two pages, `index.html` and `connect.html`

  - `index.html` is our web form that allows our users to enter data to send to an expert.
  - `connect.html` takes the data from the web form and sends it to our node.js API server and connects the user with an expert.

- Open a web browser to our web server at <http://localhost:3000/index.html>
- Open the file for this web page located at [`client/index.html`](./client/index.html)

  - This web page is completely functional and does not need modification.
  - This line of code is what sends the data to the `connect.html` page:

  ```html
  <form action="connect.html" method="GET"></form>
  ```

- Review the [`client/connect.js`](./client/connect.js) file.
  - This is the file that loads when the user opens `connect.html`.
  - This file uses our utility function `getUrlParams` to get the data sent from `index.html`.
- Review the [`client/utils.js`](./client/utils.js) file.
  - The function `createExpertSpace` is what takes the client data and sends it to our API.

Now that we are familiar with the code base, let's send our web data to the API.

- Open the [`client/connect.js`](./client/connect.js) file for editing.

  - At the end of our `main` function, utilize our `createExpertSpace` function to send the form data.
  - Locate the `// TODO: Create space and connect to expert` line and replace it with the following:

  ```js
  createExpertSpace(params);
  ```

  - Open a web browser to our web server at <http://localhost:3000/index.html>
  - Fill out the form data and click "Connect with an Expert" button.
  - This should take you to `connect.html` and in a few seconds, you should see our expert space created in Webex Teams!
  - The status on the web page should also read: "Expert Space Created"

### Step 5: Join a Meeting with our Expert

The final step of our journey is to get a Webex Teams Meeting started between our end user and our "expert".
Our web application will wait for the expert to start a meeting in Webex Teams, then automatically connect to the expert.
We will use the Webex Browser Javascript SDK to connect to this meeting for our end user.

- Review the [`client/meeting.js`](./client/meeting.js) file.
  - We are going to utilize the `connectToMeeting` function to connect to our meeting.
  - This function does a few things:
    - Authenticates our guest user with Webex (via `requestAccessTokenFromJwt`).
    - Registers the guest user's browser with Webex services (`webex.meetings.register()`).
    - Waits for the meeting with the expert to begin (`webex.meetings.on('meeting:added',`).
    - Joins the meeting from the browser (`joinMeeting()`).
  - There is also a lot of meeting browser setup code in the `meeting.js` file.
  - Most of this code is copied directly from the browser sample code located on the developer portal at: <https://developer.webex.com/docs/sdks/browser/samples>

Let's use this `connectToMeeting` function in our `connect.js` file.

- Open the [`client/connect.js`](./client/connect.js) file for editing.
- We are going to use Javascript "promises" to connect to the meeting once our space is created.
- Replace the `createExpertSpace(params);` line we added in step 4 to connect to the meeting with the data returned from the API:

```js
createExpertSpace(params).then((postResponse) => {
  const jwt = postResponse.guestJWT;
  const spaceID = postResponse.space.id;
  connectToMeeting(jwt, spaceID);
});
```

Our code journey is now complete! Let's connect to our "expert"!

- Open a web browser to our web server at <http://localhost:3000/index.html>
  - Fill out the form data and click "Connect with an Expert" button.
  - This should take you to `connect.html` and in a few seconds, you should see our expert space created in Webex Teams.
  - The browser should display "Webex connected, waiting for expert...".
  - Start a Webex Teams meeting in the newly created space from the Webex Teams client.
  - In a few seconds, you should see the meeting in the browser!
