/* global exports */

require('colors');
var r = require('rethinkdb');
var debug = require('debug')('r');
var Worker = require('workerjs');

var self = this;

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