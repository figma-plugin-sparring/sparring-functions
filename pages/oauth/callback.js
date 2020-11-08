import React from 'react';
import { retrieveToken, createInstance } from '../../side-effects/figma';
import { signTemporaryToken } from '../../side-effects/jwt';

const OAuthCallback = props => {
  if (props.error) {
    return (
      <>
        <h3>{props.error}</h3>
        <h4>{props.message}</h4>
        <pre>{props.stack}</pre>
      </>
    );
  }
  return <p style={{ lineBreak: 'anywhere' }}>{props.temporaryToken}</p>;
};

export async function getServerSideProps(context) {
  let figmaToken;
  try {
    const tokenResp = await retrieveToken(context.query.code);
    figmaToken = tokenResp.access_token;
  } catch (err) {
    return {
      props: {
        error: 'failed to get token',
        message: err.response.data.message,
        stack: err.stack
      }
    };
  }

  try {
    const figma = createInstance(figmaToken);
    const { data } = await figma.get('/me');
    const temporaryToken = await signTemporaryToken(data);

    return {
      props: {
        temporaryToken
      }
    };
  } catch (err) {
    return {
      props: {
        error: 'failed to init user',
        message: err.message,
        stack: err.stack
      }
    };
  }
}

export default OAuthCallback;
