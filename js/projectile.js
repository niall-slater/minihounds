class Projectile {
  constructor(creator, target) {
    this.pos = {x: creator.pos.x, y: creator.pos.y};
    this.creator = creator;
    this.target = target;
    
    this.discovered = false;
    this.alive = true;
    
    this.stats = {
      radius: 50,
      speed: 6
    }
    
    this.stroke = '#fff';
    this.fill = '#000';
    this.origin = {x: creator.pos.x, y: creator.pos.y};
    
    this.updateBounds();
    
    this.moveTo(target.pos);
  }
  
  moveTo(moveTarget) {
    var projectile = this;
    var coords = { x: this.pos.x, y: this.pos.y };
    var xdiff = this.pos.x - moveTarget.x;
    var ydiff = this.pos.y - moveTarget.y;
    var distance = Math.sqrt(xdiff * xdiff + ydiff * ydiff);
    var travelTime = distance / (this.stats.speed / 100);

    var tween = new TWEEN.Tween(coords)
            .to(moveTarget, travelTime)
            .onUpdate(function(object) {
              projectile.pos.x = coords.x;
              projectile.pos.y = coords.y;
            })
            .onComplete(function(object) {
              projectile.impact();
              projectile.target.hurt();
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
    if(!this.alive)
      return;
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
    if(!this.alive)
      return;
    graphics.drawLine(this.origin.x, this.origin.y, this.pos.x, this.pos.y, 2, this.creator.fill);
    graphics.drawPolygon(this.poly, this.stroke, this.fill);
  }
  
  die() {
    this.alive = false;
  }
}