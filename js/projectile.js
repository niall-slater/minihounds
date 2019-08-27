class Projectile {
  constructor(creator, target) {
    this.pos = { x: creator.pos.x, y: creator.pos.y };
    this.creator = creator;
    this.target = target;

    this.discovered = false;
    this.alive = true;

    this.stats = {
      radius: this.creator.stats.projectileRadius,
      speed: this.creator.stats.projectileSpeed,
      homing: this.creator.stats.homingProjectiles
    }

    this.stroke = '#fff';
    this.fill = '#333';
    this.origin = { x: creator.pos.x, y: creator.pos.y };

    this.moveTo(target.pos);
    var dotSpawnInterval = 200;
    var me = this;
    this.trailInterval = setInterval(function () {
      me.spawnTrailDot()
    }, 200);
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
    var impact = new Impact(this.pos, this.stats.radius);
    impacts.push(impact);
    this.die();
  }

  spawnTrailDot() {
    if (!this.alive)
      return;
    trailDots.push(new TrailDot(this.pos, 2, this.fill));
  }

  render() {
    if (!this.alive)
      return;

    graphics.drawDot(this.pos.x, this.pos.y, 4, this.creator.fill)
  }

  die() {
    clearInterval(this.trailInterval);
    this.alive = false;
  }
}

class Impact {
  constructor(position, radius) {
    if (!radius)
      radius = 100;
    this.pos = position;
    this.radius = radius;
    this.alive = true;

    this.stroke = '#000';
    this.fill = '#9a9a9a';//'#ffaa00';
    this.alpha = 1;

    this.damageHoundsInside();
  }

  damageHoundsInside() {
    var impact = this;
    hounds.forEach(function (hound) {
      if (distanceBetween(hound.pos, impact.pos) < impact.radius)
        hound.hurt(50);
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