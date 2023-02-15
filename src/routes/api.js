const express = require('express');
const router = express.Router();
const auth = require('../controllers/auth');
const passport = require('passport');
const verifyToken = require('../middlewares/verifyToken');
const { validator, validation } = require('../middlewares/validator');
const { Routes, Services } = require('../constants');

require('../utils/passport-jwt'); // * Requiring passport-jwt strategy

// * Register user
router.post(
  Routes.register,
  [validator(Services.register), validation],
  auth.register
);
// * Login
router.post(Routes.login, [validator(Services.login), validation], auth.login);
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
