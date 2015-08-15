/* global module */

require('colors');
var r = require('rethinkdb');
var debug = require('debug')('r');
var Worker = require('workerjs');
_ = require("underscore");

var connectdb = require("./ConnectDb");

var self = this;
var liveActives = {};
//var intervalChart; // interval de update do gráfico dispositivos ativos

module.exports.getNameVendorByMac = function (req, res) {
  connectdb.onConnect(function (err, conn) {
    r.db(self.getDataBase(req.params.sock))
            .table("DispMoveis")
            .get(req.params.mac)("nameVendor")
            .run(conn, function (err, result) {
              if (err) {
                console.log("ERROR: %s:%s", err.name, err.msg);
              } else {
                console.log(result);
                res.send(result);
              }
              conn.close();
            });
  });
};

module.exports.getAllTimes = function (req, res) {
  connectdb.onConnect(function (err, conn) {
    r.db(self.getDataBase(req.params.sock)).table("DispMoveis").map(function (a) {
      return {"row": a, "state": a("disp").contains(function (b) {
          return b("values").contains(function (c) {
            return c("Last_time").ge(r.now().toEpochTime().sub(3600));
          });
        })};
    }).filter({"state": true}).without("state")("row")
            .coerceTo("array")
            .run(conn, function (err, result2) {
              if (err) {
                console.log("ERROR: %s:%s", err.name, err.msg);
              } else {
                var tempo = new Worker('./lib/TempoMedio.js');
                var result = [];

                //Na resposta do webworker
                tempo.onmessage = function (msg) {
                  // se a mensagem for "stop" e' para parar
                  if (msg.data == "stop") {
                    //termina o webworker
                    tempo.terminate();
                    //array para construir a resposta
                    var resposta = {};
                    //[macAddress] = numero de visitas
                    for (var i in result) {
                      resposta[i.toString()] = result[i];
                    }
                    //devolve a resposta ao cliente
                    res.json(resposta);
                  } else {
                    //verifica se a posição do array esta' indefinida e inicializa-a
                    if (typeof result[msg.data.macAddress] == "undefined") {
                      result[msg.data.macAddress] = [];
                    }
                    //guarda no array das visitas [macAddress] = [{visita},{visita}]
                    result[msg.data.macAddress].push(msg.data.visita);
                  }
                };

                //worker start
                tempo.postMessage(result2);
              }
              conn.close();
            });
  });
};

module.exports.getDataBases = function (req, res) {
  connectdb.onConnect(function (err, conn) {
    r.dbList().map({"db": r.row})
            .filter(r.row("db").ne("rethinkdb"))
            .filter(r.row("db").ne("user"))
            .run(conn, function (err, result) {
              if (err) {
                console.log("ERROR: %s:%s", err.name, err.msg);
              } else {
                res.send(result);
              }
              conn.close();
            });
  });
}

module.exports.getFabricantes = function (req, res) {
  connectdb.onConnect(function (err, conn) {
    r.db(self.getDataBase(req.params.sock))
            .table('DispMoveis')
            .coerceTo("array")
            .run(conn, function (err, result) {
              if (err) {
                console.log("ERROR: %s:%s", err.name, err.msg);
              } else {
                res.send(getMACInDate(req.params.min, result));
              }
              conn.close();
            });
  });
};

module.exports.getAllSensorAndisp = function (req, res) {
  connectdb.onConnect(function (err, conn) {
    r.db(self.getDataBase(req.params.sock)).table('AntAp').map(function (row) {
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
    }).coerceTo('array').run(conn, function (err, result) {
      if (err) {
        console.log("ERROR: %s:%s", err.name, err.msg);
      } else {
        res.send(result);
      }
      conn.close();
    });
  });
};

