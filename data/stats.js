// Class defintions 
var houndClassStats = {
  scout: {
    level: 1,
    hp: 6 + rollDice(6, 1),
    ac: 6 + rollDice(4, 1),
    speed: 6,
    sightRange: 600,
    projectileSpeed: 3,
    projectileRadius: 20,
    homingProjectiles: false
  },
  soldier: {
    level: 1,
    hp: 6 + rollDice(6, 1),
    ac: 6 + rollDice(4, 1),
    speed: 3,
    sightRange: 250,
    projectileSpeed: 2,
    projectileRadius: 45,
    homingProjectiles: false
  },
  artillery: {
    level: 1,
    hp: 6 + rollDice(6, 1),
    ac: 6 + rollDice(4, 1),
    speed: 1,
    sightRange: 100,
    projectileSpeed: 7,
    projectileRadius: 100,
    homingProjectiles: false
  }
}