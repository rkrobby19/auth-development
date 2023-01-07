const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const auth = require('../controllers/auth');
const jsonParser = bodyParser.json();
const passport = require('passport');
require('../utils/passport-jwt'); // * Requiring passport-jwt strategy

// * Register user
router.post('/register', jsonParser, auth.register);
// * Login
router.post('/login', jsonParser, auth.login);

// * Profile
router.get(
  '/profile',
  [passport.authenticate('jwt', { session: false })],
  auth.profile
);

module.exports = router;
