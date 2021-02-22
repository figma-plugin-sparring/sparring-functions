import { refreshToken } from '../../../side-effects/figma';
import { verifyTemporaryToken } from '../../../side-effects/jwt';
import { auth, firestore } from '../../../side-effects/firebaseAdmin';

export default async function exchangePersistTokenHandler(req, res) {
  switch (req.method) {
    case 'OPTIONS':
      res.end();
      break;

    case 'POST':
      const userInfo = await verifyTemporaryToken(req.body.temporaryToken);
      const persistToken = await auth.createCustomToken(userInfo.id);
      const userSnapshot = await firestore.collection('users').doc(userInfo.id).get();
      let { figma, ...user } = userSnapshot.data();
      if (figma.expiresAt - Date.now() < 86400000) {
        const refreshTokenResp = await refreshToken(figma.refreshToken);
        figma = {
          ...figma,
          accessToken: refreshTokenResp.access_token,
          expiresAt: Date.now() + refreshTokenResp.expires_in * 1000
        };
        await firestore.collection('users').doc(userInfo.id).update({ figma });
      }
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.status(200).json({
        user,
        figmaToken: figma.accessToken,
        firebaseToken: persistToken
      });
      break;

    default:
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
