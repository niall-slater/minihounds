function parseCommand(command) {
  command = command.toLowerCase();
  var components = command.split(' ');
  var name = components[0];
  components.shift();
  var verb = components[0];
  components.shift();
  var args = components;

  switch (verb) {
    case 'move': {
      if (args.length != 2) {
        addMessage('invalid command');
        return;
      }
      var movement = [0, 0];
      switch (args[0]) {
        case 'n': movement = [0, -Math.abs(parseInt(args[1]))]; break;
        case 'e': movement = [parseInt(args[1]), 0]; break;
        case 's': movement = [0, parseInt(args[1])]; break;
        case 'w': movement = [-Math.abs(parseInt(args[1])), 0]; break;
        default: break;
      }
      var subject = getNamedPlayerHound(name);
      var x = parseInt(movement[0]);
      var y = parseInt(movement[1]);
      var moveCommand =
      {
        x: subject.pos.x + x,
        y: subject.pos.y + y
      };
      subject.moveTo(moveCommand);
      break;
    }
    case 'stop': {
      var subject = getNamedPlayerHound(name);
      subject.stopMoving();
      break;
    }
    case 'attack': {
      var subject = getNamedPlayerHound(name);
      if (args.length != 1) {
        addMessage('invalid command');
        return;
      }
      var target = getNamedHound(args[0]);
      if (!target || !target.inSightRange()) {
        addMessage('Cannot acquire target "' + args[0] + '"');
        return;
      }
      subject.attack(target);
      break;
    }
    default: break;
  }
}

function getNamedPlayerHound(name) {
  return getPlayerHounds().find(
    (hound) => { return hound.name === name }
  );
}

function getNamedHound(name) {
  return hounds.find(
    (hound) => { return hound.name === name }
  );
}

function recallLastCommand() {
  if (input.lastCommand)
    input.console.value = input.lastCommand;
}

/* GENERIC HELPER FUNCTIONS */

function distanceBetween(a, b) {
  //a and b are {x: value, y: value} objects
  var xdiff = a.x - b.x;
  var ydiff = a.y - b.y;
  var distance = Math.sqrt(xdiff * xdiff + ydiff * ydiff);
  return distance;
}

function getClosest(array, seeker) {
  var dist = Number.POSITIVE_INFINITY;
  var result = null;
  for (var i = 0; i < array.length; i++) {
    var test = distanceBetween(seeker, array[i]);
    if (test < dist) {
      dist = test;
      result = array[i];
    }
  }
  return result;
}

function getRandomPointNear(target, radius, minDistance) {
  var randomX = Math.random() * (radius * 2) - radius;
  var randomY = Math.random() * (radius * 2) - radius;
  if (minDistance) {
    if (Math.abs(randomX < minDistance)) {
      if (randomX < 0)
        randomX -= minDistance;
      else
        randomX += minDistance;
    }
    if (Math.abs(randomY < minDistance)) {
      if (randomY < 0)
        randomY -= minDistance;
      else
        randomY += minDistance;
    }
  }
  return {x: target.pos.x + randomX, y: target.pos.y + randomY};
}

function isInside(point, polygon) {
  // ray-casting algorithm based on
  // http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html

  var x = point[0], y = point[1];

  var inside = false;
  for (var i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    var xi = polygon[i][0], yi = polygon[i][1];
    var xj = polygon[j][0], yj = polygon[j][1];

    var intersect = ((yi > y) != (yj > y))
      && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }

  return inside;
};