function parseCommand(command) {
  command = command.toLowerCase();
  var components = command.split(' ');
  var name = components[0];
  components.shift();
  var verb = components[0];
  components.shift();
  var args = components;
  
  switch(verb) {
    case 'move': {
      if (args.length != 2) {
        addMessage('invalid command');
        return; 
      }
      var movement = [0, 0];
      switch (args[0]) {
        case 'n': movement = [0, -Math.abs(parseInt(args[1]))]; break;
        case 'e': movement = [parseInt(args[1]), 0]; break;
        case 's': movement = [0, parseInt(args[1])]; break;
        case 'w': movement = [-Math.abs(parseInt(args[1])), 0]; break;
        default: break;
      }
      var subject = getNamedPlayerHound(name);
      var x = parseInt(movement[0]);
      var y = parseInt(movement[1]);
      console.log(x, y);
      var moveCommand = 
          [subject.pos.x + x,
           subject.pos.y + y];
      subject.moveTo(moveCommand);
      break;
    }
    case 'stop': {
      var subject = getNamedPlayerHound(name);
      subject.stopMoving();
      break;
    }
    case 'attack': {
      var subject = getNamedPlayerHound(name);
      if (args.length != 1) {
        addMessage('invalid command');
        return; 
      }
      var target = getNamedHound(args[0]);
      if (!target || !target.inSightRange()) {
        addMessage('Cannot acquire target "' + args[0] + '"');
        return;
      }
      subject.attack(target);
      break;
    }
    default: break;
  }
}

function getNamedPlayerHound(name) {
  return getPlayerHounds().find(
    (hound) => {return hound.name === name}
  );
}

function getNamedHound(name) {
  return hounds.find(
    (hound) => {return hound.name === name}
  );
}

function recallLastCommand() {
  if (input.lastCommand)
    input.console.value = input.lastCommand;
}