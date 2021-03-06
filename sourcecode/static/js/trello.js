$(document).ready(function() {

  var authenticationFailure = function() {
   console.log('Failed authentication');

  };

  var boardLoadFailure = function() {
   console.log('Failed to load boards');
  };

 var cardLoadFailure = function() {
    console.log('Failed to load card');
 };

 var actionLoadFailure = function() {
    console.log('Failed to load action');
 };

 var listLoadFailure = function() {
    console.log('Failed to load list');
 };

  var authenticationSuccess = function() {
    updateLoggedIn();

    var token = Trello.token();
    Trello.members.get("me", function(member){
         var welcometxt="Welcome "+member.fullName+"  ";
         $("#welcome").text(welcometxt);
       });
    //load boards
    loadBoards();

   };

  var updateLoggedIn = function() {
      var isLoggedIn = Trello.authorized();

      $("#loggedin").toggle(!isLoggedIn);
      $("#loggedout").toggle(isLoggedIn);
  };

  var loadCards=function(){
    var boardId = $('#boards').val();
    $('#cardsoractions').empty();
    $('#cardsoractions').toggle(true);

    Trello.get(
      '/members/me/cards',
      loadedCards,cardLoadFailure
    );
  }

  var loadActions=function(){
    var boardId = $('#boards').val();
    $('#cardsoractions').empty();
    $('#cardsoractions').toggle(true);
    Trello.get(
      '/members/me/actions',
      loadedActions,actionLoadFailure
    );
  }

  var loadedSelect= function(boards) {

    $.each(boards, function(index, value) {
      $('#boards')
        .append($("<option></option>")
        .attr("value",value.id)
        .text(value.name));


    });

    $('#boardsgroup').toggle(true);
    //load actions type to the board

    $('#actiontype')
      .append($("<option></option>")
      .attr("value","cards")
      .text("Cards"))
      .append($("<option></option>")
      .attr("value","actions")
      .text("Actions"));

    $('#actiontypegroup').toggle(true);

      //call to load card
      if($( "select#actiontype option:checked" ).val()=="cards"){
          loadCards();
      }else{
        //load actions
        loadActions();
      }

  };


  var loadBoards = function() {
    //Get the users boards
    Trello.get(
      '/members/me/boards/',
      loadedSelect,boardLoadFailure
    );
  };

  var loadedCards= function(cards) {
    var table= $("<table class='table table-bordered'></table>");
    var header=$("<tr><th>Card Name</th><th>Card Description</th><th>Date of Last Activity</th><th>Due Date</th><th>Marked Completed ?</th><th>Closed ?</th><th>List Name</th></tr>");
    header.appendTo(table);
    $.each(cards, function(index, card) {

      $('#cardsoractions').toggle(true);
      var boardId = $( "select#boards option:checked" ).val();
      //only add cards that belong to the currently selected board
      var dueComplete;
      var closed;
      var due;

      if(card.dueComplte==true){
        dueComplete="Yes";
      }else{
        dueComplete="No";
      }

      if(card.closed==true){
        closed="Yes";
      }else{
        closed="No";
      }

      if(card.due==null){
        due="Not Set";
      }else{
        due=card.due;
      }

      if(boardId==card.idBoard){
        idList=card.idList;
        //get the list the card belongs to
        Trello.get(
          '/list/'+idList,
          function(list) {
            var tabledata=$("<tr><td class='bg-primary'>"+card.name+"</td><td class='bg-warning' >"+card.desc+"</td><td class='bg-danger' >"+card.dateLastActivity+"</td><td class='bg-info' >"+due+"</td><td class='bg-success' >"+dueComplete+"</td><td class='bg-warning'>"+closed+"</td><td class='bg-primary'>"+list.name+"</td></tr>");
            tabledata.appendTo(table);
          },listLoadFailure
        );

      }

    });

    table.appendTo($('#cardsoractions'));
    $("<button class='btn btn-warning' onclick=\"exportTableToCSV('cards.csv')\">Export To CSV File</button>").appendTo($('#cardsoractions'));

  };

  var loadedActions= function(actions) {
    var table= $("<table class='table table-bordered'></table>");
    var header=$("<tr><th>Action Type</th><th>Action Date</th><th>Card Name</th><th>List Name</th></tr>");
    header.appendTo(table);
    $.each(actions, function(index, action) {
      var boardId = $( "select#boards option:checked" ).val();
      //only add cards that belong to the currently selected board
      if(typeof action.data.board!== 'undefined' && boardId==action.data.board.id){
        var whichcard;
        var whichlist;
        if(typeof action.data.card!=='undefined'){
          whichcard=action.data.card.name;
        }else{
          whichcard="Not Applicable";
        }

        if(typeof action.data.list!=='undefined'){
          whichlist=action.data.list.name;
        }else{
          whichlist="Not Applicable";
        }
        var tabledata=$("<tr><td class='bg-primary' >"+action.type+"</td><td class='bg-warning'>"+action.date+"</td><td class='bg-danger' >"+whichcard+"</td><td class='bg-info' >"+whichlist+"</td></tr>");
        tabledata.appendTo(table);
      }

    });
    table.appendTo($('#cardsoractions'));
    $("<button class='btn btn-warning' onclick=\"exportTableToCSV('actions.csv')\">Export To CSV File</button>").appendTo($('#cardsoractions'));
  };

  //attempt to authenticate when page is refreshed
  Trello.authorize({
    interactive:false,
    success: authenticationSuccess

  });

  //login in
  $("#loggedin").click(function(){
    $(".intro").hide();
    Trello.authorize({
      type: 'popup',
      name: 'Trello Web Api Application',
      scope: {
      read: 'true',
      write: 'true' },
      expiration: 'never',
      success: authenticationSuccess,
      error: authenticationFailure
    });
  });

  //login in
  $("#loggedin2").click(function(){
    $(".intro").hide();
    Trello.authorize({
      type: 'popup',
      name: 'Trello Web Api Application',
      scope: {
      read: 'true',
      write: 'true' },
      expiration: 'never',
      success: authenticationSuccess,
      error: authenticationFailure
    });
  });

  //login out
    $("#loggedout").click(function(){
      $(".intro").show();
      Trello.deauthorize();
      updateLoggedIn()
      window.location.replace("/");
    });


    $('#boards').change(function() {
      //call to load card
      if($( "select#actiontype option:checked" ).val()=="cards"){
          loadCards();
      }else{
        //load actions
        loadActions();
      }
    });

    $('#actiontype').change(function() {
      //call to load card
      if($( "select#actiontype option:checked" ).val()=="cards"){
          loadCards();
      }else{
        //load actions
        loadActions();
      }
    });


});

