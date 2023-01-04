require('dotenv').config();
const express = require('express');
const app = express();
const path = require('path');

const pageRouter = require('./routes/index');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use('/utils', express.static(path.join(__dirname, 'utils')));

app.get('/', (req, res) => {
  res.send('Hello World');
});

app.use('/', pageRouter);

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`The server is listening on port http://localhost:${PORT}`);
});
