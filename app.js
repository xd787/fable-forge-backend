require('dotenv').config();
require('./models/connection');

var express = require('express');
const bodyParser = require('body-parser');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const storiesRouter = require('./routes/stories')
const apiRouter = require('./routes/api')

var app = express();
const cors = require('cors');
app.use(bodyParser.json());
app.use(cors());


const http = require('http');
const { initializeWebSocket } = require('./routes/api');
const server = http.createServer(app);
initializeWebSocket(server); // Pass the HTTP server instance to initializeWebSocket
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/stories', storiesRouter)
app.use('/api', apiRouter)

module.exports = app;
