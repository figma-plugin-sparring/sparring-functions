import jwt from 'jsonwebtoken';

export function signTemporaryToken(userInfo) {
  return new Promise((resolve, reject) => {
    jwt.sign(
      userInfo,
      process.env.JWT_SECRET,
      {
        algorithm: 'HS256',
        expiresIn: 180
      },
      (err, token) => {
        if (err) reject(err);
        else resolve(token);
      }
    );
  });
}

export function verifyTemporaryToken(token) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, process.env.JWT_SECRET, (err, userInfo) => {
      if (err) reject(err);
      else resolve(userInfo);
    });
  });
}
