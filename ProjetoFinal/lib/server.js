/* global module, require, process */

var express = require('express');
var http = require('http');
var socketio = require('socket.io');
var fs = require('fs');
var bodyParser = require('body-parser');
var r = require('rethinkdb');

var Worker = require('workerjs');
var work = new Worker('./lib/workerGraph.js');

var liveActives = [];
var intervalChart;

var dbData = "";
/**
 * 
 * @param {type} port
 * @param {type} dbr
 * @param {type} con
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
  dbData = {
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
  this.server.listen(this.port);
  var allowCrossDomain = function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date');
    next();
  };

  this.app.use(allowCrossDomain);

  // fornece ao cliente a pagina index.html
  this.app.use(express.static(__dirname + './../www/'));

  var self = this;

  this.app.get("/getNumDispositivos/:sock", function (req, res) {
    r.connect(dbData).then(function (conn) {
      return r.db(self.getDataBase(req.params.sock)).table("ActiveAnt").count().do(function (val) {
        return {"sensor": val,
          "moveis": r.db(self.getDataBase(req.params.sock)).table("DispMoveis").count(),
          "ap": r.db(self.getDataBase(req.params.sock)).table("DispAp").count()};
      }).run(conn).finally(function () {
        conn.close();
      });
    }).then(function (output) {
      res.json(output);
    }).error(function (err) {
      console.log(err);
      res.status(500).json({err: err});
    });
  });


  /**
   * Devolve o sensor com o numero dos varios dispositivos encontrados
   */
  this.app.get("/getAllAntenasAndDisps/:sock", function (req, res) {
    r.connect(dbData).then(function (conn) {
      return r.db(self.getDataBase(req.params.sock)).table('AntAp').map(function (row) {
        return [{
            "nome": row("nomeAntena"),
            "count": row("host").count()
          }];
      }).map(function (row2) {
        return {
          "AP": row2.nth(0),
          "DISP": {
            "nome": row2("nome").nth(0),
            "count": r.db(self.getDataBase(req.params.sock)).table('AntDisp').filter({
              "nomeAntena": row2("nome").nth(0)})("host").nth(0).count().default(0)
          }
        };
      }).coerceTo('array').run(conn)
              .finally(function () {
                conn.close();
              });
    }).then(function (output) {
      res.json(output);
    }).error(function (err) {
      res.status(500).json({err: err});
    });
  });
  
    /**
     * Retorna o numero de Disp nas antenasna ultima hora
     */
    self.app.get("/getAllDisp/:sock", function (req, res) {
      if (liveActives[self.getDataBase(req.params.sock)] != undefined) {
        res.json(liveActives[self.getDataBase(req.params.sock)]);
      } else {
        r.connect(dbData).then(function (conn) {
          return r.db(self.getDataBase(req.params.sock)).table('DispMoveis').coerceTo("ARRAY").run(conn)
                  .finally(function () {
                    conn.close();
                  });
        }).then(function (output) {
          work.postMessage(output);
          work.onmessage = function (msg) {
            liveActives[self.getDataBase(req.params.sock)] = msg.data;
            res.json(msg.data);
          };

          //Interval de update do grafico nos clientes
          intervalChart = setInterval(function () {
            r.connect(dbData).then(function (conn) {
              return r.db(self.getDataBase(req.params.sock)).table("DispMoveis").map(function (row) {
                return  row("disp").do(function (ro) {
                  return {"macAddress": row("macAddress"), "nameVendor": row("nameVendor"), "values": ro("values").nth(0).orderBy(r.desc("Last_time")).limit(100).orderBy(r.asc("Last_time"))}
                })
              }).map(function (a) {
                return {"macAddress": a('macAddress'), "state": a('values').contains(function (value) {
                    return r.now().do(function (time) {
                      return value('Last_time').gt(r.time(
                              time.year(),
                              time.month(),
                              time.day(),
                              time.hours(),
                              time.minutes().sub(1),
                              time.seconds().mul(0),
                              time.timezone()
                              ));
                    });
                  })}
              }).filter({"state": true}).count().run(conn)
                      .finally(function () {
                        conn.close();
                      });
            }).then(function (output) {

              //Atualiza o array do servidor       
              var novaData = new Date(liveActives[self.getDataBase(req.params.sock)][liveActives[self.getDataBase(req.params.sock)].length - 1].x);
              novaData.addMinutes(1);
              liveActives[self.getDataBase(req.params.sock)].shift();
              var x = {x: novaData, y: output * 1};
              liveActives[self.getDataBase(req.params.sock)].push(x);

              //Envia para os clientes
              self.io.sockets.emit("updateChart", self.getDataBase(req.params.sock), x);

            }).error(function (err) {
              res.status(500).json({err: err});
            });

          }, 1000 * 60); //De segundo a segundo


        }).error(function (err) {
          res.status(500).json({err: err});
        });
      }
    }
    );

    /**
     * Retorna o numero de Disp nas antenas
     */
    self.app.get("/getFabricantesinMin/:min/:sock", function (req, res) {
      r.connect(dbData).then(function (conn) {
        return r.db(self.getDataBase(req.params.sock)).table('DispMoveis').coerceTo("ARRAY").run(conn)
                .finally(function () {
                  conn.close();
                });
      }).then(function (output) {
        res.json(getMACInDate(req.params.min, output));
      }).error(function (err) {
        res.status(500).json({err: err});
      });
    });


  /**
   * Retorna as bases de dados dos varios sites
   */
  this.app.get("/getAllDataBase", function (req, res) {
    r.connect(dbData).then(function (conn) {
      return r.dbList().map({"db": r.row})
              .filter(r.row("db").ne("rethinkdb"))
              .filter(r.row("db").ne("user")).run(conn)
              .finally(function () {
                conn.close();
              });
    }).then(function (output) {
      res.json(output);
    }).error(function (err) {
      res.status(500).json({err: err});
    });
  });

