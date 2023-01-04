const express = require('express');
const router = express.Router();
const app = express();
const bodyParser = require('body-parser');

const jsonParser = bodyParser.json();

app.use(bodyParser.urlencoded({ extended: true }));

router.get('/register', (req, res) => {
  res.render('register', { tittle: 'Register', js: '', css: '' });
});

router.get('/login', (req, res) => {
  res.render('login', { tittle: 'Login', js: '', css: '' });
});

module.exports = router;
