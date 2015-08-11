/* global module, __dirname */

require('colors'); //bold, italic, underline, inverse, yellow, cyan, white, magenta, green, red, grey, blue, rainbow
var express = require('express');
var http = require('http');
var fs = require('fs');
var bodyParser = require('body-parser');
var r = require('rethinkdb');
var connectdb = require("./ConnectDb");
var dbUsers = require('./db.js');
var osquerys = require("./linuxquery");

var ServerHTTP = function (configdb) {
  this.app = express();
  this.server = http.Server(this.app);
  this.dbConfig = configdb;
  this.dbData = {
    host: this.dbConfig.host,
    port: this.dbConfig.port,
    authKey: this.dbConfig.authKey
  };
};

ServerHTTP.prototype.start = function () {
  var self = this;
  self.server.listen(8080);

  var allowCrossDomain = function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date');
    next();
  };

  this.app.use(bodyParser.urlencoded({
    extended: true
  }));
  this.app.use(bodyParser.json());
  this.app.use(allowCrossDomain);

  // fornece ao cliente a pagina index.html
  this.app.use(express.static(__dirname + './../public'));

  connectdb.dbData = this.dbData;

  this.app.post("/login", dbUsers.loginUser);

  this.app.get("/dispOswlan", osquerys.getdispwlan);

  this.app.get("/dispOsmon", osquerys.getdispmon);
  
  this.app.get("/paramsinifile", osquerys.getinifileparams);

  this.app.post("/createmonitor", osquerys.createmonitor);
  
  this.app.post("/savesettings", osquerys.savesettings);
  
  this.app.post("/startmonitor", osquerys.startmonitor);
  
  this.app.post("/stopmonitor", osquerys.stoptmonitor);
  
  this.app.get("/checkmonitorstart", osquerys.checkmonitorstart);
  

  console.log('Server HTTP Wait %d'.green.bold, 8080);
};

process.on("message", function (data) {
  var srv = new ServerHTTP(data.serverdata);
  srv.start();
});
module.exports = ServerHTTP;