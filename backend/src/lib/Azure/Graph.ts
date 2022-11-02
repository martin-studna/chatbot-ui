import 'isomorphic-fetch';
import * as graph from '@microsoft/microsoft-graph-client';

function getAuthenticatedClient(accessToken: string): any {
  // Initialize Graph client
  const client = graph.Client.init({
    // Use the provided access token to authenticate
    // requests
    authProvider: done => {
      done(null, accessToken);
    },
  });

  return client;
}

export async function getUserDetails(accessToken: string): Promise<any> {
  const client = getAuthenticatedClient(accessToken);

  const user = await client.api('/me')
    .select('displayName, givenName, jobTitle, mobilePhone, country, preferredLanguage, surname, userPrincipalName, id, country, department')
    .get();

  return user;
}

export async function getEvents(accessToken: string): Promise<any> {
  const client = getAuthenticatedClient(accessToken);

  const events = await client
    .api('/me/events')
    .select('subject,organizer,start,end')
    .orderby('createdDateTime DESC')
    .get();

  return events;
}
