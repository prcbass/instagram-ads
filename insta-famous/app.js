var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var session = require('express-session');
var fs = require('fs');
var multer = require('multer');

//Mongo Database
var mongo = require('mongodb');
var monk = require('monk');
var db;


//var mongoose = require('mongoose');
//mongoose.connect('mongodb://localhost:27017/test-api');

//Instagram-API
var api = require('instagram-node').instagram();

//Cookie Manager
var cookieParser = require('cookie-parser');

//Grid
var Grid = require('gridfs-stream');

//Passport
var passport = require('passport');
var InstagramStrategy = require('passport-instagram').Strategy;

var routes = require('./routes/index');
//var users = require('./routes/users');

var app = express();

//changes db connection based on host
app.use(function(req,res,next){
  if(req.get('host') == 'localhost:3000'){
    db = monk('localhost:27017/test-api');
  }
  else{
    db = monk('toutloud.com:27017/test-api');
  }
  next();
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(methodOverride());
app.use(session({secret: 'keyboard cat', resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));

// Make our db accessible to our router
app.use(function(req,res,next){
    req.db = db;
    next();
});

var INSTAGRAM_CLIENT_ID = "3368cd2a15ec494383b2d21d0a28ff60"
var INSTAGRAM_CLIENT_SECRET = "6cf80d749cf1474089d4908ca26b3dcd"
var callBackUrl;

app.use(function(req,res, next){
  if(req.get('host') == 'localhost:3000'){
    callBackUrl = 'http://localhost:3000/handleauth'; 
  }
  else{
    callBackUrl = 'http://toutloud.com/handleauth';
  }
  console.log('CALL BACK URL: ', callBackUrl);

  passport.serializeUser(function(user,done){
    done(null,user);
  });

  passport.deserializeUser(function(obj,done){
    done(null,obj);
  });

  passport.use(new InstagramStrategy({
    clientID: INSTAGRAM_CLIENT_ID,
    clientSecret: INSTAGRAM_CLIENT_SECRET,
    callbackURL: callBackUrl
  },
  function(accessToken, refreshToken, profile, done){
    process.nextTick(function(){
      app.set('instaID', profile.id.toString());
      app.set('fullName', profile.displayName);
      app.set('imgSource', profile._json.data.profile_picture);

      return done(null,profile.id);
    });
  }));

  next();
});

console.log("URL: ", callBackUrl)

app.use('/', routes);
//app.use('/users', users);

//INSTAGRAM AUTHENTICATION---------------------------------------------------------------------



//global variable holding current audience types
var audienceTypes = ["AUTOMOTIVE", "ELECTRONICS", "SPORTS", "MISC"];
app.set("audienceArr", audienceTypes);

//global variable holding mongoDB ObjectId of most recently created post
app.set("recentPostID", 0);

//----------------------------------------------------------------------------------------------



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
