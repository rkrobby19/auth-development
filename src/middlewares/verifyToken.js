const Errors = require('../constants/errors');
const Jwt = require('../utils/jwt');

module.exports = verifyToken = async (req, res, next) => {
  try {
    const { refresh_token } = req.cookies;

    if (refresh_token) {
      const decoded = Jwt.verifyRefresh(refresh_token);

      if (
        decoded.name === Errors.JsonWebTokenError ||
        decoded.name === Errors.TokenExpiredError
      ) {
        return res
          .status(401)
          .send({ status: 'Error', message: decoded.message });
      }

      req.decoded = decoded;
      return next();
    } else {
      return res
        .status(401)
        .send({ status: 'Error', message: 'No token provided' });
    }
  } catch (error) {
    return res.send(error);
  }
};
