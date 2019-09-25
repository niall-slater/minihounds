var timeStep = 10;
var map;

var hounds = [];
var projectiles = [];
var impacts = [];
var trailDots = [];
var cities = [];

var playerTeam = 0;

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

var seed = [13, 1, 23, 4, 5, 6,
  13, 1, 23, 4, 5, 6,
  13, 1, 23, 4, 5, 6,
  13, 1, 23, 4, 5, 6];

function getRandomProperty(obj) {
  var keys = Object.keys(obj)
  return obj[keys[keys.length * Math.random() << 0]];
}

/* Setup */

function start() {
  setInterval(update, timeStep);
  playerSocket.emit('mapseed', seed);
}

function end() {
  console.log('game end');
  settings.paused = true;
}

/* Game functions */

function update() {
  if (settings.paused) {
    projectiles.forEach(function (p) { p.update(); });
    impacts.forEach(function (i) { i.update(); });
    trailDots.forEach(function (t) { t.update(); });

    projectiles = removeDead(projectiles);
    impacts = removeDead(impacts);
    trailDots = removeDead(trailDots);
    cities = removeDead(cities);
    return;
  }
  playerSocket.emit('console', 'update!');

  TWEEN.update();

  map.update();

  hounds.forEach(function (h) { h.update(); });
  cities.forEach(function (c) { c.update(); });
  projectiles.forEach(function (p) { p.update(); });
  impacts.forEach(function (i) { i.update(); });
  trailDots.forEach(function (t) { t.update(); });

  hounds = removeDead(hounds);
  projectiles = removeDead(projectiles);
  impacts = removeDead(impacts);
  trailDots = removeDead(trailDots);
  cities = removeDead(cities);

  checkWinCondition();
}

function checkWinCondition() {
  //check each team to see if there's just one remaining
  //that's the winner
}

function removeDead(array) {
  return array.filter(function (element) {
    return element.alive;
  });
}

function getHoundsOnTeam(team) {
  return hounds.filter(
    function (hound) {
      return hound.team === team;
    }
  );
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