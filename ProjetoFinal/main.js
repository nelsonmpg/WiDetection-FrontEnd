/* global module */

var cp = require('child_process');
var http = require('http');
var fs = require('fs');
var ini = require('ini');

var Main = function () {
  this.portHTTP = 0;
  this.dbConfig = {
    host: '',
    port: 0,
    db: 'ProjetoFinal'
  };

  this.dbData = {
    host: 0,
    port: 0
  };

};

Main.prototype.start = function () {
  this.config = ini.parse(fs.readFileSync('./ConfigHTTP.ini', 'utf-8'));
  this.dbConfig = {
    host: this.config.database.host,
    port: this.config.database.port
  };

  this.dbData = {
    host: this.dbConfig.host,
    port: this.dbConfig.port
  };

  this.portHTTP = this.config.server_http.port;
  this.startHTTPServer();
};

Main.prototype.startHTTPServer = function () {
  var args = {
    port: this.portHTTP,
    configdb: this.dbConfig
  };

  var child = cp.fork('./lib/server');
  child.send(args);

  console.log("****************** Server HTTP Start ******************");
};

var serverHttp = new Main();
serverHttp.start();

module.exports = Main;
