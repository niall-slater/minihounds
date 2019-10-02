var TWEEN = require('@tweenjs/tween.js');
var Hound = require('./hound.js');
var Map = require('./map.js');
var Projectile = require('./projectile.js');
var Impact = require('./impact.js');
var CommandController = require('./commands.js');
var gameInstance;

var connections;
var io;
var gameOver = false;

function generateSeed() {
  var length = 40;
  var result = [];
  for (var i = 0; i < length; i++) {
    result.push(Math.floor(Math.random()*25));
  }
  
  return result;
}

class Game {
  constructor(sockets) {
    var seed = generateSeed();
    this.started = false;
    this.complete = false;
    this.timeStep = 10;
    this.gameData = {
      mapSeed: seed,
      hounds: [],
      projectiles: [],
      impacts: [],
      trailDots: [],
      cities: []
    }
    
    this.settings = {
      gameWidth: 800,
      gameHeight: 600,
      mapWidth: 2048,
      mapHeight: 2048,
      difficulty: 1
    };
    
    this.houndClassStats = houndClassStats;
    
    this.players = [];
    
    this.commandController = new CommandController(this);
    var cc = this.commandController;

    for (var i = 0; i < sockets.length; i++) {
      var player = sockets[i];
      player.details = {};
      player.details.name = 'player ' + i;
      player.details.team = i;
      console.log(player.details);
      this.players.push(player); 
      player.emit('playerdetails', player.details);
    }

    sockets[0].on('command', (msg) => {
      cc.parseCommand(msg, sockets[0]);
    });
    sockets[1].on('command', (msg) => {
      cc.parseCommand(msg, sockets[1]);
    });
    
    this.map = new Map(seed, this.settings);
    this.gameData.cities = this.map.cities;
    
    this.createNewHound(
      'lynx',
      204,
      204,
      0,
      houndClassStats.scout);
    
    this.createNewHound(
      'wolf',
      300,
      204,
      0,
      houndClassStats.soldier);
    
    this.createNewHound(
      'bear',
      100,
      204,
      0,
      houndClassStats.artillery);
    
    this.createNewHound(
      'crow',
      400,
      800,
      1,
      houndClassStats.scout);
    
    this.createNewHound(
      'eagle',
      500,
      800,
      1,
      houndClassStats.soldier);
    
    this.createNewHound(
      'vulture',
      600,
      800,
      1,
      houndClassStats.artillery);
    
    this.start();
  }
  
  createNewHound(name, x, y, team, houndClass) {
    var id = this.gameData.hounds.length;
    var h = new Hound(
      id, name, 
      { x: x,
        y: y},
      team, houndClass,
      this.map,
      this.timeStep,
      this.createProjectile.bind(this));
    this.gameData.hounds.push(h);
  }
  
  createProjectile(creator, target, targetingHound) {
    var p = new Projectile(creator.stats, creator.pos, target, targetingHound, this.createImpact.bind(this));
    this.gameData.projectiles.push(p);
    this.sendToAllPlayers("spawnprojectile", p);
  }
  
  createImpact(position, radius, damage) {
    var i = new Impact(position, radius, damage, this.gameData.hounds,this.gameData.cities);
    this.gameData.impacts.push(i);
    this.sendToAllPlayers("spawnimpact", i);
  }

  start() {
    this.started = true;
    setInterval(this.update.bind(this), this.timeStep);
    this.sendToAllPlayers('mapseed', this.gameData.mapSeed);

    this.sendToAllPlayers("spawnhounds", this.gameData.hounds);
  }

  end() {
    console.log('game end');
    this.settings.paused = true;
  }
  
  /* Game functions */

  update() {
    if (gameOver)
      return;
    var timeStep = this.timeStep;
    TWEEN.update();

    this.map.update();
    this.gameData.hounds.forEach(function (h) { h.update(); });
    this.gameData.cities.forEach(function (c) { c.update(); });
    this.gameData.projectiles.forEach(function (p) { p.update(); });
    this.gameData.impacts.forEach(function (i) { i.update(timeStep); });

    this.sendToAllPlayers('update', this.gameData);

    this.gameData.hounds = this.removeDead(this.gameData.hounds);
    this.gameData.projectiles = this.removeDead(this.gameData.projectiles);
    this.gameData.impacts = this.removeDead(this.gameData.impacts);
    this.gameData.cities = this.removeDead(this.gameData.cities);
    
    this.checkWinCondition();
  }
  
