"use strict";

var _ = require("lodash");
var position = require("../../position.js");
var taskList;
var lastKnownPositions;
var scannedAreas = [];




// Change botNames and teamName to your choice.

var botNames = [
  "Tupu",
  "Hupu",
  "Lupu"
];

module.exports = function Ai() {
  function makeDecisions(roundId, events, bots, config) {
	var ourBotIds = [];
    var ourPositions =  []; // pos1, ...
	var availableBots = {}; // id:index
    
    //var availableBots = [];
    
	var die = []; // Viimekierroksen kuolleet botit

	// Meidän toimet 
	var hit = []; // Osutut botit
	var see  = []; // Nähdyt botit. Pelkkiä pos objekteja 

	// Vihollisen toimet
	var damaged = [];  // Meidän botit joita vihollinen osui
	var detected = []; // Vihollinsen havaitsemat meidän botit
	
	// Alusta elossa olevat botit
	bots.forEach(function(bot) {
		ourBotIds.push(bot.botId);
		if (bot.alive) {
			//availableBots.push(bot)
            availableBots[bot.botId] = bots.indexOf(bot);
			var tempPosition = {}; // Tallenna nykyinen sijainti
			tempPosition.x = bot.x;
			tempPosition.y = bot.y;
			ourPositions.push(tempPosition);
		}
	});

	events.forEach(function(event) {
        if (event.event === "damaged") {
          damaged.push(event);
		  detected.push(event);
		  console.log("Someone hit us: ", event.botId);
        } 
		
		else if (event.event === "see" || event.event === "radarEcho") { 
		  see.push(event);
          console.log("We detected bot at", event.pos.x, event.pos.y);
		} 
		
		else if (event.event === "hit") {
		  hit.push(event);
          console.log("Our bot hit:", event.botId);
		} 
		
		if (event.event === "see") {	// Meidät on havaittu
				if (ourBotIds.indexOf(event.source) > -1) {
					console.log("We have been seen", event.pos.x, event.pos.y);
					var tempevent = {};
					tempevent.event = event.event;
					tempevent.botId = event.source;
					detected.push(tempevent);
				}
			}
			
		else if (event.event === "detected") {
		  detected.push(event);
          //console.log("Enemy detected our bot at", event.pos.x, event.pos.y); 
        }
		
		  else if (event.event === "message") {
          var friendlyMessage = event.data.source.player === playerId;
          console.info("MESSAGE", event.data.source, event.data.messageId, event.data.message, friendlyMessage);
        }
      });
  
  
	var priorities = getPriorities(events); // Hae prioriteettilista
	

	var botsOnMission = [];
    for (var j = 0; j < priorities.length; j++) {
        var pr = priorities[j];
        
            switch(pr){
                case "Dodge":
                    //jos huomattu tai osunut niin väistä
                    detected.forEach(function(det) {
						var botId = det.botId;
						
						// rautalankaa, sama botti saattaa tulla havaituksi monta kertaa.
						if (botId in availableBots) {
							var bot = findBot2(bots, botId);
							console.log("botID: " + bot.botId)
							var pos = selectMove(config, bot);
							console.log(pos.x, pos.y);
							bot.move(pos.x, pos.y);
							
							// HOX! Tämä kaikkiin liikkumisfunktioihin
							ourPositions.forEach(function(temp) {
								console.log("x: " + temp.x + ", y: " + temp.y );
							});
							updateBotPositions(bot.x, bot.y, pos.x, pos.y);
							ourPositions.forEach(function(temp) {
								console.log("x: " + temp.x + ", y: " + temp.y );
							});
							
							delete availableBots[botId];
						}
						});
               
                break;
                case "Attack":
                //jos vihollinen huomattu niin ammu
                    if(see.length != 0){//ampuu aina yhtä havaittua kaikilla
                        
                        var availableCount = Object.keys(availableBots).length;
                        var coordinateAdditions = [];
                        switch(availableCount){
                            
                            case 0:
                                break;
                            
                            case 1:
                                coordinateAdditions.push([1, 0]);
								coordinateAdditions.push([-1, 1]);
                                coordinateAdditions.push([0, -1]);
								coordinateAdditions.push([1, -1]);
                                
                                for (var botId in availableBots) {
                                    if (availableBots.hasOwnProperty(botId)) {
                                        var bot = findBot2(bots, botId);
                                        var pos = see[0].pos;
										
										// tarkista onko omia lähimailla
										var isAbleToShoot = 0;
										while(isAbleToShoot== 0) {
											var a = coordinateAdditions.pop();
											if(a == null){
												break;
											}
											var shootx = pos.x - a[0];
											var shooty = pos.y - a[1];
																					
											var minDistanceFromShip = 10;
											ourPositions.forEach(function(pod) {
												var mincanditate = position.distance(pod, position.make(shootx, shooty));
												if (mincanditate < minDistanceFromShip) {
													minDistanceFromShip = mincanditate;
												}
											});
											
											if (minDistanceFromShip > config.cannon) {
												isAbleToShoot = 1;
												break;
											}	
                                            
                                            var testPos = pos;
                                            
                                            testPos.x = testPos.x - a[0];
                                            testPos.y = testPos.y - a[1];
                                            
                                            if(isInsideMap(config, testPos) === false){
                                                isAbleToShoot = 0;
                                            }
                                            
										}
                                        
                                        
										
										if (isAbleToShoot == 1) {
											bot.cannon(shootx, shooty); 
											delete availableBots[botId];
										}
                                        
                                        break;
                                    }
                                    
                                }
                                
                                break;
                            case 2:
                                coordinateAdditions.push([1, 0]);
                                coordinateAdditions.push([-1, 0]);
                                for (var botId in availableBots) {
                                    if (availableBots.hasOwnProperty(botId)) {
                                        var bot = findBot2(bots, botId);
                                        //console.log("ammu");
                                        var pos = see[0].pos;
                                        console.log(pos.x, pos.y);
                                        
                                        var a = coordinateAdditions.pop();
                                        
                                        if(a == null){
                                            break;
                                        }
										var shootx = pos.x - a[0];
										var shooty = pos.y - a[1];
										
										var isAbleToShoot = 0;
										var minDistanceFromShip = 10;
										ourPositions.forEach(function(pod) {
											var mincanditate = position.distance(pod, position.make(shootx, shooty));
											if (mincanditate < minDistanceFromShip) {
												minDistanceFromShip = mincanditate;
											}
										});
										
										if (minDistanceFromShip > config.cannon) {
											isAbleToShoot = 1;
										}	
                                        
                                        var testPos = pos;
                                        
                                        testPos.x = testPos.x - a[0];
                                        testPos.y = testPos.y - a[1];
                                        
                                        if(isInsideMap(config, testPos) === false){
                                            isAbleToShoot = 0;
                                        }
                                        
										if(isAbleToShoot==1) {
											bot.cannon(pos.x - a[0], pos.y - a[1]);
											delete availableBots[botId];
										}
                                    }
                                    
                                }
                                break;
                            case 3:
                            default:
                                coordinateAdditions.push([1, 0]);
                                coordinateAdditions.push([-1, 1]);
                                coordinateAdditions.push([0, -1]);
                                
                                for (var botId in availableBots) {
                                    if (availableBots.hasOwnProperty(botId)) {
                                        var bot = findBot2(bots, botId);
                                        var pos = see[0].pos;
                                        var a = coordinateAdditions.pop();
										
                                        if(a == null){
                                            break;
                                        }var shootx = pos.x - a[0];
										var shooty = pos.y - a[1];
										
										var isAbleToShoot = 0;
										var minDistanceFromShip = 10;
										ourPositions.forEach(function(pod) {
											var mincanditate = position.distance(pod, position.make(shootx, shooty));
											if (mincanditate < minDistanceFromShip) {
												minDistanceFromShip = mincanditate;
											}
										});
										
										if (minDistanceFromShip > config.cannon) {
											isAbleToShoot = 1;
										}
                                        
                                        var testPos = pos;
                                        
                                        testPos.x = testPos.x - a[0];
                                        testPos.y = testPos.y - a[1];
                                        
                                        if(isInsideMap(config, testPos) === false){
                                            isAbleToShoot = 0;
                                        }
                                        
										if(isAbleToShoot==1) {
											bot.cannon(pos.x - a[0], pos.y - a[1]);
											delete availableBots[botId];
										}
                                    }
                                }
                                
                        
                        }

                    }
                        
                    //}
                break;
                case "Scan":
                    //skannaa satunnaista paikkaa
                   
                    //noustaan perse edellä puuhun
                    for (var botId in availableBots) {
                        if (availableBots.hasOwnProperty(botId)) {
                            var bot = findBot2(bots, botId);
                            
                            var pos = selectRadar(bot);
                            console.log(pos.x, pos.y);
                            bot.radar(pos.x, pos.y);
                            
                            delete availableBots[botId];
                            }
                    }
                break;
                
                case "ScanLoop":
                    if(see.length != 0){
                        for (var botId in availableBots) {
                            if (availableBots.hasOwnProperty(botId)) {
                                var bot = findBot2(bots, botId);
                                //console.log(
                                //var pos = selectRadar(bot);
                                var pos = see[0].pos;
                                //console.log(pos.x, pos.y);
                                bot.radar(pos.x, pos.y);
                                
                                delete availableBots[botId];
                                scannedAreas.unshift(pos);
                                break;
                                }
                        }
                    }
                
                break;
                
                case "ScanLastPosition":
                    if(see.length != 0){
                        for (var botId in availableBots) {
                            if (availableBots.hasOwnProperty(botId)) {
                                var bot = findBot2(bots, botId);
                                //console.log(
                                //var pos = selectRadar(bot);
                                var pos = see[0].pos;
                                //console.log(pos.x, pos.y);
                                bot.radar(pos.x, pos.y);
                                
                                delete availableBots[botId];
                                break;
                                }
                        }
                    }
                
                break;
                
                default:
            
            }
      
    }
    
	function updateBotPositions(ox, oy, nx, ny) {
		var opos = {}; // missä on
		var npos = {}; // mihin liikkuu
		opos.x = ox;
		opos.y = oy;
		npos.x = nx;
		npos.y = ny;
		
		var index = -1;
		
		for(var i = 0, len = ourPositions.length; i < len; i++) {
			if (ourPositions[i].x === opos.x && ourPositions[i].y === opos.y) {
				console.log(ourPositions[i].x + " == " + opos.x + " and " + ourPositions[i].y + " == " + opos.y);
				index = i;
				break;
			}
			else {
				console.log(ourPositions[i].x + " != " + opos.x + " or " + ourPositions[i].y + " != " + opos.y);
			}
		}
		
		if (index > -1) {
			ourPositions[index] = npos; // Korvaa vanha positio uudella 
		}
		else {
			console.log("####### ERROR IN UPDATEPOSITIONS ###########");
		}	
	}
	
	function selectRadar(bot) {
		var radarPositions = position.neighbours(position.origo, config.fieldRadius - (config.radar - 1)); // Poista reunoilta kaistaleet joita ei skannata
		radarPositions.push(position.origo);
		// em. tekee listan kaikista sijainneista joista on mahdollista skannata kartan reunaan asti. 

		var minDistanceFromShip=0; // Korvaa tämä poistamalla kaikki laivojen sijainnit radarPositionsista
		var minDistanceFromScannedArea=0;
		var loopLimit=100;
		var pos;
		while (loopLimit>0 && (minDistanceFromShip<(config.radar + config.see) || minDistanceFromScannedArea<(config.radar + (config.radar -1)))) { 
			var min = 10; // update minDistance from our ship
			pos = radarPositions[randInt(0, radarPositions.length - 1)];
			ourPositions.forEach(function(pod) {
				var mincanditate = position.distance(position.make(pod.x, pod.y), pos);
				if (mincanditate < min) {
					minDistanceFromShip = mincanditate;
					min = mincanditate;
				}
			});
			
			min = 20; // updateMinDistance from our lastscannedAreas
			scannedAreas.forEach(function(pod) {
				var mincanditate = position.distance(pod, pos);
				
				if (mincanditate < min) {
					minDistanceFromScannedArea = mincanditate;
					min = mincanditate;
				}
			});
			
			
			
			loopLimit--;
		}
		
		if (loopLimit < 1) {
			console.log("############# LOOP LIMIT SCANNEDAREAS ######################")
		}
		//console.log("SCANNED AREAS " + scannedAreas);
		scannedAreas.unshift(pos);
		scannedAreas = scannedAreas.slice(0,10);
		
		return pos;  
	}
    

	
	/* Tämä ei toimi 
	function erasePositions(array1, array2) {
		array1.filter(function(el) {
			var index = -1;
		
			for(var i = 0, len = array2.length; i < len; i++) {
				if (array2[i].x === el.x && array2[i].y === el.y) {
					return false;
			}
		}
		
		if (index == -1) 
			{
				return true;
			}
		}
		);
		
		return array1;
	}
	*/
	
    _.each(events, function(event) {
      if (event.event === "noaction") {
        console.log("Bot did not respond in required time", event.data);
      }
    });
  }
  
    
    function findBot2(allbots, botId){
        var palautettava;
        allbots.forEach(function(bot) {
            //console.log(bot.botId + " == " + botId);
            if(String(bot.botId) == String(botId)){
                palautettava = bot;               
            }
        });
        
        return palautettava;
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
	  if (loopLimit < 1)  {
	  console.log("########### INCREASE LOOP LIMIT IN MOVE FUNCTION ##############");
	  }
	  
	  return pos;  
  }
  
    function isInsideMap(config, pos){
        if (position.distance(pos, position.origo) >= config.fieldRadius) {
            return false;
        }
        return true;
    
    }
  

  function getPriorities(events) {
        var taskPriorities = ["Dodge", "Attack","ScanLoop", "ScanLastPosition", "Scan"];
  
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
