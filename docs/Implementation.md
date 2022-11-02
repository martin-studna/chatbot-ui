# Overview
This document contains description of specific implementation details.
# Conversation services
Server part of implementation contains concept of Conversation services which allows modification of message and integration with other services. There are 3 available options for implementation
## PreProcessing service
Should contain any service that modifies user message before entering conversation. Example of such message is adding of authentication details about user to context variable.
## Conversation service
Solving problem when you want to call some integration (or external service) from conversation and process the result within conversation. Example is situation when you want to send mail and inform user about status based on result.
The approach how to call such service from the conversation is:
1. Populate the context variable $request-service with the name of the service to be called.
2. Populate (typically in the same node) the input parameters relevant for the selected service. All parameters are prefixed with $request-params (so the complete name for each parameter is $request-params-PARAM_NAME resp. $request-params-KEY-NESTED_KEY in case of a hierarchical request structure.
3. Optionally we may populate also $request-resultTarget and $request-errorTarget. The first one defaults to 'response.result' and the second one to 'response.error' which means that in case of success the service result will be written to the Watson context variable $response.result and in case of failure the error object will be written to the context variable $response.error.  If we need to covert existing Watson skill which uses e. g. direct cloud function calls to a solution with conversation services and we want to minimize the impact on the skill then it may be convenient to use these parameters to align the output with existing implementation. Setting $request-resultTarget or $error-errorTarget to an empty string will cause that the data will be written directly to the context root.  For new implementations we should always use the default locations.
4. Respond with any text. As $request-service is defined by the application which knows that it has to make a service call instead of returning the text to the chat user (the text is completely ignored). Once the service returns the application, it will populate Watson context $response variable and it will call Watson again with a forced intent #response1 or #error1. The conversation is expected to:
  - Handle the intent #response1 and
    * return some response which typically uses the returned result $response.result - the format of this object is specific for each service).
    * or make another call by populating $request (unlike usual context variables the application cleans $request with each Watson call so the conversation developer does not need to care about the values stored in $request before the previous call). In this case the result is communicated to the conversation as a forced intent #response2 resp. #error2 (#response3, #response4 etc. - the incrementing is reset once we stop filling $request and return a standard response to the chat user).
  - Handle the intent #error1 and communicate the problem to the chat user. Error details are stored in $response.error.
## PostProcessing service
To be used in situation when message from conversation to user should be modified (decorated with other data). Example can be specific formatting of data e.g. generating QR code from conversation output and displaying it to user.
# Authentication
It is possible to run ChatUI in authenticated mode. Authentication is creating JWT token which is used to store data about user. Auth.ts API expects that authentication will be called on FE (using federated authentication identity provider). Implementation is currently ready for Azure AD auth provider.
