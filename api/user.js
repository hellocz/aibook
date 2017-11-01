/**
 * New node file
 */
var Book = require('../models/book.js').Book;
var User = require('../models/book.js').User;

//Use this function as the callback for Model methods (e.g. create, save, etc.)
function afterAction(req, res, err, data) {
	if (err) {
		res.status(404).send(err);
		}
	else {
		res.set('Content-Type', 'application/json');
		res.json(data);
		}
}

exports.findUser = function (req, res) {
  var id = req.params.id;
  var email = req.params.email;
  var query = {};
  //check querying by id or by email
  if (id) {
    query = {'_id' : id};
  } else {
    if (email) {
      query = {'email' : email};
    } else {
      res.status(404).send('Incorrect query string.');
    }
  }
  User.findOne(query, function(err, user){
    afterAction(req, res, err, user);
	});
};

exports.list = function (req, res) {
  var query = {};
	User.find(query, function(err, users){
    afterAction(req, res, err, users);
	});
};

