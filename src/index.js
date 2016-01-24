var Botkit = require('botkit');
var _      = require('underscore');

var slackToken = process.env.SLACK_TOKEN
if (!slackToken) {
  console.error('SLACK_TOKEN is required!')
  process.exit(1)
}

var controller = Botkit.slackbot({
  json_file_store: './src/db_slackbutton_bot/',
})

var bot = controller.spawn({
  token: slackToken
})


// just a simple way to make sure we don't
// connect to the RTM twice for the same team
var _bots = {};
function trackBot(bot) {
  _bots[bot.config.token] = bot;
}

controller.storage.teams.all(function(err,teams) {

  if (err) {
    throw new Error(err);
  }

  // connect all teams with bots up to slack!
  for (var t  in teams) {
    if (teams[t].swears) {
      console.log(teams[t].swears)
      var bot = controller.spawn(teams[t]).startRTM(function(err) {
        if (err) {
          console.log('Error connecting bot to Slack:',err);
        } else {
          bot.botkit.hears(teams[t].swears, ['ambient'], function(bot,message){
            bot.reply(message,'Watch your mouth!');
          })
          // function(teams[t].swears,['ambient'],function(bot,message) {
          //
          // });
          // listenToSwears(teams[t].swears)
          trackBot(bot);
        }
      });
    }
  }
})

// function listenToSwears(swears){
controller.hears("ugh",['ambient'],function(bot,message) {
  bot.reply(message,'Watch your mouth!');
});
// }
