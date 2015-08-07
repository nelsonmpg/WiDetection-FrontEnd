  /* global module */

  _ = require('underscore');
  var pedidos = require('./pedidos');
  var connectdb = require("./ConnectDb");
  var Worker = require('workerjs');
  var r = require('rethinkdb');

  var ServerSktIo = function (options) {
      var updateChartAtives;
      this.server = options.server;
      this.users = [];
      this.liveActives;
  };

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

          socket.on("userid", function (id) {
              iduser = id;
              self.server.setUserServer(id);
          });
//      setInterval(function (){
//        socket.emit("teste", iduser);
//      }, 5000);

          socket.on("getAllDisp", function (id) {
              pedidos.getAllDisp(id, socket);
          });
//
          socket.on("changesite", function (iduser, data) {
              self.server.setDataBase(iduser, data);
          });

    pedidos.getAllDataBases(function (err, data) {
      for (var i = 0; i < data.length; i++) {
        console.log(data[i].db);
        pedidos.changeDispMoveis(data[i].db, socket);
        pedidos.changeDispAp(data[i].db, socket);
        pedidos.changeActiveAnt(data[i].db, socket);
      }
    });

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
                      if (count == 0 && self.liveActives[a] != null ) {
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

          self.updateChartAtives = function (proj, element) {
              socket.broadcast.emit('updateChartAtives', proj, element);
          };

      });
      return this;
  };

  ServerSktIo.prototype.setLiveActive = function (data) {
      this.liveActives = data;
      return true;
  };

  module.exports = ServerSktIo;
