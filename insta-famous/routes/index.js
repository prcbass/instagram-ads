var express = require('express');
var router = express.Router();

/* GET home page. */
//Lists Users (Advertisers and Customers)
router.get('/', function(req, res, next) {
  	res.render('index', {
  		title: "Insta-famous"
  	});
});


module.exports = router;
