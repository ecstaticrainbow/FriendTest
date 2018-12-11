const path = require('path')
const express = require('express')
const exphbs = require('express-handlebars')
const app = express()
const port = 3000
const http = require('http').Server(app)
const io = require('socket.io')(http)
const session = require("express-session");
var cookieParser = require('cookie-parser');
var fs = require('fs');

var sessionMiddleware = session({
  name: "testcookie",
  secret: "keyboard cat",
  resave: true,
  saveUninitialized: true,
  cookie: { maxAge: 600000}
});

io.use(function(socket, next) {
  sessionMiddleware(socket.request, socket.request.res, next);
});

app.use(cookieParser());

//app.use(sessionMiddleware);


//app.use(session({ name: 'testcookie', secret: 'this-is-a-secret-token', resave: true, saveUninitialized: true, cookie: { maxAge: 60000 }}));


Array.prototype.remove= function(){
  var what, a= arguments, L= a.length, ax;
  while(L && this.length){
    what= a[--L];
    while((ax= this.indexOf(what))!= -1){
      this.splice(ax, 1);
    }
  }
  return this;
}

Array.prototype.removebyIndex = function(from, to) {
  var rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
};

class gameRoom {
  constructor(roomCode) {
    this.roomCode = roomCode;
    this.host;
    this.players = new Array();
    this.gameState = "lobby";
    this.currentPlayer = 0;
    this.currentPlayerAnswer = 0;
    this.currentRoundAnswers = new Array();
    this.currentPlayerVotes = new Array();

  }
  add(player) {
    this.players.push(player);
  }

  setHost(player) {
    this.host = player;
  }

  removeplayer(player) {
    this.players.remove(player);
  }

  removePlayerByIndex(index) {
    this.players.removebyIndex(index);
  }

  get playerIDList() {
    var playerIDList = new Array();
    for (var i = 0; i < this.players.length; i++) {
      playerIDList.push(this.players[i].username);
    }
    return playerIDList;
  }

}

class player {
  constructor(playerData) {
    this.username = playerData.dataUID;
  }
}

app.engine('.hbs', exphbs({
  defaultLayout: 'main',
  extname: '.hbs',
  layoutsDir: path.join(__dirname, 'views/layouts')
}))

app.set('view engine', '.hbs')
app.set('views', path.join(__dirname, 'views'))

app.use(express.static(__dirname + '/public/'));

app.get('/', (request, response) => {
  response.render('home', {
    layout: 'home'
  })
})

app.get('/game', (request, response) => {
  //response.cookie("userID" , 'ID', {maxAge : 600000});
  response.render('game', {
    name: 'John'
  })

})

app.get('/cookie',function(req, res){

});


//var lobby = io.of('/lobby');

var rooms = new Array();
var players = new Array();
//var testroom = new gameRoom("test");




