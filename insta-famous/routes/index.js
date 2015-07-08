var express = require('express');
var cookieParser = require('cookie-parser');
var passport = require('passport');
var router = express.Router();

router.use(cookieParser());

function ensureAuthenticated(req,res,next){
  if(req.isAuthenticated()){
    console.log("USER IS AUTHENTICATED");
    return next();
  }
  console.log("USER IS NOT AUTHENTICATED");
  res.redirect('/home');
}

router.get('/authorize_user', 
  passport.authenticate('instagram'),
  function(req,res){

  });

router.get('/handleauth',
  passport.authenticate('instagram', {failureRedirect: '/home'}),
  function(req,res){
    res.redirect('/basicuser');
  });


router.get('/home', function(req,res){
  res.render('home');
});

router.use(function(req,res,next){
  ensureAuthenticated(req,res,next);
});


/* GET index page. */
router.get('/', function(req, res){

  var db = req.db;
  var collection = db.get('advertcollection');
  var source = req.app.get('imgSource');
  var instaID = req.app.get("instaID");
  var loggedStatus = '';

  
  if(req.isAuthenticated()){
    loggedStatus = "Basic User Logged In";
  }

  collection.find({},{},function(e,docs){
    res.render('index',{
      "userID"  : instaID,
      "userlist" : docs,
      "imgURL" : source,
      "title": "Insta-Famous",
      "loggedStatus" : loggedStatus
    });
  });
});

/* ADD Basic User instaid to database */
router.all('/basicuser', function(req,res){
  console.log("ADDING BASIC USER\n");

  var db = req.db;
  var collection = db.get('usercollection');
  var idCount = 0;

  var instaID = req.app.get("instaID");

  
  collection.findOne({DBinstaID : instaID},function(e,docs){
    console.log("VALUE OF DOCS BASIC USER: %j", docs);

    if(docs){
      idCount++;
    }

    console.log("VALUE OF IDCOUNT: " , idCount);

    if(idCount == 0){
      collection.insert({
        "DBinstaID" : instaID
      }, function(err, result){
        if(err){
          //dispay error
          res.send("Error: " + err);
        }

        console.log("Success! Basic User Added");
        res.redirect('/');

      });

    }
    else{
      console.log("User redirected but already in database");
      res.redirect('/');
    }

  });

});

/* GET adduser form page */
router.get('/adduser', function(req,res){

  res.render('adduser', {"title": "Insta-Famous"});
});

/* ADD User InstaID and Price to Database */
router.post('/adduser', function(req,res){
  console.log("IN ROUTER POST");

  var db = req.db;
  var collection = db.get('advertcollection');

  var instaID = req.app.get("instaID");
  var fullName = req.app.get("fullName");
  var imgURL = req.app.get("imgSource")
  var price = req.body.price;
  console.log("VALUE OF PRICE: " + price + "\n");

  collection.insert({
    "instaID" : instaID,
    "fullName" : fullName,
    "price" : price,
    "imgURL" : imgURL,
    "userType" : "advertiser"
  }, function(err, result){
    if(err){
      //display error
      res.send("Error: " + err);
    } 
  console.log("Success! Advert User Added");

  res.redirect('/');
  });
});

/* GET User page, specific to user via instaid */
router.get('/userpage/:id', function(req,res){
  console.log("IN USER PAGE ROUTE");

  var fullName = req.app.get("fullName");
  var imgURL = req.app.get("imgSource")

  res.render('userpage', {
    "userName" : fullName,
    "imgURL" : imgURL
  });

});


/* DELETE User via their mongodb id*/
router.delete('/deleteuser/:id', function(req,res){
  console.log("IN DELETE ROUTE\n")
  var db = req.db;
  var collection = db.get('advertcollection');
  var targetUser = req.params.id;

  collection.remove({'_id' : targetUser}, function(err){
    if(err){
      res.send('Error ' + err);
    }
    else{
      console.log("REDIRECTING");
      res.end();
    }
  });
});

/* GET logout route */
router.get('/logout', function(req,res){
  req.logout();
  res.render('logout');
});


module.exports = router;
