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
  

	var availableBots = []; // Meidän elossa olevat botit
	var die = []; // Viimekierroksen kuolleet botit

	
	// Meidän toimet 
	var hit = []; // Osutut botit
	var see  = []; // Nähdyt botit. Pelkkiä pos objekteja 

	
	// Vihollisen toimet
	var damaged = [];  // Meidän botit joita vihollinen osui
	var detected = []; // Vihollinsen havaitsemat meidän botit
	
	// Alusta elossa olevat botit
	bots.forEach(function(bot) {
		if (bot.alive) {
			availableBots.push(bot)
		}
	});
	
	/*
	availableBots.forEach(function(bot) {
		console.log("Our bot is alive:", bot.botId);
	});
	*/

	events.forEach(function(event) {
        if (event.event === "damaged") {
          damaged.push(event);
		  console.log("Someone hit us: ", event.botId);
        } else if (event.event === "see") {
		  see.push(event);
          console.log("We detected bot at", event.pos.x, event.pos.y); 
        } else if (event.event === "hit") {
		  hit.push(event);
          console.log("Our bot hit:", event.botId);
		} else if (event.event === "detected") {
		  detected.push(event);
          console.log("Enemy detected our bot at", event.pos.x, event.pos.y); 
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
	
	var botsOnMission = [];
    for (var j = 0; j < priorities.length; j++) {
        var pr = priorities[j];
        
        
        //ourBotsAlive.forEach(function(bot) {
        
        for(var i = availableBots.length -1; i >= 0 ; i--){
            var bot = availableBots[i];
            //if(elements[i] == 5){
            //    elements.splice(i, 1);
        
            
        
            switch(pr){
                case "Dodge":
                    //jos huomattu tai osunut niin väistä
                    //if(enemyDetectedOurBots.indexOf(bot.botId) != -1){
                        var pos = selectMove(config, bot);

                        console.log(pos.x, pos.y);
                        bot.move(pos.x, pos.y);
                        
                        //poisto listasta
                        //bots.splice(i, 1);
                    //}
                break;
                case "Attack":
                //jos vihollinen huomattu niin ammu
                    //if (detectedEnemyBots.length != 0){
                        
                        
                    //}
                break;
                case "Scan":
                    //skannaa satunnaista paikkaa
                break;
                
                
                default:
            
            }
        }
    }
    
    /*
    ourBotsAlive.forEach(function(bot) {

	  var pos = selectMove(config, bot);
	  //var pos = selectRadar(config, bot, radarPositions);
	  
	  console.log(pos.x, pos.y);
      bot.move(pos.x, pos.y);
	  //bot.radar(pos.x, pos.y);
    });
*/
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
        var taskPriorities = ["Dodge", "Shoot", "Scan"];
  
        return taskPriorities;
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
