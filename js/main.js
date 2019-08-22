var timeStep = 10;
var map;

var hounds = [];
var projectiles = [];
var impacts = [];
var trailDots = [];

var playerTeam = 0;

var settings = {
  gameWidth: 1280,
  gameHeight: 1280,
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
    projectileSpeed: 3,
    projectileRadius: 20,
    homingProjectiles: false
  },
  soldier: {
    level: 1,
    hp: 6 + rollDice(6, 1),
    ac: 6 + rollDice(4, 1),
    speed: 3,
    sightRange: 250,
    projectileSpeed: 2,
    projectileRadius: 45,
    homingProjectiles: false
  },
  artillery: {
    level: 1,
    hp: 6 + rollDice(6, 1),
    ac: 6 + rollDice(4, 1),
    speed: 1,
    sightRange: 100,
    projectileSpeed: 7,
    projectileRadius: 100,
    homingProjectiles: false
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

var complexity = 44;

var seed = [13, 1, 23, 4, 5, 6,
            13, 1, 23, 4, 5, 6,
            13, 1, 23, 4, 5, 6,
            13, 1, 23, 4, 5, 6];

var voronoiDensity;

function createMap() {

  hounds = [];
  projectiles = [];
  impacts = [];
  trailDots = [];

  for (var i = 0; i < complexity; i++) {
    seed[i] = Math.random() * 2000;
  }

  console.log(seed);

  voronoiDensity = seed.length / 2;

  map = new Map(seed);

  hounds.push(new Hound(
    1, 'scout', {x: 550, y: 950}, 0, houndClassStats.scout));
  hounds.push(new Hound(
    2, 'soldier', {x: 450, y: 950}, 0, houndClassStats.soldier));
  hounds.push(new Hound(
    3, 'artillery', {x: 500, y: 1050}, 0, houndClassStats.artillery));

  for (var i = 0; i < settings.difficulty; i++) {
    var randomPos = {x: Math.random() * settings.gameWidth, y: Math.random() * settings.gameHeight / 2 };
    hounds.push(new Hound(3 + i, 'enemy', randomPos, 1, getRandomProperty(houndClassStats)));
  }
}

function getRandomProperty(obj) {
  var keys = Object.keys(obj)
  return obj[keys[ keys.length * Math.random() << 0]];
}

$( document ).ready(function() {
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
  graphics.init();
  setInterval(update, timeStep);
  createMap();
}

function win() {
  addMessage('WAVE CLEARED. REBOOTING...');
  settings.difficulty++;
  addMessage('ENTERING WAVE ' + settings.difficulty);
  createMap();
}

function lose() {
  addMessage('ALL HOUNDS LOST. SIMULATION COMPLETE.');
}

/* Game functions */

function update() {
  //Update graphics
  TWEEN.update();
  //update objects
  //update ui
  updateAllDisplays();

  map.update();

  hounds.forEach(function(h){h.update();});
  projectiles.forEach(function(p){p.update();});
  impacts.forEach(function(i){i.update();});
  trailDots.forEach(function(t){t.update();});

  hounds = removeDead(hounds);
  projectiles = removeDead(projectiles);
  impacts = removeDead(impacts);
  trailDots = removeDead(trailDots);

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

  setTimeout(function() {
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

  setTimeout(function() {
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

  setTimeout(function() {
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

function parseBool (str) {
  if (str === 'true')
    return true;
  else
    return false;
}

/*--------------------*/
/* EVENT LISTENERS
/*--------------------*/

$('#input-console').keydown(function(e) {
  var context = this;
  // Enter pressed
  if(e.which == 10 || e.which == 13) {
    sendCommand();
  }
  // Up pressed
  if(e.which == 38) {
    recallLastCommand();
    setTimeout(function(){context.selectionStart = context.selectionEnd = context.value.length},0);
  }
});

function disableInput(duration){
  input.enabled = false;
  $('button').addClass('disabled');

  if (duration){
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