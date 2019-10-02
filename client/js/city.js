class City {
  constructor(name, x, y, size, color, team) {
    this.name = name;
    this.pos = {
      x: x,
      y: y
    };
    this.size = size;
    this.alive = true;
    
    this.stats = {
      hp: 20,
      sightRange: 250
    }
    this.fill = color;
  }

  update() {
    if (!this.alive)
      return;
  }

  render() {
    if (!this.alive)
      return;
    graphics.drawRect(this.pos.x, this.pos.y, this.size, this.size, this.fill, '#eee', this.name, '#fff')
  }

  renderSightRange() {
    if (this.team != playerDetails.team)
      return;
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