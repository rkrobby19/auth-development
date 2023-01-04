require('dotenv').config();
const express = require('express');
const path = require('path');
const app = express();

const apiRouter = require('./routes/api');

app.get('/', (req, res) => {
  res.send('Hello World');
});

app.use('/api', apiRouter);

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`The server is listening on port http://localhost:${PORT}`);
});
