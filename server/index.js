var app = require('express')();
var http = require('http').createServer(app);;
var io = require('socket.io')(http);

var Game = require('./src/main.js').GameClass;
var CreateFunction = require('./src/main.js').CreateFunction;

var connections = [];

var games = [];

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket) {
  socket.on('test', function (message) {
    console.log('message from ' + socket.id);
    console.log(message);
  });
  socket.on('disconnect', function() {
    console.log('user disconnected');
    manageDisconnection(socket.game);
  });
  
  console.log(socket.id, 'connected');
  connections.push(socket);
  socket.emit('console', 'Welcome to MiniHounds!');
  socket.emit('console', 'Waiting for opponent...');
});

http.listen(3000, function() {
  console.log('listening on *:3000');
});

setInterval(updateServer, 100);

function updateServer() {
  
  //Matchmake players into games
  var waitingPlayers = connections.filter(function (c) {
    return !c.ingame;
  });
  
  for (var i = 0; i < waitingPlayers.length; i++) {
    if (i + 1 < waitingPlayers.length) {
      createGame(waitingPlayers[i], waitingPlayers[i+1]);
    }
  }
  
  //Clean up finished games
  games.forEach(function (game) {
    if (game.complete) {
      game.players.forEach(function (p) {
        p.disconnect();
      });
    }
  });
  
  games = games.filter(function (game) {
    return !game.complete;
  });
}

function createGame(p1, p2) {
  console.log("Starting game with " + p1.id + " and " + p2.id);
  p1.emit('console', 'Found game...'); p1.ingame = true;
  p2.emit('console', 'Found game...'); p2.ingame = true;
  var game = CreateFunction([p1, p2], io);
  p1.game = game; p2.game = game;
  games.push(game);
}

function manageDisconnection(game) {
  if (!game)
    return;
  
  game.players.forEach(function (player) {
    player.emit('console', 'Player disconnected, ending game.');
    player.emit('console', 'Refesh to play another!');
  });
  game.end();
}