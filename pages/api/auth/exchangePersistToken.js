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
      const { figma } = await firestore.collection('users').doc(userInfo.id).get();
      const refreshTokenResp = await refreshToken(figma.refreshToken);
      await firestore
        .collection('users')
        .doc(userInfo.id)
        .update({
          figma: {
            accessToken: refreshTokenResp.access_token,
            expiresIn: refreshTokenResp.expires_in,
            refreshToken: figma.refreshToken
          }
        });
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.status(200).json({ persistToken });
      break;

    default:
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
