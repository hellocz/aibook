
/**
 * Module dependencies.
 */

var express = require('express');
var http = require('http');
var path = require('path');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var methodOverride = require('method-override');
var logger = require('morgan');
var bookapi = require('./api/book.js');
var userapi = require('./api/user.js');
var app = express();


// all environments
app.set('port', process.env.PORT || 3001);
//app.use(express.favicon());
app.use(logger('dev'));
app.use(bodyParser());
app.use(methodOverride());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());

// development only
if ('development' === app.get('env')) {
  var errorHandler = require('errorhandler');
  app.use(errorHandler());
}

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

//================ API Service ==================

app.get('/', function(req, res) {
  res.sendfile('./public/index.html');
});

app.get('/api/book/list', function(req, res, next) {
  bookapi.list(req, res);
});

app.get('/api/book/sendemail', function(req, res, next) {
  bookapi.sendemail(req, res);
});

app.get('/api/book/listofMine', function(req, res, next) {
  bookapi.listofMine(req, res);
});

app.get('/api/book/listCart', function(req, res, next) {
  bookapi.listCart(req, res);
});

app.get('/api/book/id/:id', function(req, res, next) {
  bookapi.show(req, res);
});

app.get('/api/douban/isbn/:isbn', function(req, res, next) {
  bookapi.searchDouban(req, res);
});

app.post('/api/book/donate', function(req, res, next) {
  bookapi.donateBook(req, res);
});

app.post('/api/book/borrow', function(req, res, next) {
  bookapi.borrowBook(req, res);
});

app.post('/api/book/userSave', function(req, res, next) {
  bookapi.userSave(req, res);
});

app.post('/api/book/return', function(req, res, next) {
  bookapi.returnBook(req, res);
});

app.post('/api/book/return2013', function(req, res, next) {
  bookapi.returnBook2013(req, res);
});

app.post('/api/book/upload', function(req, res, next) {
  bookapi.uploadBooks(req, res);
});

app.get('/api/user/id/:id', function(req, res, next) {
  userapi.findUser(req, res);
});

app.get('/api/user/email/:email', function(req, res, next) {
  userapi.findUser(req, res);
});

app.get('/api/user/list', function(req, res, next) {
  userapi.list(req, res);
});

//================ API Service ==================
