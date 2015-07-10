var express = require('express');
var cookieParser = require('cookie-parser');
var passport = require('passport');
var router = express.Router();

router.use(cookieParser());

/* General function that is run at the beginning of every request 
after /home to check if user is authenticated */
function ensureAuthenticated(req,res,next){
  if(req.isAuthenticated()){
    console.log("USER IS AUTHENTICATED");
    return next();
  }
  console.log("USER IS NOT AUTHENTICATED");
  res.redirect('/home');
}

/* GET authorize_user page, via passport */
router.get('/authorize_user', 
  passport.authenticate('instagram'),
  function(req,res){

  });

/* GET handleauth route, redirects to basicuser */
router.get('/handleauth',
  passport.authenticate('instagram', {failureRedirect: '/home'}),
  function(req,res){
    res.redirect('/basicuser');
  });

/* GET HOME PAGE */
router.get('/home', function(req,res){
  res.render('home');
});

/* SEE function above */
router.use(function(req,res,next){
  ensureAuthenticated(req,res,next);
});


/* GET index page. */
router.get('/', function(req, res){

  var db = req.db;
  var collection = db.get('advertcollection');

  var UinstaID = req.app.get("instaID");
  var loggedStatus = '';
  var jUserType = '';

  
  if(req.isAuthenticated()){
    collection.findOne({instaID:UinstaID},function(e,docs){
      if(e){
        res.send("Error: ", e);
      }
      if(docs.userType == "advertiser"){
        loggedStatus = "Advertiser logged in";
        jUserType = "advertiser";
      }
      else if(docs.userType == "basic"){
        loggedStatus = " Basic User Logged in";
        jUserType = "basic";
      }
      else{
        loggedStatus = "Unknown user logged in";
      }

      collection.find({userType : "advertiser"},{},function(e,docs){
        res.render('index',{
          "userlist" : docs,
          "title": "Insta-Famous",
          "loggedStatus" : loggedStatus,
          "jUserType" : jUserType,
          "userID" : UinstaID
        });
      });
    });
  }
});

/* ADD Basic User instaid to database */
router.all('/basicuser', function(req,res){
  console.log("ADDING BASIC USER\n");

  var db = req.db;
  var collection = db.get('advertcollection');
  var idCount = 0;

  var UinstaID = req.app.get("instaID");
  var fullName = req.app.get("fullName");
  var imgURL = req.app.get("imgSource")

  
  collection.findOne({instaID : UinstaID},function(e,docs){
    console.log("VALUE OF DOCS BASIC USER: %j", docs);

    if(docs){
      idCount++;
    }

    console.log("VALUE OF IDCOUNT: " , idCount);

    if(idCount == 0){
      collection.insert({
        "userType" : "basic",
        "instaID" : UinstaID,
        "fullName" : fullName,
        "price" : null,
        "imgURL" : imgURL,
        "contact" : null,
        "targetAudience" : null
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
  var targetAudience = req.app.get("audienceArr");

  res.render('adduser', {"title": "Insta-Famous", "targetAudience": targetAudience});
});

/* ADD User InstaID and Price to Database */
router.post('/adduser', function(req,res){
  console.log("IN ROUTER POST");

  var db = req.db;
  var collection = db.get('advertcollection');

  var UinstaID = req.app.get("instaID");
  var fullName = req.app.get("fullName");
  var imgURL = req.app.get("imgSource")
  var price = req.body.price;
  var contact = req.body.contact;

  var audienceArr = req.app.get("audienceArr");
  var selectedTypes = [];


//Makes array "selectedTypes" that holds all the checkboxes the user selected
  for(i=0; i < audienceArr.length; i++){
    if(req.body[audienceArr[i]] == "on"){
      selectedTypes.push(audienceArr[i]);
      console.log("ARRAY RESPONSE: ", selectedTypes[i]);
    }
  }

  collection.findOne({instaID: UinstaID}, function(e,docs){
    if(e){
      res.send("Err: ", e);
    }
    if(docs){
      console.log("UPDATING EXISTING USER");
      collection.update({instaID: UinstaID}, {$set: {
        "userType" :"advertiser",
        "price": price,
        "contact":contact,
        "targetAudience" : selectedTypes
      }}, function(err,result){
        if(err){
          res.send("Error: " + err);
        }
      });

      res.redirect('/');
    }
    //Should not occur unless docs is null (in which case 
    //something went wrong in /basicuser)
    else{
      console.log("INSERTING NEW USER");
      collection.insert({
        "instaID" : UinstaID,
        "fullName" : fullName,
        "price" : price,
        "imgURL" : imgURL,
        "contact" : contact,
        "userType" : "advertiser",
        "targetAudience" : targetAudience
      }, function(err, result){
        if(err){
          //display error
          res.send("Error: " + err);
        } 

        console.log("Success! Advert User Added");
      });

      console.log("REDIRECTING TO INDEX FROM ADD USER")
      res.redirect('/');
    }
  });
});

/* GET User page, specific to user via instaid */
router.get('/userpage/:id', function(req,res){
  console.log("IN USER PAGE ROUTE");

  var db = req.db;
  var collection = db.get('advertcollection');
  var targetAudience = req.app.get("audienceArr");
  var selectedTypes = [];

  collection.findOne({instaID : req.params.id}, function(e,docs){
    selectedTypes = docs.targetAudience;
    if(docs.userType == "advertiser"){
      res.render('advertpage', {
        "userName" : docs.fullName,
        "contactEmail" : docs.contact,
        "imgURL" : docs.imgURL,
        "price" : docs.price,
        "targetAudience" : targetAudience,
        "selectedTypes" : selectedTypes
      });
    }
    else if(docs.userType == "basic"){
      res.render('userpage',{
        "userName" : docs.fullName,
        "imgURL" : docs.imgURL
      });
    }
    else{
      res.send("ERROR USER TYPE NOT FOUND");
    }
  });

});


/* CHANGES USER TYPE BACK TO BASIC */
router.delete('/deleteuser/:id', function(req,res){
  console.log("IN DELETE ROUTE\n")
  var db = req.db;
  var collection = db.get('advertcollection');
  var targetUser = req.params.id;


  collection.update({'_id': targetUser}, {$set: {
    "userType" :"basic",
    "price": null,
    "contact":null,
    "targetAudience" : null
  }}, function(err,result){
    if(err){
      res.send("Error: " + err);
    }
    else{
      console.log("\'DELETED'\ USER, REDIRECTING");
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
