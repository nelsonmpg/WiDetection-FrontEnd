/* global module, __dirname, process */

require('colors'); //bold, italic, underline, inverse, yellow, cyan, white, magenta, green, red, grey, blue, rainbow
var express = require('express');
var http = require('http');
var fs = require('fs');
var bodyParser = require('body-parser');
var r = require('rethinkdb');
var cp = require('child_process');
var ini = require('ini');
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

  dbUsers.dbData = this.dbData;

  this.app.post("/login", dbUsers.loginUser);

  this.app.get("/dispOswlan", osquerys.getdispwlan);

  this.app.get("/dispOsmon", osquerys.getdispmon);

  this.app.get("/paramsinifile", osquerys.getinifileparams);

  this.app.post("/createmonitor", osquerys.createmonitor);

  this.app.post("/savesettings", osquerys.savesettings);

  this.app.post("/startmonitor", osquerys.startmonitor);

  this.app.post("/stopmonitor", osquerys.stoptmonitor);

  this.app.get("/checkmonitorstart", osquerys.checkmonitorstart);

  this.app.get("/restartsystem", osquerys.restartsystem);

  this.app.get("/poweroffsystem", osquerys.poweroffsystem);


  this.checkServerSocketAutoStart();
  
  console.log('Server HTTP Wait %d'.green.bold, 8080);
};

ServerHTTP.prototype.checkServerSocketAutoStart = function () {
  var fileconfig = './ConfigSKT.ini';
  var configexist = checkconfigexist(fileconfig);
  if (configexist) {
    var config = ini.parse(fs.readFileSync(fileconfig, 'utf-8'));
    if (config.global.autostart) {
      console.log("cfg - " + config.global.autostart);
      cp.exec("sudo ifconfig -a | grep 'wlan' | tr -s ' ' | cut -d' ' -f1,5", function (error, stdout, stderr) {
        console.log(stdout);
        var lanw = stdout.toString().split(" ")[0];
        cp.exec("sudo ifconfig -a | grep 'mon' | tr -s ' ' | cut -d' ' -f1", function (error, stdout, stderr) {
          console.log(stdout);
          if (stdout.toString().trim() == "") {
            cp.exec("sudo airmon-ng start '" + lanw + "' | grep 'monitor' | tr -s ' '| cut -d' ' -f5", function (error, stdout, stderr) {
              console.log(stdout);
              if (error !== null) {
                console.log('exec error: ' + error);
              }
            });
          }
          cp.fork('./lib/mainSKT.js');
          console.log("Start Monitor");
        });
        if (error !== null) {
          console.log('exec error: ' + error);
        }
      });
    }
  }
};

process.on("message", function (data) {
  var srv = new ServerHTTP(data.serverdata);
  srv.start();
});
module.exports = ServerHTTP;

var checkconfigexist = function (file) {
  var config;
  try {
    // try to get the override configuration file if it exists
    fs.readFileSync(file);
    config = true;
  } catch (e) {
    // otherwise, node.js barfed and we have to clean it up
    // use the default file
    config = false;
  }
  return config;
};