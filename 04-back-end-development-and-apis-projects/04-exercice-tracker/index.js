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

// Connect to MongoDB using mongoose
mongoose
  .connect(process.env.DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
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

// POST /api/users - Create a new user
app.post('/api/users', async (req, res) => {
  const { username } = req.body;

  try {
    const newUser = new User({ username });
    const savedUser = await newUser.save();
    res.json({ _id: savedUser._id, username: savedUser.username });
  } catch (err) {
    res.send(ERROR);
  }
});

// GET /api/users - Get all users
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find({}, 'username _id');
    res.json(users);
  } catch (err) {
    res.send(ERROR);
  }
});

// POST /api/users/:id/exercises - Add an exercise for a user
app.post('/api/users/:id/exercises', async (req, res) => {
  const { id } = req.params;
  let { description, duration, date } = req.body;

  const newExercise = {
    description,
    duration,
    date: date ? new Date(date).toDateString() : new Date().toDateString(),
  };

  try {
    const user = await User.findById(id);
    if (!user) return res.send(ERROR);

    user.exercises.push(newExercise);
    const savedUser = await user.save();

    const exercise = savedUser.exercises[savedUser.exercises.length - 1];

    const response = {
      username: savedUser.username,
      description: exercise.description,
      duration: exercise.duration,
      date: new Date(exercise.date).toDateString(),
      _id: savedUser._id,
    };

    res.json(response);
  } catch (err) {
    res.send(ERROR);
  }
});

// GET /api/users/:id/logs - Get exercise log for a user
app.get('/api/users/:id/logs', async (req, res) => {
  const { id } = req.params;
  const dateFrom = req.query.from ? new Date(req.query.from) : null;
  const dateTo = req.query.to ? new Date(req.query.to) : null;
  const limit = parseInt(req.query.limit);

  try {
    const user = await User.findById(id);
    if (!user) return res.send(ERROR);

    // Filter exercises based on from and to date range
    let log = user.exercises;

    // Apply "from" and "to" filters if provided
    if (dateFrom) {
      log = log.filter((exercise) => new Date(exercise.date) >= dateFrom);
    }
    if (dateTo) {
      log = log.filter((exercise) => new Date(exercise.date) <= dateTo);
    }

    // Map exercises to desired format: description, duration, and date as string
    log = log.map((exercise) => ({
      description: exercise.description,
      duration: exercise.duration,
      date: new Date(exercise.date).toDateString(), // Convert to string in Date format
    }));

    // Apply the "limit" if provided
    if (limit) log = log.slice(0, limit);

    // Return the user object with count and the log array
    res.json({
      _id: user._id,
      username: user.username,
      count: log.length, // Count the number of exercises in the filtered log
      log: log, // Return the filtered log array
    });
  } catch (err) {
    res.send(ERROR);
  }
});

// Start the server
const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});
