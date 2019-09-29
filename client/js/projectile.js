class Projectile {
  constructor(stats, pos, target, targetingHound) {
    this.pos = { x: pos.x, y: pos.y };
    this.target = target;
    this.targetingHound = targetingHound;

    this.discovered = false;
    this.alive = true;

    this.stats = {
      radius: stats.projectileRadius,
      speed: stats.projectileSpeed,
      damage: stats.projectileDamage,
      homing: stats.homingProjectiles
    }

    this.stroke = '#fff';
    this.fill = '#fff';
    this.origin = { x: pos.x, y: pos.y };
    
    if (this.targetingHound)
      this.moveTo(target.pos);
    else
      this.moveTo(target);

    var dotSpawnInterval = 100;
    var me = this;
    this.trailInterval = setInterval(function () {
      me.spawnTrailDot()
    }, dotSpawnInterval);
  }

  moveTo(moveTarget) {
    var projectile = this;
    var coords = { x: this.pos.x, y: this.pos.y };
    var xdiff = this.pos.x - moveTarget.x;
    var ydiff = this.pos.y - moveTarget.y;
    var distance = Math.sqrt(xdiff * xdiff + ydiff * ydiff);
    var travelTime = distance / (this.stats.speed / 100);

    if (!this.stats.homing)
      moveTarget = { x: moveTarget.x, y: moveTarget.y };

    var tween = new TWEEN.Tween(coords)
      .to(moveTarget, travelTime)
      .onUpdate(function (object) {
        projectile.pos.x = coords.x;
        projectile.pos.y = coords.y;
      })
      .onComplete(function (object) {
        projectile.impact();
      })
      .start();
  }

  updateBounds() {

  }

  update() {
    if (!this.alive)
      return;
  }

  onInspect() {
    addMessage(this.name + ": lvl" + this.stats.level, colors.text);
  }

  impact() {
    //create damage circle
    var impact = new Impact(this.pos, this.stats.radius, this.stats.damage);
    gameData.impacts.push(impact);
    this.die();
  }

  spawnTrailDot() {
    if (!this.alive || !this.inSightRange())
      return;
    gameData.trailDots.push(new TrailDot(this.pos, 5, '#fff'));
  }

  render() {
    if (!this.alive)
      return;
    
    if (!this.inSightRange())
      return;

    graphics.drawDot(this.pos.x, this.pos.y, 8, '#000')
  }

  inSightRange() {
    return true;
  }

  die() {
    clearInterval(this.trailInterval);
    this.alive = false;
  }
}

class Impact {
  constructor(position, radius, damage) {
    if (!radius)
      radius = 100;
    this.pos = position;
    this.radius = radius;
    this.alive = true;
    this.damage = damage;

    this.stroke = '#000';
    this.fill = '#ffaa00';//'#9a9a9a'; for grey
    this.alpha = 1;

    this.damageHoundsInside();
    this.damageCitiesInside();
  }

  damageHoundsInside() {
    var impact = this;
    gameData.hounds.forEach(function (hound) {
      if (distanceBetween(hound.pos, impact.pos) < impact.radius)
        hound.hurt(rollDice(6, impact.damage));
    });
  }

  damageCitiesInside() {
    var impact = this;
    gameData.cities.forEach(function (city) {
      if (distanceBetween(city.pos, impact.pos) < impact.radius)
        city.hurt(rollDice(6, impact.damage));
    });
  }

  update() {
    if (!this.alive)
      return;

    var explosionFadeTime = 1400;

    if (this.alpha > 0)
      this.alpha -= timeStep / explosionFadeTime;
    else
      this.alpha = 0;

    this.updateBounds();
  }

  updateBounds() {
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

class TrailDot {
  constructor(position, radius, color) {
    this.pos = { x: position.x, y: position.y };
    this.radius = radius;
    this.alive = true;

    this.fill = color;
    this.alpha = 1;
  }

  update() {
    if (!this.alive)
      return;
    var trailLifetime = 2000;
    if (this.alpha > 0)
      this.alpha -= timeStep / trailLifetime;
    else {
      this.alpha = 0;
      this.die();
    }
  }

  render() {
    if (!this.alive)
      return;

    graphics.ctx.globalAlpha = this.alpha;
    graphics.drawDot(this.pos.x, this.pos.y, this.radius,
      this.fill);
    graphics.ctx.globalAlpha = 1;
  }

  die() {
    this.alive = false;
  }
}