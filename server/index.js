var app = require('express')();
var http = require('http').createServer(app);;
var io = require('socket.io')(http);

var Game = require('./src/main.js');

var houndGame;

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
  var log = 'a user connected';
  console.log(log);
  socket.emit('test', 'HEWWO??');
  houndGame = new Game(socket);
});

http.listen(3000, function() {
  console.log('listening on *:3000');
});