//    this.app.get("/getDispsActive/:disp/:ant", function (req, res) {
//        var tabela = "";
//        if (req.params.disp.trim() == "Dispositivos Moveis") {
//            tabela = "AntDisp";
//        } else if (req.params.disp.trim() == "Access Points") {
//            tabela = "AntAp";
//        } else {
//            console.log("Erro Tabela");
//            return;
//        }
//        r.connect(dbData).then(function (connection) {
//            return r.db(self.getDataBase(socket.id)).table(tabela).get(req.params.ant).do(function (row) {
//                return row("host").filter(function (value) {
//                    return r.now().inTimezone("+01:00").do(function (time) {
//                        return value("data").gt(r.time(
//                                time.year(),
//                                time.month(),
//                                time.day(),
//                                time.hours(),
//                                time.minutes().sub(5),
//                                time.seconds(),
//                                time.timezone()
//                                ));
//                    });
//                });
//            }).coerceTo('array').run(connection)
//                    .finally(function () {
//                        connection.close();
//                    });
//        }).then(function (output) {
//            res.json(output);
//        }).error(function (err) {
//            console.log(err);
//            res.status(500).json({err: err});
//        });
//    });
//
//    this.app.get("/getAllClientes/:disp", function (req, res) {
//        var tabela = "";
//        if (req.params.disp.trim() == "Dispositivos Moveis") {
//            tabela = "DispMoveis";
//        } else if (req.params.disp.trim() == "Access Points") {
//            tabela = "DispAp";
//        } else {
//            console.log("Erro Tabela");
//            return;
//        }
//        r.connect(dbData).then(function (conn) {
//            return r.db(self.getDataBase(socket.id)).table(tabela).pluck(
//                    "macAddress",
//                    "nameVendor",
//                    {"disp": {
//                            "name": true,
//                            "values": {
//                                "Power": true,
//                                "First_time": true,
//                                "Last_time": true
//                            }
//                        }
//                    }
//            ).coerceTo('array').run(conn).finally(function () {
//                conn.close();
//            });
//        }).then(function (output) {
//            res.json(output);
//        }).error(function (err) {
//            res.status(500).json({err: err});
//        });
//    });
//
//    this.app.get("/getAntenasAtivas", function (req, res) {
//        r.connect(dbData).then(function (conn) {
//            return r.db(self.getDataBase(socket.id)).table('ActiveAnt').filter(function (row) {
//                return r.now().inTimezone("+01:00").do(function (time) {
//                    return row("data").gt(r.time(
//                            time.year(),
//                            time.month(),
//                            time.day(),
//                            time.hours(),
//                            time.minutes().sub(5),
//                            time.seconds(),
//                            time.timezone()
//                            ));
//                });
//            }).coerceTo("array").run(conn).finally(function () {
//                conn.close();
//            });
//        }).then(function (output) {
//            res.json(output);
//        }).error(function (err) {
//            res.status(500).json({err: err});
//        });
//    });
//
//    /**
//     * retornar antenas ativas
//     * Falta alterar a consulta para retornar apenas as activas
//     */
//    this.app.get("/getTodasAntenas/", function (req, res) {
//        r.connect(dbData).then(function (conn) {
//            return r.db(self.getDataBase(socket.id)).table('ActiveAnt').coerceTo('array')
//                    .run(conn)
//                    .finally(function () {
//                        conn.close();
//                    });
//        }).then(function (output) {
//            res.json(output);
//        }).error(function (err) {
//            res.status(500).json({err: err});
//        });
//    });
//
//    /**
//     * Retorna os Dispositivos detectados nos ultimos 5 minutos por antena
//     */
//    this.app.get("/getAtives/:tipo/:nomeAntena", function (req, res) {//req.params.nomeAntena
//        var table = (req.params.tipo.toUpperCase() == "AP") ? "AntAp" : "AntDisp";
//        r.connect(dbData).then(function (conn) { //self.getDataBase(socket.id) 
//            return r.db(self.getDataBase(socket.id)).table(table).filter({"nomeAntena": req.params.nomeAntena}).map(function (row) {
//                return row("host").map(function (row2) {
//                    return r.now().inTimezone("+01:00").do(function (time) {
//                        return {"l": row2,
//                            "estado": row2("data").gt(r.time(
//                                    time.year(),
//                                    time.month(),
//                                    time.day(),
//                                    time.hours(),
//                                    time.minutes().sub(5),
//                                    time.seconds(),
//                                    time.timezone()
//                                    ))};
//                    });
//                });
//            }).map(function (x) {
//                return x.filter({"estado": true})("l")
//            }).coerceTo('array').run(conn)
//                    .finally(function () {
//                        conn.close();
//                    });
//        }).then(function (output) {
//            res.json(output);
//        }).error(function (err) {
//            res.status(500).json({err: err});
//        });
//    });
//
//
//    /**
//     * retornar antenas ativas
//     * Falta alterar a consulta para retornar apenas as activas
//     */
//    this.app.get("/getHostByAntena", function (req, res) {
//        r.connect(dbData).then(function (conn) {
//            r.db(self.getDataBase(socket.id)).table('AntDisp').coerceTo('array')
//                    .run(conn)
//                    .finally(function () {
//                        conn.close();
//                    });
//        }).then(function (output) {
//            res.json(output);
//        }).error(function (err) {
//            res.status(500).json({err: err});
//        });
//    });
//
//    /**
//     * 
//     */
//    this.app.get("/getFabLogo/:fab", function (req, res) {
//        clientIMG.search(req.params.fab + " wikipedia official logo .png", function (err, images) {
//            if (err) {
//                res.json(err);
//            }
//            res.json(images[0].url);
//        });
//    });
//
//
//    /**
//     * Retorna o numero de AP's e Disp da antena passada
//     */
//    this.app.get("/GetDeviceByAntena/:nomeAntena", function (req, res) {//req.params.nomeAntena
//        r.connect(dbData).then(function (conn) {
//            return r.db(self.getDataBase(socket.id)).table('AntAp').filter({"nomeAntena": req.params.nomeAntena}).map(function (row) {
//                return [{"nome": row("nomeAntena"), "count": row("host").count()}]
//            }).map(function (row2) {
//                return [{"AP": row2.nth(0)("count"),
//                        "DISP": r.db(self.getDataBase(socket.id)).table('AntDisp').filter({"nomeAntena": row2("nome").nth(0)})("host").nth(0).count().default(0)}]
//            }).nth(0).nth(0).coerceTo('array')
//                    .run(conn)
//                    .finally(function () {
//                        conn.close();
//                    });
//        }).then(function (output) {
//            res.json(output);
//        }).error(function (err) {
//            res.status(500).json({err: err});
//        });
//    });
//
//
//       /**
//     * Retorna o numero de AP's e Disp da antena passada
//     */
//    this.app.get("/getHostbyTipoNome/:tipo/:nomeAntena", function (req, res) {//req.params.nomeAntena
//        if (req.params.tipo == "AP") {
//            r.connect(dbData).then(function (conn) {
//                return r.db(self.getDataBase(socket.id)).table('AntAp').filter({"nomeAntena": req.params.nomeAntena})("host").coerceTo('array')
//                        .run(conn)
//                        .finally(function () {
//                            conn.close();
//                        });
//            }).then(function (output) {
//                res.json(output);
//            }).error(function (err) {
//                res.status(500).json({err: err});
//            });
//        } else {
//            r.connect(dbData).then(function (conn) {
//                return r.db(self.getDataBase(socket.id)).table('AntDisp').filter({"nomeAntena": req.params.nomeAntena})("host").coerceTo('array')
//                        .run(conn)
//                        .finally(function () {
//                            conn.close();
//                        });
//            }).then(function (output) {
//                res.json(output);
//            }).error(function (err) {
//                res.status(500).json({err: err});
//            });
//
//        }
//    });



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

    r.connect(dbData).then(function (c) {
      return r.db(self.getDataBase(socket.id)).table("DispMoveis").changes().filter(function (row) {
        return row('old_val').eq(null);
      }).run(c);
    }).then(function (cursor) {
      cursor.each(function (err, item) {
        socket.emit("newDisp", item, "moveis", self.getDataBase(socket.id));
      });
    });

    r.connect(dbData).then(function (c) {
      return r.db(self.getDataBase(socket.id)).table("DispAp").changes().filter(function (row) {
        return row('old_val').eq(null);
      }).run(c);
    }).then(function (cursor) {
      cursor.each(function (err, item) {
        self.io.sockets.emit("newDisp", item, "ap", self.getDataBase(socket.id));
      });
    });

    r.connect(dbData).then(function (c) {
      return r.db(self.getDataBase(socket.id)).table("ActiveAnt").changes().filter(function (row) {
        return row('old_val').eq(null);
      }).run(c);
    }).then(function (cursor) {
      cursor.each(function (err, item) {
        self.io.sockets.emit("newDisp", item, "sensor", self.getDataBase(socket.id));
      });
    });

//        r.connect(dbData).then(function (c) {
//            return r.db(self.getDataBase(socket.id)).table("DispMoveis").changes().run(c);
//        }).then(function (cursor) {
//            cursor.each(function (err, item) {
//                socket.emit("newDevice", item);
//            });
//        });
//
//        r.connect(dbData).then(function (c) {
//            return r.db(self.getDataBase(socket.id)).table("DispAp").changes().run(c);
//        }).then(function (cursor) {
//            cursor.each(function (err, item) {
//                socket.emit("newDevice", item);
//            });
//        });


    r.connect(dbData).then(function (c) {
      return r.db(self.getDataBase(socket.id)).table("AntAp").changes()('new_val').run(c);
    }).then(function (cursor) {
      cursor.each(function (err, item) {
        self.io.sockets.emit("updateDisp", item, "ap", self.getDataBase(socket.id));
      });
    });

    r.connect(dbData).then(function (c) {
      return r.db(self.getDataBase(socket.id)).table("AntDisp").changes()('new_val').run(c);
    }).then(function (cursor) {
      cursor.each(function (err, item) {
        self.io.sockets.emit("updateDisp", item, "disp", self.getDataBase(socket.id));
      });
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
