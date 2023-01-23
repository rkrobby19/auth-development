const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const auth = require('../controllers/auth');
const jsonParser = bodyParser.json();
const passport = require('passport');
const verifyToken = require('../middlewares/verifyToken');
require('../utils/passport-jwt'); // * Requiring passport-jwt strategy

// * Register user
router.post('/register', jsonParser, auth.register);
// * Login
router.post('/login', jsonParser, auth.login);
// * Logout
router.post('/revoke', auth.revoke);

// * Refresh token
router.post('/refresh_token', verifyToken, auth.refresh_token);

// * Profile
router.get(
  '/profile',
  [passport.authenticate('jwt', { session: false })],
  auth.profile
);

module.exports = router;
