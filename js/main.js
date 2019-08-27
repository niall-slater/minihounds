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

// Class defintions
var houndClassStats = {
  scout: {
    level: 1,
    hp: 6 + rollDice(6, 1),
    ac: 6 + rollDice(4, 1),
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
    hp: 12 + rollDice(12, 1),
    ac: 6 + rollDice(4, 1),
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
    hp: 6 + rollDice(6, 1),
    ac: 6 + rollDice(4, 1),
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
    hp: 6 + rollDice(4, 1),
    ac: 6 + rollDice(3, 1),
    speed: 1,
    sightRange: 100,
    projectileSpeed: 3,
    projectileRadius: 40,
    projectileDamage: 1,
    homingProjectiles: false,
    attackCooldown: 5000
  }
}

var constants = {
  maxMessages: 50
};

var input = {
  enabled: true,
  console: undefined
};

var output = {
  console: undefined,
  alert: undefined,
  planetList: undefined
};

var complexity = 144;

var seed = [13, 1, 23, 4, 5, 6,
  13, 1, 23, 4, 5, 6,
  13, 1, 23, 4, 5, 6,
  13, 1, 23, 4, 5, 6];

var voronoiDensity;

function createMap() {

  hounds.length = 0;
  projectiles.length = 0;
  impacts.length = 0;
  trailDots.length = 0;

  for (var i = 0; i < complexity; i++) {
    seed[i] = Math.random() * 2000;
  }

  voronoiDensity = seed.length / 2;

  map = new Map(seed);

  hounds.push(new Hound(
    1, 'scout', { x: settings.gameWidth / 2, y: settings.gameHeight / 2 },
    0, houndClassStats.scout));
  hounds.push(new Hound(
    2, 'soldier', { x: settings.gameWidth / 2 - 50, y: settings.gameHeight / 2 - 50 },
    0, houndClassStats.soldier));
  hounds.push(new Hound(
    3, 'artillery', { x: settings.gameWidth / 2 + 50, y: settings.gameHeight / 2 - 50 },
    0, houndClassStats.artillery));

  for (var i = 0; i < settings.difficulty * 3; i++) {
    var randomPos = { x: Math.random() * settings.mapWidth, y: (Math.random() * settings.mapHeight / 2) + settings.mapHeight / 2 };
    var id = 3 + i;
    hounds.push(new Hound(id, 'enemy' + id, randomPos, 1,
      houndClassStats.weakling));
  }
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
  setInterval(update, timeStep);
  createMap();
  addMessage('System booting...', colors_computer[0], 50);
  addMessage('Please wait...', colors_computer[0], 100);
  addMessage('Reaching hound receivers...', colors_computer[0], 250);
  addMessage('Hounds responding...', colors_computer[0], 1250);
  getPlayerHounds().forEach(function (hound) {
    addMessage(hound.name.toUpperCase() + " READY", colors_computer[4], 1350);
  });
  addMessage('Hounds awaiting commands.', null, 2500);
  addMessage('Try the following:', '#eee', 3000);
  addMessage('SCOUT MOVE N 250', '#fff', 3500);
}

function win() {
  addMessage('WAVE CLEARED. REBOOTING...');
  settings.paused = true;

  setTimeout(function () {
    settings.paused = false;
    settings.difficulty++;
    createMap();
    addMessage('ENTERING WAVE ' + settings.difficulty);
  }, 3000);
}

function lose() {
  addMessage('ALL HOUNDS LOST. SIMULATION COMPLETE');
  settings.paused = true;
}

/* Game functions */

function update() {

  updateAllDisplays();

  if (settings.paused) {
    projectiles.forEach(function (p) { p.update(); });
    impacts.forEach(function (i) { i.update(); });
    trailDots.forEach(function (t) { t.update(); });

    projectiles = removeDead(projectiles);
    impacts = removeDead(impacts);
    trailDots = removeDead(trailDots);
    cities = removeDead(cities);

    graphics.render();
    return;
  }

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

  //render updated graphics
  graphics.render();
}

function checkWinCondition() {
  var playerHounds = hounds.filter(function (hound) {
    return hound.team == playerTeam;
  });

  if (playerHounds.length == 0)
    lose();

  var enemyHounds = hounds.filter(function (hound) {
    return hound.team != playerTeam;
  });

  if (enemyHounds.length == 0)
    win();
}

function removeDead(array) {
  return array.filter(function (element) {
    return element.alive;
  });
}

function getPlayerHounds() {
  return hounds.filter(
    function (hound) {
      return hound.team === playerTeam;
    });
}

/* UI output functions */

function updateAllDisplays() {

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

function addMessageWithLink(linkText, url, delay) {
  if (output.numMessages >= constants.maxMessages) {
    output.console.removeChild(output.console.firstChild);
  }

  var li = document.createElement("li");
  var linkElement = document.createElement("a");
  linkElement.textContent = linkText;
  $(linkElement).attr('href', url);
  $(linkElement).attr('target', '_blank');
  li.appendChild(linkElement);

  if (!delay)
    delay = 0;

  setTimeout(function () {
    output.console.appendChild(li);
    output.console.parentElement.scrollTop = output.console.parentElement.scrollHeight;
    output.numMessages++
  }, delay);
}

function addMessageImage(imageSrc, url, delay) {

  if (output.numMessages >= constants.maxMessages) {
    output.console.removeChild(output.console.firstChild);
  }

  var li = document.createElement("li");
  var a = document.createElement("a");
  var img = document.createElement("img");
  img.src = imageSrc;
  $(a).attr('href', url);
  $(a).attr('target', '_blank');
  li.appendChild(a);
  a.appendChild(img);

  if (!delay)
    delay = 0;

  setTimeout(function () {
    output.console.appendChild(li);
    output.console.parentElement.scrollTop = output.console.parentElement.scrollHeight;
    output.numMessages++
  }, delay);
}

function addMessageAscii(arr) {
  for (var i = 0; i < arr.length; i++) {
    addMessage(arr[i], colors.normal);
  }
}

function sendCommand() {
  var command = input.console.value;
  input.lastCommand = command;
  input.console.value = '';
  addMessage(command);
  parseCommand(command);
}

/*--------------------*/
/* SAVE/LOAD DATA
/*--------------------*/

function saveData() {
  var statsData = stats;
  var skillsData = skills;

  setCookie('statsData', statsData);
  setCookie('skillsData', skillsData);
}

function loadData() {
  var statsData = readCookie('statsData');
  var skillsData = readCookie('skillsData');

  if (!statsData || !skillsData)
    return;

  stats.age = parseInt(statsData.age);
  stats.name = statsData.name;
  stats.power = parseInt(statsData.power);
  stats.calculations = parseInt(statsData.calculations);
  stats.children = parseInt(statsData.children);
  stats.funding = parseInt(statsData.funding);

  skills.power = parseInt(skillsData.power);
  skills.speed = parseInt(skillsData.speed);
  skills.networking = parseInt(skillsData.networking);
  skills.negotiation = parseInt(skillsData.negotiation);

  skills.autocalc = parseBool(skillsData.calculations);
  skills.autofeed = parseBool(skillsData.calculations);

  for (var i = 0; i < stats.children; i++) {
    addChildDisplay();
  }
}

function clearData() {
  deleteCookie('statsData');
  deleteCookie('skillsData');
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