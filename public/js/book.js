$(document).ready(function() {


	//======================== Books Page ========================
  var searchFormVisible = false;

  var citys = new Array("北京","宁波");

  var beijingBuilding =new Array("环宇","钻石","盘古");

  var ningboBuilding = new Array("宁波A","宁波B");

  $("#books").find("form").eq(0).hide();

	function handleSearchForm() {
  	var $form = $("#books").find("form").eq(0);
  	if (searchFormVisible) {
  		$form.hide();
  		searchFormVisible = false;
  	} else {
  		$form.show();
  		searchFormVisible = true;
  	}
	}

	var $searchButton = $("#books").find("div a").eq(0);

  $searchButton.on("tap", handleSearchForm);

	$(document).pagecontainer({
		create: function ( event, ui ) {
			var previous = ui.prevPage;
			// Set up user's email first
			//$.removeCookie('email', { path: '/' });
	    var $email = $.cookie('email');
	    if ($email && $email !=="") {
        //loadBooks(event);
        loadUpdates(event); 
			} else {
        $(location).attr('href', '#me');         
			}
		},
		});

	$("#books").on("pagebeforeshow", function ( event ) {
		loadBooks(event);
	});

	function loadBooks (event) {
		$.ajax({
	    url: "/api/book/list",
	    dataType: "json",
      data: {sort: '-update_at'},
	    cache: true
	    })
	  .done(function(books) {
	    var $booklist = $("#booklist");
	    var $parent = $booklist.parent();
	    $booklist.empty();
	    $booklist.detach();
	    var length = books.length;
	   // $("#books #booklist").attr("data-filter-placeholder", "Search in total " + length + " books ...");
	    for (var i = 0; i < length; i++) {
	      var book = books[i];
	      var item = $('#item_tm').clone();
	      item.attr({id: book._id});
	      item.find('img.image').attr({src: book.image});
	      item.find('h2.title').text(book.title);
	      item.find('p.summary').html(book.summary);
        item.find('p.ui-li-aside').html('<strong>(' + book.remain + '/' + book.amount + ')</strong> ');
	      $booklist.append(item);
	    }
	    $parent.append($booklist);
	    $booklist.listview("refresh");
	  })
	  .fail(function(err) {
	    alert('Failed to get the book list.');
	  });
	};
  $("#booksOfmine").on("pagebeforeshow", function ( event ) {
    loadBooksofMine(event);
  });

  function loadBooksofMine (event) {
    var user_id = $.cookie('user_id');
    if(user_id === undefined || !user_id){
      alert("Your infomation is not full please reset your information.")
      $(location).attr('href', '#me');  
    }
    $.ajax({
      url: "/api/book/listofMine",
      dataType: "json",
      data: {sort: '-update_at',user_id: user_id},
      cache: true
      })
    .done(function(books) {
      var $booklist = $("#booklistofMine");
      var $parent = $booklist.parent();
      $booklist.empty();
      $booklist.detach();
      var length = books.length;
      for (var i = 0; i < length; i++) {
        var book = books[i];
        var item = $('#item_tm').clone();
        item.attr({id: book._id});
        item.find('img.image').attr({src: book.image});
        item.find('h2.title').text(book.title);
        item.find('p.summary').html(book.summary);
        item.find('p.ui-li-aside').html('<strong>(' + book.remain + '/' + book.amount + ')</strong> ');
        $booklist.append(item);
      }
      $parent.append($booklist);
      $booklist.listview("refresh");
    })
    .fail(function(err) {
      alert('Failed to get the book list.');
    });
  };

$("#booklistofMine").on("tap", "li", function() {
    showBook($(this).attr('id'));
    //$(location).attr('href', '/#bookshow');
  });

$("#booksCart").on("pagebeforeshow", function ( event ) {
    loadBookCart(event);
  });

  function loadBookCart (event) {
    var user_id = $.cookie('user_id');
    if(user_id === undefined || !user_id){
      alert("Your infomation is not full please reset your information.")
      $(location).attr('href', '#me');  
    }
    $.ajax({
      url: "/api/book/listCart",
      dataType: "json",
      data: {sort: '-update_at',user_id: user_id},
      cache: true
      })
    .done(function(books) {
      var $booklist = $("#booklistCart");
      var $parent = $booklist.parent();
      $booklist.empty();
      $booklist.detach();
      var length = books.length;
      for (var i = 0; i < length; i++) {
        var book = books[i];
        var item = $('#item_tm').clone();
        item.attr({id: book._id});
        item.find('img.image').attr({src: book.image});
        item.find('h2.title').text(book.title);
        item.find('p.summary').html(book.summary);
        item.find('p.ui-li-aside').html('<strong>(' + book.remain + '/' + book.amount + ')</strong> ');
        $booklist.append(item);
      }
      $parent.append($booklist);
      $booklist.listview("refresh");
    })
    .fail(function(err) {
      alert('Failed to get the book list.');
    });
  };

$("#booklistCart").on("tap", "li", function() {
    showBook($(this).attr('id'));
    //$(location).attr('href', '/#bookshow');
  });
	//======================== Bookshow Page ========================

	$("#booklist").on("tap", "li", function() {
    showBook($(this).attr('id'));
    //$(location).attr('href', '/#bookshow');
  });

    $("#me_city").on("change",function(){
    var $city = $('#me_city').val();
    var buiding;
    var buidings;
    var buidingstr="";
    if($city === "0"){
      buidings=beijingBuilding;
    }
    else if($city === "1"){
      buidings=ningboBuilding;
    }
    for(buiding in buidings){
      buidingstr+="<option value="+buiding+">"+buidings[buiding]+"</option>";
    }
    $('#me_building').html(buidingstr);
    $("#me_building").selectmenu('refresh', true);
  });

	function showBook(id) {
    $.ajax({
      url: "/api/book/id/" + id,
      type: "GET",
      dataType: "json",
      cache: true
      })
    .done(function(book) {
      var $book = $('#bookshow');
      $book.data("book_id", book._id); //id to be user for borrow or return actions
      $book.find('img.image').attr({src: book.image});
      $book.find('h3.title').text(book.title);
      var info = '数量：有 ' + book.remain + ' 本，共 ' + book.amount + ' 本<br>';
      info += '作者：' + book.author + '<br>出版：' + book.publisher + '(' + book.pubdate +')<br>';
      $book.find('p.info').html(info);
      $book.find('p.summary').text(book.summary);
      $book.find('p.borrower_ongoing').text('');
      $book.find('p.borrower_done').text('');
      var CurrentUserBorrowedButNotReturned = false;
      var NumberOfBorrowedButNotReturned = 0;
      if (book.borrow.length > 0 ) {
        var ongoing = '';
        var done = ''
        for (var j = 0; j < book.borrow.length; j++) {
          var borrow = book.borrow[j];
          var borrow_at = formatDate(new Date(borrow.borrow_at), false);
          var return_at = formatDate(new Date(borrow.return_at), false);
          if (borrow.returned) {
            done += borrow.borrower_id.email + ' ';
          } else {
            NumberOfBorrowedButNotReturned += borrow.amount;
            ongoing += borrow.borrower_id.email + ' ';
            if (borrow.borrower_id.email === $.cookie('email')) {
              CurrentUserBorrowedButNotReturned = true;
            }
          }
        }
        if (ongoing !== '') {
          $book.find('p.borrower_ongoing').html('借阅记录（未还）：' + ongoing);
        }
        if (done !== '') {
          $book.find('p.borrower_done').html('借阅记录（已还）：' + done);
        }
      }
      if (book.donate.length > 0 ) {
        var donates = '';
        for (var i = 0; i < book.donate.length; i++) {
          var donate = book.donate[i];
          var donate_at = formatDate(new Date(donate.donate_at), true);
          var buildings;
          donates +=  "<input type=\"radio\" name=\"owner_id\" value=\"" + donate.donator_id.email +"\">" + donate.donator_id.email + citys[donate.donator_id.city];
          if(donate.donator_id.city===0){
            buildings = beijingBuilding;
          }
          else if(donate.donator_id.city===1){
            buildings = ningboBuilding;
          }
          donates += buildings[donate.donator_id.building] + donate.donator_id.seat + ' (' + donate.amount + ') ';
        }
        //$book.find('p.amount').text('共有 ' + book.amount + ' 本' + donates + '捐赠');
      } else {
        //$book.find('p.donates').text('共有 ' + book.amount + ' 本');
      }
      $book.find('p.donator').html('本书由 ' + donates + ' 捐赠');

      //Books borrowed in 2013 if true as no borrow records in the DB
      if ((book.amount - book.remain) > NumberOfBorrowedButNotReturned) {
        $book.find( "p.return2013" ).show();
      } else {
        $book.find( "p.return2013" ).hide();
      }
      if ((Number(book.remain) === 0) || CurrentUserBorrowedButNotReturned) {
        $( "#borrow" ).hide();
      } else {
        $( "#borrow" ).show();
      }
      if (CurrentUserBorrowedButNotReturned) {
        $( "#return" ).show();
      } else {
        $( "#return" ).hide();
      }
     })
    .fail(function(err) {
      alert('Failed to get the book information.');
      });
	}

  $("#borrow").on("tap", function() {
    var $email = $.cookie('email');
    var $book_id = $("#bookshow").data("book_id");
    var $owner_id = $("input[name='owner_id']:checked").val();
    if($owner_id===undefined || $owner_id===null){
       alert("Please choose a owner!");
      return;
    }
    if ((! $email) || ($email === "")) {
      alert("Please set up your Intranet ID first!");
      return;
    }
    $.ajax({
      url: "/api/book/borrow",
      type: "POST",
      dataType: "json",
      data: {book_id: $book_id, email: $email, owner_id: $owner_id, amount: 1},
      cache: true
      })
    .done(function(book) {
      alert("您已借出：" + book.title);
      showBook(String(book._id));
      })
    .error(function(err) {
      alert("Failed to borrow book.");
    });
  });

  $("#return").on("tap", function() {
    var $email = $.cookie('email');
    if ((! $email) || ($email === "")) {
      alert("Please set up your Intranet ID first!");
      return;
    }
    var $book_id = $("#bookshow").data("book_id");
    $.ajax({
      url: "/api/book/return",
      type: "POST",
      dataType: "json",
      data: {book_id: $book_id, email: $email, amount: 1},
      cache: true
      })
    .done(function(book) {
      alert("您已归还：" + book.title);
      showBook(String(book._id));
      })
    .error(function(err) {
      alert("Failed to return book.");
    });
  });

  $("#return2013").on("tap", function() {
    var $email = $.cookie('email');
    if ((! $email) || ($email === "")) {
      alert("Please set up your Intranet ID first!");
      return;
    }
    var $book_id = $("#bookshow").data("book_id");
    $.ajax({
      url: "/api/book/return2013",
      type: "POST",
      dataType: "json",
      data: {book_id: $book_id, email: $email, amount: 1},
      cache: true
      })
    .done(function(book) {
      alert("您已归还：" + book.title);
      showBook(String(book._id));
      })
    .error(function(err) {
      alert("Failed to return book.");
    });
  });

  //======================== Donate Page ========================

	$("#donatebook").on("pagebeforeshow", function ( event ) {
    $("#donate_submit").hide();
    $("#donate_search").show();
    $('#donatebook').find('label').eq(0).html("图书ISBN号码：");
		$('#donate_isbn').val('');
    $('#donatebook').find('p.title').text("");
		var $email = $.cookie('email');
		if ($email && $email !=="") {
			$('#donate_email').val($email);
		}
	});
/*
  $("#donate_isbn").on("focusout", function() {
    var $isbn = $.trim($('#donate_isbn').val());
  	$.ajax({
      url: "/api/douban/isbn/"+$isbn,
      type: "GET",
      dataType: "json",
      cache: true
      })
    .done(function(book) {
      $('#donatebook').find('label').eq(0).html("您要捐赠的书：<strong>" + book.title + "</strong>");
      })
    .fail(function(err) {
      $('#donatebook').find('label').eq(0).html("根据ISBN没找到您要捐赠的书");
      });
  });
*/
  $("#donate_search").on("tap", function() {
    var $isbn = $.trim($('#donate_isbn').val());
    var $amount = $('#donate_amount').val();
    var $email = $.trim($('#donate_email').val());
    $.ajax({
      url: "/api/book/donate",
      type: "POST",
      dataType: "json",
      data: {isbn: $isbn, email: $email, amount: $amount, method: "search"},
      cache: true
      })
    .done(function(book) {
      alert("Your book infomation is: " + book.title);
      $("#donate_search").hide();
      $("#donate_submit").show();
      //redirect to #bookshow page to show the donated book
    //  showBook(String(book._id));
     // $(location).attr('href', '/#bookshow');
      })
    .error(function(err) {
      alert("Can't find this book with the ISBN number :" + $isbn);
    });
  });

  $("#donate_submit").on("tap", function() {
    var $isbn = $.trim($('#donate_isbn').val());
    var $amount = $('#donate_amount').val();
    var $email = $.trim($('#donate_email').val());
    $.ajax({
      url: "/api/book/donate",
      type: "POST",
      dataType: "json",
      data: {isbn: $isbn, email: $email, amount: $amount, method : "donate"},
      cache: true
      })
    .done(function(book) {
      alert("Thank you for donating: " + book.title);
      //redirect to #bookshow page to show the donated book
      showBook(String(book._id));
      $(location).attr('href', '/#bookshow');
      })
    .error(function(err) {
      alert("Failed to create a book record in DB.");
    });
  });

  //======================== Me Page ========================

	$("#me").on("pagebeforeshow", function ( event ) {
		var $email = $.cookie('email');
    var $city = $.cookie('city');
    var $building = $.cookie('building');
    var $seat = $.cookie('seat');
    if($email && $email !==""){
		//if ($email && $city && $building && $seat && $email !=="" && $city !==null && $building!==null && $seat !=="") {
			$('#me_form').hide();
			$('#me_show').find('p.user').html('您设定的Intranet ID：<strong>' + $email + '</strong>');
			$('#me_show').show();
		} else {
		  $('#me_email').val('');
		  $('#me_form').show();
			$('#me_show').hide();
		}
	});

  $("#me_submit").on("tap", function(event) {
    var $email = $.trim($('#me_email').val());
  	if ($email === "") {
  		alert("Please input Intranet ID!");
  		return;
  	}
    var $city = $('#me_city').val();
    if($city === null){
      alert("Please choose your city!");
      return;
    }
    var $building = $('#me_building').val();
    if($building === null){
      alert("Please choose your building!");
      return;
    }
    var $seat = $.trim($('#me_seat').val());
    if ($seat === "") {
      alert("Please input seat number!");
      return;
    }
    

    $.ajax({
      url: "/api/book/userSave",
      type: "POST",
      dataType: "json",
      data: {email: $email, city: $city, building: $building, seat: $seat},
      cache: true
      })
    .done(function(user) {
      alert("Your information saved successful: " + user.email);
      //redirect to #bookshow page to show the donated book
    $.cookie('email', user.email, { expires: 10000, path: '/' }); //expires after 10000 days
    $.cookie('city', user.city, { expires: 10000, path: '/' }); //expires after 10000 days
    $.cookie('building', user.building, { expires: 10000, path: '/' }); //expires after 10000 days
    $.cookie('seat', user.seat, { expires: 10000, path: '/' }); //expires after 10000 days
    $.cookie('user_id',user._id,{ expires: 10000, path: '/' });//expires after 10000 days
    $('#me_form').hide();
    $('#me_show').find('p.user').html('您设定的Intranet ID：<strong>' + user.email + '</strong>');
    $('#me_show').show();
      })
    .error(function(err) {
      alert("Failed to create a book record in DB.");
    });
  });

  $("#me_edit").on("tap", function() {
		var email = $.cookie('email');
		$('#me_email').val(email);
		$('#me_show').hide();
		$('#me_form').show();
  });


  //======================== Update Page ========================
  $("#updates").on("pagebeforeshow", function ( event ) {
    loadUpdates(event);
  });

  function loadUpdates (event) {
    $.ajax({
      url: "/api/book/list",
      dataType: "json",
      data: {limit: 10, sort: '-donate.donate_at'},
      cache: true
      })
    .done(function(books) {
      var $updatelist = $("#updatelist");
      var $parent = $updatelist.parent();
      $updatelist.empty();
      $updatelist.detach();
      var length = books.length;
      for (var i = 0; i < length; i++) {
        var book = books[i];
        var item = $('#update_tm').clone();
        item.attr({id: book._id});
        var donate = book.donate[book.donate.length-1]; // the last one
        item.find('h2.donateinfo').html(donate.donator_id.email);
        item.find('p.title').html('捐赠：<strong>' + book.title + '</strong> ' + donate.amount + ' 本！');
        item.find('p.ui-li-aside').html('<strong>' + formatDate(new Date(donate.donate_at), false) + '</strong> ');
        $updatelist.append(item);
      }
      $parent.append($updatelist);
      $updatelist.listview("refresh");
    })
    .fail(function(err) {
      alert('Failed to get the book list.');
    });
  }


// END of $(document).ready(function() {
});

