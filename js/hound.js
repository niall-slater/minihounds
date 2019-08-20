class Hound {
  constructor(id, name, position) {
    this.id = id;
    this.name = name;
    this.pos = position;
    
    this.discovered = false;
    this.alive = true;
    
    var level = 1 + rollDie(20);
    
    this.stats = {
      level: level,
      hp: 6 + rollDice(6, level),
      ac: 6 + rollDice(4, Math.floor(level/4)),
      speed: 3
    }
    
    this.stroke = '#fff';
    this.fill = getRandom(colors_primary);
    
    this.updateBounds();
  }
  
  moveTo(target) {
    addMessage("Now approaching: " + target);
    var hound = this;
    var coords = { x: this.pos.x, y: this.pos.y };
    var xdiff = this.pos.x - target[0];
    var ydiff = this.pos.y - target[1];
    var distance = Math.sqrt(xdiff * xdiff + ydiff * ydiff);
    var travelTime = distance / (this.stats.speed / 100);

    var tween = new TWEEN.Tween(coords)
            .to({ x: target[0] - 4, y: target[1] - 4 }, travelTime)
            .onUpdate(function(object) {
              hound.pos.x = coords.x;
              hound.pos.y = coords.y;
            })
            .onComplete(function(object) {
            })
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
    graphics.drawPolygon(this.poly, this.stroke, this.fill);
  }
  
  die() {
    this.alive = false;
  }
}