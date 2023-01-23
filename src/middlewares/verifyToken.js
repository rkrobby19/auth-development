const { getUserByEmail } = require('../services/user-services');
const Jwt = require('../utils/jwt');

module.exports = verifyToken = async (req, res, next) => {
  try {
    const token = req.cookies.refresh_token;

    if (token) {
      const verify = Jwt.verifyRefresh(token);

      if (verify.message === 'jwt expired') {
        return res.status(401).send({
          status: 'error',
          message: 'Jwt token expired',
          info: 'Please login again',
        });
      }

      if (verify.message === 'invalid signature') {
        return res
          .status(401)
          .send({ status: 'error', message: 'Token invalid' });
      }

      const user = await getUserByEmail(verify.email);

      if (verify.token_version !== user.token_version) {
        return res
          .status(401)
          .send({ status: 'error', message: 'Token version not valid' });
      }

      req.user = user;

      next();
    } else {
      return res
        .status(401)
        .send({ status: 'error', message: 'No token provided' });
    }
  } catch (error) {
    return res.send(error);
  }
};
