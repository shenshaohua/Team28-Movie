var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mysql = require('mysql');
var bodyParser = require('body-parser');
var fileUpload = require('express-fileupload');


var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// connect to the database
// the mysql.createConnection function takes in a configuration object which contains host, user, password and the database name.
var db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '123456',
  database: 'team28'
});

db.connect((err) => {
  if (err) {
    console.log("[mysql error]",err);
  }
  console.log('Connected to database');
});
global.db = db;

// specify the port number (I am not sure how to do this, and will use the default 3000 port for now)
//var port = 5000;


// view engine setup & configure middleware
//app.set('port', process.env.port || port); // set express to use this port

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use(bodyParser.json()); // parse form data client
app.use(fileUpload()); // configure fileupload

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});
app.listen(3000, '127.0.0.1');
module.exports = app;