  sendToPlayer(player, message, content) {
    var target = this.players.find(function (p) {
      return p.id == player;
    });
    target.emit(message, content);
  }

  sendToAllPlayers(message, content) {
    for (var i = 0; i < this.players.length; i++) {
      this.players[i].emit(message, content);
    }
  }

  getTeamHounds(team) {
    return this.gameData.hounds.filter(
      (hound) => { return hound.team === team }
    );
  }
  
  getNamedTeamHound(name, team) {
    return this.getTeamHounds(team).find(
      (hound) => { return hound.name === name }
    );
  }

  getNamedHound(name) {
    return this.gameData.hounds.find(
      (hound) => { return hound.name === name }
    );
  }

  checkWinCondition() {
    if (this.getTeamHounds(0).length == 0 || this.getTeamHounds(1).length == 0) {
      gameOver = true;
    }
    var winner;
    if (gameOver) {
      if (this.getTeamHounds(0).length > 0)
        winner = 0;
      else
        winner = 1;
      this.sendEndgameMessage(winner);
    }
    //that's the winner
  }
  
  sendEndgameMessage(winner) {
    var loser = 0;
    if (winner == 0)
      loser = 1;
    addMessage('You win!', winner);
    addMessage('You lose!', loser);
    addMessage('Game over - refresh to rejoin queue');
    this.end();
  }
  
  end() {
    this.complete = true;
  }

  removeDead(array) {
    return array.filter(function (element) {
      return element.alive;
    });
  }
}

var settings = {
  gameWidth: 800,
  gameHeight: 600,
  mapWidth: 2048,
  mapHeight: 2048,
  difficulty: 1
};

// Class definitions
var houndClassStats = {
  scout: {
    level: 1,
    hp: 12,
    ac: 8,
    speed: 6,
    sightRange: 600,
    projectileSpeed: 14,
    projectileRadius: 20,
    projectileDamage: 1,
    homingProjectiles: false,
    attackCooldown: 3000
  },
  soldier: {
    level: 1,
    hp: 18,
    ac: 10,
    speed: 3,
    sightRange: 250,
    projectileSpeed: 2,
    projectileRadius: 45,
    projectileDamage: 2,
    homingProjectiles: false,
    attackCooldown: 3000
  },
  artillery: {
    level: 1,
    hp: 12,
    ac: 8,
    speed: 1,
    sightRange: 100,
    projectileSpeed: 7,
    projectileRadius: 100,
    projectileDamage: 5,
    homingProjectiles: false,
    attackCooldown: 5000
  },
  weakling: {
    level: 1,
    hp: 6,
    ac: 6,
    speed: 1,
    sightRange: 100,
    projectileSpeed: 1,
    projectileRadius: 40,
    projectileDamage: 1,
    homingProjectiles: false,
    attackCooldown: 10000
  }
}

var complexity = 144;

function getRandomProperty(obj) {
  var keys = Object.keys(obj)
  return obj[keys[keys.length * Math.random() << 0]];
}

/*--------------------*/
/* UI INPUT/OUTPUT
/*--------------------*/

function addMessage(msg, team) {
  if (team === undefined) {
    io.emit('console', msg);
  } else {
    connections.filter(function (c) {
      if (c.details.team === team)
        c.emit('console', msg);
    });
  }
}

/*--------------------*/
/* HELPERS
/*--------------------*/

function parseBool(str) {
  if (str === 'true')
    return true;
  else
    return false;
}

/* DICE ROLLS */

function rollDice(sides, numberOfDice) {
  var result = 0;
  for (var i = 0; i < numberOfDice; i++) {
    result += rollDie(sides);
  }
  return result;
}

function rollDie(sides) {
  return 1 + Math.floor(Math.random() * sides);
}

module.exports.GameClass = Game;
module.exports.CreateFunction = function(sockets, ioClient) {
  connections = sockets;
  io = ioClient;
  gameInstance = new Game(sockets);
  module.exports.GameInstance = gameInstance;
  return gameInstance;
}
module.exports.AddMessage = addMessage;