module.exports.getNumDispositivos = function (req, res) {
  connectdb.onConnect(function (err, conn) {
    r.db(self.getDataBase(req.params.id)).table("ActiveAnt").count().do(function (val) {
      return {"sensor": val,
        "moveis": r.db(self.getDataBase(req.params.id)).table("DispMoveis").count(),
        "ap": r.db(self.getDataBase(req.params.id)).table("DispAp").count()};
    }).run(conn, function (err, result) {
      if (err) {
        console.log("ERROR: %s:%s", err.name, err.msg);
      } else {
        res.send(result);
      }
      conn.close();
    });
  });
};

module.exports.getAllDataBases = function (callback) {
  connectdb.onConnect(function (err, conn) {
    r.dbList().map({"db": r.row})
            .filter(r.row("db").ne("rethinkdb"))
            .filter(r.row("db").ne("user"))
            .run(conn, function (err, result) {
              if (err) {
                callback(err.msg, null);
                console.log("ERROR: %s:%s", err.name, err.msg);
              } else {
                callback(null, result);
              }
//              conn.close();
            });
  });
};

module.exports.changeTablesDisps = function (database, socket, table, nemedisp) {
  connectdb.onConnect(function (err, conn) {
    r.db(database).table(table)
            .changes()
            .filter(function (row) {
              return row('old_val').eq(null);
            }).run(conn)
            .then(function (cursor) {
              cursor.each(function (err, item) {
//                console.log(item);
                socket.emit("newDisp", item, nemedisp, database);
              });
            });
  });
};

module.exports.changeTableAnt = function (database, socket, table, nemedisp) {
  connectdb.onConnect(function (err, conn) {
    r.db(database).table(table)
            .changes()('new_val')
            .map(function (v) {
              return {"sensor": v("nomeAntena"), "hosts": v("host").do(function (row) {
                  return row.filter(function (o) {
                    return o("data").ge(r.now().toEpochTime().sub(60));
                  }).withFields("macAddress", "nameVendor", "Power", "data");
                })};
            }).run(conn)
            .then(function (cursor) {
              cursor.each(function (err, item) {
                socket.emit("updateRealTimeChart", item, nemedisp, database);
              });
            });
  });
};

module.exports.changeActiveAnt = function (database, socket) {
  connectdb.onConnect(function (err, conn) {
    r.db(database).table("ActiveAnt")
            .changes()('new_val').withFields("cpu", "disc", "memory", "data").run(conn)
            .then(function (cursor) {
              cursor.each(function (err, item) {
//                console.log(item);
                socket.emit("changeActiveAnt", item, database);
              });
            });
  });
};

module.exports.getSensors = function (req, res) {
  connectdb.onConnect(function (err, conn) {
    r.db(self.getDataBase(req.params.id)).table("ActiveAnt")
            .coerceTo("ARRAY")
            .run(conn, function (err, result) {
              if (err) {
                console.log("ERROR: %s:%s", err.name, err.msg);
              } else {
                res.send(result);
              }
              conn.close();
            });
  });
};

module.exports.getActiveDisps = function (req, res) {
  var table = "";
  if (req.params.table == "disp") {
    table = "AntDisp";
  } else if (req.params.table == "ap") {
    table = "AntAp";
  } else {
    res.send("erro");
    return;
  }
  connectdb.onConnect(function (err, conn) {
    r.db(self.getDataBase(req.params.id)).table(table).get(req.params.sensor)("host").do(function (row) {
      return row.filter(function (a) {
        return a("data").ge(r.now().toEpochTime().sub(60));
      }).withFields("macAddress", "nameVendor", "Power", "data");
    }).coerceTo("ARRAY")
            .run(conn, function (err, result) {
              if (err) {
                console.log("ERROR: %s:%s", err.name, err.msg);
              } else {
                res.send(result);
              }
              conn.close();
            });
  });
};

/**
 * 
 * @param {type} req
 * @param {type} res
 * @returns {undefined}
 */
