// jack sneeringer
const Discord = require('discord.js');

const auth = require('./auth.json'); // Load up the token
const config = require('./config.json');

// const Enmap = require('enmap');
// const fs = require('fs');

let usingHardcore = false;

const bot = new Discord.Client();
bot.on('ready', () => {
  console.log('Stats bot is ready');
});

// for memory usage: https://enmap.evie.dev/examples/settings
/*
bot.settings = new Enmap({
  name: "settings",
  fetchAll: false,
  autoFetch: true,
  cloneLevel: 'deep'
});
*/

bot.on('message', message => {
  if (message.author.bot || !message.content.startsWith(config.prefix)) return;

    // split around spaces
    const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    switch (command) {
      case 'ping':
        message.channel.send('pong!');
        break;
      case 'hybrid':
      // let [strEquation dexEquation conEquation intEquation wisEquation chaEquation] = args;
        // respond with contigency points, number remaining
        let ret = [0, 0, 0, 0, 0, 0];
        for (i = 0; i < args.length; i++) {
          switch (args[i]) {
            case 'a':
              ret[i] = 15 +  Math.floor((Math.random() * (6) + 1)/2);
              break;
            case 'b':
              ret[i] = 10 + 2 * Math.floor(Math.random() * (4) + 1);
              break;
            case 'c':
              ret[i] = 6 + 2 * Math.floor(Math.random() * (6) + 1);
              break;
            default:
              ret[i] = 3 * Math.floor(Math.random() * (6) + 1);
              break;
          }
          message.channel.send(ret[i]+' ');
        }

        break;
      case 'roll':
        let [iterations, dice] = args.split('d');

case 'help':
  message.channel.send('Recognized commands: roll, ping, hybrid, that\'s it.');

      default:
        message.channel.send('I don\'t recognize that. Sorry.');
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
bot.on('error', (e) => console.error(e));
bot.on('warn', (e) => console.warn(e));
bot.on('debug', (e) => console.info(e));
bot.on('disconnect', () => {
  bot.connect(); // Will reconnect
});

bot.login(auth.token);
