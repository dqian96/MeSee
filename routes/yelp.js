var express = require('express');
var router = express.Router();
var path = require("path");
var Yelp = require('yelp');
const dotenv = require('dotenv');


/**
 * Load environment variables from .env file, where API keys and passwords are configured.
 */
dotenv.load({ path: 'env_vars' });

var yelp = new Yelp({
  consumer_key: process.env.YELP_CONSUMER_KEY,
  consumer_secret: process.env.YELP_CONSUMER_SECRET,
  token: process.env.YELP_TOKEN,
  token_secret: process.env.YELP_TOKEN_SECRET,
}); 

/* GET home page. */
router.get('/location/:location', function(req, res, next) {
    var location = req.params.location;
    getRatingsOfPlaces(location, function(err, data){
        console.log(data);
    }) 
    res.render('index', { title: 'Express' });
});

function getRatingsOfPlaces(location, callback){
    yelp.search({ location: location , radius_filter : 1500}, function(err, data){
        if(err) throw err;
        var average = 0, sum = 0;
        for(var i = 0; i < data.businesses.length; ++i){
            sum += data.businesses[i].rating;
        }
        average = sum / data.businesses.length;
        callback(null, average);	
    })
}
module.exports = router;
