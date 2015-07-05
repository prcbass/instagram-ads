var express = require('express');
var cookieParser = require('cookie-parser');
var router = express.Router();

router.use(cookieParser());

//Changes url so index becomes /home
router.use(function(req,res,next){
  var reqURL = req.url;
  var urlLetter = reqURL.substr(reqURL.lastIndexOf('/') + 1).substr(0,2);
  console.log("FIRST LETTER AFTER SLASH: " , urlLetter);
  
  if(req.cookies.logstatus === undefined){
    res.cookie('logstatus', 0, {maxAge: (30*60*1000)});
  }
  else if(req.url === '/authorize_user'){
    console.log("IN AUTHORIZE USER\n");
    res.cookie('logstatus', 1, {maxAge: (30*60*1000)});
  }
  else if(urlLetter == "ha" && req.cookies.logstatus == 1){
    console.log("IN HANDLEAUTH\n\n");
  }
    //user trying to go from log-in page to another page
  else if(req.cookies.logstatus == 1 && req.app.get('apiStatus') == false){
    console.log("CAN'T GET AROUND ME\n");
    req.url = '/home';
  }
  else if(req.cookies.logstatus == 0){
    console.log("GOING BACK HOME\n");
    req.url = '/home';
  }
  else{
    console.log("NORMAL ROUTING\n");
  }

  console.log("BOOL OF COOKIE: ", (req.cookies.logstatus==0));
  next();
});

router.get('/home', function(req,res){
  console.log("VALUE OF COOKIE HOME: \n" , req.cookies.logstatus);
  res.render('home');
});


/* GET index page. */
router.get('/', function(req, res){
  var db = req.db;
  var collection = db.get('advertcollection');
  var source = req.app.get('imgSource');
  var loggedStatus = '';

  
  if(req.cookies.logstatus != 0){
    loggedStatus = "Basic User Logged In";
  }

  collection.find({},{},function(e,docs){
    res.render('index',{
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
      res.send('/');
    }
  });
});

/* GET logout route */
router.get('/logout', function(req,res){
  res.cookie('logstatus', 0, { maxAge: (30*60*1000)});
  //res.cookie('apistatus', false, {maxAge: (30*60*1000)});
  req.app.set('apiStatus', false);
  res.render('logout');
})


module.exports = router;
