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

console.log('mongodb uri: ',process.env.DB_URI);


// Connect to MongoDB using mongoose
mongoose
  .connect(process.env.DB_URI)
  .then(() => {
    console.log('MongoDB connection established');
  })
  .catch((err) => {
    console.log('Error connecting to the database:', err);
    process.exit(1);
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


app.post('/api/users', (req, res) => {
  res.status(201).json({
    message: 'user saved successfully'
  })
});
app.post('/api/users/:id/exercises', (req, res) => {
  const id = req.params.id;
  let { description, duration, date } = req.body;

  const newExercise = {
    description: description,
    duration: duration,
    date: date ? new Date(date).toDateString() : new Date().toDateString(),
  };

res.status(201).json({newExercise})
});



// Start the server
const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});
