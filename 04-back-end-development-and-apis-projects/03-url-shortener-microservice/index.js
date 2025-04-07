require('dotenv').config();

console.log(process.env.DB_URI);

const express = require('express');
const cors = require('cors');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


const port = process.env.PORT || 3000;

// Connect to MongoDB using mongoose
mongoose
  .connect(process.env.DB_URI)
  .then(() => {
    console.log('MongoDB connection established');
  })
  .catch((err) => {
    console.log('Error connecting to the database:', err);
    // process.exit(1);
  });

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
app.get('/api/shorturl/:input', async(req, res) => {
  const input = parseInt(req.params.input)
 
 try {
   const foundUrl = await Url.findOne({ short: input });
   
   if (foundUrl) {
     return res.redirect(foundUrl.original);
   } else {
     return res.status(404).json({
       message: 'URL not found'
     })
   }

 } catch (error) {
   res.status(500).json({
    message: error.message
  })
 }
});

// callback way
// app.post('/api/shorturl', async(req, res) => {
//   const bodyUrl = req.body.url
//   console.log(bodyUrl);

//   let urlRegex = new RegExp(
//     /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&\/\/=]*)/
//   );

//   if (!bodyUrl.match(urlRegex)) {
//     return res.json({ error: 'Invalid URL' });
//   }

//     let index = 1;



// Url.findOne({ original: bodyUrl }, (err, existing) => {
//   if (err) return res.json({ error: 'DB error.' });

//   if (existing) {
//     // URL already exists, return existing short
//     return res.json({
//       original_url: existing.original,
//       short_url: existing.short,
//     });
//   }

//   // URL doesn't exist, get the highest short and insert new
//   Url.findOne({})
//     .sort({ short: 'desc' })
//     .exec((err, latest) => {
//       if (err) return res.json({ error: 'DB error.' });
      

//       const index = latest ? latest.short + 1 : 1;

//       Url.create({ original: bodyUrl, short: index }, (err, newUrl) => {
//         if (err) return res.json({ error: 'Failed to save.' });

//         res.json({
//           original_url: newUrl.original,
//           short_url: newUrl.short,
//         });
//       });
//     });
// });

// });

// async await way
app.post('/api/shorturl', async (req, res) => {
  const bodyUrl = req.body.url;

  try {
    // 1. Check if the URL already exists
    const existing = await Url.findOne({ original: bodyUrl });

    if (existing) {
      return res.json({
        original_url: existing.original,
        short_url: existing.short,
      });
    }

    // 2. Get the latest short value
    const latest = await Url.findOne().sort({ short: 'desc' });
    const index = latest ? latest.short + 1 : 1;

    // 3. Create a new shortened URL
    const newUrl = await Url.create({ original: bodyUrl, short: index });

    return res.json({
      original_url: newUrl.original,
      short_url: newUrl.short,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Something went wrong.' });
  }
});



app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
