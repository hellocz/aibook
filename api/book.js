/**
 * New node file
 */
var Book = require('../models/book.js').Book;
var User = require('../models/book.js').User;
var Util = require('../libs/utilities.js');

var nodemailer = require('nodemailer');

var smtpTransport = nodemailer.createTransport('smtps:chenzhihn84%40163.com:11021010@smtp.163.com');
/*
("SMTP",{
host: "smtp.163.com",
secure: true, // use SSL
port: 465, // port for secure SMTP
auth: {
user: "chenzhihn84@163.com",
pass: "11021010"
}
});
*/
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

//Find all books in the collection, and return an array of books JSON
exports.list = function (req, res) {
  var query = {};
  var Query = Book.find(query);
  var sortString = '-update_at';
  if (req.query.sort) {
    sortString = req.query.sort;
    Query.sort(sortString);
  }
  if (req.query.limit) {
    Query.limit(Number(req.query.limit));
  }
  Query.populate('donate.donator_id borrow.borrower_id');
	Query.exec(function (err, books) {
		afterAction(req, res, err, books);
	});
};

exports.sendemail = function(req,res){
var mailOptions = {
    from: 'chenzhihn84@163.com', // sender address
    to: 'chenzcdl@163.com', // list of receivers
    subject: 'Hello ✔', // Subject line
    text: 'Hello world ✔', // plaintext body
    html: '<b>Hello world ✔</b>' // html body
};

smtpTransport.sendMail(mailOptions, function(error, info){
    if(error){
        res.set('Content-Type', 'application/json');
		res.json("{return:"+error+"}");
    }else{
    	res.set('Content-Type', 'application/json');
		res.json("{return:"+info+"}");
    }
});
};

exports.listofMine = function (req, res) {
  var user_id = req.query.user_id;
  var query = {'donate.donator_id' : user_id};
  var Query = Book.find(query);
  var sortString = '-update_at';
  if (req.query.sort) {
    sortString = req.query.sort;
    Query.sort(sortString);
  }
  if (req.query.limit) {
    Query.limit(Number(req.query.limit));
  }
  Query.populate('donate.donator_id borrow.borrower_id');
	Query.exec(function (err, books) {
		afterAction(req, res, err, books);
	});
};

exports.listCart = function (req, res) {
  var user_id = req.query.user_id;
  var query = {'borrow.borrower_id' : user_id};
  var Query = Book.find(query);
  var sortString = '-update_at';
  if (req.query.sort) {
    sortString = req.query.sort;
    Query.sort(sortString);
  }
  if (req.query.limit) {
    Query.limit(Number(req.query.limit));
  }
  Query.populate('donate.donator_id borrow.borrower_id');
	Query.exec(function (err, books) {
		afterAction(req, res, err, books);
	});
};

//Find one book by ID, and return a book JSON
exports.show = function (req, res) {
  var id = req.params.id;
	if (id.length !== 24) {
    return res.send('Invalid ID number');
  }
	var query = {'_id' : id};
	Book
	.findOne(query)
	.populate('donate.donator_id borrow.borrower_id')
	.exec(function (err, book) {
		afterAction(req, res, err, book);
	});
};

exports.userSave = function(req,res){
	var email = req.body.email;
	var city = req.body.city;
	var building = req.body.building;
	var seat = req.body.seat;
	createUser(email,city,building,seat,function(err,user){
		if (err) {
		res.status(404).send(err);
		}
	else {
		res.set('Content-Type', 'application/json');
		res.json(user);
		}
	});
}