// Referred to codes in NJBlog
function formatDate(date, friendly) {
  var year = date.getFullYear();
  var month = date.getMonth() + 1;
  var day = date.getDate();
  var hour = date.getHours();
  var minute = date.getMinutes();
  var second = date.getSeconds();

  if (friendly) {
    var now = new Date();
    var mseconds = -(date.getTime() - now.getTime());
    var time_std = [ 1000, 60 * 1000, 60 * 60 * 1000, 24 * 60 * 60 * 1000 ];
    if (mseconds < time_std[3]) {
      if (mseconds > 0 && mseconds < time_std[1]) {
        return Math.floor(mseconds / time_std[0]).toString() + ' seconds ago';
      }
      if (mseconds > time_std[1] && mseconds < time_std[2]) {
        return Math.floor(mseconds / time_std[1]).toString() + ' minutes ago';
      }
      if (mseconds > time_std[2]) {
        return Math.floor(mseconds / time_std[2]).toString() + ' hours ago';
      }
    }
  }
  month = ((month < 10) ? '0' : '') + month;
  day = ((day < 10) ? '0' : '') + day;
  hour = ((hour < 10) ? '0' : '') + hour;
  minute = ((minute < 10) ? '0' : '') + minute;
  second = ((second < 10) ? '0': '') + second;

  var thisYear = new Date().getFullYear();
  year = (thisYear === year) ? '' : (year + '-');
  return year + month + '-' + day + ' ' + hour + ':' + minute;
}

//Obsolete function: it works but JSONP cannot handle error
function searchDoubanDirectly() {
  var $isbn = $.trim($('#ISBN').val());
  $.ajax({
  	url: "http://api.douban.com/v2/book/isbn/" + $isbn,
    type: "GET",
    dataType: "jsonp"
    })
  .done(function(book) {
    alert("OK");
      //$('#popupSearch').find('p.title').text("Found book: " + JSON.stringify(book));
    })
  .fail(function(err) {
  	alert("Bad");
  	});
};


