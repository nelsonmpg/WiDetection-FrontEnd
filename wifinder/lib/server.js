  /* global module, require, process, connection */

  require('colors');

  var express = require('express');
  var http = require('http');
  var socketio = require('socket.io');
  var fs = require('fs');
  var bodyParser = require('body-parser');
  var r = require('rethinkdb');
  var pedidos = require('./pedidos');
  var connectdb = require("./ConnectDb");
  var Worker = require('workerjs');
  var serverIo = require('./serverio');
  var dbUsers = require('./db.js');

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
      this.liveActives;
      this.skt = undefined;
      this.clientArray = [];

      this.dbConfig = configdb;
      this.dbData = {
          host: this.dbConfig.host,
          port: this.dbConfig.port,
          authKey: this.dbConfig.authKey
      };
  };
  /**
   *
   * @returns {undefined}
   */
  Server.prototype.start = function () {
      var self = this;

      self.server.listen(self.port);
      this.skt = new serverIo({server: self}).init();

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
      this.app.use(express.static(__dirname + './../www'));

      pedidos.dbData = this.dbData;
      pedidos.getDataBase = this.getDataBase;
      pedidos.clientArray = this.clientArray;
      pedidos.setUserServer = this.setUserServer;
      pedidos.dbConfig = this.dbConfig;

      this.liveActives = pedidos.liveActives;

      connectdb.dbData = this.dbData;

      dbUsers.setup();

      this.app.get("/getNumDispositivos/:id", pedidos.getNumDispositivos);

      /**
       * Devolve o sensor com o numero dos varios dispositivos encontrados
       */
      this.app.get("/getAllAntenasAndDisps/:sock", pedidos.getAllSensorAndisp);

      /**
       * Retorna o numero de Disp nas antenasna ultima hora
       */
//    this.app.get("/getAllDisp/:sock", pedidos.getAllDisp);
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

      this.app.get("/getSensors/:id", pedidos.getSensors);

      this.app.get("/getNameVendor/:mac/:sock", pedidos.getNameVendorByMac);

      this.app.get("/getLastAllTimes/:id", pedidos.getLastAllTimes);

      this.app.get("/getpowerlistdispmoveis/:id/:sensor/:table", pedidos.getpluckDispMoveis);

      this.app.get("/getLastAllTimes/:id", pedidos.getLastAllTimes);


      ///////// Page Detail //////////

      this.app.get("/getAllOrderbyVendor/:id/:table/:sensor/:max/:min", pedidos.getAllOrderbyVendor);

      this.app.get("/getDispMoveisbySensor/:id/:sensor", pedidos.getDispMoveisbySensor);
      
       ///////// Page DetailAP //////////
      
      this.app.get("/getAllAP/:id", pedidos.getAllAP);
      
      this.app.get("/getDispConnectedtoAp/:id/:mac", pedidos.getDispConnectedtoAp);
      
      this.app.get("/getApFirstTime/:id/:mac", pedidos.getApFirstTime);
      ////////////////////////////////

// ----------------------------- Pedidos Users -----------------------------------
      this.app.post("/login", dbUsers.loginUser);

      this.app.post("/NovoUtilizador", dbUsers.registeruser);


//----------------------------------------------------------------------------------


      console.log('Server HTTP Wait %d'.green, this.port);
  };

  process.on("message", function (data) {
      new Server(data.port, data.configdb).start();
  });

  Server.prototype.setUserServer = function (iduser) {
      this.clientArray[iduser] = {
          socket: iduser,
          db: "",
          state: true
      };
  };

  Server.prototype.getDataBase = function (iduser) {
      if (typeof this.clientArray[iduser] == "undefined") {
          this.setUserServer(iduser);
      }
      return this.clientArray[iduser].db;
  };

  Server.prototype.setDataBase = function (iduser, database) {
      this.clientArray[iduser].db = database;
  };

  Server.prototype.getUserServer = function (iduser) {
      return this.clientArray[iduser];
  };

  Server.prototype.getAllUserServer = function () {
      return this.clientArray;
  };

  Server.prototype.removeUser = function (iduser) {
      if (this.clientArray[iduser] != undefined) {
          this.clientArray[iduser].state = false;
      }
      this.skt.setLiveActive(pedidos.getLiveActives());
      //this.clientArray.splice(iduser,1);
      return true;
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
