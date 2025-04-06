require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use('/public', express.static(`${process.cwd()}/public`));

// Connect to Mongo
mongoose
  .connect(process.env.DB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log(err));

// Schema and Model
const urlSchema = new mongoose.Schema({
  original: String,
  short: Number,
});

const Url = mongoose.model('Url', urlSchema);

// Routes
app.get('/', (req, res) => {
  res.sendFile(process.cwd() + '/views/index.html');
});

app.get('/api/shorturl/:input', async (req, res) => {
  const shortId = parseInt(req.params.input); // The `short_url` we need to redirect to

  try {
    // Find the URL with the corresponding short_id
    const found = await Url.findOne({ short: shortId });
    if (!found) {
      return res.json({ error: 'No short URL found for given input' });
    }

    // Redirect to the original URL
    res.redirect(found.original);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});


app.post('/api/shorturl', async (req, res) => {
  const bodyUrl = req.body.url;

  // Validate the URL
  const urlRegex =
    /^(https?:\/\/)?([a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*)(:[0-9]+)?(\/.*)?$/;
  if (!urlRegex.test(bodyUrl)) {
    return res.json({ error: 'invalid url' });
  }

  try {
    // Check if the URL already exists
    const existing = await Url.findOne({ original: bodyUrl });
    if (existing) {
      return res.json({
        original_url: existing.original,
        short_url: existing.short,
      });
    }

    // Create new short_url (auto-increment logic)
    const count = await Url.countDocuments({});
    const newShort = count + 1;

    const newUrl = new Url({ original: bodyUrl, short: newShort });
    await newUrl.save();

    res.json({
      original_url: newUrl.original,
      short_url: newUrl.short,
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});




const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
