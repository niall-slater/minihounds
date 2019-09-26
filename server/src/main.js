var TWEEN = require('@tweenjs/tween.js');

class GameState {
  constructor(data) {
    this.data = data;
  }
}

class Game {
  constructor(sockets) {
    var seed = [13, 1, 23, 4, 5, 6,
                13, 1, 23, 4, 5, 6,
                13, 1, 23, 4, 5, 6,
                13, 1, 23, 4, 5, 6];
    
    this.timeStep = 10;
    this.gameData = {
      mapSeed: seed,
      hounds: [],
      projectiles: [],
      impacts: [],
      trailDots: [],
      cities: []
    }

    this.gameState = new GameState(this.gameData);
    
    this.settings = {
      gameWidth: 800,
      gameHeight: 600,
      mapWidth: 2048,
      mapHeight: 2048,
      difficulty: 1
    };
    
    this.houndClassStats = houndClassStats;
    
    this.players = [];

    for (var i = 0; i < sockets.length; i++) {
      var player = sockets[i];
      player.details = {};
      player.details.name = 'player ' + (i + 1);
      player.details.team = (i + 1);
      console.log(player.details);
      this.players.push(player); 
      player.emit('playerdetails', player.details);
    }
    this.start();
  }
  

  start() {
    setInterval(this.update.bind(this), this.timeStep);
    this.sendToAllPlayers('mapseed', this.gameData.mapSeed);
  }

  end() {
    console.log('game end');
    this.settings.paused = true;
  }
  
  /* Game functions */

  update() {
    if (this.settings.paused) {
      this.gameData.projectiles.forEach(function (p) { p.update(); });
      this.gameData.impacts.forEach(function (i) { i.update(); });
      this.gameData.trailDots.forEach(function (t) { t.update(); });

      this.gameData.projectiles = this.removeDead(this.gameData.projectiles);
      this.gameData.impacts = this.removeDead(this.gameData.impacts);
      this.gameData.trailDots = this.removeDead(this.gameData.trailDots);
      this.gameData.cities = this.removeDead(this.gameData.cities);
      return;
    }
    
    this.sendToAllPlayers('console', 'update!');

    TWEEN.update();

    //this.map.update();

    this.gameData.hounds.forEach(function (h) { h.update(); });
    this.gameData.cities.forEach(function (c) { c.update(); });
    this.gameData.projectiles.forEach(function (p) { p.update(); });
    this.gameData.impacts.forEach(function (i) { i.update(); });
    this.gameData.trailDots.forEach(function (t) { t.update(); });

    this.gameData.hounds = this.removeDead(this.gameData.hounds);
    this.gameData.projectiles = this.removeDead(this.gameData.projectiles);
    this.gameData.impacts = this.removeDead(this.gameData.impacts);
    this.gameData.trailDots = this.removeDead(this.gameData.trailDots);
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

  checkWinCondition() {
    //check each team to see if there's just one remaining
    //that's the winner
  }

  removeDead(array) {
    return array.filter(function (element) {
      return element.alive;
    });
  }

  getHoundsOnTeam(team) {
    return this.gameData.hounds.filter(
      function (hound) {
        return hound.team === team;
      }
    );
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

//Send a message to player's console
function addMessage(text, recipient, delay) {
  console.log(text);

  if (!delay)
    delay = 0;

  setTimeout(function () {
    //sendmessage
  }, delay);
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

module.exports = Game;