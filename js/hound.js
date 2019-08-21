class Hound {
  constructor(id, name, position, team) {
    this.id = id;
    this.name = name;
    this.pos = position;
    
    this.visible = false;
    this.alive = true;
    
    var level = 1 + rollDie(20);
    
    this.stats = {
      level: level,
      hp: 6 + rollDice(6, level),
      ac: 6 + rollDice(4, Math.floor(level/4)),
      speed: 3,
      sightRange: 350
    }
    
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
    this.thinkInterval = setInterval(this.think, 1000);l
  }
  
  think() {
    
  }
  
  moveTo(target, nextTask) {
    if (this.tween)
      this.tween.stop();
    //Target is an object like {x: 5, y: 5}
    if (this.team === playerTeam)
      addMessage(this.name + " moving to " + target);
    var hound = this;
    var coords = { x: this.pos.x, y: this.pos.y };
    var distance = distanceBetween(this.pos, target);
    var travelTime = distance / (this.stats.speed / 100);

    this.tween = new TWEEN.Tween(coords)
      .to(target, travelTime)
      .onUpdate(function(object) {
        hound.pos.x = coords.x;
        hound.pos.y = coords.y;
      })
      .onComplete(() => {
        if (nextTask) {
          nextTask(this);
        }
        this.tween = null;
      })
      .start();
  }
  
  stopMoving() {
    this.tween.stop();
  }
  
  updateBounds() {
    this.poly = [
      [this.pos.x - 10, this.pos.y + 10],
      [this.pos.x + 0,  this.pos.y - 10],
      [this.pos.x + 10, this.pos.y + 10]
    ];
  }
  
  update() {
    if (!this.alive)
      return;
    this.updateBounds();
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
    var target = {x: Math.random() * settings.gameWidth, y: Math.random() * settings.gameHeight/2};
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