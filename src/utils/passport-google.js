const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { User } = require('../models');
const Jwt = require('./jwt');
const Errors = require('../constants/errors');
const UserServices = require('../services/user-services');

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env['GOOGLE_CLIENT_ID'],
      clientSecret: process.env['GOOGLE_CLIENT_SECRET'],
      callbackURL: '/oauth2/redirect/google',
      scope: ['profile', 'email'],
    },
    async function (accessToken, refreshToken, profile, cb) {
      const data = await User.findOne({
        where: { email: profile.emails[0].value },
      });
      if (data) {
        let { refresh_token, token_version } = data;

        const currentToken = Jwt.verifyRefresh(refresh_token);

        if (
          currentToken.name === Errors.TokenExpiredError ||
          currentToken.token_version !== token_version
        ) {
          const payloadRefresh = {
            username: data.username,
            email: data.email,
            token_version: data.token_version,
          };

          const newRefreshToken = Jwt.signRefresh(payloadRefresh);

          await UserServices.updateRefreshToken(data.email, newRefreshToken);

          // refresh_token = newRefreshToken;
        }

        return cb(null, data);
      } else {
        const payload = {
          username: profile.displayName,
          email: profile.emails[0].value,
          token_version: 0,
        };

        const refresh_token = await Jwt.signRefresh(payload);

        let user = await User.create({
          username: profile.displayName,
          email: profile.emails[0].value,
          password: 'fromGoogleOauth',
          googleId: profile.id,
          refresh_token,
        });

        return cb(null, user);
      }
    }
  )
);

passport.serializeUser(function (user, cb) {
  process.nextTick(function () {
    cb(null, { id: user.id, username: user.username, email: user.email });
  });
});

passport.deserializeUser(function (user, cb) {
  process.nextTick(async function () {
    const data = await UserServices.getUserById(user.id);
    return cb(null, data);
  });
});
