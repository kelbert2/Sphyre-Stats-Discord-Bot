const Discord = require('discord.js');
//const logger = require('winston');
const prefix = '~';

const auth = require('./auth.json'); // Load up the token
/*
// winston
logger.remove(logger.transports.Console);
logger.add(new logger.transports.Console, {
  colorize: true
});
logger.level = 'debug';
*/

let usingHardcore = false;

const bot = new Discord.Client();
bot.on('ready', () => {
  console.log('Botty boy is ready');
});

/*
logger.info('Logged in as: ');
logger.info(bot.username = '-(' + bot.id + ')');
*/

bot.on('message', message => {
  if (message.author.bot) return;

  if (message.content.substring(0,1) === prefix) {
    // split around spaces
    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    switch (command) {
      case 'ping':
        message.channel.send('pong!');
        break;
      case 'hybrid':
        if (args[0] == hardcore) {
          // six things, a b c // DEBUG:
        } else {
          // assume softcore
        }
        // respond with contigency points, number remaining
        break;
      default:
        message.channel.send('I don\'t recognize that.');
    }
  }
});

/*
bot.on('message', function(user, userID, channelID, msg, event) {
  if (message.substring(0, 1) === '~') {
    var args = message.substring(1).split('');
    var cmd = args[0];

    args = args.splice(1);
    switch(cmd) {
      case 'ping':
        bot.sendMessage({
          to: channelID,
          message: 'pong!'
        });
        break;
    }
  }
});
*/

bot.on('disconnect', () => {
  bot.connect(); // Will reconnect
});

bot.login(auth.token);
