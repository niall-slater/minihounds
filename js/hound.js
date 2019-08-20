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
      speed: 23,
      sightRange: 600
    }
    
    this.stroke = '#fff';
    this.fill = colors_primary[team];
    this.team = team;
    if (team != playerTeam)
      this.wander();
    
    this.updateBounds();
  }
  
  moveTo(target, nextTask) {
    console.log(this.name, 'moving to ' + target);
    //Target is an array like [x, y]
    addMessage(this.name + " moving to " + target);
    var hound = this;
    var coords = { x: this.pos.x, y: this.pos.y };
    var distance = distanceBetween(this.pos, {x: target[0], y: target[1]});
    var travelTime = distance / (this.stats.speed / 100);

    var tween = new TWEEN.Tween(coords)
            .to({ x: target[0] - 4, y: target[1] - 4 }, travelTime)
            .onUpdate(function(object) {
              hound.pos.x = coords.x;
              hound.pos.y = coords.y;
            })
            .onComplete(() => {nextTask(this);})
            .start();
  }
  
  updateBounds() {
    this.poly = [
      [this.pos.x - 10, this.pos.y + 10],
      [this.pos.x + 0,  this.pos.y - 10],
      [this.pos.x + 10, this.pos.y + 10]
    ];
  }
  
  update() {
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
    this.stats.hp -= amount;
    if (this.stats.hp <= 0) {
      this.stats.hp = 0;
      this.die();
    }
  }
  
  render() {
    if (!this.inSightRange())
      return;
    graphics.drawPolygon(this.poly, this.stroke, this.fill);
    graphics.drawText(this.name, this.pos.x - 32, this.pos.y + 34, this.fill, 22);
    graphics.drawText(this.name, this.pos.x - 34, this.pos.y + 32, '#fff', 22);
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
    this.alive = false;
  }
  
  wander() {
    var target = [Math.random() * settings.gameWidth, Math.random() * settings.gameHeight/2];
    var repeat = function(hound) {hound.wander();}
    this.moveTo(target, repeat);
  }
}

function distanceBetween(a, b) {
  //a and b are {x: value, y: value} objects
  var xdiff = a.x - b.x;
  var ydiff = a.y - b.y;
  var distance = Math.sqrt(xdiff * xdiff + ydiff * ydiff);
  return distance;
}