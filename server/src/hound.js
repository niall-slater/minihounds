var houndMovementMultiplier = 0.03;
var aiThinkInterval = 3000;
var arriveAtLocationTolerance = 10;

class Hound {
  constructor(id, name, position, team, stats, map, timeStep) {
    this.id = id;
    this.name = name;
    this.pos = position;
    this.movement = { x: 0, y: 0 };
    this.moveTarget = null;
    
    this.map = map;
    this.timeStep = timeStep;

    this.tasks = [];

    this.visible = false;
    this.alive = true;

    var level = 1 + rollDie(20);

    if (!stats) {
      this.stats = houndClassStats.soldier;
    } else
      this.stats = stats;
    
    this.cooldowns = {
      attack: 0
    }

    this.stroke = '#fff';
    this.fill = colors_primary[team];
    this.team = team;
    
    this.ai = false;
    //this.ai = team != playerTeam;
    var me = this;
    if (this.ai)
      this.startAi();

    this.updateBounds();
  }

  startAi() {
    if (Math.random() > 1)
      this.startWanderBehaviour();
    else
      this.startAssaultBehaviour();
    var me = this;
    this.think();
    this.thinkInterval = setInterval(function () { me.think(); }, aiThinkInterval);
  }

  think() {
    var me = this;
    
    var playerHoundsInRange = hounds.filter(function (hound) {
      return hound.team == playerTeam;
    }).filter(function (playerHound) {
      return distanceBetween(playerHound.pos, me.pos) < me.stats.sightRange;
    });
    
    var target = getRandom(playerHoundsInRange);
    
    if (target) {
      if (Math.random() > .5) {
        this.stopMoving();
        this.attack(target);
      }
    }
    
    if (this.tasks.length === 0) {
      this.startAssaultBehaviour();
    }
  }

  moveTo(target) {
    var targetRegion = this.map.getRegionAt(target.x, target.y);
    this.moveTarget = target;

    var dx, dy;
    dx = target.x - this.pos.x;
    dy = target.y - this.pos.y;
    var angle = Math.atan2(dy, dx);
    var xVelocity, yVelocity;

    xVelocity = Math.cos(angle);
    yVelocity = Math.sin(angle);

    this.movement = { x: xVelocity, y: yVelocity };
  }

  stopMoving() {
    this.moveTarget = null;
    this.movement.x = 0;
    this.movement.y = 0;
  }


  updateCooldowns() {
    if (this.cooldowns.attack > 0)
      this.cooldowns.attack -= this.timeStep;
    else
      this.cooldowns.attack = 0;
  }

  updateBounds() {
    this.poly = [
      [this.pos.x - 10, this.pos.y + 10],
      [this.pos.x + 0, this.pos.y - 10],
      [this.pos.x + 10, this.pos.y + 10]
    ];
  }

  updateMovement() {
    if (!this.moveTarget)
      return;
    this.currentRegion = this.map.getRegionAt(this.pos.x, this.pos.y);

    var speedCostAdjustment = 1 - this.stats.speedPenalty;
    this.pos.x += this.movement.x * this.timeStep * houndMovementMultiplier * speedCostAdjustment;
    this.pos.y += this.movement.y * this.timeStep * houndMovementMultiplier * speedCostAdjustment;

    if (distanceBetween(this.moveTarget, this.pos) < 10)
      this.stopMoving()
  }
  
  updateTasks() {
    var currentTask = this.tasks[0];
    if (!currentTask)
      return;

    if (currentTask.isComplete)
      this.tasks.shift();

    currentTask = this.tasks[0];
    if (!currentTask)
      return;

    if (!currentTask.inProgress)
      currentTask.start();
    
    currentTask.update();
  }