module.exports.getAllOrderbyVendor = function (req, res) {
  var min = req.params.min;//new Date(req.params.min).toJSON();
  var max = req.params.max;//new Date(req.params.max).toJSON();
  var table = ((req.params.table).toString().toUpperCase() == "AP") ? "DispAp" : "DispMoveis";
  connectdb.onConnect(function (err, conn) {
    r.db(self.getDataBase(req.params.id)).table(table).filter(function (row) {
      return row("disp")("values").contains(function (a) {
        return a("Last_time").contains(function (b) {
          return b.ge(r.ISO8601(min).toEpochTime()).and(b.le(r.ISO8601(max).toEpochTime()));
        })
      })
    }).group("nameVendor").filter(function (a) {
      return a("disp").contains(function (b) {
        return b("name").eq(req.params.sensor)
      })
    })
            .coerceTo("ARRAY")
            .run(conn, function (err, result) {
              if (err) {
                console.log("ERROR: %s:%s", err.name, err.msg);
              } else {
                res.send(result);
              }
              conn.close();
            });
  });
};

/**
 * Devolve a tabela DispMoveis filtrada pelo nome do sensor
 * @param {type} req
 * @param {type} res
 * @returns {undefined}
 */
module.exports.getDispMoveisbySensor = function (req, res) {
  connectdb.onConnect(function (err, conn) {
    r.db(self.getDataBase(req.params.id)).table("DispMoveis").filter(function (row) {
      return row("disp")("name").contains(function (a) {
        return a.match("^" + req.params.sensor + "$");
      });
    })
            .group("nameVendor")
            .coerceTo("ARRAY")
            .run(conn, function (err, result) {
              if (err) {
                console.log("ERROR: %s:%s", err.name, err.msg);
              } else {
                res.send(result);
              }
              conn.close();
            });
  });
};

/**
 * Devolve todos os ap organizados por macaddress e essid 
 * @param {type} req
 * @param {type} res
 * @returns {undefined}
 */
module.exports.getAllAP = function (req, res) {
  connectdb.onConnect(function (err, conn) {
    r.db(self.getDataBase(req.params.id))
            .table("AntAp")("host")
            .group("macAddress", "ESSID")
            .run(conn, function (err, result) {
              if (err) {
                console.log("ERROR: %s:%s", err.name, err.msg);
              } else {
                res.send(result);
              }
              conn.close();
            });
  });
};

/**
 * retorna os dispositivos que estiveram ligados a um determinado ap
 * @param {type} req
 * @param {type} res
 * @returns {undefined}
 */
module.exports.getDispConnectedtoAp = function (req, res) {
  connectdb.onConnect(function (err, conn) {
    r.db(self.getDataBase(req.params.id))
            .table("DispMoveis")
            .filter(function (row) {
              return row("disp")("values").contains(function (a) {
                return a("BSSID").contains(function (b) {
                  return b.match(req.params.mac);
                });
              });
            }).coerceTo("array")
            .run(conn, function (err, result) {
              if (err) {
                console.log("ERROR: %s:%s", err.name, err.msg);
              } else {
                res.send([result, req.params.mac]);
              }
              conn.close();
            });
  });
};

/**
 * Retorna a data ISO8060 da primeira vez que um AP foi visto
 * @param {type} req
 * @param {type} res
 * @returns {undefined}
 */
module.exports.getApFirstTime = function (req, res) {
  connectdb.onConnect(function (err, conn) {
    r.db(self.getDataBase(req.params.id))
            .table("DispAp")
            .get(req.params.mac)("disp")("First_time")
            .min().do(function (result) {
      return [result, r.db(self.getDataBase(req.params.id))
                .table("DispAp")
                .get(req.params.mac)("disp")("values")
                .nth(0)("Last_time").max()];
    }).run(conn, function (err, result) {
      if (err) {
        console.log("ERROR: %s:%s", err.name, err.msg);
      } else {
        res.send(result);
      }
      conn.close();
    });
  });
};

/**
 * 
 * @param {type} req
 * @param {type} res
 * @returns {undefined}
 */