//Check if a donator has been added in to user DB
function findDonator(email, fn) {
	User.findOne({email: email}, function(err, user){
		if (err) {
			return fn(err);
		}
		if (!user) {	//user would be NULL if not found
			//Add the user if not exist
			User.create ({email: email}, function (err, user){
				if (err) {
					return fn(err);
				} else {
					fn(null, user);
				}
			});
		} else {
			//Otherwise return the user directly
				fn(null, user);
		}
	});
}
function createUser(email, city, building, seat,fn) {
	User.findOne({email: email}, function(err, user){
		if (err) {
			return fn(err);
		}
		if (!user) {	//user would be NULL if not found
			//Add the user if not exist
			User.create ({email:email, city:city, building:building, seat:seat}, function (err, user){
				if (err) {
					return fn(err);
				} else {
					fn(null, user);
				}
			});
		} else {
			user.city = city;
			user.building = building;
			user.seat = seat;
			user.save(function (err, book){
						if (err) {
							res.status(404).send(err);
							}
						else {
							fn(null, user);
							}
					});
				}
			//Otherwise return the user directly
	});
}

function addDonate(req, res, book, donate) {
	book.donate.push(donate);
	book.amount += donate.amount;
	book.remain += donate.amount;
	book.save(function (err, book){
		afterAction(req, res, err, book);
	});
}



//Donate one book, and return the book JSON
exports.donateBook = function (req, res) {
	Util.search_douban(req.body.isbn, function(err, douban){
		if (err) {
			res.status(404).send(err);
		} else {
			var email = req.body.email;
			var amount = Number(req.body.amount);
			var method = req.body.method;
			findDonator(email, function (err, user) {
				if (err) {
					res.status(404).send(err);
				} else {
					var donator = {donator_id: user, amount: amount, donate_at: Date.now()}; // use user instead of user._id as it is populate object
					Book.findOne({isbn : douban.isbn13})
					.populate('donate.donator_id borrow.borrower_id')
					.exec(function (err, book) {
						if (err) {
							return res.status(404).send(err);
						}
						if (!book) {
							//Add the book if not exist
							var array = [{
								isbn:	douban.isbn13,
								title: douban.title,
								author: douban.author,
								summary: douban.summary,
								image: douban.image,
								publisher: douban.publisher,
								pubdate: douban.pubdate,
								price: douban.price,
								pages: douban.pages,
								amount: 0,
								remain: 0,
                create_at: Date.now(),
								update_at: Date.now(),
								donate: [],
								borrow: [],
								douban: douban
								}];
							Book.create(array, function (err, book) {
								if (err) {
									res.status(404).send(err);
									}
								else {
									res.set('Content-Type', 'application/json');
									res.json(book);
								//	addDonate(req, res, book, donator);
									}
							});
						} else {
							if (method === "search"){
								res.set('Content-Type', 'application/json');
								res.json(book);
							}
							else{
             				book.update_at = Date.now();
							//Update the book with donate information
							addDonate(req, res, book, donator);
							}
							}
					});
				}
			});
		}
	});
};

//Check if a borrower has been added in to user DB
function addBorrower(email, amount,owner_id, fn) {
	User.findOne({email: email}, function(err, user){
		if (err) {
			return fn(err);
		}
		if (!user) {	//user would be NULL if not found
			//Add the user if not exist
			User.create({email: email}, function (err, user){
				if (err) {
					return fn(err);
				} else {
						User.findOne({email: owner_id}, function(err, owner){
						if (err) {
							return fn(err);
						}
						var borrower = {borrower_id: user,owner_id: owner, amount: amount, returned: false, borrow_at: Date.now()};
						fn(null, borrower);
					});
				}
			});
		} else {
			//Otherwise use the user ID directly
			User.findOne({email: owner_id}, function(err, owner){
						if (err) {
							return fn(err);
						}
						var borrower = {borrower_id: user,owner_id: owner, amount: amount, returned: false, borrow_at: Date.now()};
						fn(null, borrower);
					});
		}
	});
}

