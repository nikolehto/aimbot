"use strict";

var _ = require("lodash");
var position = require("../../position.js");
var taskList;
var lastKnownPositions;
var scannedAreas;




// Change botNames and teamName to your choice.

var botNames = [
  "Tupu",
  "Hupu",
  "Lupu"
];

module.exports = function Ai() {
  function makeDecisions(roundId, events, bots, config) {
  

	var ourBotsAlive = []; // Meidän elossa olevat botit
	var enemyHitOurBots = [];  // Meidän botit joita vihollinen osui
	var detectedEnemyBots = []; // Vihollisen botit jotka havaittiin  
	
	// Alusta elossa olevat botit
	bots.forEach(function(bot) {
		if (bot.alive) {
			ourBotsAlive.push(bot)
		}
	});
	
	
	ourBotsAlive.forEach(function(bot) {
		console.log("Our bot is alive:", bot.botId);
	});
	

  

  
	events.forEach(function(event) {
        if (event.event === "damaged") {
          console.log("Someone hit us: ", event.botId);
        } else if (event.event === "see") {
          console.log("Detected bot at", event.pos.x, event.pos.y); 
        } else if (event.event === "hit") {
        // we hit!
          console.log("Our bot hit:", event.botId);
		  if (event.botId) {
			}
		}
		  else if (event.event === "message") {
          var friendlyMessage = event.data.source.player === playerId;
          console.info("MESSAGE", event.data.source, event.data.messageId, event.data.message, friendlyMessage);
        }
      });
  
  
	var priorities = getPriorities(events); // Hae prioriteettilista
	
	var radarPositions = position.neighbours(position.origo, config.fieldRadius - config.radar);
	radarPositions.push(position.origo);
	// em. tekee listan kaikista sijainneista joista on mahdollista skannata kartan reunaan asti. 
	// TODO:
	// Poista omien bottien naapuristot tästä listasta, huomioi myös bottien tulevat liikkeet. 
	
	
    ourBotsAlive.forEach(function(bot) {
	  var pos = selectMove(config, bot);
	  //var pos = selectRadar(config, bot, radarPositions);
	  
	  console.log(pos.x, pos.y);
      bot.move(pos.x, pos.y);
	  //bot.radar(pos.x, pos.y);
    });

    _.each(events, function(event) {
      if (event.event === "noaction") {
        console.log("Bot did not respond in required time", event.data);
      }
    });
  }
  
  
  
  function selectMove(config, bot) {
      // Liiku aina niin kauas kuin mahdollista, huomioi kentän reunat
	  // Tänne olisi hyvä toteuttaa: Älä liiku lähelle omia, yritä liikkua lähelle vihollisia? 
	  var ps = position.neighbours(position.make(bot.x, bot.y), config.move);
      var moveLength=0;
	  var loopLimit=100;
	  var pos;
	  while (loopLimit>0 && moveLength<config.move) { 
		  pos = ps[randInt(0, ps.length - 1)];
		  moveLength = position.distance(position.make(bot.x, bot.y), pos);
		  if (position.distance(pos, position.origo) > config.fieldRadius) {
			moveLength = 0;	
		  }
		  loopLimit--;
	  }
	  
	  return pos;  
  }
  
    function selectRadar(config, bot, radarPositions) {
      // Skannaa vain kenttää, (väliaikainen älä skannaa itseä)
      var minDistanceFromShip=0; // Korvaa tämä poistamalla kaikki laivojen sijainnit radarPositionsista
	  var loopLimit=100;
	  var pos;
	  while (loopLimit>0 && minDistanceFromShip<config.radar) { 
		  pos = radarPositions[randInt(0, radarPositions.length - 1)];
		  minDistanceFromShip = position.distance(position.make(bot.x, bot.y), pos);
		  loopLimit--;
	  }
	  
	  return pos;  
  }
  

  function getPriorities(events) {
	
  }
  
  function randInt(min, max) {
    var range = max - min;
    var rand = Math.floor(Math.random() * (range + 1));
    return min + rand;
  }

  return {
    // The AI must return these three attributes
    botNames: botNames,
    makeDecisions: makeDecisions
  };
};
