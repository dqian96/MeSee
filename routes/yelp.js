var express = require('express');
var router = express.Router();
var path = require("path");
var Yelp = require('yelp');
var indico = require('indico.io');
var fs = require('fs');

//indico.apiKey = process.env.INDICO_API_KEY;
indico.apiKey = '61f321e617349d9852cef5d2424baa96';
var crime_json = fs.readFileSync('crime.json', 'utf8');

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
        res.json(data);
    }) 
});


router.get('/location1/:location', function(req, res, next) {
    var location = req.params.location;
    getReviewsOfNearbyPlaces(location, function(err, data){
        res.json(data);
    })
    res.render('index'); 
});

router.get('/location2/:location', function(req, res, next) {
    var location = req.params.location;
    indicoBatchSentimentAnalysis(location, function(err, data){
        res.json(data);
    })
    res.render('index'); 
});

router.get('/crime/:num', function(req, res, next) {
    var num = req.params.location;
    getCrimeIndex(function(err, data){
        res.json('OK');
    })
    
});

router.get('/:location/:location_id', function(req, res, next) {
    var location = req.params.location;
    var location_id = req.params.location_id;
    consolidateTotal(location, location_id, function(err, results){
        console.log(results);
        res.json(results);
    })
    res.render('index'); 
});


// RATINGS FUNCTION | returns rating average out of 70%
function getRatingsOfPlaces(location, callback){
    yelp.search({ location: location , radius_filter : 1500}, function(err, data){
        if(err) throw err;
        var average = 0, sum = 0;
        for(var i = 0; i < data.businesses.length; ++i){
            sum += data.businesses[i].rating;
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

// SENTIMENT FUNCTION | returns sentiment positve index average out of 5%;
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

function readCrimeData(callback){
    fs.readFile("./crime.json", 'utf8', function (err, content) {
        if (err) return callback(err)
        callback(null, content);
    });
}

function getCrimeIndex(callback){
    var crime_arr = new Array;
        var obj = JSON.parse(crime_json);
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                var crimeTotal = 0;
                crimeTotal = Number(obj[key].assault) + Number(obj[key].break_and_enter) + Number(obj[key].sexual_assault) + Number(obj[key].drug) + Number(obj[key].robbery) + Number(obj[key].vehicle) + Number(obj[key].theft);
                crimeTotal /= 7;
                crimeTotal = Number((crimeTotal).toFixed(5));
                var nobj = {num : key, crime_total : crimeTotal};
                crime_arr.push(nobj);
            }
        }
        callback(null, crime_arr);
}

function getCrimeIndexByLocationID(location_id, callback){
    getCrimeIndex(function(err, data){
        var res = data[location_id].crime_total;
        console.log(res);
        callback(null, res);
    })
}

// function getCrimeData(num, callback){
//     console.log(num);
//     var obj;
//     fs.readFile('./crime.json', 'utf8', function (err, data) {
//         if (err) throw err;
//         var crime_arr = new Array;
//         obj = JSON.parse(data);
//         var x = 0;
//         for (var key in obj) {
//             if (obj.hasOwnProperty(key)) {
//                 var crimeTotal = 0;
//                 crimeTotal = Number(obj[key].assault) + Number(obj[key].break_and_enter) + Number(obj[key].sexual_assault) + Number(obj[key].drug) + Number(obj[key].robbery) + Number(obj[key].vehicle) + Number(obj[key].theft);
//                 crimeTotal /= 7;
//                 crimeTotal = Number((crimeTotal).toFixed(1));
//                 //console.log(key + " -> " + crimeTotal);
//                 var obj = {num : key, crime_total : crimeTotal};
//                 crime_arr.push(obj);
//             }
//         }
        
//         //console.log(crime_arr);
//         callback(null, crime_arr)
//     });
// }

function consolidateTotal(location, location_id, callback){
    var score;
    var ratingF;
    var crimeF;
    var indicoF;
    
    getRatingsOfPlaces(location, function(err, ratingsData){
        if (err) throw err;
        ratingF = ratingsData;
        getCrimeIndexByLocationID(location_id, function(err, crimeIndexData){
            if (err) throw err;
            crimeF = crimeIndexData;
            indicoBatchSentimentAnalysis(location, function(err, indicoData){
                if (err) throw err;
                indicoF = indicoData;
                score = ratingsData + crimeF + indicoF;
                callback(null, score);
            })
        })
    })
}
module.exports = router;
 