  update() {
    if (!this.alive)
      return;

    this.currentRegion = this.map.getRegionAt(this.pos.x, this.pos.y);
    if (this.currentRegion)
      this.stats.speedPenalty = this.currentRegion.movecost;
    else
      this.stats.speedPenalty = 0;
    
    this.updateCooldowns();

    this.updateBounds();
    this.updateMovement();
    
    this.updateTasks();
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
    if (!amount)
      return;
    this.stats.hp -= amount;
    var terrainCover = this.map.getRegionAt(this.pos.x, this.pos.y).defence;
    amount *= 1 - terrainCover;
    addMessage(amount + " damage to " + this.name + ". " + this.stats.hp + "HP remaining.");
    if (this.stats.hp <= 0) {
      this.stats.hp = 0;
      this.die();
    }
  }

  inSightRange() {
    var playerHounds = hounds.filter(function (hound) {
      return hound.team == playerTeam;
    });

    for (var i = 0; i < playerHounds.length; i++) {
      if (distanceBetween(playerHounds[i].pos, this.pos) <
          playerHounds[i].stats.sightRange)
        return true;
    }

    for (var i = 0; i < cities.length; i++) {
      if (distanceBetween(cities[i].pos, this.pos) <
          cities[i].stats.sightRange)
        return true;
    }

    return false;
  }

  die() {
    addMessage(this.name + ' DESTROYED');
    clearInterval(this.thinkInterval);
    this.alive = false;
  }

  ///////////////////
  /* AI Behaviours */
  ///////////////////
  
  startWanderBehaviour() {
    var target = { x: Math.random() * settings.mapWidth, y: Math.random() * settings.mapHeight / 2 };
    var hound = this;

    var task = new Task(
      hound,
      hound.moveTo,
      [target],
      function() {return distanceBetween(hound.pos, target) < arriveAtLocationTolerance},
      hound.startWanderBehaviour,
      []
    );
    
    hound.tasks.push(task);
  }
  
  startAssaultBehaviour() {
    var target = getClosest(cities, this);
    if (!target)
      return;
    
    var hound = this;
    
    var moveTarget = getRandomPointNear(
      target, this.stats.sightRange, 
      this.stats.projectileRadius + target.stats.sightRange);
    
    var completionCheck = function() {
      return distanceBetween(hound.pos, moveTarget) < arriveAtLocationTolerance;
    }
    
    var taskMove = new Task(
      hound,
      hound.moveTo,
      [moveTarget],
      completionCheck,
      hound.startBombardBehaviour,
      [target]
    );
    
    this.tasks.push(taskMove);
  }
  
  startBombardBehaviour(target) {
    var taskAttack = new Task(
      this,
      this.attack,
      [target],
      function(){return !target.alive},
      null,
      [],
      true
    );
    
    this.tasks.push(taskAttack);
  }
  
  /* END AI Behaviours */

  attack(target) {
    if (this.cooldowns.attack > 0) {
      if (this.team === playerTeam)
        addMessage(this.name + " cannot fire - reloading");
      return; 
    }
    this.cooldowns.attack = this.stats.attackCooldown;
    projectiles.push(new Projectile(this, target, true));
    var coords = parsePixels(this.pos.x, this.pos.y);
    addMessage('WEAPON DISCHARGE DETECTED AT ' + Math.round(coords[0]) + ', ' + Math.round(coords[1]));
  }
  attackPoint(target) {
    if (this.cooldowns.attack > 0) {
      if (this.team === 1)
        addMessage(this.name + " cannot fire - reloading");
      return;
    }
    this.cooldowns.attack = this.stats.attackCooldown;
    projectiles.push(new Projectile(this, target, false));
    addMessage(this.name + ' WEAPON DISCHARGE');
  }
}

module.exports = Hound;

/* Helper stuff */

var colors_primary = [
  '#f00', '#00f'
];

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

function distanceBetween(a, b) {
  //a and b are {x: value, y: value} objects
  var xdiff = a.x - b.x;
  var ydiff = a.y - b.y;
  var distance = Math.sqrt(xdiff * xdiff + ydiff * ydiff);
  return distance;
}