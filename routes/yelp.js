var express = require('express');
var router = express.Router();
var path = require("path");
var Yelp = require('yelp');


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
        res.json(data);
    }) 
});


router.get('/location1/:location', function(req, res, next) {
    var location = req.params.location;
    getReviewsOfNearbyPlaces(location, function(err, data){
        console.log(data);
        res.json(data);
    })
    res.render('index'); 
});

function getRatingsOfPlaces(location, callback){
    yelp.search({ location: location , radius_filter : 1500}, function(err, data){
        if(err) throw err;
        var average = 0, sum = 0;
        for(var i = 0; i < data.businesses.length; ++i){
            sum += data.businesses[i].rating;
        }
        average = sum / data.businesses.length;
        callback(null, data);	
    })
}

function getPlacesInArea(location, callback){
    yelp.search({ location: location , radius_filter : 1500}, function(err, data){
        if(err) throw err;
        callback(null, data);
    })	
}

function getBusinessesInArea(business, callback){
    yelp.business(business, function(err, data){
        if(err) throw err;
        callback(null, data);
    })	
}

function getReviewsOfNearbyPlaces(location, callback){
    getPlacesInArea(location, function(err, data){
        if(err) throw err;
        var arr = new Array;
        var obj = {};
        
        for(var i = 0; i < data.businesses.length; i++){
            
            var business_id = data.businesses[i].id;
            //obj = {id : data.businesses[i].id, review : data.};
            getBusinessesInArea(business_id, function(err, business){
                if (err) throw err;
                //console.log(i);
                obj = {id : business_id, review : business.reviews.excerpt};
                
                //arr[i] = obj;
                arr[i] = obj;
                
            })
            callback(null, arr);
        };
        //callback(null, arr);
    })
}
module.exports = router;
