// var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var logger = require('morgan');
var Adapter = require('simple-odata-server-mongodb');
var cors = require('cors');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var file = require('./routes/file');
var userAuth = require('./routes/authenticate');

var app = express();
app.use(cors());
var config = require('./config');
var db = require('./db');
var _dbUrl = config.db_url;
var dbname = config.database;

// swagger document
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json({ limit: '50Mb', type: 'application/json' }));
app.use(express.urlencoded({ limit: '50Mb', extended: false }));
app.use(cookieParser());
app.use(bodyParser.json({ limit: '50Mb', type: 'application/json' }));
app.use(bodyParser.urlencoded({ limit: '50Mb', extended: false, parameterLimit: 5000 }));
app.use(express.static(path.join(__dirname, 'public')));
// app.use(express.static(path.join('http://zobaba.com/photographer/', 'uploads')));
app.use('/uploads', express.static('uploads'));
// app.use('http://zobaba.com/photographer/uploads', express.static('uploads'));

/* set JWT token */
app.use('/userauth', userAuth);
// app.use('/getdata', userAuth);

app.use('/', indexRouter);

/* set OAuth token verification */
app.use('/files', userAuth);
/* user create and login */
app.use('/', usersRouter);

/* file control API */
app.use('/', file);

// catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   next(createError(404));
// });

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// Connect to Mongo on start
db.connect(_dbUrl, dbname, function (err) {
  if (err) {
    console.log(err);
    console.log('Unable to connect to Mongo.');
    // process.exit(1);
  } else {
    console.log('Connected successfully database...');
  }
});

module.exports = app;
