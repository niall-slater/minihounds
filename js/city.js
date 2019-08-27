class City {
  constructor(region, size, color) {
    this.region = region;
    this.pos = {
      x: region.center.x,
      y: region.center.y + 100
    };
    this.size = size;
    this.alive = true;

    this.name = region.name + ' City';
    this.fill = color;
  }

  update() {
    if (!this.alive)
      return;
  }

  render() {
    if (!this.alive)
      return;
    graphics.drawRect(this.pos.x, this.pos.y, this.size, this.size, this.fill, '#333', this.name, '#000')
  }

  die() {
    this.alive = false;
  }
}