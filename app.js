require('dotenv').config();
require('./models/connection');

var express = require('express');
const bodyParser = require('body-parser');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const http = require('http')
const WebSocket = require ('ws')
const fs = require('fs');
const https = require('https');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const storiesRouter = require('./routes/stories')


var app = express();
const cors = require('cors');
app.use(bodyParser.json());
app.use(cors());


  // Create an HTTPS server
  const server = http.createServer(app);
  
  // Initialize WebSocket Server over HTTPS
  const wss = new WebSocket.Server({server});
  
  // Your WebSocket API initialization function
  const { initializeWebSocket } = require('./routes/api.js');
  initializeWebSocket(wss);
  
  server.listen(8001, () => {
    console.log('Secure WebSocket server running on port 8001');
  });


//   // Read your SSL certificate and key
// const privateKey = fs.readFileSync('path/to/private-key.pem', 'utf8');
// const certificate = fs.readFileSync('path/to/certificate.pem', 'utf8');
// const credentials = { key: privateKey, cert: certificate };

// // Create an HTTPS server
// const httpsServer = https.createServer(credentials, app);

// // Initialize WebSocket Server over HTTPS
// const wss = new WebSocket.Server({ server: httpsServer });

// // Your WebSocket API initialization function
// const { initializeWebSocket } = require('./routes/api.js');
// initializeWebSocket(wss);

// // Start the HTTPS server on port 443 (standard HTTPS port)
// httpsServer.listen(443, () => {
//   console.log('Secure WebSocket server running on port 443');
// });

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/stories', storiesRouter)

module.exports = app;
