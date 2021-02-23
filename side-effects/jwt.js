import jwt from 'jsonwebtoken';

export function signToken(userInfo) {
  return new Promise((resolve, reject) => {
    jwt.sign(
      userInfo,
      process.env.JWT_SECRET,
      {
        algorithm: 'HS256'
      },
      (err, token) => {
        if (err) reject(err);
        else resolve(token);
      }
    );
  });
}

export function verifyToken(token) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, process.env.JWT_SECRET, (err, userInfo) => {
      if (err) reject(err);
      else resolve(userInfo);
    });
  });
}
