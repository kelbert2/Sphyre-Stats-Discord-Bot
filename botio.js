const Discord = require('discord.io');
//const logger = require('winston');
const prefix = '~';

const auth = require('./auth.json');
/*
// winston
logger.remove(logger.transports.Console);
logger.add(new logger.transports.Console, {
  colorize: true
});
logger.level = 'debug';
*/

const bot = new Discord.Client({
  token: auth.token,
  autorun: true
});

bot.on('ready', () => {
  console.log('Logged in as %s - %s\n', bot.username, bot.id);
});
// console.log('Logged in as ${bot.user.tag} as bot username: ${bot.username}');

/*
logger.info('Logged in as: ');
logger.info(bot.username = '-(' + bot.id + ')');
*/

bot.on('message', function(user, userID, channelID, message, event) {

  if (message.indexOf(prefix) !== 0) return;

  const args = message.slice(prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();

  switch (command) {
    case 'ping':
      bot.sendMessage({
        to: channelID,
        message: "pong!"
      });
      break;
    default:
      bot.sendMessage({
        to: channelID,
        message: 'I don\'t recognize that!'
      });
  }
});

bot.on('disconnect', () => {
  bot.connect(); // can't keep me down
});
