/* global process, module, assert, result */

require('colors');
var cp = require('child_process');
var net = require('net');
var r = require('rethinkdb');
var fs = require('fs');
var jsdiff = require('diff');
var chokidar = require('chokidar');
var lineReader = require('line-reader');
var shellInterval = require("shell-interval");
var localTable = [];
var fileRead = '/media/usb/scanNetworks-01.csv';

var watcher = chokidar.watch(fileRead, {
  ignored: /[\/\\]\./,
  persistent: true
});

var connectdb = require("./ConnectDb");

var dispmoveis = require("./DispMoveis");
var antdisp = require("./AntDisp");

var dispap = require("./DispAp");
var antap = require("./AntAp");

var activeant = require("./ActiveAnt");

var ServerSocket = function (port, configdb, sensorcfg) {
  this.port = port;
  this.net = require('net');
  this.serverSck = net.createServer(this.net);
  this.clienteSend = sensorcfg.name;
  this.lati = sensorcfg.lati;
  this.long = sensorcfg.long;
  this.local = sensorcfg.loc;
  this.posx = sensorcfg.posx;
  this.posy = sensorcfg.posy;
  this.scanStart = false;
  this.dbConfig = configdb;

  this.dbData = {
    host: this.dbConfig.host,
    port: this.dbConfig.port,
    authKey: this.dbConfig.authKey
  };

  connectdb.dbData = this.dbData;

  antdisp.dbData = this.dbData;
  antap.dbData = this.dbData;
  dispmoveis.dbData = this.dbData;
  dispap.dbData = this.dbData;
  activeant.dbData = this.dbData;

  antdisp.dbConfig = this.dbConfig;
  antap.dbConfig = this.dbConfig;
  dispmoveis.dbConfig = this.dbConfig;
  dispap.dbConfig = this.dbConfig;
  activeant.dbConfig = this.dbConfig;

  var self = this;

  shellInterval({
    options: {
      command: "./serverStatus.sh",
      time: 5
    },
    onExec: function (err, stdout, stderr) {
      if (err) {
        throw err;
      }
      var outres = stdout.split("\n");
      var memarr = outres[0].split(" ");
      var discarr = outres[2].split(" ");
      var mem = {
        total: memarr[0],
        used: memarr[1],
        free: memarr[2]
      };
      var disc = {
        size: discarr[0],
        used: discarr[1],
        avail: discarr[2],
        use: discarr[3]
      };
      var cpu = outres[1];

      activeant.updateActiveAnt(self.clienteSend, mem, cpu, disc);
      console.log('--------------------------------------------------------');
    },
    onFinish: function () {
      console.log("The shell command was called five times. Exiting...");
    }
  });
};

ServerSocket.prototype.start = function () {
  var self = this;
  activeant.insertActiveAnt(self.clienteSend, self.lati, self.long, self.local, self.posx, self.posy);
  this.serverSck.listen(this.port);

  watcher.on('change', function (path) {
    lineReader.eachLine(fileRead, function (line) {
      if (line[2] == ":" && line.length > 4) {
        var result = line.split(", ");
        var oldLine = localTable[result[0]];
        if (oldLine) {
          var a = result.slice();
          var diff = jsdiff.diffTrimmedLines(oldLine, line);
          diff.forEach(function (part) {
            if (part.added) {
              localTable[result[0]] = line;
              self.sendToDataBase(a);
            }
          });
        } else {
          var b = result.slice();
          localTable[result[0]] = line;
          self.sendToDataBase(b);
        }
      }
    }).then(function () {
      console.log("I'm done!!");
    });
  });
};

ServerSocket.prototype.sendToDataBase = function (result) {
  var self = this;
  if (result[0].trim().length == 17) { // verificacao do tamanho do macaddress recebido
    if (result.length < 8) {
      var valsHost = result;
      var valuesHst = result;

      dispmoveis.insertDispMovel(valsHost, self.clienteSend);
      antdisp.insertAntDisp(valuesHst, self.clienteSend);

    } else if (result.length == 13 || result.length == 14 || result.length == 15) {
      // if de verificacao do tamanho do array < 8

      var valsAp = result;
      var valuesAp = result;

      dispap.insertDispAp(valsAp, self.clienteSend);
      antap.insertAntAp(valuesAp, self.clienteSend);

    } // else da verificacao do tamanho do arraymais de 8
  } // fim verificacao do tamanho do macaddress
};

process.on("message", function (data) {
  cp.spawn("./runAirmon", ["&"]);
  var serverskt = new ServerSocket(data.port, data.configdb, data.sensorcfg);
  serverskt.start();
});
//excepcoes para os erros encontrados
//process.on('uncaughtException', function (err) {
//    console.log('Excepcao capturada: ' + err);
//});
module.exports = ServerSocket;