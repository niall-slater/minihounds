var app = require('express')();
var http = require('http').createServer(app);;
var io = require('socket.io')(http);

var Game = require('./src/main.js').GameClass;

var houndGame;

var connections = [];
var gameStarted = false;

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket) {
  if (gameStarted) {
    console.log(socket.id, 'rejected, game in progress');
    return;
  }

  socket.on('test', function (message) {
    console.log('message from ' + socket.id);
    console.log(message);
  });
  socket.on('disconnect', function() {
    console.log('user disconnected');
  });
  
  console.log(socket.id, 'connected');
  connections.push(socket);
  socket.emit('test', 'HEWWO??');
  if (connections.length == 2) {
    gameStarted = true;
    console.log('starting game...');
    houndGame = new Game(connections);
  }
});

http.listen(3000, function() {
  console.log('listening on *:3000');
});

module.exports.houndGame = houndGame;