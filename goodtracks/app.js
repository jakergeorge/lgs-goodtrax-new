require('./db');
require('./auth');

var passport = require('passport');

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');






var LocalStrategy = require('passport-local').Strategy;



var index = require('./routes/index');

var app = express();

var session = require('express-session');

var RedisStore = require('connect-memcached')(session);
var redisUrl = require('redis-url');


MemcachedStore = require('connect-memcached')(session);


var sessionOptions = {
     proxy   : 'true', store   : new MemcachedStore({
    hosts: ['memcached-12845.c10.us-east-1-3.ec2.cloud.redislabs.com:12845'],
    secret: '123, easy as ABC. ABC, easy as 123' // Optionally use transparent encryption for memcache session data
}),

    secret: "lifeishard1289",
    resave: false,
    saveUninitialized: true
};

/*
var sessionStore = new RedisStore({client: redisUrl.connect('redis-10987.c10.us-east-1-3.ec2.cloud.redislabs.com:10987')});

var sessionOptions = {
    store: sessionStore,
    secret: "lifeishard1289",
    resave: true,
    saveUninitialized: true
};
*/
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Non-default middleware

app.use(session(sessionOptions));
app.use(passport.initialize());
app.use(passport.session());


// NOTE: add some middleware that drops req.user into the context of
// every template
app.use(function(req, res, next){
    res.locals.user = req.user;
    next();
});


app.use('/', index);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
