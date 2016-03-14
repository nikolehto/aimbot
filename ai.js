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
    bots.forEach(function(bot) {
      var ps = position.neighbours(position.make(bot.x, bot.y), config.move);
      var moveLength=0;
	  var loopLimit=100;
	  var pos;
	  while (loopLimit>0 && moveLength < 2) { // Tähän lisäehtona että pos on kentän rajojen sisällä
		  pos = ps[randInt(0, ps.length - 1)];
		  moveLength = position.distance(position.make(bot.x, bot.y), pos);
		  loopLimit--;
	  }
	  console.log(moveLength);
      bot.move(pos.x, pos.y);
    });

    _.each(events, function(event) {
      if (event.event === "noaction") {
        console.log("Bot did not respond in required time", event.data);
      }
    });
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