module.exports.getAllDisp = function (iduser, socket) {
  if (liveActives[self.getDataBase(iduser)] != undefined) {
    socket.emit("getAllDisp", liveActives[self.getDataBase(iduser)].array, self.getDataBase(iduser));
  } else {
    liveActives[self.getDataBase(iduser)] = {};
    connectdb.onConnect(function (err, conn) {
      r.db(self.getDataBase(iduser)).table("DispMoveis").map(function (a) {
        return {"row": a, "state": a("disp").contains(function (b) {
            return b("values").contains(function (c) {
              return c("Last_time").ge(r.now().toEpochTime().sub(3600));
            });
          })};
      }).filter({"state": true}).without("state")("row")
              .coerceTo("ARRAY")
              .run(conn, function (err, result) {
                if (err) {
                  console.log("ERROR: %s:%s", err.name, err.msg);
                } else {

                  var work = new Worker('./lib/workerGraph.js');
                  work.postMessage(result);
                  work.onmessage = function (msg) {
                    liveActives[self.getDataBase(iduser)].array = msg.data;
                    work.terminate();
                    socket.emit("getAllDisp", msg.data, self.getDataBase(iduser));
                  };

                  //Interval de update do grafico nos clientes
                  liveActives[self.getDataBase(iduser)].intervalChart = setInterval(function () {
                    if (typeof liveActives[self.getDataBase(iduser)] != "undefined" && liveActives[self.getDataBase(iduser)] != null) {
                      //a ultima data do array
                      var nextDate = new Date(liveActives[self.getDataBase(iduser)].array[liveActives[self.getDataBase(iduser)].array.length - 1].x);
                      // + 1 minuto, ou seja, r.now()
                      nextDate.addMinutes(1);
                      var min, hou;
                      // 
                      if (nextDate.getMinutes() != 0) {
                        min = 1;
                        hou = 0;
                      } else {
                        min = 1;
                        hou = 1;
                      }

                      connectdb.onConnect(function (err, conn) {
                        r.db(self.getDataBase(iduser)).table("DispMoveis").map(function (row) {
                          return  row("disp").do(function (ro) {
                            return {"macAddress": row("macAddress"), "values": ro("values").nth(0).orderBy(r.desc("Last_time")).limit(10).orderBy(r.asc("Last_time"))};
                          });
                        }).map(function (a) {
                          return {"macAddress": a('macAddress'), "state": a('values').contains(function (value) {
                              return value("Last_time").ge(r.now().toEpochTime().sub(60));
                            })};
                        }).filter({"state": true})
                                .count().run(conn, function (err, result) {
                          if (err) {
                            console.log("ERROR: %s:%s", err.name, err.msg);
                          } else {
                            //Atualiza o array do servidor       
                            var novaData = new Date(liveActives[self.getDataBase(iduser)].array[liveActives[self.getDataBase(iduser)].array.length - 1].x);
                            novaData.addMinutes(1);
                            liveActives[self.getDataBase(iduser)].array.shift();
                            var x = {x: novaData.toISOString(), y: result * 1};
                            liveActives[self.getDataBase(iduser)].array.push(x);
                            //Envia para os clientes
                            socket.emit("updateChart", x, self.getDataBase(iduser));
                            clearInterval(liveActives[self.getDataBase(iduser)].intervalChart);
                          }
                          conn.close();
                        });
                      });
                    } else {
                        
                    }
                  }, 1000 * 60); //De minuto a minuto
                }
                conn.close();
              });
    });
  }
};

/**
 * 
 * @param {type} req
 * @param {type} res
 * @returns {undefined}
 */
module.exports.getLastAllTimes = function (req, res) {
  if (liveActives[self.getDataBase(req.params.id)] != undefined) {
    var last = _.last(liveActives[self.getDataBase(req.params.id)].array);
    res.json(last);
  }
};

module.exports.getLiveActives = function () {
  return liveActives;
}

Date.prototype.addMinutes = function (h) {
  this.setMinutes(this.getMinutes() + h);
  return this;
};