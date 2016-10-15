var express = require('express');
var router = express.Router();
var path = require("path");
var Yelp = require('yelp');
var indico = require('indico.io');

indico.apiKey = 'f844248f8582881cdf65b74c1718d0ac';


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
        
        var x  = 0;
        //console.log(data);
        for(var i = 0; i < data.businesses.length; i++){
            
            var business_id = data.businesses[i].id;
            
            //obj = {id : data.businesses[i].id, review : data.};
            getBusinessesInArea(business_id, function(err, business){
                if (err) throw err;
                console.log(business);
                var obj = {id : business.id, review : business.reviews[0].excerpt};
               
                //arr[i] = obj;
                arr.push(obj);
                if(++x == data.businesses.length) callback(null, arr);
            })
        };
        //callback(null, arr);
    })
}

function indicoBatchSentimentAnalysis(reviewArr, callback){
    indico.sentiment(reviewArr, function(err, results){
        if (err) throw err;
        var total = 0;
        for(var i in arr) { total += arr[i]; }
        var avg = total / reviewArr.length;
        callback(err, avg);
    })
}

function consolidateTotal(ratings, indico, crime, callback){
    // give weight to each value
    // generate a final score
}
module.exports = router;
