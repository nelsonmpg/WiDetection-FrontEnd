/* global module, require, process, connection */

var express = require('express');
var http = require('http');
var socketio = require('socket.io');
var fs = require('fs');
var bodyParser = require('body-parser');
var r = require('rethinkdb');
var pedidos = require('./pedidos');
var connectdb = require("./ConnectDb");
var Worker = require('workerjs');

var liveActives = [];
var intervalChart;
var conn;

/**
 * 
 * @param {type} port
 * @param {type} configdb
 * @returns {Server}
 */
var Server = function (port, configdb) {
  this.port = port;
  this.app = express();
  this.server = http.Server(this.app);
  this.io = socketio(this.server);
  this.clientArray = [];
  this.dbConfig = configdb;
  this.dbData = {
    host: this.dbConfig.host,
    port: this.dbConfig.port
  };

  this.app.use(bodyParser.urlencoded({
    extended: true
  }));
  this.app.use(bodyParser.json());
};
/**
 *
 * @returns {undefined}
 */
Server.prototype.start = function () {
  var self = this;

  self.server.listen(self.port);

  var allowCrossDomain = function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date');
    next();
  };

  this.app.use(allowCrossDomain);

  // fornece ao cliente a pagina index.html
  this.app.use(express.static(__dirname + './../www'));

  pedidos.dbData = this.dbData;
  pedidos.getDataBase = this.getDataBase;
  pedidos.clientArray = this.clientArray;
  pedidos.setUserServer = this.setUserServer;
  pedidos.dbConfig = this.dbConfig;

  connectdb.dbData = this.dbData;

  this.app.get("/getNumDispositivos/:sock", pedidos.getNumDispositivos);

  /**
   * Devolve o sensor com o numero dos varios dispositivos encontrados
   */
  this.app.get("/getAllAntenasAndDisps/:sock", pedidos.getAllSensorAndisp);

  /**
   * Retorna o numero de Disp nas antenasna ultima hora
   */
  this.app.get("/getAllDisp/:sock", pedidos.getAllDisp);
  /**
   * Retorna os tempos das visitas dos DispMoveis
   */
  this.app.get("/getAllTimes/:sock", pedidos.getAllTimes);

  /**
   * Retorna o numero de Disp nas antenas
   */
  this.app.get("/getFabricantesinMin/:min/:sock", pedidos.getFabricantes);

  /**
   * Retorna as bases de dados dos varios sites
   */
  this.app.get("/getAllDataBase", pedidos.getDataBases);


  this.app.get("/getNameVendor/:mac/:sock", pedidos.getNameVendorByMac);

  this.io.on('connection', function (socket) {
    var c = socket.request.connection._peername;
    console.log("+++++++++++++++++++++ ADD +++++++++++++++++++++++++");
    console.log("Connected - " + c.address + " : " + c.port);
    console.log("User - " + socket.id);
    console.log("++++++++++++++++++++++++++++++++++++++++++++++++++++");

    self.setUserServer(socket.id);

    socket.on("changedatabase", function (data) {
      self.setDataBase(socket.id, data);
    });

    pedidos.changeDispMoveis(self.getDataBase(socket.id), function (err, changed) {
      if (!err && changed.length > 0) {
        socket.emit("newDisp", changed, "moveis", self.getDataBase(socket.id));
      }
    });

    pedidos.changeDispAp(self.getDataBase(socket.id), function (err, changed) {
      if (!err && changed.length > 0) {
        socket.emit("newDisp", changed, "ap", self.getDataBase(socket.id));
      }
    });
        
    pedidos.changeDispAp(self.getDataBase(socket.id), function (err, changed) {
      if (!err && changed.length > 0) {
        socket.emit("newDisp", changed, "sensor", self.getDataBase(socket.id));
      }
    });
    
    socket.on('disconnect', function () {
      socket.broadcast.emit('diconnected', socket.id);
      var usr = self.getUserServer(socket.id);
      if (usr !== null) {
        console.log('------------------- REMOVE --------------------');
        console.log("User - " + usr.socket + " - " + usr.db);
        console.log('-----------------------------------------------');
        //self.clientArray[socket.id] = null;
        console.log("Socket id removido - " + socket.id);
      } else {
        console.log('------------ O Cliente ja nao existe ----------');
      }
    });



  });
  console.log('Server HTTP Wait ' + this.port);
};

process.on("message", function (data) {
  new Server(data.port, data.configdb).start();
});

Server.prototype.setUserServer = function (socketid) {
  this.clientArray[socketid] = {
    socket: socketid,
    db: this.dbConfig.db
  };
};

Server.prototype.getDataBase = function (socketid) {
  if (typeof this.clientArray[socketid] == "undefined") {
    this.setUserServer(socketid);
  }
  return this.clientArray[socketid].db;
};

Server.prototype.setDataBase = function (socketid, database) {
  this.clientArray[socketid].db = database;
};

Server.prototype.getUserServer = function (socketid) {
  return this.clientArray[socketid];
};

/**
 * Passar uma data new Date("15/07/2015") e devolvolve um array com os MacAddress Ativos nessa data
 * @param {type} date
 * @returns {Array|getMACAfterDate.entrou}
 */
function getMACInDate(date, teste) {
  var entrou = [];
  for (var i in teste) {
    for (var e in teste[i].sensores) {
      for (var r in teste[i].sensores[e].values) {
        var find = new Date(teste[i].sensores[e].values[r].Last_time);
        if (find.getDate() == date.getDate() && find.getFullYear() == date.getFullYear() && find.getHours() == date.getHours() && find.getMonth() == date.getMonth() && find.getMinutes() == date.getMinutes()) {
          entrou.push({mac: teste[i].macAddress, vendor: teste[i].nameVendor});
          break;
        }
      }
    }
  }
  return entrou;
}

Date.prototype.addMinutes = function (h) {
  this.setMinutes(this.getMinutes() + h);
  return this;
};

/**
 *
 * @param {type} port
 * @returns {Server}
 */
module.exports = Server;
