$(document).ready(function(){

  var room = getUrlParameter("roomcode");
  var username;

  if(!$.cookie("UserID")) {
    username = makeid();
    var date = new Date();
    var minutes = 10;
    date.setTime(date.getTime() + (minutes * 60 * 1000));
    $.cookie("UserID", username, { expires: date, path: '/' });
  } else {
    username = $.cookie("UserID");
  }
  
  $(".roomCode").text(room);
  var socket = io.connect('/');
  var playerData = {
    dataRoomCode: room,
    dataUID: username,
  }
  socket.emit('join room', playerData);

  var colors = ['#e57373', '#F06292', '#BA68C8', '#9575CD', '#7986CB', '#64B5F6', '#4FC3F7', '#4DD0E1', '#4DB6AC', '#81C784', '#AED581', '#DCE775', '#FFD54F', '#FFB74D', '#FF8A65'];
  var random_color = colors[Math.floor(Math.random() * colors.length)];
  $('body').css('background-color', random_color);
  $('#ingame-logo').css('color', random_color);
  $('#ingame-logo').css('filter', 'invert(100)');
  var metaThemeColor = document.querySelector("meta[name=theme-color]");
  metaThemeColor.setAttribute("content", random_color);

  var imageColors = ['e84686', 'fb4c01', 'b1c018', '00727a', 'f7e440', '5087f3', '8e4adb', '5dd64b', 'f80006'];

  var globalRoom;

  socket.on("connectedUsers", (room) => {
    console.log(room);
    globalRoom = room;
    var currentColor = 1;
    $("#playerWrap").empty();
    $("#playerWrap").append("<div id='" + room.host.username + "' class='player'><img src='http://tinygraphs.com/spaceinvaders/" + room.host.username + "?bg=ffffff&fg=" + imageColors[0] + "&size=220&fmt=svg'/><br/><span class='hostText'>Host</span><span class='playertext'>" + room.host.username + "</span></div>");
    for (var i = 0; i < room.players.length; i++) {
      if(username === room.players[i].username) {
        $("#playerWrap").append("<div id='" + room.players[i].username + "' class='player'><img src='http://tinygraphs.com/spaceinvaders/" + room.players[i].username + "?bg=ffffff&fg=" + imageColors[currentColor] + "&size=220&fmt=svg'/><br/><span class='currentPlayerText' style='background-color:" + imageColors[currentColor] + "'>You</span><span class='playertext'>" + room.players[i].username + "</span></div>");
      } else {
        $("#playerWrap").append("<div id='" + room.players[i].username + "' class='player'><img src='http://tinygraphs.com/spaceinvaders/" + room.players[i].username + "?bg=ffffff&fg=" + imageColors[currentColor] + "&size=220&fmt=svg'/><br/><span class='playertext'>" + room.players[i].username + "</span></div>");
      }

      if (currentColor == 8) {
        currentColor = 0;
      } else {
        currentColor++;
      }
    }
    $("#playerWrap").append('<div class="newplayer"><img src="http://tinygraphs.com/spaceinvaders/new?theme=base&inv=1&size=220&fmt=svg" /><br/><span class="newPlayerText">Free Slot</span></div>');

    if(username === room.host.username) {
      $("#startButton").show();
      $("#host-options").show();
    }
  });

  $("#startButton").click(function(event) {
    var options = {
      answerTime: $("#answerTimer").val(),
      numberOfRounds: $("#numberOfRounds").val(),
    };
    socket.emit("start countdown", room, options);

    //do shit for round 1
  });

  socket.on("countdown", function() {
    $("#content-area").empty();
    $.get("../countdown.html", function(data){
      $("#content-area").html(data);
      var sec = 3;
      var timer = setInterval(function() {
        $('#countdown-num').text(--sec);
        if (sec == -1) {
          $("#countdown-div").fadeOut(800, function() {
            $("#content-area").empty();
          })
          clearInterval(timer);
        }
      }, 1000);
    });
  });

  socket.on("roundstarted", (questionSet, options) => {

    $(".player").addClass('nowAnswering');
    var questionCounter = 1;
    var playerAnswers = new Array();
    var playerIndex;
    for (var i = 0; i < questionSet.length; i++) {
      if (questionSet[i].player == username) {
        playerIndex = i;
      }
    }
    showQuestion(questionSet[playerIndex].questions[0]);
    $.get('../roundcountdown.html', function(data) {
      $("body").append(data);
      $("#round-countdown-num").text(sec);
    });
    var sec = options.answerTime;
    var twoThirds = Math.round((options.answerTime/100)*66);
    var oneThird = Math.round((options.answerTime/100)*33);

    var timer = setInterval(function() {
      $('#round-countdown-num').text(--sec);
      if (sec == twoThirds) {
        $("#round-countdown-text").animate({
          "font-size": "2.2em"},
          500, function() {
            $("#round-countdown-text").text("Keep Going");
            $("#round-countdown-text").animate({"font-size": "2em"}, 500);
          });
      }
      if (sec == oneThird) {
        $("#round-countdown-text").animate({
          "font-size": "2.2em"},
          500, function() {
            $("#round-countdown-text").text("Hurry Up");
            $("#round-countdown-text").animate({"font-size": "2em"}, 500);
          });
      }
      if (sec == 5) {
        $("#round-countdown-text").animate({
          "font-size": "2.2em"},
          500, function() {
            $("#round-countdown-text").text("Start Panicing");
            $("#round-countdown-text").animate({"font-size": "2em"}, 500);
          });
      }
      if (sec == 4) {
        $("#round-countdown-text").animate({
          "font-size": "2.2em"},
          500, function() {
            $("#round-countdown-text").text("Panic Harder");
            $("#round-countdown-text").animate({"font-size": "2em"}, 500);
          });
      }
      if (sec == 3) {
        $("#round-countdown-text").animate({
          "font-size": "2.2em"},
          500, function() {
            $("#round-countdown-text").text("Break Down");
            $("#round-countdown-text").animate({"font-size": "2em"}, 500);
          });
      }
      if (sec == 2) {
        $("#round-countdown-text").animate({
          "font-size": "2.2em"},
          500, function() {
            $("#round-countdown-text").text("Roll On The Floor");
            $("#round-countdown-text").animate({"font-size": "2em"}, 500);
          });        
      }
      if (sec == 1) {
        $("#round-countdown-text").animate({
          "font-size": "2.2em"},
          500, function() {
           $("#round-countdown-text").text("Start Crying");
           $("#round-countdown-text").animate({"font-size": "2em"}, 500);
         });
      }
      if (sec == 0) {
        while(playerAnswers.length < 3) {
          playerAnswers.push({question: questionSet[playerIndex].questions[questionCounter - 1], answer: 0});
          questionCounter++;
        }
        socket.emit("playerAnswered", playerAnswers, room, username);
        $("#content-area").empty();
        $("#content-area").append("<h1 id='waiting'>Waiting for other players</h1><div class='loader'></div>");
        clearInterval(timer);
      }
    }, 1000);
    $("#content-area").on('click', '.answer', function(event) {
      event.preventDefault();
      console.log($(event.target).index());
      playerAnswers.push({question: questionSet[playerIndex].questions[questionCounter - 1], answer: $(event.target).index()});
      if (questionCounter < 3) {
        showQuestion(questionSet[playerIndex].questions[questionCounter]);
        questionCounter++;
      } else {
        socket.emit("playerAnswered", playerAnswers, room, username);
        clearInterval(timer);
        $("#content-area").empty();
        $("#content-area").append("<h1 id='waiting'>Waiting for other players</h1><div class='loader'></div>");
      }
    });

  });

  socket.on("playerAnswered", (username) => {
    $("#" + username).removeClass('nowAnswering');
  });

  socket.on("roundfinished", (currentRoundAnswers) => {
    console.log(currentRoundAnswers);
    alert("Player:" + currentRoundAnswers[0].player + " Answered Question " + currentRoundAnswers[0].answers[0].question + " with: " + currentRoundAnswers[0].answers[0].answer);
    alert("Player:" + currentRoundAnswers[0].player + " Answered Question " + currentRoundAnswers[0].answers[1].question + " with: " + currentRoundAnswers[0].answers[1].answer);
    alert("Player:" + currentRoundAnswers[0].player + " Answered Question " + currentRoundAnswers[0].answers[2].question + " with: " + currentRoundAnswers[0].answers[2].answer);
  });

  socket.on("round1", (currentPlayer) => {

    var globalQuestionNum;
    var answerNum;

    //round 1 has started
    if (username === globalRoom.players[currentPlayer]) {
      //current player logic
      $("#content-area").empty();
      $("#" + globalRoom.players[currentPlayer]).addClass("nowAnswering");
      socket.emit("request question", room);
      socket.on("recive question", (questionNum) => {
        globalQuestionNum = questionNum;

          //show user question related to that number
          showQuestion(questionNum);
          //on user imput emit submit to server socket.emit("host submit", questionNum)
          $(document).on('click', '.answer' , function(event) {
            //code here ....
            switch (event.target.id) {
              case 'answer1':
              answerNum = 1;
              break;
              case 'answer2':
              answerNum = 2;
              break;
              case 'answer3':
              answerNum = 3;
              break;
              default:
              break;
            }
            socket.emit("send player answer", room, questionNum, answerNum, username);

            //change ui to show submitted
            //$(".player").addClass("nowAnswering");
            //$("#" + globalRoom.players[currentPlayer]).removeClass("nowAnswering");
            $("#content-area").empty();
            $("#content-area").append("<h1 id='waiting'>Waiting for other players</h1><div class='loader'></div>");
          });


        });
    } else {
      //  spectator logic
      $("#" + globalRoom.players[currentPlayer]).addClass("nowAnswering");

      //show UI for waiting
      $("#content-area").empty();
      $("#content-area").append("<h1 id='waiting'>Waiting for other players</h1><div class='loader'></div>");
      //  wait for submit emit socket.on("host finished" (questionNum) => {})
      socket.on("player answered", (questionNum) => {
        $(".player").addClass("nowAnswering");
        $("#" + globalRoom.players[currentPlayer]).removeClass("nowAnswering");
        //  show user question realted to question number
        showQuestion(questionNum);
        //  on user input emit to Server socket.emit("client submit", username)
        $(document).on('click', '.answer' , function(event) {
          //code here ....
          switch (event.target.id) {
            case 'answer1':
            answerNum = 1;
            break;
            case 'answer2':
            answerNum = 2;
            break;
            case 'answer3':
            answerNum = 3;
            break;
            default:
            break;
          }
          socket.emit("send spectator answer", room, questionNum, answerNum, username);


          //  change ui to show waiting
          $("#content-area").empty();
          $("#content-area").append("<h1 id='waiting'>Waiting for other players</h1><div class='loader'></div>");
        });

      });
    }

    socket.on("all spectators answered", function() {
      alert("time for the results");
    })
  });


});



