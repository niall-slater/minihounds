class Projectile {
  constructor(creator, target) {
    this.pos = creator.pos;
    
    this.discovered = false;
    this.alive = true;
    
    this.stats = {
      radius: 50,
      speed: 6
    }
    
    this.stroke = '#fff';
    this.fill = '#000';
    
    this.updateBounds();
  }
  
  moveTo(target) {
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
      [this.pos.x - 4, this.pos.y - 4,],
      [this.pos.x + 0, this.pos.y - 6,],
      [this.pos.x + 4, this.pos.y - 4,],
      [this.pos.x + 4, this.pos.y + 4,],
      [this.pos.x - 4, this.pos.y + 4,]
    ];
  }
  
  update() {
    this.updateBounds();
  }
  
  onInspect() {
    addMessage(this.name + ": lvl" + this.stats.level, colors.text);
  }
  
  impact() {
    //create damage circle
    this.die();
  }
  
  render() {
    graphics.drawPolygon(this.poly, this.stroke, this.fill);
  }
  
  die() {
    this.alive = false;
  }
}