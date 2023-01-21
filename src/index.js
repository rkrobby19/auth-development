require('dotenv').config();
const express = require('express');
const path = require('path');
const app = express();
const session = require('express-session');
const ejs = require('ejs');
const passport = require('passport');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.set('trust proxy', 1); // trust first proxy
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true },
  })
);

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
