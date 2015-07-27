/* global module */

require('colors');
var r = require('rethinkdb');
var debug = require('debug')('r');
var Worker = require('workerjs');

var connectdb = require("./ConnectDb");

var self = this;
var liveActives = [];

module.exports.getliveActives = function(){
  return self.liveActives;
};

module.exports.getNameVendorByMac = function (req, res) {
  console.log(self.getDataBase(req.params.sock));
  console.log(req.params.mac);
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
};

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

module.exports.getAllTimes = function (req, res) {
  connectdb.onConnect(function (err, conn) {
    r.db(self.getDataBase(req.params.sock))
            .table('DispMoveis')
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
                      resposta[i.toString()] = result2[i];
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
    r.db(self.getDataBase(req.params.sock)).table("ActiveAnt").count().do(function (val) {
      return {"sensor": val,
        "moveis": r.db(self.getDataBase(req.params.sock)).table("DispMoveis").count(),
        "ap": r.db(self.getDataBase(req.params.sock)).table("DispAp").count()};
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

module.exports.changeDispMoveis = function (database, callback) {
  if (database) {
    connectdb.onConnect(function (err, conn) {
      r.db(database).table("DispMoveis").changes().filter(function (row) {
        return row('old_val').eq(null);
      }).run(conn, function (err, cursor) {
        if (err) {
          console.log("ERROR: %s:%s", err.name, err.msg);
          callback(null, []);
        } else {
          cursor.each(function (err, item) {
            if (err) {
              console.log("ERROR: %s:%s", err.name, err.msg);
              callback(null, []);
            } else {
              callback(null, item);
            }
          });
        }
        conn.close();
      });
    });
  } else {
    callback(null, []);
  }
};

module.exports.changeDispAp = function (database, callback) {
  if (database) {
    connectdb.onConnect(function (err, conn) {
      r.db(database).table("DispAp").changes().filter(function (row) {
        return row('old_val').eq(null);
      }).run(conn, function (err, cursor) {
        if (err) {
          console.log("ERROR: %s:%s", err.name, err.msg);
          callback(null, []);
        } else {
          cursor.each(function (err, item) {
            if (err) {
              console.log("ERROR: %s:%s", err.name, err.msg);
              callback(null, []);
            } else {
              callback(null, item);
            }
          });
        }
        conn.close();
      });
    });
  } else {
    callback(null, []);
  }
};

module.exports.changeActiveAnt = function (database, callback) {
  if (database) {
    connectdb.onConnect(function (err, conn) {
      r.db(database).table("ActiveAnt").changes().filter(function (row) {
        return row('old_val').eq(null);
      }).run(conn, function (err, cursor) {
        if (err) {
          console.log("ERROR: %s:%s", err.name, err.msg);
          callback(null, []);
        } else {
          cursor.each(function (err, item) {
            if (err) {
              console.log("ERROR: %s:%s", err.name, err.msg);
              callback(null, []);
            } else {
              callback(null, item);
            }
          });
        }
        conn.close();
      });
    });
  } else {
    callback(null, []);
  }
};


/**
 * 
 * @param {type} req
 * @param {type} res
 * @returns {undefined}
 */
module.exports.getAllDisp = function (req, res) {
  if (liveActives[self.getDataBase(req.params.sock)] != undefined) {
    res.json(liveActives[self.getDataBase(req.params.sock)]);
  } else {
    r.connect(self.dbData).then(function (conn) {
      return r.db(self.getDataBase(req.params.sock)).table('DispMoveis').coerceTo("ARRAY").run(conn)
              .finally(function () {
                conn.close();
              });
    }).then(function (output) {
      var work = new Worker('./lib/workerGraph.js');
      work.postMessage(output);
      work.onmessage = function (msg) {
        liveActives[self.getDataBase(req.params.sock)] = msg.data;
        work.terminate();
        res.json(msg.data);
      };
    }).error(function (err) {
      res.status(500).json({err: err});
    });
  }
};

Date.prototype.addMinutes = function (h) {
  this.setMinutes(this.getMinutes() + h);
  return this;
};