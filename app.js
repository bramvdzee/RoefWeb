var express = require('express');
var exphbs = require('express-handlebars');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var cors = require('cors');
var mysql = require("mysql");
var LocalStorage = require('node-localstorage').LocalStorage;
localStorage = new LocalStorage('./scratch');

var index = require('./routes/index');
var webLogin = require("./routes/login");
var webLogout = require("./routes/logout");
var webDagstaat = require('./routes/beheer/dagstaat');
var webPersoneel = require('./routes/beheer/personeel');
var webKlant = require('./routes/beheer/klant');
var webWagen = require('./routes/beheer/wagen');
var webKenteken = require('./routes/beheer/kenteken');

var medewerker = require('./routes/api/medewerker');
var dagstaat = require('./routes/api/dagstaat');
var kenteken = require('./routes/api/kenteken');
var klant = require('./routes/api/klant');
var rol = require('./routes/api/rol');
var wagentype = require('./routes/api/wagentype');
var login = require('./routes/api/login');
var weekstaat = require('./routes/api/weekstaat');

var app = express();

var hbs = exphbs.create({
  defaultLayout: 'main',
  extname: '.hbs',
  helpers:
  {
    ifEq: function(v1, v2, options)
    {
      if(v1 === v2) {
        return options.fn(this);
      }
      return options.inverse(this);
    }
  }

});

// view engine setup
app.engine('.hbs', hbs.engine);
app.set('view engine', '.hbs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(cors({origin: '*'}));

app.use('/', index);
app.use('/login', webLogin);
app.use('/logout', webLogout);
app.use('/dagstaat', webDagstaat);
app.use('/personeel', webPersoneel);
app.use('/klant', webKlant);
app.use('/wagen', webWagen);
app.use('/kenteken', webKenteken);

app.use('/api/medewerker', medewerker);
app.use('/api/dagstaat', dagstaat);
app.use('/api/kenteken', kenteken);
app.use('/api/klant', klant);
app.use('/api/rol', rol);
app.use('/api/wagentype', wagentype);
app.use('/api/login', login);
app.use('/api/weekstaat', weekstaat);

app.locals.storage = localStorage;

app.locals.connection = mysql.createConnection({
  host: "databases.aii.avans.nl",
  user: "bpzee",
  password: "Ab12345",
  database: "bpzee_db2"
});

app.locals.connection.connect(function(err){
  if(err){
    console.log('Error connecting to Db');
    return;
  }
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render(err.message);
});

module.exports = app;
