GOTO EndComment
Automaattinen skripti serverin ja bottien käynnistämiseen, vieläpä korkealla prioriteetilla. 
Tätä on mukava käyttää siihen asti että tulee ongelmia clientissä (ikkunat sulkeutuu automaattisesti -> tämän voisi korjata siten että ikkunat jäisivät auki ?)

Tallenna tämä tykin root kansioon
:EndComment

start node server/start-server.js 
start node clients/javascript/cli.js "--ai=aimbot" /HIGH
start node clients/javascript/cli.js "--ai=aimbot" /HIGH
start firefox.exe -new-window "localhost:3000"
