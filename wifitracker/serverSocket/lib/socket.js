/* global process, module, assert, result */

var net = require('net');
var r = require('rethinkdb');

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
  this.dbConfig = configdb;

  this.dbData = {
    host: this.dbConfig.host,
    port: this.dbConfig.port
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
};

ServerSocket.prototype.start = function () {
  this.serverSck.listen(this.port);

  var self = this;
  this.serverSck.on('connection', function (sock) {

    // We have a connection - a socket object is assigned to the connection automatically
    console.log('CONNECTED: IP - ' + sock.remoteAddress + ' Port - ' + sock.remotePort);

    // Add a 'data' event handler to this instance of socket
    sock.on('data', function (data) {
      var aux = data.toString();
      var resultLine = aux.split("\r\n");
      for (var i in resultLine) {
        var line = resultLine[i];
        if (line[2] == ":" && line.length > 4) { // verfica se a linha recebida tem na terceira posicao :
          var result = line.split(", ");
          if (result[0].trim().length == 17) { // verificacao do tamanho do macaddress recebido
            if (result.length < 8) {
              var valsHost = result;
              var valuesHst = result;
              
              dispmoveis.insertDispMovel(valsHost, self.clienteSend);
              antdisp.insertAntDisp(valuesHst, self.clienteSend);

            } else { // if de verificacao do tamanho do array < 8
              
              var valsAp = result;
              var valuesAp = result;
              
              dispap.insertDispAp(valsAp, self.clienteSend);
              antap.insertAntAp(valuesAp, self.clienteSend);
              
            } // else da verificacao do tamanho do arraymais de 8
          } // fim verificacao do tamanho do macaddress
        }
      }
      
      activeant.insertActiveAnt(self.clienteSend, self.lati, self.long, self.local);
      console.log('--------------------------------------------------------');
    });
    // Add a 'close' event handler to this instance of socket
    sock.on('disconnect', function (data) {
      console.log('CLOSED: ' + sock.remoteAddress + ' ' + sock.remotePort);
    });
  });
  console.log('Server Socket Wait : ' + this.port);
};


process.on("message", function (data) {
  var serverskt = new ServerSocket(data.port, data.configdb, data.sensorcfg);
  serverskt.start();
});
//excepcoes para os erros encontrados
//process.on('uncaughtException', function (err) {
//    console.log('Excepcao capturada: ' + err);
//});
module.exports = ServerSocket;