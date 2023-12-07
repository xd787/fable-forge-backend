require('dotenv').config();
require('./models/connection');

var express = require('express');
const bodyParser = require('body-parser');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const http = require('http')
const WebSocket = require ('ws')

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const storiesRouter = require('./routes/stories')


var app = express();
const cors = require('cors');
app.use(bodyParser.json());
app.use(cors());

// Créer un serveur HTTP
const server = http.createServer(app);
  
// Initialize WebSocket Server over HTTPS
const wss = new WebSocket.Server({server});
  
// Your WebSocket API initialization function
const { initializeWebSocket } = require('./routes/api.js');
initializeWebSocket(wss);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/stories', storiesRouter)

module.exports = app;
