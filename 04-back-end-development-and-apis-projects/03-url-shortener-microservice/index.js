require('dotenv').config();

const express = require('express');
const cors = require('cors');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Basic Configuration
try {
  mongoose.connect(process.env.DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log('mongodb connection established');
} catch (err) {
  console.log(err);
}

const port = process.env.PORT || 3000;

// Model
const schema = new mongoose.Schema({
  original: { type: String, required: true },
  short: { type: Number, required: true },
});
const Url = mongoose.model('Url', schema);

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/shorturl/:input', async (req, res) => {
  const input = parseInt(req.params.input);

  try {
    const found = await Url.findOne({ short: input });
    if (!found)
      return res.json({ error: 'No short URL found for given input' });
    res.redirect(found.original);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});


app.post('/api/shorturl', async (req, res) => {
  const bodyUrl = req.body.url;
  let urlRegex = new RegExp(
    /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/
  );

  if (!bodyUrl.match(urlRegex)) {
    return res.json({ error: 'invalid url' }); // <- note lowercase 'invalid url'
  }

  try {
    // Check if the URL is already in DB
    let found = await Url.findOne({ original: bodyUrl });
    if (found) {
      return res.json({ original_url: found.original, short_url: found.short });
    }

    // Otherwise, assign next short number
    const latest = await Url.findOne().sort({ short: 'desc' });
    const newShort = latest ? latest.short + 1 : 1;

    const newUrl = new Url({ original: bodyUrl, short: newShort });
    await newUrl.save();

    res.json({ original_url: newUrl.original, short_url: newUrl.short });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
