var houndMovementMultiplier = 0.003;

class Hound {
  constructor(id, name, position, team, stats) {
    this.id = id;
    this.name = name;
    this.pos = position;
    this.movement = {x: 0, y: 0};
    this.moveTarget = null;
    
    this.visible = false;
    this.alive = true;

    var level = 1 + rollDie(20);

    if (!stats) {
      this.stats = houndClassStats.soldier;
    } else
      this.stats = stats;

    this.stroke = '#fff';
    this.fill = colors_primary[team];
    this.team = team;
    this.ai = team != playerTeam;
    if (this.ai)
      this.startAi();

    this.updateBounds();
  }

  startAi() {
    if (Math.random() > .5)
      this.wander();
    var me = this;
    this.think();
    this.thinkInterval = setInterval(function(){me.think();}, 8000);
  }

  think() {
    var me = this;

    var playerHoundsInRange = hounds.filter(function (hound) {
      return hound.team == playerTeam;
    }).filter(function (playerHound) {
      return distanceBetween(playerHound.pos, me.pos) < me.stats.sightRange;
    });

    var target = getRandom(playerHoundsInRange);
    if (!target)
      return;

    if (Math.random() > .5) {
      this.stopMoving();
      this.attack(target);
    }
  }

  moveTo(target, nextTask) {
    var targetRegion = map.getRegionAt(target.x, target.y);
    this.moveTarget = target;
    
    var dx, dy;
    dx = target.x - this.pos.x;
    dy = target.y - this.pos.y;
    var angle = Math.atan2(dy, dx);
    var xVelocity, yVelocity;
    xVelocity = this.stats.speed * Math.cos(angle);
    yVelocity = this.stats.speed * Math.sin(angle);

    this.movement = {x: xVelocity, y: yVelocity};
  }

  stopMoving() {
    this.moveTarget = null;
    this.movement.x = 0;
    this.movement.y = 0;
  }

  updateBounds() {
    this.poly = [
      [this.pos.x - 10, this.pos.y + 10],
      [this.pos.x + 0,  this.pos.y - 10],
      [this.pos.x + 10, this.pos.y + 10]
    ];
  }
  
  updateMovement() {
    if (!this.moveTarget)
      return;
    
    this.pos.x += this.movement.x * timeStep * houndMovementMultiplier;
    this.pos.y += this.movement.y * timeStep * houndMovementMultiplier;
    
    if (distanceBetween(this.moveTarget, this.pos) < 10)
      this.stopMoving()
  }

  update() {
    if (!this.alive)
      return;
    this.updateBounds();
    this.updateMovement();
  }

  onInspect() {
    addMessage(this.name + ": lvl" + this.stats.level, colors.text);
  }

  say(phrase) {
    if (!this.alive)
      return;

    addMessage(this.name + " says: '" + phrase + "'");
  }

  hurt(amount) {
    if (!amount)
      return;
    this.stats.hp -= amount;
    var terrainCover = map.getRegionAt(this.pos.x, this.pos. y).defence;
    amount *= 1-terrainCover;
    addMessage(amount + " damage to " + this.name + ". " + this.stats.hp + "HP remaining.");
    if (this.stats.hp <= 0) {
      this.stats.hp = 0;
      this.die();
    }
  }

  render() {
    if (!this.alive)
      return;
    if (!this.inSightRange())
      return;
    graphics.drawPolygon(this.poly, this.stroke, this.fill);
    graphics.drawText(this.name, this.pos.x - 32, this.pos.y + 34, this.fill, 22);
    graphics.drawText(this.name, this.pos.x - 34, this.pos.y + 32, '#fff', 22);
  }

  renderSightRange() {
    graphics.drawCircle(this.pos.x, this.pos.y,
                        this.stats.sightRange, '#fff');
  }

  inSightRange() {
    var playerHounds = hounds.filter(function (hound) {
      return hound.team == playerTeam;
    });

    for (var i = 0; i < playerHounds.length; i++) {
      if (distanceBetween(playerHounds[i].pos, this.pos) < playerHounds[i].stats.sightRange)
        return true;
    }

    return false;
  }

  die() {
    addMessage(this.name + ' DESTROYED');
    clearInterval(this.thinkInterval);
    this.alive = false;
  }

  wander() {
    var target = {x: Math.random() * settings.mapWidth, y: Math.random() * settings.mapHeight/2};
    var repeat = function(hound) {hound.wander();}
    this.moveTo(target, repeat);
  }

  attack(target) {
    projectiles.push(new Projectile(this, target));
    addMessage(this.name + ' WEAPON DISCHARGE');
  }
}

function distanceBetween(a, b) {
  //a and b are {x: value, y: value} objects
  var xdiff = a.x - b.x;
  var ydiff = a.y - b.y;
  var distance = Math.sqrt(xdiff * xdiff + ydiff * ydiff);
  return distance;
}