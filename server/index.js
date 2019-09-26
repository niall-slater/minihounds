var app = require('express')();
var http = require('http').createServer(app);;
var io = require('socket.io')(http);

var Game = require('./src/main.js');

var houndGame;

var connections = [];
var gameStarted = false;

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
  if (gameStarted) {
    console.log(socket.id, 'rejected, game in progress');
    return;
  }
  console.log(socket.id, 'connected');
  connections.push(socket);
  socket.emit('test', 'HEWWO??');
  if (connections.length == 1) {
    gameStarted = true;
    console.log('starting game...');
    houndGame = new Game(connections);
  }
});

http.listen(3000, function() {
  console.log('listening on *:3000');
});

