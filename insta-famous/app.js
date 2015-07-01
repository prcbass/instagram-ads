var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

//Mongo Database
var mongo = require('mongodb');
var monk = require('monk');
var db = monk('localhost:27017/test-api');

//Instagram-API
var api = require('instagram-node').instagram();

var routes = require('./routes/index');
//var users = require('./routes/users');

var app = express();

//Sets default picture for user (this is being saved to database. Uncomment if default image needed)
//var defaultSource = "http://naccrra.org/sites/default/files/default_site_pages/2013/instagram-icon.png";
//app.set('imgSource', defaultSource);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Make our db accessible to our router
app.use(function(req,res,next){
    req.db = db;
    next();
});

app.use('/', routes);
//app.use('/users', users);


//INSTAGRAM AUTHENTICATION---------------------------------------------------------------------

api.use({
  client_id: "3368cd2a15ec494383b2d21d0a28ff60",
  client_secret: "6cf80d749cf1474089d4908ca26b3dcd"
  //access_token: "280430135.3368cd2.5b0f100ef30e43d8a23825f5637ef38c"
});
  
var redirect_uri = 'http://localhost:3000/handleauth';

exports.authorize_user = function(req, res) {
  res.redirect(api.get_authorization_url(redirect_uri, { scope: ['likes+relationships'], state: 'a state' }));
};
  
 
exports.handleauth = function(req, res) {
  api.authorize_user(req.query.code, redirect_uri, function(err, result) {
    if (err) {
      console.log(err.body);
      res.send("Didn't work");
    } else {
      console.log('Yay! Access token is ' + result.access_token);

      app.set('instaID', result.user.id.toString());
      app.set('fullName', result.user.full_name);
      res.redirect('/render_user');
    }
  });
};

exports.renderUser = function(req, res){
  console.log("STARTING RENDERING");

  //var userID = "280430135";
  console.log("USER ID: " + app.get('instaID'));
  console.log("FULL NAME: " + app.get('fullName') + "\n");

  api.user(app.get('instaID'), function(err, result, remaining, limit){
    if(err){
      console.log("current user " + err);
    }
    app.set('imgSource', result.profile_picture);
    console.log("WAITING FOR REDIRECT\n");
    res.redirect("/adduser");
  });
};

app.get('/authorize_user', exports.authorize_user);
app.get('/handleauth', exports.handleauth); 
app.get('/render_user', exports.renderUser);

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
