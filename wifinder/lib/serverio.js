/* global module */

_ = require('underscore');
var pedidos = require('./pedidos');
var connectdb = require("./ConnectDb");
var Worker = require('workerjs');
var r = require('rethinkdb');

/**
 * Class do Socket
 * @param {type} options
 * @returns {ServerSktIo}
 */
var ServerSktIo = function (options) {
  var updateChartAtives;
  this.server = options.server;
  this.users = [];
  this.liveActives;
};

/**
 * Inicia a criacao do socket para cada cliente
 * @returns {ServerSktIo.prototype}
 */
ServerSktIo.prototype.init = function () {
  var self = this;

  // Fired upon a connection
  this.server.io.on("connection", function (socket) {
    var iduser;

    var c = socket.request.connection._peername;
    console.log("+++++++++++++++++++++ ADD ++++++++++++++++++++++++++");
    console.log("Connected - " + c.address + " : " + c.port);
    console.log("User - " + socket.id);
    console.log("++++++++++++++++++++++++++++++++++++++++++++++++++++");

    // Novo cliente conectado e adicionado a lista de useres do server
    socket.on("userid", function (id) {
      iduser = id;
      self.server.setUserServer(id);
    });

    // Devolve o numero de visitas por minuto dos clientes e faz a atualizacao a cada minuto
    socket.on("getAllDisp", function (id) {
      pedidos.getAllDisp(id, socket);
    });

    // Atualiza o site selecionado pelo user
    socket.on("changesite", function (iduser, data) {
      self.server.setDataBase(iduser, data);
    });

    // Consulta o servidor para saber os sites disponiveis e 
    // coloca a escotas as varias tabelas para receber as vaias 
    // alteracoens dos dados em realtime
    pedidos.getAllDataBases(function (err, data) {
      for (var i = 0; i < data.length; i++) {
        console.log(data[i].db);
        pedidos.changeTablesDisps(data[i].db, socket, 'DispMoveis', "moveis");
        pedidos.changeTablesDisps(data[i].db, socket, 'DispAp', "ap");
        pedidos.changeTablesDisps(data[i].db, socket, "ActiveAnt", "sensor");
        pedidos.changeTableAnt(data[i].db, socket, "AntAp", "ap");
        pedidos.changeTableAnt(data[i].db, socket, "AntDisp", "disp");
        pedidos.changeTableAntForGraph(data[i].db, socket, "AntAp", "ap");
        pedidos.changeTableAntForGraph(data[i].db, socket, "AntDisp", "disp");
        pedidos.changeActiveAnt(data[i].db, socket);
      }
    });

    // deteta quando o cliente se desconecta do servidor e e removido da lista do servidor
    socket.on('disconnect', function () {
      socket.broadcast.emit('diconnected', socket.id);
      var usr = self.server.getUserServer(iduser);
      if (usr !== null) {

        self.server.removeUser(iduser);
        for (var a in self.liveActives) {
          //console.log(self.liveActives[a]);
          var count = 0;
          for (var i in self.server.getAllUserServer()) {
            if (self.server.clientArray[i].db == a && self.server.clientArray[i].state == true) {
              count++;
            }
          }
          if (count == 0 && self.liveActives[a] != null) {
            console.log("STOP->" + a);
            clearInterval(self.liveActives[a].intervalChart);
            self.liveActives[a] = null;
          }
        }
        if (usr != undefined) {
          console.log('------------------- REMOVE --------------------');
          console.log("User - " + usr.socket + " - " + usr.db);
          console.log("Socket id removido - " + socket.id);
          console.log('-----------------------------------------------');
        }
      } else {
        console.olg('------------ O Cliente ja nao existe ----------');
      }
    });
  });
  return this;
};

ServerSktIo.prototype.setLiveActive = function (data) {
  this.liveActives = data;
  return true;
};

module.exports = ServerSktIo;
