/* global module */

_ = require('underscore');
var pedidos = require('./pedidos');
var connectdb = require("./ConnectDb");
var Worker = require('workerjs');

var ServerSktIo = function (options) {
    var self = this;
    var updateChartAtives;
    self.io = options.io;
    self.server = options.server;
    self.users = [];
    self.liveActives;
    
   
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

                    self.server.removeUser(iduser);
                    for (var a in self.liveActives) {
                        //console.log(self.liveActives[a]);
                        var count = 0;
                        for (var i in self.server.getAllUserServer()) {
                            if (self.server.clientArray[i].db == a && self.server.clientArray[i].state == true) {
                                count++;
                            }
                        }
                        if (count == 0) {
                            console.log("STOP->" + a );
                            clearInterval(self.liveActives[a].intervalChart);
                        }
                    }

                    console.log('------------------- REMOVE --------------------');
                    console.log("User - " + usr.socket + " - " + usr.db);
                    console.log("Socket id removido - " + socket.id);
                    console.log('-----------------------------------------------');

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
};
ServerSktIo.prototype.setLiveActive = function (data) {
    this.liveActives = data;
    return true;
};

module.exports = ServerSktIo;