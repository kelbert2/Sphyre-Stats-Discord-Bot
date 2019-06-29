const Discord = require('discord.js');

const auth = require('./auth.json'); // Load up the token
const config = require('./config.json');
const Enmap = require('enmap');

let usingHardcore = false;

const bot = new Discord.Client();
bot.on('ready', () => {
  console.log('Stats bot is ready');
});

// for memory usage: https://enmap.evie.dev/examples/settings
bot.settings = new Enmap({
  name: "settings",
  fetchAll: false,
  autoFetch: true,
  cloneLevel: 'deep'
});

bot.on('message', message => {
  if (message.author.bot || !message.content.startsWith(config.prefix)) return;

    // split around spaces
    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    switch (command) {
      case 'ping':
        message.channel.send('pong!');
        break;
      case 'hybrid':
      let [strEquation dexEquation conEquation intEquation wisEquation chaEquation] = args;
        // respond with contigency points, number remaining
        break;
      default:
        message.channel.send('I don\'t recognize that.');
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
