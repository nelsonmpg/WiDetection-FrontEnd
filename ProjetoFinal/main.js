var cp = require('child_process');


var Server = require('./lib/server');
var serv = new Server(8080);
serv.start();

var ServerSocket = require('./lib/socket');
var srv = new ServerSocket(8888);
srv.start();