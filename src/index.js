require('dotenv').config();
const express = require('express');

const app = express();
const PORT = process.env.PORT || 8000;

app.get('/', (req, res) => {
  res.send('Hello World');
});

app.listen(PORT, () => {
  console.log(`The server is listening on port http://localhost:${PORT}`);
});
