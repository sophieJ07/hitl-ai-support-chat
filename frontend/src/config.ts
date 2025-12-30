export const config = {
  aws: {
    region: import.meta.env.VITE_AWS_REGION,
    userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID,
    clientId: import.meta.env.VITE_COGNITO_APP_CLIENT_ID,
    domain: import.meta.env.VITE_COGNITO_DOMAIN,
  },
  api: {
    baseUrl: import.meta.env.VITE_API_URL,
  },
};