require('dotenv').config();
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

app.get('/api/whoami', (req, res) => { 
  // console.log(req.socket.remoteAddress, req.get('accept-language',))
  
  // console.log(req.get('user-agent'));

  // console.log(req.get)
  
  
  
  res.json({
    ipaddress: req.socket.remoteAddress,
    language: req.get('accept-language'),
    software: req.get('user-agent')
  })
})


// listen for requests :)
var listener = app.listen(process.env.PORT || 3000, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
