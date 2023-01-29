const express = require('express');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { User } = require('../models');
const Jwt = require('../utils/jwt');
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

          await UserServices.updateRefreshToken(user.email, newRefreshToken);

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
    cb(null, { id: user.id, username: user.username });
  });
});

passport.deserializeUser(function (user, cb) {
  process.nextTick(function () {
    return cb(null, user);
  });
});

const router = express.Router();

router.get('/', (req, res) => {
  res.send('Hello World');
});

router.get('/login', function (req, res, next) {
  res.render('login');
});

router.get('/success', function (req, res, next) {
  const data = req.user;
  res.send({ msg: 'login success', data: data });
});

router.get('/failed', function (req, res, next) {
  res.send('login failed');
});

router.get('/login/federated/google', passport.authenticate('google'));

router.get(
  '/oauth2/redirect/google',
  passport.authenticate('google', {
    successRedirect: '/success',
    failureRedirect: '/failed',
  })
);

module.exports = router;
