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

      var c = socket.request.connection._peername;
      console.log("+++++++++++++++++++++ ADD +++++++++++++++++++++++++");
      console.log("Connected - " + c.address + " : " + c.port);
      console.log("User - " + socket.id);
      console.log("++++++++++++++++++++++++++++++++++++++++++++++++++++");
      self.server.setUserServer(socket.id);
      socket.on("changedatabase", function (data) {
        self.server.setDataBase(socket.id, data);
      });

      pedidos.changeDispMoveis(self.server.getDataBase(socket.id), function (err, changed) {
        if (!err && changed.length > 0) {
          socket.emit("newDisp", changed, "moveis", self.server.getDataBase(socket.id));
        }
      });
      pedidos.changeDispAp(self.server.getDataBase(socket.id), function (err, changed) {
        if (!err && changed.length > 0) {
          socket.emit("newDisp", changed, "ap", self.server.getDataBase(socket.id));
        }
      });
      pedidos.changeDispAp(self.server.getDataBase(socket.id), function (err, changed) {
        if (!err && changed.length > 0) {
          socket.emit("newDisp", changed, "sensor", self.server.getDataBase(socket.id));
        }
      });
      socket.on('disconnect', function () {
        socket.broadcast.emit('diconnected', socket.id);
        var usr = self.server.getUserServer(socket.id);
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
  };
};

module.exports = ServerSktIo;