io.on('connection', function(socket){

  var room;
  var roomIndex;
  var playername;

  socket.on('join room', (playerData) => {
    //get roomcode from client

    room = playerData.dataRoomCode;
    
    playername = playerData.dataUID;


  //socket.request.session.cookie.username = playername;

  //check room doesnt already exist, if it doesnt then push a new one
  if (!checkRoom(room)) {
    rooms.push(new gameRoom(room));
  }
    //add the client to the room, create if it doesnt exist
    socket.join(room);

  //get room index in array using room code
  roomIndex = rooms.findIndex((obj => obj.roomCode === room));
  //add player socket to players list for that room

  if(!rooms[roomIndex].host) {
    rooms[roomIndex].setHost(new player(playerData));
    console.log('The Host Connected');
  } 
  else if (rooms[roomIndex].host.username != playername && !rooms[roomIndex].playerIDList.includes(playername)) {
    rooms[roomIndex].add(new player(playerData));
    console.log('a user connected');
  } else {
    console.log("player already exists");
  }
  
  //connectedSockets = Object.keys(io.sockets.sockets);
  io.to(room).emit('connectedUsers', rooms[roomIndex]);

});
  
  socket.on('disconnect', function(){

    try {
      if(rooms[roomIndex].host.username == playername) {

        if (!rooms[roomIndex].players.length == 0) {


          rooms[roomIndex].setHost(rooms[roomIndex].players[0]);

          rooms[roomIndex].players.shift();
          socket.leave(room);
          console.log('The Host Disconnected');
          console.log("New Host is: " + rooms[roomIndex].host.username);
        } else {
          rooms.splice(roomIndex, 1);
        }
      } else {
        for (var i = 0; i < rooms[roomIndex].players.length; i++) {
          if (rooms[roomIndex].players[0].username == playername) {
            rooms[roomIndex].players.splice(i, 1);
          }
        }
        socket.leave(room); 
      }

      io.to(room).emit('connectedUsers', rooms[roomIndex]);
    } catch(e) {
      // statements
      console.log(e);
    }
    
  });
  socket.on('start countdown', (room, options) => {

   rooms[roomIndex].gameState = "countdown";
   console.log(rooms[roomIndex]);
   io.to(room).emit('countdown');
   var sec = 4;
   var timer = setInterval(function() {
    sec--;
    if (sec == -1) {
     var currentplayer = Math.floor((Math.random() * rooms[roomIndex].players.length));
     //[roomIndex].currentPlayer = currentplayer;
     rooms[roomIndex].gameState = "round1questions";
     var questionSet = new Array();
     //set host questions
     questionSet.push({player: rooms[roomIndex].host.username, questions: getQuestionSet(options.questionsPerRound)});
     for (var i = 0; i < rooms[roomIndex].players.length; i++) {
       questionSet.push({player: rooms[roomIndex].players[i].username, questions: getQuestionSet(options.questionsPerRound)});
     }
     io.to(room).emit('roundstarted', questionSet, options);

     clearInterval(timer);
   }
 }, 1000);
 });
  socket.on('playerAnswered', (playerAnswers, room, username) => {
    io.to(room).emit('playerAnswered', username);
    var answerSet = {player: username, answers: playerAnswers};
    console.log(answerSet);
    var currentRoom = rooms[roomIndex];
    currentRoom.currentRoundAnswers.push(answerSet);
    console.log("Player: " + answerSet.player + " Answered question with: " + answerSet.answers);
    console.log(currentRoom.currentRoundAnswers);
    var totalplayers = rooms[roomIndex].players.length + 1;
    if (currentRoom.currentRoundAnswers.length === totalplayers) {
      io.to(room).emit('roundfinished', currentRoom.currentRoundAnswers);
      console.log("everyone has answered");
    }
  });

  socket.on("playerVoted", (playerVotes, room, username, playerCounter, currentRoundAnswers) => {
    io.to(room).emit('playerAnswered', username);
    var voteSet = {player: username, votes: playerVotes};
    var currentRoom = rooms[roomIndex];

    currentRoom.currentPlayerVotes.push(voteSet);

    var totalplayers = currentRoom.players.length;
    if (currentRoom.currentPlayerVotes.length === totalplayers) {
      io.to(room).emit("votingFinished", currentRoom.currentPlayerVotes, playerCounter, currentRoundAnswers);
      console.log("everyone has voted");
    }
  });

  socket.on("resultsFinished", (room, playerCounter) => {
    var currentRoom = rooms[roomIndex];
    currentRoom.currentPlayerVotes = [];
    if ((playerCounter+1) < (currentRoom.players.length + 1)){
    io.to(room).emit("startVoting", currentRoom.currentRoundAnswers, (playerCounter+1));
  }
  });



  socket.on('request question', (room) => {
    //console.log("question requested");
    var questionNum = Math.floor((Math.random() * 8));
    console.log("sent question");
    io.to(room).emit("recive question", questionNum);
  });
  socket.on("send player answer", (room, questionNum, answerNum, username) =>{

    rooms[roomIndex].currentPlayerAnswer = answerNum;
    var currentRoundAnswers = new Array(rooms[roomIndex].players.length);
    var playerIndex = rooms[roomIndex].players.indexOf(username);
    rooms[roomIndex].currentRoundAnswers.splice(playerIndex, 1, answerNum);
    console.log("player answered");
    io.to(room).emit("player answered", questionNum);
    //io.to(room).emit("recieve player answer", rooms[roomIndex].currentPlayerAnswer);
  });
  socket.on("send spectator answer", (room, questionNum, answerNum, username) =>{

    rooms[roomIndex].currentPlayerAnswer = answerNum;

    var playerIndex = rooms[roomIndex].players.indexOf(username);
    rooms[roomIndex].currentRoundAnswers.splice(playerIndex, 1, answerNum);
    if (rooms[roomIndex].currentPlayer === (rooms[roomIndex].players.length-1)) {
      rooms[roomIndex].currentPlayer = 0;
    } else {
      rooms[roomIndex].currentPlayer += 1;
    }
    //io.to(room).emit("all spectators answered");
    io.to(room).emit('round1', rooms[roomIndex].currentPlayer);
    if (rooms[roomIndex].currentRoundAnswers.length === rooms[roomIndex].players.length) {


    }

    //io.to(room).emit("player answered", questionNum);
    //io.to(room).emit("recieve player answer", rooms[roomIndex].currentPlayerAnswer);
  });

  //when all spectators have answered emit all players answers

});


http.listen(port, (err) => {
  if (err) {
    return console.log('something bad happened', err)
  }

  console.log(`server is listening on ${port}`)
})

function getQuestionSet(numQuestions) {
  var i = 0;
  var questionSet = new Array();
  while (i < numQuestions) {
    var temp = Math.floor((Math.random() * 8));
    if (!questionSet.includes(temp)) {
      questionSet.push(temp);
      i++;
    }
  }
  return questionSet;
}

function checkRoom(room) {
  var result = rooms.map(a => a.roomCode);
  return result.includes(room);

}
