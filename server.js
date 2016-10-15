// Entry point 

// Modules
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var logger = require('morgan');
var path = require('path');
var jade = require('jade');

// Creating an app
var app = express();
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

var routes = require('./routes/index');
var yelpRoute = require('./routes/yelp');
app.use('/', routes);
app.use('/yelp', yelpRoute);

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// Database
mongoose.connect('mongodb://localhost:27017/ratemyhouse');
var db = mongoose.connection;
var port = 3000;

// Server:
// -app listens on 8080 for requests
// -call back once instantiated
var server = app.listen(port, function () {
   console.log("App listening at http://localhost/%s", port)
})

// export of module i.e. return
module.exports = app;