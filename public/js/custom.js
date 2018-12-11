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
  window.random_color = colors[Math.floor(Math.random() * colors.length)];
  $('body').css('background-color', random_color);
  $('#ingame-logo').css('color', random_color);
  $('#ingame-logo').css('filter', 'invert(100)');

  var metaThemeColor = document.querySelector("meta[name=theme-color]");
  metaThemeColor.setAttribute("content", random_color);

  var imageColors = ['e84686', 'fb4c01', 'b1c018', '00727a', 'f7e440', '5087f3', '8e4adb', '5dd64b', 'f80006'];

  var globalRoom;
  var globalOptions;

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
    if (room.players.length == 0) {
      $("#startButton").prop('disabled', true);
      $("#startButton").prop('value', 'Need At Least 2 Players To Start');
      $("#startButton").css('font-size', '1em');
      $("#startButton").css('cursor', 'not-allowed');
    } else {
      $("#startButton").prop('disabled', false);
      $("#startButton").prop('value', 'Start Game');
      $("#startButton").css('font-size', '1.5em');
      $("#startButton").css('cursor', 'pointer');
    }
    if(username === room.host.username) {
      $("#startButton").show();
      $("#host-options").show();
    }
  });

  $("#startButton").click(function(event) {
    var options = {
      answerTime: $("#answerTimer").val(),
      questionsPerRound: $("#numberOfQuestions").val(),
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

    globalOptions = options;

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
      if (sec == twoThirds && sec >= 5) {
        $("#round-countdown-text").animate({
          "font-size": "2.2em"},
          500, function() {
            $("#round-countdown-text").text("Keep Going");
            $("#round-countdown-text").animate({"font-size": "2em"}, 500);
          });
      }
      if (sec == oneThird && sec >= 5) {
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
        while(playerAnswers.length < options.questionsPerRound) {
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
      if (questionCounter < options.questionsPerRound) {
        showQuestion(questionSet[playerIndex].questions[questionCounter]);
        questionCounter++;
      } else {
        socket.emit("playerAnswered", playerAnswers, room, username);
        clearInterval(timer);
        $("#content-area").empty();
        $("#round-countdown-div").empty();
        $("#content-area").append("<h1 id='waiting'>Waiting for other players</h1><div class='loader'></div>");
      }
    });

  });

socket.on("playerAnswered", (username) => {
  $("#" + username).removeClass('nowAnswering');
});

socket.on("roundfinished", (currentRoundAnswers) => {
  var voteCounter = 1; 
  var playerCounter = 0;
  var playerVotes = new Array();
  console.log("roudn finished");
  console.log(currentRoundAnswers);
  $(".player").addClass('nowAnswering');
  $("#" + currentRoundAnswers[playerCounter].player).removeClass('nowAnswering');
  $("#content-area").empty();
  if (currentRoundAnswers[playerCounter].player != username) { 
    //$("#content-area").append("<p>Player " + currentRoundAnswers[playerCounter].player + "'s answers: </p>");
    showFriendQuestion(currentRoundAnswers[playerCounter].answers[0].question, currentRoundAnswers[playerCounter].player);
    $("#content-area").off();
    $("#content-area").on('click', '.friend-answer', function(event) {
      event.preventDefault();
      playerVotes.push($(event.target).index()-2);
      if (voteCounter < globalOptions.questionsPerRound) {
        showFriendQuestion(currentRoundAnswers[playerCounter].answers[voteCounter].question, currentRoundAnswers[playerCounter].player);
        voteCounter++;
      } else {
        socket.emit("playerVoted", playerVotes, room, username, playerCounter, currentRoundAnswers);
        $("#content-area").empty();
        $("#content-area").append("<h1 id='waiting'>Waiting for other players</h1><div class='loader'></div>");

          //playerCounter++;
          //voteCounter = 1;
          //showQuestion(currentRoundAnswers[playerCounter].answers[0].question);
        }
        /* Act on the event */
      });
    /*for (i=0; i < currentRoundAnswers[0].answers.length; i++) {
      showAnsweredQuestion(currentRoundAnswers[0].answers[i].question, currentRoundAnswers[0].answers[i].answer);
    } */
  } else {
    $("#content-area").empty();
    $("#content-area").append("<h1 id='waiting'>Waiting for other players</h1><div class='loader'></div>");
  }
});

socket.on("playerVoted", (username) => {
 $("#" + username).removeClass('nowAnswering');
});

socket.on("votingFinished", (currentPlayerVotes, playerCounter, currentRoundAnswers) => {
    //TODO code to display the questions again
    $("#content-area").empty();
    $("#content-area").off();
    showVotedFriendQuestion(currentRoundAnswers[playerCounter].answers[0].question, currentRoundAnswers[playerCounter].player, currentPlayerVotes);
    
    for (var i = 0; i < currentPlayerVotes.length; i++) {


      //var tempPic = $("#" + currentPlayerVotes[i].player + " img").prop('src');
      
      //$("friend-question-div").append("<img src='" + tempPic + "'/>");
      /*for (var y = 0; y < currentPlayerVotes[i].votes.length; y++) {
        var result;

        if(currentPlayerVotes[i].votes[y] == currentRoundAnswers[playerCounter].answers[y].answer) {
          result = "correct";
        } else {
          result = "incorrect";
        }
        $("#content-area").append("Player: " + currentPlayerVotes[i].player + " Question " + (y+1) + " Voted For Answer: " + currentPlayerVotes[i].votes[y] + " They were " + result + "</br>");
      } */

    }
    /*var sec = 5;
    var timer = setInterval(function() {
        $('#countdown-num').text(--sec);
        if (sec == 0) {
          socket.emit("resultsFinished", room, playerCounter);
          clearInterval(timer);
        }
      }, 1000);*/

    });

socket.on("startVoting", (currentRoundAnswers, playerCounter) => {
  var voteCounter = 1; 
  var playerVotes = new Array();
  console.log("roudn finished");
  console.log(currentRoundAnswers);
  $(".player").addClass('nowAnswering');
  $("#" + currentRoundAnswers[playerCounter].player).removeClass('nowAnswering');
  $("#content-area").empty();
  if (currentRoundAnswers[playerCounter].player != username) { 
    //$("#content-area").append("<p>Player " + currentRoundAnswers[playerCounter].player + "'s answers: </p>");
    showFriendQuestion(currentRoundAnswers[playerCounter].answers[0].question, currentRoundAnswers[playerCounter].player);
    $("#content-area").off();
    $("#content-area").on('click', '.friend-answer', function(event) {
      event.preventDefault();
      playerVotes.push($(event.target).index()-2);
      if (voteCounter < globalOptions.questionsPerRound) {
        showFriendQuestion(currentRoundAnswers[playerCounter].answers[voteCounter].question, currentRoundAnswers[playerCounter].player);
        voteCounter++;
      } else {
        socket.emit("playerVoted", playerVotes, room, username, playerCounter, currentRoundAnswers);
        $("#content-area").empty();
        $("#content-area").append("<h1 id='waiting'>Waiting for other players</h1><div class='loader'></div>");

          //playerCounter++;
          //voteCounter = 1;
          //showQuestion(currentRoundAnswers[playerCounter].answers[0].question);
        }
        /* Act on the event */
      });
    /*for (i=0; i < currentRoundAnswers[0].answers.length; i++) {
      showAnsweredQuestion(currentRoundAnswers[0].answers[i].question, currentRoundAnswers[0].answers[i].answer);
    } */
  } else {
    $("#content-area").empty();
    $("#content-area").append("<h1 id='waiting'>Waiting for other players</h1><div class='loader'></div>");
  }
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
        newQuestion += '<p id="answer1" class="answer">' + responseObject.questions[questionNum].answers[1] + '</p>';
        newQuestion += '<p id="answer2" class="answer">' + responseObject.questions[questionNum].answers[2] + '</p>';
        newQuestion += '<p id="answer3" class="answer">' + responseObject.questions[questionNum].answers[3] + '</p>';
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
  function showFriendQuestion(questionNum, playerName) {

    var newQuestion = '';
    var xhr = new XMLHttpRequest();

    xhr.onload = function() {
      if(xhr.status === 200) {
        responseObject = JSON.parse(xhr.responseText);

        var min = 0;
        var max = responseObject.questions.length-1;



        for (var i=0; i < 1; i++) {
          newQuestion += '<div id="friend-question-div">';
          newQuestion += '<p id="friend-name">What did <span id="friend-name-span">' + playerName + ' </span>answer?</p>';
          newQuestion += '<strong><p class="friend-question">' + responseObject.questions[questionNum].q + '</p></strong>';
          newQuestion += '<p id="friend-answer1" class="friend-answer">' + responseObject.questions[questionNum].answers[1] + '</p>';
          newQuestion += '<p id="friend-answer2" class="friend-answer">' + responseObject.questions[questionNum].answers[2] + '</p>';
          newQuestion += '<p id="friend-answer3" class="friend-answer">' + responseObject.questions[questionNum].answers[3] + '</p>';
          newQuestion += '</div>';
        }
        $("#content-area").empty();
        $("#content-area").append(newQuestion);
        $('#friend-name').css('background-color', random_color);
        $('#friend-name-span').css('color', random_color);
        $('#friend-name-span').css('filter', 'invert(100)');
        $(".answer").click(function(event) {

        });
        //document.getElementById('content').innerHTML = newQuestion;
      }
    };
    xhr.open('GET', '../q.json', true);
    xhr.send(null);
  }

  function showVotedFriendQuestion(questionNum, playerName, currentPlayerVotes) {

    var newQuestion = '';
    var xhr = new XMLHttpRequest();

    xhr.onload = function() {
      if(xhr.status === 200) {
        responseObject = JSON.parse(xhr.responseText);

        var min = 0;
        var max = responseObject.questions.length-1;



        for (var i=0; i < 1; i++) {
          newQuestion += '<div id="friend-question-div">';
          newQuestion += '<p id="friend-name">What did <span id="friend-name-span">' + playerName + ' </span>answer?</p>';
          newQuestion += '<strong><p class="friend-question">' + responseObject.questions[questionNum].q + '</p></strong>';

          newQuestion += '<div id="friend-answer1" class="friend-answer">' + responseObject.questions[questionNum].answers[1] + '</div>';
          newQuestion += '<div id="friend-answer2" class="friend-answer">' + responseObject.questions[questionNum].answers[2] + '</div>';
          newQuestion += '<div id="friend-answer3" class="friend-answer">' + responseObject.questions[questionNum].answers[3] + '</div>';
          newQuestion += '</div>';
        }
        $("#content-area").empty();
        $("#content-area").append(newQuestion);
        for(var y = 0; y < currentPlayerVotes.length; y++) {
          if (currentPlayerVotes[y].votes[0] == 0) {
            var tempPic = $("#" + currentPlayerVotes[y].player + " img").prop('src');
            var val = tempPic.substr(tempPic.indexOf("fg=") + 3);
            var inverseColor = val.substring(0, 6);

            $("#friend-answer1").append("<img style='border-color:#" + inverseColor + "' class='vote-bubble' src='" + tempPic + "'/>");
          } else if (currentPlayerVotes[y].votes[0] == 1) {
            var tempPic = $("#" + currentPlayerVotes[y].player + " img").prop('src');
            var val = tempPic.substr(tempPic.indexOf("fg=") + 3);
            var inverseColor = val.substring(0, 6);
            $("#friend-answer2").append("<img style='border-color:#" + inverseColor + "' class='vote-bubble' src='" + tempPic + "'/>");
          } else if (currentPlayerVotes[y].votes[0] == 2) {
            var tempPic = $("#" + currentPlayerVotes[y].player + " img").prop('src');
            var val = tempPic.substr(tempPic.indexOf("fg=") + 3);
            var inverseColor = val.substring(0, 6);
            $("#friend-answer3").append("<img style='border-color:#" + inverseColor + "' class='vote-bubble' src='" + tempPic + "'/>");
          }
        }

        $('#friend-name').css('background-color', random_color);
        $('#friend-name-span').css('color', random_color);
        $('#friend-name-span').css('filter', 'invert(100)');
        $(".answer").click(function(event) {

        });
        //document.getElementById('content').innerHTML = newQuestion;
      }
    };
    xhr.open('GET', '../q.json', true);
    xhr.send(null);
  }



  function showAnsweredQuestion(questionNum, answerNum) {
  // show all questions they answered
  // show which answer was selected
  var min = 0;
  var max = responseObject.questions.length-1;
  var answeredQuestion = '';

  answeredQuestion += '<div class="answered-question-div">';
  answeredQuestion += '<strong><p class="answered-question">' + responseObject.questions[questionNum].q + '</p></strong>';
  answeredQuestion += '<p>' + responseObject.questions[questionNum].answers[answerNum] + '<p><br><br>';
  answeredQuestion += '</div>';

  $("#content-area").append(answeredQuestion);

}
