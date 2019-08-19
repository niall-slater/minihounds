class Hound {
  constructor(id, name, position) {
    this.id = id;
    this.name = name;
    this.position = position;
    
    this.discovered = false;
    this.alive = true;
    
    var level = 1 + rollDie(20);
    
    this.stats = {
      level: level,
      hp: 6 + rollDice(6, level),
      ac: 6 + rollDice(4, Math.floor(level/4))
    }
  }
  
  moveTo(target) {
    addMessage("Now approaching: " + target.name);
    var coords = { x: this.pos.x, y: this.pos.y };
    var travelTime = 1700;
    var tween = new TWEEN.Tween(coords)
            .to({ x: target[0] - 4, y: target[1] - 4 }, travelTime)
            .easing(TWEEN.Easing.Quadratic.Out)
            .onUpdate(function(object) {
              player.pos.x = coords.x;
              player.pos.y = coords.y;
            })
            .onComplete(function(object) {
              player.followingObject = true;
              $('#button-scan').removeClass('disabled');
            })
            .start();
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
  
  die() {
    this.alive = false;
  }
}