function getUrlParameter(name) {
  name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
  var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
  var results = regex.exec(location.search);
  return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
};

function makeid() {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 5; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

function showQuestion(questionNum) {

  var newQuestion = '';
  var xhr = new XMLHttpRequest();

  xhr.onload = function() {
    if(xhr.status === 200) {
      responseObject = JSON.parse(xhr.responseText);

      var min = 0;
      var max = responseObject.questions.length-1;



      for (var i=0; i < 1; i++) {
        newQuestion += '<div class="question-div">';
        newQuestion += '<strong><p class="question">' + responseObject.questions[questionNum].q + '</p></strong>';
        newQuestion += '<p id="answer1" class="answer">' + responseObject.questions[questionNum].a1 + '</p>';
        newQuestion += '<p id="answer2" class="answer">' + responseObject.questions[questionNum].a2 + '</p>';
        newQuestion += '<p id="answer3" class="answer">' + responseObject.questions[questionNum].a3 + '</p>';
        newQuestion += '</div>';
      }
      $("#content-area").empty();
      $("#content-area").append(newQuestion);
      $(".answer").click(function(event) {

      });
        //document.getElementById('content').innerHTML = newQuestion;
      }
    };
    xhr.open('GET', '../q.json', true);
    xhr.send(null);
  }
