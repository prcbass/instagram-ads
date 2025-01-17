var express = require('express');
var cookieParser = require('cookie-parser');
var passport = require('passport');
var fs = require('fs');
var Grid = require('gridfs-stream');
var multer = require('multer');
var mongo = require('mongodb');
var router = express.Router();

//var ObjectId = require('mongodb').ObjectId

var upload = multer({dest:'uploads/'});

//Not sure if needed atm
router.use(cookieParser());

/* GET HOME PAGE */
router.get('/home', function(req,res){
  res.render('home');
});

/* General function that is run at the beginning of every request 
after /home to check if user is authenticated */
function ensureAuthenticated(req,res,next){
  if(req.isAuthenticated()){
    console.log("USER IS AUTHENTICATED OK");
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

  var tAudience = req.app.get("audienceArr");

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
          "userID" : UinstaID,
          "tAudience" : tAudience
        });
      });
      
    });
  }
});

/* POST made when user searches from the index */
router.post('/', function(req,res){
  var db = req.db;
  var collection = db.get('advertcollection');

  var UinstaID = req.app.get("instaID");
  var loggedStatus = '';
  var jUserType = '';

  var tAudience = req.app.get("audienceArr");
  //Make array of selected search audiences 

  var selectedTypes = [];

  for(i=0; i < tAudience.length; i++){
    if(req.body[tAudience[i]] == "on"){
      selectedTypes.push(tAudience[i]);
      console.log("ARRAY RESPONSE INDEX: ", selectedTypes);
    }
  }

  if(selectedTypes.length == 0){
    collection.find({userType : "advertiser"},{},function(e,docs){
      res.render('index',{
        "userlist" : docs,
        "title": "Insta-Famous",
        "loggedStatus" : loggedStatus,
        "jUserType" : jUserType,
        "userID" : UinstaID,
        "tAudience" : tAudience
      });
    });
  }
  //queries mongodb based on contents of selectedTypes **NEED TO CHANGE NAMES** 
  else{

    var query = {userType:"advertiser"};
    query["$or"] = [];

    for(i=0; i<selectedTypes.length; i++){
      query["$or"].push({"targetAudience":selectedTypes[i]});
    }

    console.log("QUERY: ", query);

    collection.find(query,{},function(e,docs){
      res.render('index',{
        "userlist" : docs,
        "title": "Insta-Famous",
        "loggedStatus" : loggedStatus,
        "jUserType" : jUserType,
        "userID" : UinstaID,
        "tAudience" : tAudience
      });
    });
  }
});

/* GET for page where user chooses advertisers */
router.get('/chooseadvertisers', function(req,res){
  var db = req.db;
  var collection = db.get('advertcollection');
  var tAudience = req.app.get("audienceArr");

  collection.find({userType : "advertiser"},{},function(e,docs){
    res.render('chooseadvertisers',{
      "userlist" : docs,
      "tAudience" : tAudience
    });
  });
});

/* POST for getting which advertisers are associated with a post */
router.post('/postadvertisers', function(req,res){
  console.log(req.body.result);

  var selectedAdvertisers = req.body.result;

  var db = req.db;

  //collection for creator
  var collection = db.get('postcollection');

  //get ObjectId of post entry in db to use in advertiser collection
  //collection.find()

  //collection for advertisers

  //collection for posts
  res.redirect('/chooseadvertisers');
});


/* POST for chooseadvertisers, simply allows for searching of target audience in chooseadvertiser route*/
router.post('/chooseadvertisers',function(req,res){
  var db = req.db;
  var collection = db.get('advertcollection');

  var UinstaID = req.app.get("instaID");
  var loggedStatus = '';
  var jUserType = '';

  var tAudience = req.app.get("audienceArr");
  //Make array of selected search audiences 

  var selectedTypes = [];

  for(i=0; i < tAudience.length; i++){
    if(req.body[tAudience[i]] == "on"){
      selectedTypes.push(tAudience[i]);
      console.log("ARRAY RESPONSE INDEX: ", selectedTypes);
    }
  }

  if(selectedTypes.length == 0){
    collection.find({userType : "advertiser"},{},function(e,docs){
      res.render('chooseadvertisers',{
        "userlist" : docs,
        "tAudience" : tAudience
      });
    });
  }
  //queries mongodb based on contents of selectedTypes
  else{

    //Dynamic queries 
    var query = {userType:"advertiser"};
    query["$or"] = [];

    for(i=0; i<selectedTypes.length; i++){
      query["$or"].push({"targetAudience":selectedTypes[i]});
    }

    console.log("QUERY: ", query);

    collection.find(query,{},function(e,docs){
      res.render('chooseadvertisers',{
        "userlist" : docs,
        "tAudience" : tAudience
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
        "imgURL" : imgURL
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

/*GET for create post page */
router.get('/createpost', function(req,res){
  res.render('createpost');
});

var cpUpload = upload.single('postImg');

/* POST for create post page NOTE: storepost used to prevent name conflict */
router.post('/storepost', cpUpload, function(req,res){
  var db = req.db;
  var collection = db.get('postcollection');
  var UinstaID = req.app.get("instaID");
  
  console.log("\nPOST FROM BODY: %j", req.body);
  console.log("\nPOST FROM FILE: %j", req.file.path);

  var tmp_path = req.file.path;
  var target_path = './public/images/' + req.file.originalname;

  fs.rename(tmp_path, target_path, function(err){
    if(err){
      throw err;
    }
    fs.unlink(tmp_path, function(){
      console.log("NEW POST ID", collection.id());
      collection.insert({
        "instaID" : UinstaID,
        "imgName" : req.file.originalname,
        "postText" : req.body.postText
      }, function(err, result){
        if(err){
          //dispay error
          res.send("Error: " + err);
        }

        console.log("Yay! User post created.");
        res.redirect('/chooseadvertisers');

      });

      collection.findOne({})

    });
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

/* GET PREVIOUS POSTS ROUTE */
router.get('/previousposts', function(req,res){
  var db = req.db;
  var collection = db.get('postcollection');
  var UinstaID = req.app.get("instaID");

  collection.find({instaID:UinstaID},{}, function(e,docs){
    if(e){
      console.log("Error: ", e);
      res.send(e);
    }
    if(docs.length != 0){
      console.log("\nFOUND POSTS")
      res.render('previousposts',{
        "postcollection" : docs,
        "postStatus" : " "
      });
    }
    else{
      console.log("\nNO POSTS");
      res.render('previousposts',{
        "postcollection" : 0,
        "postStatus" : "Oops, no posts made"
      });
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
