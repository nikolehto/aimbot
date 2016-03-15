"use strict";

var _ = require("lodash");
var position = require("../../position.js");

// Change botNames and teamName to your choice.

var botNames = [
  "Tupu",
  "Hupu",
  "Lupu"
];

module.exports = function Ai() {
  function makeDecisions(roundId, events, bots, config) {
	var radarPositions = position.neighbours(position.origo, config.fieldRadius - config.radar);
	// em. tekee listan kaikista sijainneista joista on mahdollista skannata kartan reunaan asti. 
	// TODO:
	// Poista omien bottien naapuristot tästä listasta, huomioi myös bottien tulevat liikkeet. 
	
	
    bots.forEach(function(bot) {
	  //var pos = selectMove(config, bot);
	  var pos = selectRadar(config, bot, radarPositions);
	  
	  console.log(pos.x, pos.y);
      //bot.move(pos.x, pos.y);
	  bot.radar(pos.x, pos.y);
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
