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

app.post('/api/shorturl', async (req, res) => {
  const bodyUrl = req.body.url;
  let urlRegex = /^https?:\/\/(www\.)?[\w\-]+\.\w{2,}(\/[\w\-./?%&=]*)?$/;

  if (!urlRegex.test(bodyUrl)) {
    return res.json({ error: 'invalid url' });
  }

  try {
    // Check if already exists
    const found = await Url.findOne({ original: bodyUrl });
    if (found) {
      return res.json({
        original_url: found.original,
        short_url: found.short,
      });
    }

    // Assign next short number
    const count = await Url.estimatedDocumentCount();
    const newUrl = new Url({ original: bodyUrl, short: count + 1 });
    await newUrl.save();

    res.json({
      original_url: newUrl.original,
      short_url: newUrl.short,
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/shorturl/:input', async (req, res) => {
  const shortId = parseInt(req.params.input);

  try {
    const found = await Url.findOne({ short: shortId });
    if (!found)
      return res.json({ error: 'No short URL found for given input' });

    res.redirect(found.original);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
