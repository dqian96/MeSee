// Entry point 

// Modules
var express = require('express');
var favicon = require('serve-favicon'),
var mongoose = require('mongoose'),

// Creating an app
var app = express();
var db = mongoose(),

//app.use(favicon(__dirname + '/public/assets/img/logo.ico'));

// app.get('/', function (req, res) {
//    res.send('Hello World');
// })

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

