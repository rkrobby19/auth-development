const UserServices = require('../services/user-services');
const Jwt = require('../utils/jwt');

module.exports = {
  register: async (req, res) => {
    try {
      const { username, email, password } = req.body;

      // * Create refresh_token payload
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
      res.send({ status: 'Error', message: error.message });
    }
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      const user = await UserServices.verifyUser(email, password);

      if (user === 'User not found') {
        return res
          .status(404)
          .send({ status: 'error', message: 'User not found' });
      }
      if (user === 'Incorrect Password') {
        return res
          .status(401)
          .send({ status: 'error', message: 'Incorrect Password' });
      }

      // * Check validity current refresh token
      let refresh_token = user.refresh_token;

      const currentToken = Jwt.verifyRefresh(user.refresh_token);

      // ! Exp refresh token
      if (currentToken.message === 'jwt expired') {
        // * Update version
        const newTokenVersion = user.token_version + 1;

        const newVersion = await UserServices.updateTokenVersion(
          email,
          newTokenVersion
        );

        // * Create new refresh token
        const payloadRefresh = {
          username: user.username,
          email: user.email,
          token_version: newTokenVersion,
        };

        const new_refresh_token = Jwt.signRefresh(payloadRefresh);

        // * update refresh token on db
        const updateToken = await UserServices.updateRefreshToken(
          user.email,
          new_refresh_token
        );

        // * re-assign new token
        refresh_token = new_refresh_token;
      }

      // ! Token version updated
      const decodedToken = Jwt.decodeToken(user.refresh_token);

      if (currentToken.token_version !== user.token_version) {
        // * Create new refresh token
        const payloadRefresh = {
          username: user.username,
          email: user.email,
          token_version: user.token_version,
        };

        const new_refresh_token = Jwt.signRefresh(payloadRefresh);

        // * update refresh token on db
        const updateToken = await UserServices.updateRefreshToken(
          user.email,
          new_refresh_token
        );

        // * re-assign new token
        refresh_token = new_refresh_token;
      }

      const payloadAccess = {
        username: user.username,
        email: user.email,
      };

      const access_token = Jwt.signAccess(payloadAccess);

      const cookieOpts = {
        maxAge: 1000 * 60 * 10, // would expire after 10 minutes
        httpOnly: true, // The cookie only accessible by the web server
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

  refresh_token: async (req, res) => {
    const { username, email } = req.user;

    const payload = {
      username,
      email,
    };

    const access_token = Jwt.signAccess(payload);
    res.send({ access_token });
  },

  revoke: async (req, res) => {
    try {
      // * Get refresh token
      const token = req.cookies.refresh_token;

      const data = Jwt.decodeToken(token);

      // * Update token version
      const newVersion = data.token_version + 1;

      const updateVersion = await UserServices.updateTokenVersion(
        data.email,
        newVersion
      );

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
