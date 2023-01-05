const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const auth = require('../controllers/auth');
const jsonParser = bodyParser.json();

// * Register user
router.post('/register', jsonParser, auth.register);
// * Login
router.post('/login', jsonParser, auth.login);

module.exports = router;
