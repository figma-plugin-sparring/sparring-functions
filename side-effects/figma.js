import axios from 'axios';
import querystring from 'querystring';

export async function retrieveToken(code) {
  const query = querystring.stringify({
    client_id: process.env.FIGMA_ID,
    client_secret: process.env.FIGMA_SECRET,
    redirect_uri: process.env.FIGMA_CALLBACK,
    code,
    grant_type: 'authorization_code'
  });
  const tokenResp = await axios.post(`https://www.figma.com/api/oauth/token?${query}`);
  return tokenResp.data;
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
