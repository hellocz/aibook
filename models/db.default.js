/*
 * Config the DB URL below and rename this file to 'db.js'
*/

var dbURL = 'mongodb://localhost/book';

exports.mongoose = require('mongoose').connect(dbURL);

var db = this.mongoose.connection;
db.on('error', function(err){
	console.error('connect to %s error: ', dbURL, err.message);
	process.exit(1);
});
db.once('open', function () {
	console.log('%s has been connected.', dbURL);
});
