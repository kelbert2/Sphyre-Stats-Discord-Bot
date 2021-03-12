# Sphyre-Stats-Discord-Bot
D&amp;D character creator bot based on [Sphyre's pointbuy rolling system](http://dmkaruikage.proboards.com/thread/14).

Roll a new character's stats using Sphyre's system, either the hardcore or softcore version
- roll
- point buy

Add racial and (optional) feat bonuses
- type your race or input bonuses yourself
- feat bonuses

See which attributes to focus on based on chosen class

See recommended races for your class and your roll for min/maxing and balancing, filtered by which books they appear in

## Resources:
Formatting - https://leovoel.github.io/embed-visualizer/
https://discordjs.guide/popular-topics/embeds.html#using-the-richembedmessageembed-constructor

## Running Locally
Clone the repo, navigate to the folder, and a file called "auth.json" that contains
```JSON
{
    "token": "aaaa"
}
```
where "aaaa" is the Discord Bot authorization token.

In the command line, run "npm install" to set up node module dependencies.

Run "node bot-dummy.js" to start up the bot.

Press Ctrl+C to kill the bot.