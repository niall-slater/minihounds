const Impact = require('./impact.js');
const TrailDot = require('./trailDot.js');
const TWEEN = require('@tweenjs/tween.js');

class Projectile {
  constructor(stats, pos, target, targetingHound, createImpact) {
    this.pos = { x: pos.x, y: pos.y };
    this.target = target;
    this.targetingHound = targetingHound;

    this.discovered = false;
    this.alive = true;
    
    this.createImpact = createImpact;

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

    /*
    var dotSpawnInterval = 1000;
    var me = this;
    this.trailInterval = setInterval(function () {
      me.spawnTrailDot()
    }, dotSpawnInterval);
    */
    this.die.bind(this);
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
    this.createImpact(this.pos, this.stats.radius, this.stats.damage);
    this.die();
  }

  spawnTrailDot() {
    if (!this.alive || !this.inSightRange())
      return;
    trailDots.push(new TrailDot(this.pos, 5, '#fff'));
  }

  inSightRange() {
    var playerHounds = hounds.filter(function (hound) {
      return hound.team == playerTeam;
    });

    for (var i = 0; i < playerHounds.length; i++) {
      if (distanceBetween(playerHounds[i].pos, this.pos) <
          playerHounds[i].stats.sightRange)
        return true;
    }

    for (var i = 0; i < cities.length; i++) {
      if (distanceBetween(cities[i].pos, this.pos) <
          cities[i].stats.sightRange)
        return true;
    }

    return false;
  }

  die() {
    clearInterval(this.trailInterval);
    this.alive = false;
  }
}

module.exports = Projectile;