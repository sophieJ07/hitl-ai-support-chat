import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import {config} from './config.ts';

import React from "react";
import ReactDOM from "react-dom/client";
import { AuthProvider} from "react-oidc-context";

const cognitoAuthConfig = {
  authority: `https://cognito-idp.${config.aws.region}.amazonaws.com/${config.aws.userPoolId}`,
  client_id: config.aws.clientId,
  redirect_uri: window.location.origin,
  post_logout_redirect_uri: window.location.origin,
  scope: "openid email profile",
};

const root = ReactDOM.createRoot(document.getElementById("root")!);

root.render(
  <React.StrictMode>
    <AuthProvider {...cognitoAuthConfig}>
      <App />
    </AuthProvider>
  </React.StrictMode>
);


// createRoot(document.getElementById('root')!).render(
//   <StrictMode>
//     <App />
//   </StrictMode>,
// )
