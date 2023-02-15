const jwt = require('jsonwebtoken');

module.exports = class Jwt {
  // * Exp in 60 mnt
  static signAccess = (payload) =>
    jwt.sign(payload, process.env.SECRET, {
      expiresIn: 60,
      algorithm: 'HS256',
    });

  // * Exp in 7 days
  static signRefresh = (payload) =>
    jwt.sign(payload, process.env.REFRESH_SECRET, {
      expiresIn: 60 * 2,
      algorithm: 'HS256',
    });

  static verifyRefresh = (token) =>
    jwt.verify(token, process.env.REFRESH_SECRET, function (err, decoded) {
      if (err) {
        return err;
      }
      return decoded;
    });

  static decodeToken = (token) => jwt.decode(token);
};
