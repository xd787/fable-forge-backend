require('dotenv').config();
require('./models/connection');

var express = require('express');
const bodyParser = require('body-parser');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const http = require('http')

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const storiesRouter = require('./routes/stories')


var app = express();
const cors = require('cors');
app.use(bodyParser.json());
app.use(cors());



// CREA WEBSOCKET SERVER 
const server = http.createServer(app)
server.listen(8001, function (){
    console.log('Server running')
})
const WebSocket = require ('ws')
const wss = new WebSocket.Server({server})

//WEBSOCKET API FABLE FORGE 
const {initializeWebSocket} = require ('./routes/api.js')
initializeWebSocket(server)





app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/stories', storiesRouter)

module.exports = app;
