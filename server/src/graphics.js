function rotatePoint(cx, cy, x, y, angle) {
  var radians = (Math.PI / 180) * angle,
    cos = Math.cos(radians),
    sin = Math.sin(radians),
    nx = (cos * (x - cx)) + (sin * (y - cy)) + cx,
    ny = (cos * (y - cy)) - (sin * (x - cx)) + cy;
  return [nx, ny];
}

function clampAngle(angle) {
  var result = angle;
  if (result > 360)
    result -= 360;
  else if (result < 0)
    result += 360;
  return result;
}