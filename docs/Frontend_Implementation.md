# Overview

This document contains details about the implementation of the client which is mostly the User interface part of the chatbot application.

## Implementation

The current chatbot UI is written in Javascript and the projects uses VueJs framework.

The version of vue-cli is 4.2.3.

The main entrypoint for the app is `main.js` file. In this file we create a `div` element where VueJs hosts the chatbot application.
For chatbot integration to other websites there is a configuration in `vue.config.js` file. It is mostly the wrapper of the webpack setup where you can define for example the setting for the development or production builds. We have defined that all of our source codes are bundled in `chatWindow.js` file. Chatbot can be then easily integrated to other sites, if you just write `<script src='BASE_URL/chatWindow.js'/>` where `BASE_URL` is the url of deployed chatbot.


## Environment variables

There are several environment variables which needs to be configured before the frontend is executed.

1. `VUE_APP_SERVER_URL` is url for the server which processes messages from Watson Assistant and sends the messages to the client
2. `VUE_APP_DROPDOWN` Watson Assistant can send us  multiple types of messages. For instance we can get a message of `response_type`: `options` or `suggestions`. It means that the Assistant gives us options for the answer. We made a possibility to render these options as buttons or as a dropdown.
3. `VUE_APP_DROPDOWN_THRESHOLD = true|false` If there are at least as many options as the number stored in dropdown threshold variable, dropdown is rendered.
4. `VUE_APP_AZURE_CLIENT_ID`, `VUE_APP_AZURE_TENANT_ID` are Azure Active Directory credentials.
5. `VUE_APP_DEPLOY_SSO=button|startup` We have implemented Single Signed On with Azure Active Directory. There are two options to initialize SSO. First, you can use login button or you can set that SSO will start on the startup of the chatbot.

## Modules

Modules folder contains functions which are accesiable globally in the application. 


* `sleep(ms)`
* `animateCSS()`
* `addPopUp()`
* `removePopUp()`
* `Logger`
    * `debug`
    * `error`
    * `trace`
    * `log`
    * `info`
    * `warn`


## Logger

The Logger class is a simple wrapper for `console log, trace, debug, error ...`. You can find it in modules folder.

## Mixins

> Mixins are a flexible way to distribute reusable functionalities for Vue components. A mixin object can contain any component options. When a component uses a mixin, all options in the mixin will be “mixed” into the component’s own options. 
>
> <cite>[Mixins]</cite>

[Mixins]: https://vuejs.org/v2/guide/mixins.html

All mixins are defined in `GlobalFunctionMixins.js`. It contains following methods:

* `scrollDown(ms)` - this methods initiate scrolling to last user message in chatbot window.
* `scrollToBottom(ms)` - invokes scrolling to the bottom of the chatbot window
* `checkScrollToBottom()` - checks if the chatbot window is scrolled to the bottom.
* `authenticate()` - invokes Single Signed On
* `async say(message, event, label = '')` - sends user input to the backend and receives output.

## Store

Store is the single object which contains all application states. There should always be only one store for one application. Store simply contains variables which are used in more than one Vue component.

## Components




## Tests

## Browser portability

Only Chrome browser is now fully supported


## Structure

    client
    ├── dist                    # Compiled files
    ├── public
    │   └── index.html
    ├── src                     # Source files 
    │   ├── components
    │   │   ├── ToggleButton.vue
    │   │   ├── ChatHeader.vue
    │   │   ├── ChatInput.vue
    │   │   ├── Conversation.vue
    │   │   ├── ChatbotAvatar.vue
    │   │   ├── BotMessage.vue
    │   │   ├── UserMessage.vue
    │   │   ├── Options.vue
    │   │   ├── Suggestions.vue
    │   │   ├── DiscoveryResults.vue
    │   │   ├── Pause.vue
    │   │   ├── LoadingBubble.vue
    │   │   └── ToolTip.vue
    │   ├── store
    │   │   └── store.js
    │   ├── mixins
    │   │   └── GlobalFunctionsMixin.js
    │   ├── App.vue
    │   └── modules
    │       ├── logger.js
    │       └── misc.js
    └── tests
