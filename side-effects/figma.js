import axios from 'axios';
import querystring from 'querystring';

export function retrieveToken(code) {
  const query = querystring.stringify({
    client_id: process.env.FIGMA_ID,
    client_secret: process.env.FIGMA_SECRET,
    redirect_uri: process.env.FIGMA_CALLBACK,
    code,
    grant_type: 'authorization_code'
  });
  return axios.post(`https://www.figma.com/api/oauth/token?${query}`);
}

export function refreshToken(refreshToken) {
  const query = querystring.stringify({
    client_id: process.env.FIGMA_ID,
    client_secret: process.env.FIGMA_SECRET,
    refresh_token: refreshToken
  });
  return axios.post(`https://www.figma.com/api/oauth/refresh?${query}`);
}

export function createInstance(token) {
  const figma = axios.create({
    baseURL: 'https://api.figma.com/v1',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return figma;
}
