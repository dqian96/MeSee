var express = require('express');
var router = express.Router();
var path = require("path");

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

function getRatingsOfPlaces(location, callback){
    yelp.search({ location: location }, function(err, data){
        if(err) throw err;
        for(var i = 0; i < data.length; ++i){
            
        }
        callback(null, data);	
    })
}
module.exports = router;
