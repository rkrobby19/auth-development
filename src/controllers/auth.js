const Errors = require('../constants/errors');
const UserServices = require('../services/user-services');
const Jwt = require('../utils/jwt');

module.exports = {
  register: async (req, res) => {
    try {
      const { username, email, password } = req.body;

      const payload = {
        username,
        email,
        token_version: 0,
      };

      const refresh_token = Jwt.signRefresh(payload);

      const user = await UserServices.registerUser(
        username,
        email,
        password,
        refresh_token
      );

      res.status(201).send({ status: 'success', user: user.username });
    } catch (error) {
      res
        .status(422)
        .send({ status: error.message, message: error.errors[0].message });
    }
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      const user = await UserServices.verifyUser(email, password);

      if (!user.username) {
        return res.status(404).send({ status: 'Error', message: user });
      }

      let { refresh_token, token_version } = user;

      const currentToken = Jwt.verifyRefresh(refresh_token);

      if (
        currentToken.name === Errors.TokenExpiredError ||
        currentToken.token_version !== token_version
      ) {
        const payloadRefresh = {
          username: user.username,
          email: user.email,
          token_version: user.token_version,
        };

        const newRefreshToken = Jwt.signRefresh(payloadRefresh);

        await UserServices.updateRefreshToken(user.email, newRefreshToken);

        refresh_token = newRefreshToken;
      }

      const payloadAccess = {
        username: user.username,
        email: user.email,
      };

      const access_token = Jwt.signAccess(payloadAccess);

      const cookieOpts = {
        maxAge: 1000 * 60 * 10,
        httpOnly: true,
      };

      res
        .status(200)
        .cookie('refresh_token', refresh_token, cookieOpts)
        .send({
          message: 'Login Success',
          user: user.username,
          access_token: `Bearer ${access_token}`,
        });
    } catch (error) {
      res.send({ status: 'Error', message: error.message });
    }
  },

  refreshToken: async (req, res) => {
    try {
      const { username, email, token_version } = req.decoded;

      const user = await UserServices.getUserByEmail(email);

      if (token_version !== user.token_version) {
        return res
          .status(401)
          .send({ status: 'Error', message: 'Unauthorized' });
      }

      const payload = {
        username,
        email,
      };

      const access_token = Jwt.signAccess(payload);

      res.status(201).send({ access_token });
    } catch (error) {
      res.send({ status: 'Error', message: error.message });
    }
  },

  revoke: async (req, res) => {
    try {
      const { refresh_token } = req.cookies;

      const data = Jwt.decodeToken(refresh_token);

      const newVersion = data.token_version + 1;

      await UserServices.updateTokenVersion(data.email, newVersion);

      res
        .cookie('refresh_token', '', {
          maxAge: 0,
          overwrite: true,
        })
        .clearCookie('refresh_token')
        .send({
          status: 'success',
          message: 'User Logout',
        });
    } catch (error) {
      res.send(error.message);
    }
  },

  profile: (req, res) => {
    const { id, username, email } = req.user;
    const user = { id, username, email };
    res.send(user);
  },
};
