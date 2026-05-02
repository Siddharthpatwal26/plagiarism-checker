const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const checkRoute = require('./routes/checkRoute');

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use('/api', checkRoute);

app.get('/', (req, res) => {
  res.send('Plagiarism Checker Backend Running!');
});

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB Connected!');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log('MongoDB Error:', err);
  });