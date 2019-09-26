function parseCommand(command) {
  console.log('sending command');
  ioClient.emit('command', command);
}

function getPlayerHounds() {
  return gameData.hounds.find(
    (hound) => { return hound.team === playerTeam }
  );
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