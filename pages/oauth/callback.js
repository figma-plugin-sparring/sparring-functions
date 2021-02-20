import React, { useState, useCallback } from 'react';
import styled from 'styled-components';
import copy from 'copy-to-clipboard';
import { retrieveToken, createInstance } from '../../side-effects/figma';
import { firestore } from '../../side-effects/firebaseAdmin';
import { signTemporaryToken } from '../../side-effects/jwt';

const Wrapper = styled.div`
  width: 460px;
  height: 685px;
  margin: auto;
  text-align: center;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
`;

const Heading = styled.h1`
  font-size: 36px;
`;

const ImagePlaceholder = styled.div`
  display: inline-block;
  width: 160px;
  height: 160px;
  background-color: #333;
`;

const Description = styled.p`
  font-size: 18px;
  font-weight: 400;
  line-height: 21px;
  i {
    display: block;
    font-size: 43px;
    margin: 35px;
  }
`;

const Button = styled.button`
  background: #18a0fb;
  border-radius: 6px;
  border: none;
  outline: none;
  font-weight: 500;
  font-size: 11px;
  letter-spacing: 0.01em;
  color: #ffffff;
  height: 48px;
  padding: 7px 10px;
  text-align: center;
  width: 340px;

  &:active {
    box-sizing: border-box;
    box-shadow: inset 0 0 0 2px rgba(0, 0, 0, 0.3);
  }

  &::first-letter {
    text-transform: uppercase;
  }
`;

const TokenExpand = styled.div`
  font-size: 12px;
  font-weight: 400;
  margin: 20px;
  width: 340px;
  display: inline-flex;
  align-items: center;
  padding: 0 5px;
  cursor: pointer;

  &::before {
    content: '';
    width: 0;
    height: 0;
    border: 3px solid #fff;
    border-left-color: transparent;
    border-top-color: transparent;
    margin-right: 5px;
    transform: rotate(${props => (props.open ? 45 : -45)}deg);
    transition: transform 0.3s;
  }

  &::after {
    content: '';
    height: 1px;
    flex: 1;
    background-color: #fff;
    margin-left: 10px;
  }
`;

const Token = styled.textarea`
  height: 100px;
  width: 330px;
  border-radius: 6px;
  background-color: #fff;
  padding: 10px;
  font-size: 12px;
  font-weight: 400;
  line-height: 14px;
`;

const OAuthCallback = ({ error, message, stack, temporaryToken }) => {
  const [isTokenOpen, setIsTokenOpen] = useState(false);
  const onToggleToken = useCallback(e => {
    setIsTokenOpen(bool => !bool);
  }, []);
  const onCopyToken = useCallback(
    e => {
      copy(temporaryToken, {
        format: 'text/plain'
      });
    },
    [temporaryToken]
  );

  if (error) {
    return (
      <>
        <h3>{error}</h3>
        <h4>{message}</h4>
        <pre>{stack}</pre>
      </>
    );
  }

  return (
    <Wrapper>
      <Heading>DS</Heading>
      <ImagePlaceholder />
      <Description>
        Almost there! <br />
        Please copy the token <br />
        and paste in Design Spairing plugin inside Figma
        <i>👇</i>
      </Description>
      <Button onClick={onCopyToken}>Copy token</Button>
      <TokenExpand open={isTokenOpen} onClick={onToggleToken}>
        Token
      </TokenExpand>
      {isTokenOpen && <Token defaultValue={temporaryToken} disabled={true} />}
    </Wrapper>
  );
};

export async function getServerSideProps(context) {
  let tokenResp;
  try {
    tokenResp = await retrieveToken(context.query.code);
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
    const figma = createInstance(tokenResp.access_token);
    const { data } = await figma.get('/me');
    await firestore
      .collection('users')
      .doc(data.id)
      .set({
        ...data,
        figma: {
          accessToken: tokenResp.access_token,
          expiresIn: tokenResp.expires_in,
          refreshToken: tokenResp.refresh_token
        }
      });
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
