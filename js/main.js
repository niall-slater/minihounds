var timeStep = 10;
var map;

var hounds = [];

var settings = {
  gameWidth: 1280,
  gameHeight: 1280
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
  alert: undefined,
  planetList: undefined
};

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
  
  addMessage("Rolled " + rollDie(20), '#fff');
  map = new Map('seed');
  hounds.push(new Hound(1, 'benjamin', {x: 50, y: 50}));
  hounds.push(new Hound(2, 'lenjamin', {x: 150, y: 50}));
  hounds.push(new Hound(3, 'tenjamin', {x: 50, y: 150}));
  
  hounds.forEach((hound) => {
    hound.moveTo([300, 300]);
  })
}

/* Game functions */

function update() {
  //Update graphics
  TWEEN.update();
  //update objects
  //update ui
  updateAllDisplays();

  map.update();
  
  hounds.forEach(function(hound){hound.update();});
  
  //render updated graphics
  graphics.render();
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
  addMessage(command);
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

$('#console-input').keydown(function(e) {
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