exports.borrowBook = function (req, res) {
	var email = req.body.email;
	var book_id = req.body.book_id;
	var owner_id = req.body.owner_id;
	var amount = Number(req.body.amount);
	var query = {_id : book_id};
  if (!email || !book_id || !amount || !owner_id) {
    return res.status(404).send('Invalid params!');
  }
	Book
	.findOne(query)
	.populate('donate.donator_id borrow.borrower_id borrow.owner_id')
	.exec(function (err, book) {
		if (err) {
			return res.status(404).send(err);
		}
		if (!book) {
			return res.status(404).send('Book not found.');
		} else {
			//Update the book with borrower information
			if (book.remain < amount) {
				return res.status(404).send('No remaining book to borrow.');
			}
			addBorrower(email, amount,owner_id, function (err, borrower) {
				if (err) {
					return res.status(404).send(err);
				} else {
					var borrows = book.borrow;
					var length = book.borrow.length;
					//cannot borrow again if previous one is not returned
					for (var i = 0; i < length; i++) {
						if ((!borrows[i].returned) && (borrows[i].borrower_id.email === email)) { //both are objects, cannot compare directly
							return res.status(404).send('Previous one is not returned yet.');
						}
					}
					var donates = book.donate;
					var dlength = book.donate.length;
					for (var i = 0; i < dlength; i++) {
						if(donates[i].donator_id.email === owner_id ){

							if(donates[i].amount>=amount){
								donates[i].amount -=amount; 
							}
							else{
								return res.status(404).send('No remaining book to borrow.');
							}
						}
					}

					book.borrow.push(borrower);
					book.remain -= amount;
          book.update_at = Date.now();
					book.save(function (err, book){
						if (err) {
							res.status(404).send(err);
							}
						else {
							res.set('Content-Type', 'application/json');
							res.json(book);
							}
					});
				}
			});
			}
	});
};

exports.returnBook = function (req, res) {
	var email = req.body.email;
	var book_id = req.body.book_id;
	var amount = Number(req.body.amount);
	var query = {_id : book_id};
  if (!email || !book_id || !amount) {
    return res.status(404).send('Invalid params!');
  }
	Book
	.findOne(query)
	.populate('donate.donator_id borrow.borrower_id borrow.owner_id')
	.exec(function (err, book) {
		if (err) {
			return res.status(404).send(err);
		}
		if (!book) {
			return res.status(404).send('Book not found.');
		} else {
			//Update the book with borrower information
			//if (book.remain + amount > book.amount) {
			//	return res.status(404).send('Incorrect return amount.');
			//}
			var borrows = book.borrow;
			var length = book.borrow.length;
			var found = false;
			var owner_id;
			for (var i = 0; i < length; i++) {
				if ((!borrows[i].returned) && (borrows[i].borrower_id.email === email)) {
					found = true;
					owner_id=borrows[i].owner_id.email;
					borrows[i].returned = true;
					borrows[i].return_at = Date.now();
				}
			}
			if (found) {
        book.update_at = Date.now();
				book.remain += amount;
				var donates = book.donate;
				var dlength = book.donate.length;
					for (var i = 0; i < dlength; i++) {
						if(donates[i].donator_id.email === owner_id ){
								donates[i].amount +=amount; 
							}
						}
				book.save (function (err, book){
					if (err) {
						res.status(404).send(err);
						}
					else {
						res.set('Content-Type', 'application/json');
						res.json(book);
						}
				});
			} else {
				res.status(404).send('Borrow record not found.');
				console.log('Borrow record not found.');
			}
		}
	});
};

//As borrow records in 2013 are missing, this function is used to return books that borrowed in 2013 only
//it will create a borrow record with returned flag set to ture

exports.returnBook2013 = function (req, res) {
  var email = req.body.email;
  var book_id = req.body.book_id;
  var amount = Number(req.body.amount);
  var query = {_id : book_id};
  if (!email || !book_id || !amount) {
    return res.status(404).send('Invalid params!');
  }
  Book
  .findOne(query)
  .populate('donate.donator_id borrow.borrower_id')
  .exec(function (err, book) {
    if (err) {
      return res.status(404).send(err);
    }
    if (!book) {
      return res.status(404).send('Book not found.');
    } else {
      //Update the book with borrower information
      addBorrower(email, amount, function (err, borrower) {
        if (err) {
          return res.status(404).send(err);
        } else {
          borrower.returned = true;
          borrower.return_at = Date.now();
          book.borrow.push(borrower);
          book.remain += amount;
          book.update_at = Date.now();
          book.save(function (err, book){
            if (err) {
              res.status(404).send(err);
              }
            else {
              res.set('Content-Type', 'application/json');
              res.json(book);
              }
          });
        }
      });
      }
  });
};

