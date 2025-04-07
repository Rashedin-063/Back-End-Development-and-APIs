var express = require('express');
var app = express();


var cors = require('cors');
app.use(cors({ optionsSuccessStatus: 200 })); // some legacy browsers choke on 204
app.use(express.static('public'));

// home route
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/views/index.html');
});

// your first API endpoint...
app.get('/api/hello', function (req, res) {
  res.json({ greeting: 'hello API' });
});

app.get('/api/:date', (req, res) => {
  const paramsDate = req.params.date;
  const invalidDate = 'Invalid Date';
  const date = paramsDate > 1000 ? new Date (parseInt(paramsDate)) : new Date(paramsDate);


  console.log(new Date(parseInt(paramsDate)));
  

   date.toString() === invalidDate
     ? res.json({ error: invalidDate })
     : res.json({ unix: date.valueOf(), utc: date.toUTCString() });
})


// Listen on port set in environment variable or default to 3000
var listener = app.listen(process.env.PORT || 3000, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
