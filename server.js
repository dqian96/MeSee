// Entry point 

// Modules
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var logger = require('morgan');


// Creating an app
var app = express();
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

var routes = require('app/routes/index');
app.use('/', routes);


// Database
mongoose.connect('mongodb://localhost:27017/ratemyhouse');
var db = mongoose.connection;

// Yelp API
var Yelp = require('yelp');
var yelp = new Yelp({
  consumer_key: 'consumer-key',
  consumer_secret: 'consumer-secret',
  token: 'token',
  token_secret: 'token-secret',
});


// Server:
// -app listens on 8080 for requests
// -call back once instantiated
var server = app.listen(8080, function () {
   var host = server.address().address
   var port = server.address().port
   console.log("App listening at http://%s:%s", host, port)
})

// export of module i.e. return
module.exports = app;