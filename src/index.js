require('dotenv').config();
const express = require('express');
const path = require('path');
const app = express();
const session = require('express-session');
const cookieParser = require('cookie-parser');
const ejs = require('ejs');
const passport = require('passport');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST');
  res.setHeader('Access-Control-Allow-Headers', 'content-type');
  next();
});

app.set('trust proxy', 1); // trust first proxy
app.use(
  session({
    store: new (require('connect-pg-simple')(session))({
      conString: 'postgres://postgres:postgres@localhost:5432/auth_development',
      createTableIfMissing: true,
    }),
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 24 * 60 * 60 * 1000 },
  })
);

app.use(cookieParser());

// initialize passport to be used
app.use(passport.initialize());
// using session cookies
app.use(passport.session());

const apiRouter = require('./routes/api');
const indexRouter = require('./routes/index');

app.use('/', indexRouter);

app.use('/api', apiRouter);

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`The server is listening on port http://localhost:${PORT}`);
});
