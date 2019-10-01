var playerDetails = {
  name: null,
  team: null,
};

var ioClient = io.connect("http://localhost:3000");

var complexity = 144;

ioClient.on("test", (msg) =>  console.log(msg));
ioClient.on("console", (msg) => addMessage(msg));
ioClient.on("mapseed", (seed) => createMap(complexity, seed));
ioClient.on("playerdetails", (details) => {playerDetails = details; addMessage("YOU ARE TEAM " + playerDetails.team)});
ioClient.on("spawnhounds", (hounds) => spawnHounds(hounds));
ioClient.on("spawnprojectile", (p) => spawnProjectile(p));
ioClient.on("spawnimpact", (i) => spawnImpact(i));
ioClient.on("update", (packet) => networkUpdate(packet));

var timeStep = 10;

var map;

var settings = {
  gameWidth: 800,
  gameHeight: 600,
  mapWidth: 2048,
  mapHeight: 2048
};

var constants = {
  maxMessages: 50
};

var input = {
  enabled: true,
  console: undefined
};

var output = {
  console: undefined,
  alert: undefined
};

var gameData = {
  mapSeed: [],
  hounds: [],
  projectiles: [],
  impacts: [],
  trailDots: [],
  cities: []
}

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

function createMap(complexity, seed) {

  gameData.hounds.length = 0;
  gameData.projectiles.length = 0;
  gameData.impacts.length = 0;
  gameData.trailDots.length = 0;

  map = new Map(seed);
}

function getRandomProperty(obj) {
  var keys = Object.keys(obj)
  return obj[keys[keys.length * Math.random() << 0]];
}

$(document).ready(function () {
  setUpElementReferences();
  start();
});

/* Setup */

function setUpElementReferences() {
  output.console = document.getElementById('output-console');
  output.alert = document.getElementById('alert-panel');
  input.console = document.getElementById('input-console');
  output.unitList = document.getElementById('unit-list');
  output.targetList = document.getElementById('target-list');
}

function start() {
  $('input').focus();
  graphics.init();
  setInterval(localUpdate, timeStep);
  addMessage('System booting...', colors_computer[0], 50);
  addMessage('Please wait...', colors_computer[0], 100);
  addMessage('Reaching hound receivers...', colors_computer[0], 250);
  addMessage('Hounds responding...', colors_computer[0], 1250);
  addMessage('Hounds awaiting commands.', null, 2500);
}

function spawnHounds(houndsSentFromServer) {
  for (var i = 0; i < houndsSentFromServer.length; i++) {
    var houndSent = houndsSentFromServer[i];
    gameData.hounds.push(new Hound(houndSent.id, houndSent.name,
                                  houndSent.pos, houndSent.team,
                                  houndSent.stats));

  }    
}

function spawnProjectile(p) {
  gameData.projectiles.push(new Projectile(p.stats, p.pos, p.target, p.targetingHound));
}

function spawnImpact(i) {
  gameData.impacts.push(new Impact(i.pos, i.radius, i.damage));
}

function win() {
  addMessage('WIN?');
}

function lose() {
  addMessage('LOSE?');
}

/* Game functions */

function networkUpdate(serverState) {
  for (var i = 0; i < serverState.cities.length; i++) {
    gameData.cities[i].stats = serverState.cities[i].stats;
    gameData.cities[i].alive = serverState.cities[i].alive;
  }
  
  for (var i = 0; i < serverState.hounds.length; i++) {
    gameData.hounds[i].pos = serverState.hounds[i].pos;
    gameData.hounds[i].alive = serverState.hounds[i].alive;
    gameData.hounds[i].cooldowns = serverState.hounds[i].cooldowns;
    gameData.hounds[i].poly = serverState.hounds[i].poly;
  }
  
  for (var i = 0; i < serverState.projectiles.length; i++) {
    gameData.projectiles[i].pos = serverState.projectiles[i].pos;
    gameData.projectiles[i].alive = serverState.projectiles[i].alive;
  }
  
  for (var i = 0; i < serverState.impacts.length; i++) {
    gameData.impacts[i].pos = serverState.impacts[i].pos;
    gameData.impacts[i].radius = serverState.impacts[i].radius;
    gameData.impacts[i].alpha = serverState.impacts[i].alpha;
    gameData.impacts[i].alive = serverState.impacts[i].alive;
  }

  gameData.hounds = removeDead(gameData.hounds);
  gameData.projectiles = removeDead(gameData.projectiles);
  gameData.impacts = removeDead(gameData.impacts);
  gameData.trailDots = removeDead(gameData.trailDots);
  gameData.cities = removeDead(gameData.cities);
}

function localUpdate() {
  /* this is the regular update 
  there is a separate ad-hoc 
  update performed when a packet
  is received from the server */
  
  gameData.trailDots.forEach(function(t){t.update()});
  gameData.trailDots = removeDead(gameData.trailDots);

  //render updated graphics
  graphics.render();
}

/*--------------------*/
/* UI INPUT/OUTPUT
/*--------------------*/

//Print a message to the console window
function addMessage(text, color, delay, includesDonger) {
  console.log(text);
  if (output.numMessages >= constants.maxMessages) {
    output.console.removeChild(output.console.firstChild);
  }
  var li = document.createElement("li");
  li.innerHTML = text;
  if (color) {
    li.style.color = color;
  }
  if (includesDonger) {
    li.classList += 'donger';
  }

  if (!delay)
    delay = 0;

  setTimeout(function () {
    output.console.appendChild(li);
    output.console.parentElement.scrollTop = output.console.parentElement.scrollHeight;
    output.numMessages++
  }, delay);
}

function sendCommand() {
  var command = input.console.value;
  input.lastCommand = command;
  input.console.value = '';
  addMessage(command);
  parseCommand(command, ioClient);
}

/*--------------------*/
/* HELPERS
/*--------------------*/

function setCookie(name, value) {
  var cookie = [name, '=', JSON.stringify(value), '; domain=.', window.location.host.toString(), '; path=/;'].join('');
  cookie += "expires=Sat, 25 Dec 2021 12:00:00 UTC;";
  document.cookie = cookie;
}

function deleteCookie(name) {
  document.cookie = [name, '=; expires=Thu, 01-Jan-1970 00:00:01 GMT; path=/; domain=.', window.location.host.toString()].join('');
}

function readCookie(name) {
  var result = document.cookie.match(new RegExp(name + '=([^;]+)'));
  result && (result = JSON.parse(result[1]));
  return result;
}

function parseBool(str) {
  if (str === 'true')
    return true;
  else
    return false;
}

/*--------------------*/
/* EVENT LISTENERS
/*--------------------*/

$('#input-console').keydown(function (e) {
  var context = this;
  // Enter pressed
  if (e.which == 10 || e.which == 13) {
    sendCommand();
  }
  // Up pressed
  if (e.which == 38) {
    recallLastCommand();
    setTimeout(function () { context.selectionStart = context.selectionEnd = context.value.length }, 0);
  }
});

document.addEventListener('keydown', (e) => {
  //console.log(e.code);
});

function disableInput(duration) {
  input.enabled = false;
  $('button').addClass('disabled');

  if (duration) {
    setTimeout(enableInput, duration);
  }
}

function enableInput() {
  input.enabled = true;
  $('button').removeClass('disabled');
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

function removeDead(array) {
  return array.filter(function (element) {
    return element.alive;
  });
}