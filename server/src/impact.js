class Impact {
  constructor(position, radius, damage, hounds, cities) {
    if (!radius)
      radius = 100;
    this.pos = position;
    this.radius = radius;
    this.alive = true;
    this.damage = damage;

    this.stroke = '#000';
    this.fill = '#ffaa00';//'#9a9a9a'; for grey
    this.alpha = 1;

    this.damageHoundsInside(hounds);
    this.damageCitiesInside(cities);
  }

  damageHoundsInside(hounds) {
    var impact = this;
    hounds.forEach(function (hound) {
      if (distanceBetween(hound.pos, impact.pos) < impact.radius)
        hound.hurt(rollDice(6, impact.damage));
    });
  }

  damageCitiesInside(cities) {
    var impact = this;
    cities.forEach(function (city) {
      if (distanceBetween(city.pos, impact.pos) < impact.radius)
        city.hurt(rollDice(6, impact.damage));
    });
  }

  update(timeStep) {
    if (!this.alive)
      return;

    var explosionFadeTime = 1400;

    if (this.alpha > 0)
      this.alpha -= timeStep / explosionFadeTime;
    else
      this.alpha = 0;

    this.updateBounds(timeStep);
  }

  updateBounds(timeStep) {
    if (!this.alive)
      return;

    var impactShrinkTime = 100;

    if (this.radius > 0)
      this.radius -= timeStep / impactShrinkTime;
    else
      this.die();
  }

  render() {
    if (!this.alive)
      return;
    graphics.ctx.globalAlpha = this.alpha;
    graphics.drawCircle(this.pos.x, this.pos.y, this.radius,
      this.stroke, this.fill);
    graphics.ctx.globalAlpha = 1;
  }

  die() {
    this.alive = false;
  }
}

function distanceBetween(a, b) {
  //a and b are {x: value, y: value} objects
  var xdiff = a.x - b.x;
  var ydiff = a.y - b.y;
  var distance = Math.sqrt(xdiff * xdiff + ydiff * ydiff);
  return distance;
}

module.exports = Impact;

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