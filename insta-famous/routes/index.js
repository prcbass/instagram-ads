var express = require('express');
var router = express.Router();

/* GET home page. */
//Lists Users (Advertisers and Customers)
router.get('/', function(req, res, next) {
  var db = req.db;
  var collection = db.get('usercollection');
  collection.find({},{},function(e,docs){
  	res.render('index', {
  		title: "Insta-famous",
  		//"userList" : docs WAS USED FOR BULLET POINTS BUT TAKEN OUT
  	});
  });
});


module.exports = router;
