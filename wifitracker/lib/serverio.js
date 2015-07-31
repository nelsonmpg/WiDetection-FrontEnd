/* global module */

_ = require('underscore');
var pedidos = require('./pedidos');
var connectdb = require("./ConnectDb");
var Worker = require('workerjs');

var ServerSktIo = function (options) {
  var self = this;
  self.io = options.io;
  self.server = options.server;
  self.users = [];
  self.init = function () {

    // Fired upon a connection
    self.io.on("connection", function (socket) {
      var iduser;

      var c = socket.request.connection._peername;
      console.log("+++++++++++++++++++++ ADD ++++++++++++++++++++++++++");
      console.log("Connected - " + c.address + " : " + c.port);
      console.log("User - " + socket.id);
      console.log("++++++++++++++++++++++++++++++++++++++++++++++++++++");

      socket.on("userid", function (id) {
        iduser = id;
        self.server.setUserServer(id);
      });

      socket.on("changesite", function (iduser, data) {
        self.server.setDataBase(iduser, data);
      });

      pedidos.changeDispMoveis(self.server.getDataBase(iduser), function (err, changed) {
        if (!err && changed.length > 0) {
          socket.emit("newDisp", changed, "moveis", self.server.getDataBase(iduser));
        }
      });
      pedidos.changeDispAp(self.server.getDataBase(iduser), function (err, changed) {
        if (!err && changed.length > 0) {
          socket.emit("newDisp", changed, "ap", self.server.getDataBase(iduser));
        }
      });
      pedidos.changeDispAp(self.server.getDataBase(iduser), function (err, changed) {
        if (!err && changed.length > 0) {
          socket.emit("newDisp", changed, "sensor", self.server.getDataBase(iduser));
        }
      });
      socket.on('disconnect', function () {
        socket.broadcast.emit('diconnected', socket.id);
        var usr = self.server.getUserServer(iduser);
        if (usr !== null) {
          console.log('------------------- REMOVE --------------------');
          console.log("User - " + usr.socket + " - " + usr.db);
          console.log("Socket id removido - " + socket.id);
          console.log('-----------------------------------------------');
        } else {
          console.log('------------ O Cliente ja nao existe ----------');
        }
      });
    });
  };
};

module.exports = ServerSktIo;