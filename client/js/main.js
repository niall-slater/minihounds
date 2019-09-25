var ioClient = io.connect("http://localhost:3000");

ioClient.on("test", (msg) => addMessage(msg));
ioClient.on("console", (msg) => console.log(msg));
ioClient.on("mapseed", (seed) => createMap(144, seed));

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

function createMap(complexity, seed) {

  hounds.length = 0;
  projectiles.length = 0;
  impacts.length = 0;
  trailDots.length = 0;

  for (var i = 0; i < complexity; i++) {
    seed[i] = Math.random() * 2000;
  }

  var voronoiDensity = seed.length / 2;

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

function win() {
  addMessage('WIN?');
}

function lose() {
  addMessage('LOSE?');
}

/* Game functions */

function networkUpdate(serverState) {
  gameState = serverState;
}

function localUpdate() {
  /* this is the regular update 
  there is a separate ad-hoc 
  update performed when a packet
  is received from the server */
  
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
  parseCommand(command);
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