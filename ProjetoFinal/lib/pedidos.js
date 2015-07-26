/* global exports */

require('colors');
var r = require('rethinkdb');
var debug = require('debug')('r');
var Worker = require('workerjs');

var self = this;
var liveActives = [];
var intervalChart; // interval de update do gráfico dispositivos ativos

exports.getNameVendorByMac = function (req, res) {
  console.log(self.getDataBase(req.params.sock));
  console.log(req.params.mac);
  r.db(self.getDataBase(req.params.sock))
          .table("DispMoveis")
          .get(req.params.mac)("nameVendor")
          .run(self.connection, function (err, result) {
            if (err) {
              console.log(err);
            } else {
              console.log(result);
              res.send(result);
            }
          });
};

exports.getDataBases = function (req, res) {
  r.dbList().map({"db": r.row})
          .filter(r.row("db").ne("rethinkdb"))
          .filter(r.row("db").ne("user"))
          .run(self.connection, function (err, result) {
            if (err) {
              console.log(err);
            } else {
              res.send(result);
            }
          });
};

exports.getFabricantes = function (req, res) {
  r.db(self.getDataBase(req.params.sock))
          .table('DispMoveis')
          .coerceTo("array")
          .run(self.connection, function (err, result) {
            if (err) {
              console.log(err);
            } else {
              res.send(getMACInDate(req.params.min, result));
            }
          });
};

exports.getAllTimes = function (req, res) {
  r.db(self.getDataBase(req.params.sock))
          .table('DispMoveis')
          .coerceTo("array")
          .run(self.connection, function (err, result2) {
            if (err) {
              console.log(err);
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
          });
};

exports.getAllSensorAndisp = function (req, res) {
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
  }).coerceTo('array').run(self.connection, function (err, result) {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
    }
  });
};

exports.getNumDispositivos = function (req, res) {
  r.db(self.getDataBase(req.params.sock)).table("ActiveAnt").count().do(function (val) {
    return {"sensor": val,
      "moveis": r.db(self.getDataBase(req.params.sock)).table("DispMoveis").count(),
      "ap": r.db(self.getDataBase(req.params.sock)).table("DispAp").count()};
  }).run(self.connection, function (err, result) {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
    }
  });
};

/**
 * 
 * @param {type} req
 * @param {type} res
 * @returns {undefined}
 */
exports.getAllDisp = function (req,res){
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

        //Interval de update do grafico nos clientes
        intervalChart = setInterval(function () {
          //a ultima data do array
          var nextDate = new Date(liveActives[self.getDataBase(req.params.sock)][liveActives[self.getDataBase(req.params.sock)].length - 1].x);
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
          
            r.connect(self.dbData).then(function (conn) {
              return r.db(self.getDataBase(req.params.sock)).table("DispMoveis").map(function (row) {
                return  row("disp").do(function (ro) {
                  return {"macAddress": row("macAddress"), "nameVendor": row("nameVendor"), "values": ro("values").nth(0).orderBy(r.desc("Last_time")).limit(10).orderBy(r.asc("Last_time"))}
                })
              }).map(function (a) {
                return {"macAddress": a('macAddress'), "state": a('values').contains(function (value) {
                    return r.now().inTimezone("+01:00").do(function (time) {
                      return value('Last_time').ge(r.time(
                              time.year(),
                              time.month(),
                              time.day(),
                              time.hours().sub(hou),
                              time.minutes().sub(min),
                              time.seconds(),
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
        }, 1000 * 60); //De minuto a minuto
      }).error(function (err) {
        res.status(500).json({err: err});
      });
    }
}


Date.prototype.addMinutes = function (h) {
  this.setMinutes(this.getMinutes() + h);
  return this;
};