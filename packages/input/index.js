var tty = require('tty');
process.stdin.resume();
process.stdin.on('keypress', function(char, key) {
  if (key && key.ctrl && key.name == 'c') {

    process.exit()
  }
});


process.stdout.write('\033[2J');
process.stdout.write('\033[0;15f');
process.stdout.write('Hui');

process.stdout.write('\033[5;15f');

process.stdout.write('Hui');
