class City {
  constructor(name, x, y, size, color, team) {
    this.name = name;
    this.pos = {
      x: x,
      y: y
    };
    this.size = size;
    this.alive = true;
    this.team = team;
    
    this.stats = {
      hp: rollDice(20, 3),
      sightRange: 200 + rollDice(20, 5)
    }
    this.fill = color;
  }

  update() {
    if (!this.alive)
      return;
  }

  hurt(amount) {
    if (!amount)
      return;
    this.stats.hp -= amount;
    //addMessage(amount + " damage to " + this.name + ". " + this.stats.hp + "HP remaining.");
    if (this.stats.hp <= 0) {
      this.stats.hp = 0;
      this.die();
    }
  }

  die() {
    //addMessage(this.name + " destroyed!")
    this.alive = false;
  }
}

module.exports = City;

/* DICE ROLLS */

function rollDice(sides, numberOfDice) {
  var result = 0;
  for (var i = 0; i < numberOfDice; i++) {
    result += rollDie(sides);
  }
  return result;
}

function rollDie(sides) {
  return 1 + Math.floor(Math.random() * sides);
}