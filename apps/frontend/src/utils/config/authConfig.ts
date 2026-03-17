export const msalConfig = {
  auth: {
    clientId: `${import.meta.env.VITE_AUTH_CLIENT_ID}`,
    authority: `${import.meta.env.VITE_AUTH_CLOUD_AUTHORITY}/${import.meta.env.VITE_AUTH_TENANT_ID}`,
    redirectUri: `${import.meta.env.VITE_AUTH_REDIRECT_URI}`,
  },
  cache: {
    cacheLocation: 'localStorage', // This configures where your cache will be stored
    storeAuthStateInCookie: false, // Set this to "true" if you are having issues on IE11 or Edge
  },
};

// Add scopes here for ID token to be used at Microsoft identity platform endpoints.
export const loginRequest = {
  scopes: [`${import.meta.env.VITE_AUTH_CLIENT_ID}/User.Read`],
};

// Add the endpoints here for Microsoft Graph API services you'd like to use.
export const graphConfig = {
  graphMeEndpoint: `${import.meta.env.VITE_AUTH_MS_GRAPH_ENDPOINT}/v1.0/me`,
};
