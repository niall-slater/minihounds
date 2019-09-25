class City {
  constructor(region, size, color) {
    this.region = region;
    this.pos = {
      x: region.center.x,
      y: region.center.y
    };
    this.size = size;
    this.alive = true;
    
    this.stats = {
      hp: rollDice(20, 3),
      sightRange: 200 + rollDice(20, 5)
    }

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

  renderSightRange() {
    graphics.drawCircle(this.pos.x, this.pos.y,
      this.stats.sightRange, '#fff');
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

  die() {
    addMessage(this.name + " destroyed!")
    this.alive = false;
  }
}