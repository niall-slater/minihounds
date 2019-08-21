class Projectile {
  constructor(creator, target) {
    this.pos = {x: creator.pos.x, y: creator.pos.y};
    this.creator = creator;
    this.target = target;
    
    this.discovered = false;
    this.alive = true;
    
    this.stats = {
      radius: 150,
      speed: 6
    }
    
    this.stroke = '#fff';
    this.fill = '#000';
    this.origin = {x: creator.pos.x, y: creator.pos.y};
    
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
    
  }
  
  update() {
    if(!this.alive)
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
  
  render() {
    if(!this.alive)
      return;
    graphics.drawLine(this.origin.x, this.origin.y, this.pos.x, this.pos.y, 2, this.creator.fill);

    graphics.drawDot(this.pos.x, this.pos.y, 2, this.fill)
  }
  
  die() {
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
    
    this.stroke = '#fff';
    this.fill = '#ffaa00';
    
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
    if(!this.alive)
      return;
    
    this.updateBounds();
  }
  
  updateBounds() {
    if (!this.alive)
      return;

    if (this.radius > 0)
      this.radius -= timeStep/ 20;
    else
      this.die();
  }
  
  render() {
    if(!this.alive)
      return;
    console.log('rendering');
    graphics.drawCircle(this.pos.x, this.pos.y, this.radius,
                       this.stroke, this.fill);
  }
  
  die() {
    this.alive = false;
  }
}
//patroclus attack achilles