/*
 * Config the DB URL below and rename this file to 'db.js'
*/

// var dbURL = 'mongodb://book:engineerlibrary@ds033709.mongolab.com:33709/book';
//var dbURL = 'mongodb://bookUser:passw0rd@cae.cn.ibm.com:27017/book';
var dbURL = 'mongodb://IbmCloud_b3dvib5t_brpmbcul_gv60c5n7:7sVmvIP7JjZJ1LnVBsYwthIYFCEhbrB6@ds041053.mongolab.com:41053/IbmCloud_b3dvib5t_brpmbcul';
exports.mongoose = require('mongoose').connect(dbURL);

var db = this.mongoose.connection;

//var db = new Db('admin', new Server('localhost', '27017'));
db.on('error', function(err){
	console.error('connect to %s error: ', dbURL, err.message);
	process.exit(1);
});
db.once('open', function () {
	console.log('%s has been connected.', dbURL);
});

/*
create account on MongoDB for book app:

use admin
db.createUser(
  {
    user: "siteUserAdmin",
    pwd: "passw0rd",
    roles: [ { role: "userAdminAnyDatabase", db: "admin" } ]
  }
)

db.createUser(
    {
      user: "bookUser",
      pwd: "passw0rd",
      roles: [
         { role: "readWrite", db: "book" }
      ]
    }
)
*/
