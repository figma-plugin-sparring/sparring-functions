import { refreshToken } from '../../../side-effects/figma';
import { verifyToken } from '../../../side-effects/jwt';
import { auth, firestore } from '../../../side-effects/firebaseAdmin';

export default async function tokenHandler(req, res) {
  switch (req.method) {
    case 'OPTIONS':
      res.end();
      break;

    case 'POST':
      const { userId } = await verifyToken(req.body.token);
      const userSnapshot = await firestore.collection('users').doc(userId).get();
      const user = userSnapshot.data();
      if (user.figma.expiresAt - Date.now() < 86400000) {
        const { data: refreshTokenData } = await refreshToken(user.figma.refreshToken);
        await firestore
          .collection('users')
          .doc(userId)
          .collection('private')
          .doc('figma')
          .set({
            accessToken: refreshTokenData.access_token,
            expiresAt: Date.now() + refreshTokenData.expires_in * 1000,
            refreshToken: user.figma.refreshToken
          });
      }
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.status(200).json({
        userId: user.userId,
        name: user.name,
        avatar: user.avatar,
        figmaToken: user.figma.accessToken,
        firebaseToken: await auth.createCustomToken(userId)
      });
      break;

    default:
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
