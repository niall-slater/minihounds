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
    var trailLifetime = 10000;
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

module.exports = TrailDot;