GOTO EndComment
Automaattinen skripti serverin ja bottien k�ynnist�miseen, viel�p� korkealla prioriteetilla. 
T�t� on mukava k�ytt�� siihen asti ett� tulee ongelmia clientiss� (ikkunat sulkeutuu automaattisesti -> t�m�n voisi korjata siten ett� ikkunat j�isiv�t auki ?)

Tallenna t�m� tykin root kansioon
:EndComment

start node server/start-server.js 
start node clients/javascript/cli.js "--ai=aimbot" /HIGH
start node clients/javascript/cli.js "--ai=aimbot" /HIGH
start firefox.exe -new-window "localhost:3000"
