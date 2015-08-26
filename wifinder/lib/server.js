/* global module, require, process, connection, __dirname */

var c = require('colors');
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
 * @param {type} port Porta de escuta do servidor
 * @param {type} configdb configuracoes de ligacaoa base de dados
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
 * Inica o servidor
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

  /**
   * envio da configuracao da base de dados como os metodos necessarios para a selecao do site selecionado
   */
  pedidos.dbData = this.dbData;
  pedidos.getDataBase = this.getDataBase;
  pedidos.clientArray = this.clientArray;
  pedidos.setUserServer = this.setUserServer;
  pedidos.dbConfig = this.dbConfig;

  this.liveActives = pedidos.liveActives;

  // envio da configuracao da ligacao a base de dados para fazer a coneccao
  connectdb.dbData = this.dbData;

  // envio da configuracao da ligacao a base de dados para o acesso aos utilzadores
  dbUsers.dbData = this.dbData;

  // Inicia a a tabela dos utilizadores
  dbUsers.setup();

//************************************* Page DashBoard *************************************
  /**
   * Devolvee um objecto com a quantidade de dispositivos encontrados no site selecionado
   */
  this.app.get("/getNumDispositivos/:id", pedidos.getNumDispositivos);

  /**
   * Devolve o sensor com o numero dos varios dispositivos encontrados
   */
  this.app.get("/getAllAntenasAndDisps/:sock", pedidos.getAllSensorAndisp);

  /**
   * Retorna os tempos das visitas dos DispMoveis
   */
  this.app.get("/getAllTimes/:sock", pedidos.getAllTimes);

  /**
   * Retorna o numero de Disp nos sensores por fabricante 
   */
  this.app.get("/getFabricantesinMin/:min/:sock", pedidos.getFabricantes);

  /**
   * Retorna as bases de dados dos varios sites
   */
  this.app.get("/getAllDataBase", pedidos.getDataBases);

  /**
   * Devolve os sensores do site selecionado
   */
  this.app.get("/getSensors/:id", pedidos.getSensors);

  /**
   * Devolve o fabricante do dispositivo com o mac adderess encontrado no site selecionado
   */
  this.app.get("/getNameVendor/:mac/:id", pedidos.getNameVendorByMac);

  /**
   * 
   */
  this.app.get("/getLastAllTimes/:id", pedidos.getLastAllTimes);

  /**
   * Devolve a lista de dispositivos ativos por tipo e por sensor
   */
  this.app.get("/getpowerlistdisps/:id/:sensor/:table", pedidos.getActiveDisps);


//************************************* Page Details *************************************

  /**
   * 
   */
  this.app.get("/getAllOrderbyVendor/:id/:table/:sensor/:max/:min", pedidos.getAllOrderbyVendor);

  /**
   * 
   */
  this.app.get("/getDispMoveisbySensor/:id/:sensor", pedidos.getDispMoveisbySensor);

  /**
   * Decolve a planta do local onde  o sensor de encontra
   */
  this.app.get("/getPlantSite/:id/:sensor", pedidos.getPlantSite);
  

//************************************* Page DetailAP *************************************

  /**
   * Devolve todos os ap organizados por macaddress e essid
   */
  this.app.get("/getAllAP/:id", pedidos.getAllAP);

  /**
   * retorna os dispositivos que estiveram ligados a um determinado ap
   */
  this.app.get("/getDispConnectedtoAp/:id/:mac", pedidos.getDispConnectedtoAp);

  /**
   * Retorna a data ISO8060 da primeira vez que um AP foi visto
   */
  this.app.get("/getApFirstTime/:id/:mac", pedidos.getApFirstTime);

  /**
   * Devolve os mac dos clientes organizados pelo fabricante
   */
  this.app.get("/getDispMacbyVendor/:id", pedidos.getDispMacbyVendor);

  /**
   * Devolve os dados referentes ao dispositivo
   */
  this.app.get("/getDispbyMac/:id/:mac", pedidos.getDispbyMac);
  
  /**
   * Devolve os dados referentes ao ap
   */
  this.app.get("/getApbyMac/:id/:mac", pedidos.getApbyMac);

// //************************************* Pedidos Users *************************************

  this.app.post("/login", dbUsers.loginUser);

  this.app.post("/updateprofile", dbUsers.updateuser);

  this.app.post("/NovoUtilizador", dbUsers.registeruser);

//----------------------------------------------------------------------------------


  console.log('Server HTTP Wait %d'.green, this.port);
};

/**
 * Recebe as configuracoes para a ligacao ao servidor dos varios sites
 * @param {type} param1
 * @param {type} param2
 */
process.on("message", function (data) {
  new Server(data.port, data.configdb).start();
});

/**
 * Coloca o novo nuser no array dos useres
 * @param {type} iduser
 * @returns {undefined}
 */
Server.prototype.setUserServer = function (iduser) {
  this.clientArray[iduser] = {
    socket: iduser,
    db: "",
    state: true
  };
};

/**
 * Devolce o site selecionado pelo user
 * @param {type} iduser
 * @returns {Server.prototype@arr;clientArray@pro;db}
 */
Server.prototype.getDataBase = function (iduser) {
  if (typeof this.clientArray[iduser] == "undefined") {
    this.setUserServer(iduser);
  }
  return this.clientArray[iduser].db;
};

/**
 * Atualiza o site selecionado pleo user
 * @param {type} iduser
 * @param {type} database
 * @returns {undefined}
 */
Server.prototype.setDataBase = function (iduser, database) {
  this.clientArray[iduser].db = database;
};

/**
 * Devolve o objecto do user
 * @param {type} iduser
 * @returns {Array}
 */
Server.prototype.getUserServer = function (iduser) {
  return this.clientArray[iduser];
};

/**
 * Devolve todos os useres do server
 * @returns {Array}
 */
Server.prototype.getAllUserServer = function () {
  return this.clientArray;
};

/**
 * Remove o user da lista do useres do servidor
 * @param {type} iduser
 * @returns {Boolean}
 */
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
