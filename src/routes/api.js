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
router.post('/revoke', verifyToken, auth.revoke);

// * Refresh token
router.post('/refresh-token', verifyToken, auth.refreshToken);

// * Profile
router.get(
  '/profile',
  [passport.authenticate('jwt', { session: true })],
  auth.profile
);

module.exports = router;
