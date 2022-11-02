<!-- PROJECT LOGO -->
<br />
<p align="center" style="margin: 0">
  <a href="https://github.com/martin-studna/chatbot">
    <img src="./frontend/assets/bowler_hat2.png" alt="Logo" width="160" height="160">
  </a>

  <h3 align="center" style="font-size: 28px; margin: 0; padding-top: 0">Alfred</h3>

  <p align="center">
    Custom Chatbot UI for IBM Watson Assistant
    <br />
    <a href="https://github.com/othneildrew/Best-README-Template"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <a href="https://alfred-custom-ui.eu-de.mybluemix.net/">View Demo</a>
    ·
    <a href="https://github.ibm.com/AI-CoE-Prague/chat-ui-app/issues">Report Bug</a>
    ·
    <a href="https://github.ibm.com/AI-CoE-Prague/chat-ui-app/issues">Request Feature</a>
  </p>
</p>

<!-- TABLE OF CONTENTS -->

## Table of Contents

- [About the Project](#about-the-project)
  - [Server](#server)
  - [Client](#client)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Deployment](#deployment)
  - [Deployment to IBM Cloud](#deployment-to-ibm-cloud)
  - [Feedback (Google Sheets)](#feedback-google-sheets)
- [Code Style Guidelines](#code-style-guidelines)
- [Usage](#usage)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [Codebase Information](#codebase-information)
  - [System Requirements](#system-requirements)
  - [Developer Knowledge](#developer-knowledge)
  - [Data Flow](#data-flow)
  - [Front-end (Vue.js)](#front-end)
  - [Back-end (Node.js)](#back-end)
  - [Configs & Other](#configs-&-other)
  - [Libraries / Packages](#libraries/packages)
- [License](#license)
- [Authors](#authors)

## About The Project

<img align="right" src="./alfred-animated2.gif" width="360" style="margin-left: 20px; margin-bottom: 20px">

Alfred is a Node.js/Vue.js app that provides a simple chatbot user interface for the IBM Watson Assistant API that can be integrated into an existing web app with a single script tag.

The project is devided into two parts: **server** and **client**.

### Server

The server is connected to **IBM Watson Assistant** using v2 API and to our frontend. It runs on the **port 3023**. For setup it is necessary to define environment variables in server/.env file.

For local development it is handy to setup also `JSON_SCHEMA_DIR`. If this env. variable is not set then the schemas will be searched in `dist/jsonschema` where it is coppied from `src/jsonschema` during the build process. For local development we may point `JSON_SCHEMA_DIR` to `src/jsonschema` (we have to use the **absolute path**) so that we can run only `tsc -w` without the necessity to run the complete build process after every change.

If we want to run the backend and the frontend as one application. We do not define `allow_origin` and `frontend_proxy` variables. Instead of listening to the requests through frontend proxy, the backend takes the frontend as a static content from `public` folder which we need to include in `server` folder.

Lastly, you have to run `npm install` to get all dependencies for the server app.

### Client

The client is chatbot UI. The client runs on **port 8080** and it communicates on the **port 3023** with the backend. For setup it is necessary to define environment variables in `client/.env` file(s).

`VUE_APP_DEPLOY_SSO` can have two types of values: **button** or **startup**. Button option means that users are going to have SSO button for authentication with Azure Active Directory. If you set "startup", the authentication happens on the startup of the application.

You can notice that every variable has the prefix VUE_APP. If you want to define a new variable, it musts start with this prefix.

## Getting Started

In this chapter we will provide you a step-by-step manual how to get started.

### Prerequisites

The following components are required to effectively use this repository:

- npm

```
npm install npm@latest -g
```

- vue-cli

```
npm install -g @vue/cli
```

- An [IBM Cloud](https://cloud.ibm.com/registration) account
- A [IBM Watson Assistant](https://www.ibm.com/cloud/watson-assistant/) service instance
- An installation of the [IBM Cloud CLI](https://console.bluemix.net/docs/cli/index.html#overview)

### Installation

1. Clone the repo

   ```bash
   git clone https://github.ibm.com/AI-CoE-Prague/chat-ui-app
   ```

2. Setup client and server

   - **Client**

     - Go to client folder
       ```
       cd client
       ```

     * Set-up necessary configuration variables in `.env.development`

       ```bash
       VUE_APP_SERVER_URL=http://localhost:3023

       # Using of dropdowns in conversation
       VUE_APP_DROPDOWN=true|false
       VUE_APP_DROPDOWN_THRESHOLD=number


       # SSO Settings
       VUE_APP_AZURE_CLIENT_ID=xxxx-xxxx-xxxx-xxxx-xxxxx
       VUE_APP_AZURE_TENANT_ID=xxxx-xxxx-xxxx-xxxx-xxxxx
       VUE_APP_DEPLOY_SSO=button|startup
       ```

     * Install NPM packages for client
       ```
       npm install
       ```

   - **Server**

     - Go to server folder
       ```bash
       cd server
       ```

     * Set-up necessary configuration variables in `.env`

       ```bash
       # Assistant URL
       assistant_url=https://api.eu-de.assistant.watson.cloud.ibm.com/xxxxx

       # Assistant skill - V1 API
       assistant_workspace_id=xxxx-xxxx-xxxx-xxxx-xxxxx
       assistant_password=xxxxxxxxxxxxxxxxx

       # Assistant assistant - V2 API
       assistant_id=xxxx-xxxx-xxxx-xxxx-xxxxx
       assistant_apikey=xxxxxxxxxxxxxx

       frontend_proxy=http://localhost:8080
       allow_origin="*"
       jwt_secret=xxxxxxxxxxx
       ```

     * Install NPM packages for client
       ```
       npm install
       ```
     * Run build
       ```
       npm run build
       ```

If you have made all steps correctly, you can start the application with following commands:

```
# Client folder
  npm start
# Server folder
  npm start
```

Widget should be running on address defined in client configuration (by default http://localhost:8080)

## Deployment

Application supports deployment to **IBM Cloud** with **Cloud Foundry**.

### Deployment to IBM Cloud

- Login to IBM cloud
  ```
  ibmcloud login
  ```
- Set Cloud foundry target **org** (if you don't know it check interactively using:
  ```
  ibmcloud target --cf
  ```
- Set **bot name**, **bot url** and **environment variables** in `deploy-BOT_NAME-custom-ui.sh` script:
  ```bash
  ./deploy.sh BOT_NAME-custom-ui https://BOT_NAME-custom-ui.eu-de.mybluemix.net \
  --env assistant_url=https://api.eu-de.assistant.watson.cloud.ibm.com/instances/xxxxxxxxxxxxxxxx \
  --env assistant_id=xxxxxxxxxxxxxxxxx \
  --env assistant_apikey=xxxxxxxxxxx \
  --env allow_origin="'*'" \
  --env jwt_secret=xxxxxxx
  ```
- Run deployment shell script from root folder of application (named after given bot deployment)
  ```
  ./deploy-BOT_NAME-custom-ui.sh
  ```

### Feedback (Google Sheets)

Feature feedback (Google Sheets) can be eneabled by setting `VUE_APP_FEEDBACK_ENABLED` as true in .env.development file and there has to be set the credentials in .env file as well.

Moreover, on the Google side, host email adress needs to have permision to edit the sheets, document needs to be the first one among other possible documents and first two cells have to be superscribed by headers of the table - [id, feedback, message].

## Code Style Guidelines

Developers contributing to this project should follow code style conventions mentioned in this chapter. Pull requests, which do not meet following rules, might not be accepted by the administrator of the repository and by other reviewers.

- [BEM](http://getbem.com/introduction/) - The Block, Element, Modifier methodology, naming convention for classes in HTML and CSS

## Usage

The application can be easily integrated as a web widget to other websites. You just have to include this peace of code to your html file:

```html
<script src="<%= BASE_URL %>chatWindow.js" async defer></script>
```

where `BASE_URL` is url of deployed chatbot.

## Roadmap

See the open [open issues](https://github.ibm.com/AI-CoE-Prague/chat-ui-app/issues) for a list of proposed features (and known issues).

## Contributing

Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## Codebase Information

### System Requirements

- [Installation of Node.js](https://nodejs.org/en/download/)
- [Installation of NPM](https://docs.npmjs.com/getting-started/installing-node#terminals-editors-and-git-for-beginners)

### Developer Knowledge

In order to understand the inner-workings of this application and modify any code/configurations, it is recommended that a developer have a basic understanding of the following languages/technologies/frameworks:

- [Node.js](https://nodejs.org/en/docs/)
- [Express.js](http://expressjs.com/en/4x/api.html)
- [Vue.js](https://vuejs.org/)
- [REST APIs](https://www.restapitutorial.com/)

Non-essential:

- [Webpack](https://webpack.js.org/concepts/)

### Data Flow

- To initiate the Chat bot, a user clicks the chat bot toggle button positioned at the bottom right of the page
- The user is greeted with a message from the Watson Assistant service
- The user then enters a question/phrase into the text area and presses enter
- The user's input is then sent to the Watson Assistant service associated with the app via the Node.js backend API
- The Watson Assistant service then finds the most relevant node within the service instance and sends a response to the Node.js back-end API
- The Node.js back-end API then sends the response to the front-end where it is put into a message and appended to the chat dialog

### Front-end (Vue.js)

Directories/Files:

- `/public/*`
- `/src/*`

The `/public/` directory contains:

- `favicon.ico`: the favicon
- `index.html`: a sample page to add the `<script src="<%= BASE_URL %>chatWindow.js" async defer></script>` script to. This holds the place of the actual page that the script would be added to.

The `/src/` directory contains:

- `/components/`: all Vue components that make up the chat bot UI
- `main.js`: the entry point for the Vue app

### Back-end (Node.js/Express.js)

Directories/Files:

- `server/main.ts`: main file that configures the Node app: defines the routes and sets Watson Assistant API

### Configs & Other

Directories/Files:

- `.babelrc`: Babel configuration
- `.env`: Environment variable storage
- `.gitignore`: Contains file names that Git will ignore

### Libraries / Packages

All libraries/packages can be found in the `package.json` file. To add or remove a package to the app, use NPM and the corresponding NPM command for the specific package (e.g. `npm install [package]` or `npm uninstall [package]`). Do not delete or modify the `package-lock.json` file. The `/node_modules` directory is where all package code is stored and there's rarely a need to examine or modify `/node_modules` as long as one correctly adheres to NPM protocol.

Packages:

- [axios](https://github.com/axios/axios): Promise based HTTP client for the browser and Node.js
- [body-parser](https://github.com/expressjs/body-parser#readme): HTTP request body parsing interface
- [cors](https://github.com/expressjs/cors#readme): Node.js [CORS](https://en.wikipedia.org/wiki/Cross-origin_resource_sharing) middleware
- [dotenv](https://github.com/motdotla/dotenv#readme): Module that loads environment variables from a .env file into process.env
- [express](http://expressjs.com/en/4x/api.html): Web framework for Node.js
- [morgan](https://github.com/expressjs/morgan#readme): HTTP request logger middleware for Node.js

---

## License

Distributed under the MIT License. See `LICENSE` for more information.

## Authors

<a href="https://github.com/martin-studna">Martin Studna</a>
