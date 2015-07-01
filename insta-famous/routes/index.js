var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res){
  var db = req.db;
  var collection = db.get('usercollection');
  var source = req.app.get('imgSource');
  console.log("IN INDEX: IMG SOURCE: " + source + "\n");
  collection.find({},{},function(e,docs){
    res.render('index',{
      "userlist" : docs,
      "imgURL" : source,
      "title": "Insta-Famous"
    });
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
  var collection = db.get('usercollection');

  var instaID = req.app.get("instaID");
  var fullName = req.app.get("fullName");
  var imgURL = req.app.get("imgSource")
  var price = req.body.price;
  console.log("VALUE OF PRICE: " + price + "\n");

  collection.insert({
    "instaID" : instaID,
    "fullName" : fullName,
    "price" : price,
    "imgURL" : imgURL
  }, function(err, result){
    if(err){
      //display error
      res.send("Error: " + err);
    } 
  console.log("Success! User Added");

  res.redirect('/');
  });
});


/* DELETE User via their mongodb id*/
router.delete('/deleteuser/:id', function(req,res){
  console.log("IN DELETE ROUTE\n")
  var db = req.db;
  var collection = db.get('usercollection');
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


module.exports = router;
