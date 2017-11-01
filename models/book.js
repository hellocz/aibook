/**
 * New node file
 */
var mongoose = require('./db.js').mongoose;

var Schema = mongoose.Schema;

var BookSchema = new Schema({
  isbn			: String,																//Store 13 digits ISBN by default if any, otherwise use 10 digits ISBN
	title			: String,
  author		: String,
  summary		:	String,
  image			:	String,
  publisher	:	String,
  pubdate		: String,																//Douban JSON format, e.g. "2013-1"
  price			: String,
  pages			: String,                               //Use string instead of number as Douban stores "123" or "123页"
  amount		:	Number,
  remain		:	Number,
  create_at	: Date,
  update_at	: Date,
  tags			: [{
    tag			: String,
    tag_at	: Date,
    tagger_id: { type: Schema.Types.ObjectId, ref: 'User'}
    }],
	donate		: [{
		donator_id	: { type: Schema.Types.ObjectId, ref: 'User'},
		amount		: Number,
		donate_at	: Date
		}],
	borrow		: [{
		borrower_id	: { type: Schema.Types.ObjectId, ref: 'User'},
    owner_id : { type: Schema.Types.ObjectId, ref: 'User'},
		amount		: Number,
		returned	: Boolean,
		borrow_at	: Date,
		return_at	: Date
	}],
  //douban			:	Schema.Types.Mixed											//store original info got from Douban (too big, not use)
});

var UserSchema = new Schema({
  email    : { type: String, index: { unique: true } },
  city     : Number,
  building : Number,
  seat     : String
});

var Book = mongoose.model('Book', BookSchema);
var User = mongoose.model('User', UserSchema);

exports.Book = Book;
exports.User = User;