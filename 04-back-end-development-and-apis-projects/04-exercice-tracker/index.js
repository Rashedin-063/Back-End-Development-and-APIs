const express = require('express');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');
const { Schema } = mongoose;
const bodyParser = require('body-parser');
require('dotenv').config();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());
app.use(express.static('public'));

// Serve the index.html page
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});



// User schema
const userSchema = new Schema(
  {
    username: { type: String, required: true, unique: true },
    exercises: [
      {
        description: String,
        duration: Number,
        date: Date,
      },
    ],
  },
  { versionKey: false }
);

const User = mongoose.model('User', userSchema);
const ERROR = { error: 'There was an error while getting the users.' };



// Start the server
const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});
