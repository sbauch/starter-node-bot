var Botkit = require('botkit');
var _      = require('underscore');

var controller = Botkit.slackbot({
  json_file_store: './src/db_slackbutton_bot/',
}).configureSlackApp(
  {
    clientId: "17516636083.19256994213",
    clientSecret: "f81fb8ca19fe68561be02b2138da5a15",
    scopes: ['bot']
  }
);


controller.setupWebserver(process.env.port,function(err,webserver) {
  controller.createWebhookEndpoints(controller.webserver);

  controller.createOauthEndpoints(controller.webserver,function(err,req,res) {
    if (err) {
      res.status(500).send('ERROR: ' + err);
    } else {
      res.send('Success!');
    }
  });
});


// just a simple way to make sure we don't
// connect to the RTM twice for the same team
var _bots = {};
function trackBot(bot) {
  _bots[bot.config.token] = bot;
}

controller.on('create_bot',function(bot,config) {
  console.log(bot.config)

  var swears = ["first"]
  var teamConfig = _.extend(bot.config, {swears: swears})

  controller.storage.teams.save(teamConfig, function(err){
    if (err)
      console.log(err)
    else{

    }
  })



  if (_bots[bot.config.token]) {

    // already online! do nothing.
  } else {

    bot.startRTM(function(err) {

      if (!err) {
        trackBot(bot);
      }

      bot.startPrivateConversation({user: config.createdBy},function(err,convo) {
        if (err) {
          console.log(err);
        } else {
          convo.say('I am a bot that has just joined your team');
          convo.say('You must now /invite me to a channel so that I can be of use!');
        }
      });

    });
  }

});

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

function listenToSwears(swears){
  controller.hears(swears,['ambient'],function(bot,message) {
    bot.reply(message,'Watch your mouth!');
  });
}
