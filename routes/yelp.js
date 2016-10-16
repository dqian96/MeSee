var express = require('express');
var router = express.Router();
var path = require("path");
var Yelp = require('yelp');
var indico = require('indico.io');

//indico.apiKey = process.env.INDICO_API_KEY;
indico.apiKey = '61f321e617349d9852cef5d2424baa96';


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

router.get('/location2/:location', function(req, res, next) {
    var location = req.params.location;
    indicoBatchSentimentAnalysis(location, function(err, data){
        console.log(data);
        res.json(data);
    })
    res.render('index'); 
});


// RATINGS FUNCTION
function getRatingsOfPlaces(location, callback){
    yelp.search({ location: location , radius_filter : 1500}, function(err, data){
        if(err) throw err;
        var average = 0, sum = 0;
        for(var i = 0; i < data.businesses.length; ++i){
            sum += data.businesses[i].rating;
            console.log(data.businesses[i].rating);
        }
        average = sum / data.businesses.length;
        average = (average / 5) * 70;
        average = Number((average).toFixed(1));
        callback(null, average);	
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
        for(var i = 0; i < data.businesses.length; i++){
            var business_id = data.businesses[i].id;
            getBusinessesInArea(business_id, function(err, business){
                if (err) throw err;
                var obj = {id : business.id, review : business.reviews[0].excerpt};
                arr.push(obj);
                if(++x == data.businesses.length){
                    var reviewArr = arr.map(function(o){return o.review;}); 
                    callback(null, reviewArr);
                }
            })
        };
    })
}

// SENTIMENT FUNCTION
// ask mentor about promises shit
function indicoBatchSentimentAnalysis(location, callback){
    getReviewsOfNearbyPlaces(location, function(err, reviewArr){
        indico.sentiment(reviewArr)
        .then(function(res) {
            var total = 0;
            for(var i in res) { total += res[i]; }
            var avg = 0;
            avg = total / res.length;
            avg *= 5;
            avg = Number((avg).toFixed(1));
            //return avg;
            callback(null, avg);
        })
        .catch(function(err) {
            //if (err)  throw err;
        });
    })
}

function consolidateTotal(ratings, indico, crime, callback){
    // give weight to each value
    // generate a final score
}
module.exports = router;
 