/**
 * This file includes utilities.
 */

// Function to search ISBN on Douban.com and return the book information in JSON format if successful
exports.search_douban = function (isbn, fn) {

	isbn = isbn.replace(/ /g, ''); // remove blanks
	isbn = isbn.replace(/-/g, ''); // remove -
	console.log('isbna=' + isbn);
	if ((isbn.length !== 10) && (isbn.length !== 13)) {
		//console.log('Invalid ISBN: ' + isbn);
		return fn(new Error ('Invalid ISBN.'));
		}
	
	var http = require('http');
	var options = {
    host: "api.douban.com",
    port: 80,
    path: "/v2/book/isbn/:" + isbn
  };
  //console.log('Search path:' + options.host + options.path);
  http.get(options,function (res) {
    res.setEncoding('utf8');
    var body ='';
    res.on('data', function (d) {
      body += d;
      });
    res.on('end', function() {
      var book = JSON.parse(body);
      if (book) {
        if (book.code && book.code == 6000) {
          return fn(new Error(book.msg + ': ' + isbn));
        } else {
          return fn(null, book);
        }
        }
      fn(new Error ('Failed to search book on douban.com.'));
    })
    .on('error', function(e) {
      fn(e);
      console.log("Get error on Douban http request: " + e.message);
    });
  });
};