//Search a book by ISBN on Douban, and return the book JSON
exports.searchDouban = function(req, res){
	Util.search_douban(req.params.isbn, function(err, book){
		if (err) {
			res.status(404).send(err);
		} else {
			res.set('Content-Type', 'application/json');
			res.json(book);
		}
	});
};


//the following functions handle batch upload of book data
function search_and_add(isbn, email, amount, remain, fn) {
  Util.search_douban(isbn, function(err, douban){
    if (err) {
      return fn(err, "Failed to find the book on Douban: " + isbn);
    } else {
      findDonator(email, function (err, user) {
        if (err) {
          return fn(err, "Failed to query user db: " + email);
        } else {
          var donate = {donator_id: user._id, amount: amount, donate_at: Date.now()};
          Book.findOne({isbn : douban.isbn13})
          .populate('donate.donator_id borrow.borrower_id')
          .exec(function (err, book) {
            if (err) {
              return fn(err, "Failed to query book db: " + douban.isbn13);
            }
            if (!book) {
              //Add the book if not exist
              var array = [{
                isbn: douban.isbn13,
                title: douban.title,
                author: douban.author,
                summary: douban.summary,
                image: douban.image,
                publisher: douban.publisher,
                pubdate: douban.pubdate,
                price: douban.price,
                pages: douban.pages,
                amount: 0,
                remain: 0,
                create_at: Date.now(),
                update_at: Date.now(),
                donate: [],
                borrow: [],
                douban: douban
                }];
              Book.create(array, function (err, book) {
                if (err) {
                  console.log(err.message);
                  return fn(err, "Failed to save in book db: " + douban.isbn13);
                  }
                else {
                  book.donate.push(donate);
                  book.amount += amount;
                  book.remain += remain;
                  book.save(function (err, book){
                    if (err) {
                      return fn(err, "Failed to add book: " + book.isbn);
                    } else {
                      return fn(null, "Succeeded to add book: " + douban.isbn13);
                    }
                  });
                  }
              });
            } else {
              book.update_at = Date.now();
              //Update the book with donate information
              book.donate.push(donate);
              book.amount += amount;
              book.remain += remain;
              book.save(function (err, book){
                if (err) {
                  return fn(err, "Failed to update book: " + book.isbn);
                } else {
                  return fn(null, "Succeeded to update book: " + douban.isbn13);
                }
              });
              }
          });
        }
      });
    }
  });
}

exports.uploadBooks = function (req, res) {
  var baseWait = 1000;
  var extraWait = 1000;
  var secret = req.body.secret || "";
  var data = req.body.data;
  var logs = '';
  if ((data !== undefined) && (secret === "David")) {
    var lines = data.toString().split('\n');
    logs += 'Total: ' + String(lines.length) + ' records \n';
    for( var i=0;i <lines.length;i++) {
      var book = lines[i].split('\t');
      //logs += book +'\n';
      if (book[0] && book[1] && book[2] && book[3]) {
        var isbn = String(book[0]).replace(' ', ''); // remove blanks
        var email = String(book[1]).replace(' ', '');
        var amount = Number(book[2]);
        var remain = Number(book[3]);
        var wait = baseWait + Math.random() * extraWait;
        setTimeout(search_and_add(isbn, email, amount, remain, function(err, message) {
          logs += message + '\n';
          if(err) {console.log(err);}
        }), wait);
      }
    }
  } else {
    logs += ('Error: please double check your input! \n');
  }
  //logs += 'End upload. \n';
  console.log(logs);
  logs = logs.replace('\n', '<br>');
  res.set('Content-Type', 'application/json');
  res.json({logs: logs});
};

