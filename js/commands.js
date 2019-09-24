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
      var coords = parseCoords(args[0], args[1]);
      var subject = getNamedPlayerHound(name);
      var moveCommand =
      {
        x: coords[0],
        y: coords[1]
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
      if (args.length < 1) {
        addMessage('invalid command');
        return;
      }
      if (args.length == 1) {
        var target = getNamedHound(args[0]);
        if (!target || !target.inSightRange()) {
          addMessage('Cannot acquire target "' + args[0] + '"');
          return;
        }
        subject.attack(target);
        break;
      } else if (args.length == 2) {
        var coords = parseCoords(args[0], args[1]);
        var attackCommand =
        {
          x: coords[0],
          y: coords[1]
        };
        subject.attackPoint(attackCommand);
        break;
      }
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

function parseCoords(x, y) {
  var scale = 20.48;
  var result = [parseFloat(x) * scale,
                  parseFloat(y) * scale];
  return result;
}

function parsePixels(x, y) {
  var scale = 20.48;
  var result = [parseFloat(x) / scale,
                  parseFloat(y) / scale];
  return result;
}

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
    var test = distanceBetween(seeker.pos, array[i].pos);
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

function rotateVector(vec, ang)
{
    ang = ang * (Math.PI/180);
    var cos = Math.cos(ang);
    var sin = Math.sin(ang);
    return new Array(Math.round(10000*(vec[0] * cos - vec[1] * sin))/10000, Math.round(10000*(vec[0] * sin + vec[1] * cos))/10000);
};