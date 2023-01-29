const express = require('express');
const passport = require('passport');
require('../utils/passport-google'); // * Requiring passport-google strategy

const router = express.Router();

router.get('/', (req, res) => {
  res.send('Hello World');
});

router.get('/login', function (req, res, next) {
  res.render('login');
});

router.get('/success', function (req, res, next) {
  const { username } = req.user;
  res.send({ message: 'login success', username });
});

router.get('/login/federated/google', passport.authenticate('google'));

router.get(
  '/oauth2/redirect/google',
  passport.authenticate('google', {
    failureRedirect: '/login',
    successRedirect: '/success',
  })
);

module.exports = router;
