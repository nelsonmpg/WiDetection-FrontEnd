/* global module */

require('colors');
var request = require("request");
var r = require('rethinkdb');
var debug = require('debug')('r');
var Worker = require('workerjs');
_ = require("underscore");

var connectdb = require("./ConnectDb");

var self = this;
var liveActives = {};

//************************************* Page DashBoard *************************************
/**
 * Devolvee um objecto com a quantidade de dispositivos encontrados no site selecionado
 * @param {type} req
 * @param {type} res
 * @returns {undefined}
 */
module.exports.getNumDispositivos = function (req, res) {
  r.connect(self.dbData).then(function (conn) {
    return r.db(self.getDataBase(req.params.id)).table("ActiveAnt").count().default(0).do(function (val) {
      return {
        "sensor": val,
        "moveis": r.db(self.getDataBase(req.params.id)).table("DispMoveis").count().default(0),
        "ap": r.db(self.getDataBase(req.params.id)).table("DispAp").count().default(0)
      };
    }).run(conn)
            .finally(function () {
              conn.close();
            });
  }).then(function (result) {
    res.send(result);
  }).error(function (err) {
    console.log("ERROR: %s:%s", err.name, err.msg);
  });
};

/**
 * Retorna os tempos das visitas dos DispMoveis
 * @param {type} req
 * @param {type} res
 * @returns {undefined}
 */
module.exports.getAllTimes = function (req, res) {
  r.connect(self.dbData).then(function (conn) {
    return r.db(self.getDataBase(req.params.sock)).table("DispMoveis").map(function (a) {
      return {
        "row": a,
        "state": a("disp").contains(function (b) {
          return b("values").contains(function (c) {
            return c("Last_time").ge(r.now().toEpochTime().sub(3600));
          });
        })};
    }).filter({"state": true})
            .without("state")("row")
            .orderBy("nameVendor")
            .coerceTo("array")
            .run(conn)
            .finally(function () {
              conn.close();
            });
  }).then(function (result2) {
    var tempo = new Worker('./lib/TempoMedio.js');
    var result = [];
    //Na resposta do webworker
    tempo.onmessage = function (msg) {
      res.json(JSON.stringify(msg.data));
      tempo.terminate();
    };

    //worker start
    tempo.postMessage(result2);
  }).error(function (err) {
    console.log("ERROR: %s:%s", err.name, err.msg);
  });
};

/**
 * Retorna o numero de Disp nos sensores por fabricante
 * @param {type} req
 * @param {type} res
 * @returns {undefined}
 */
module.exports.getFabricantes = function (req, res) {
  r.connect(self.dbData).then(function (conn) {
    return r.db(self.getDataBase(req.params.sock))
            .table('DispMoveis')
            .coerceTo("array")
            .run(conn)
            .finally(function () {
              conn.close();
            });
  }).then(function (result) {
    res.send(getMACInDate(req.params.min, result));
  }).error(function (err) {
    console.log("ERROR: %s:%s", err.name, err.msg);
  });
};

/**
 * Retorna as bases de dados dos varios sites
 * @param {type} req
 * @param {type} res
 * @returns {undefined}
 */
module.exports.getDataBases = function (req, res) {
  r.connect(self.dbData).then(function (conn) {
    return r.dbList().map({"db": r.row})
            .filter(r.row("db").ne("rethinkdb"))
            .filter(r.row("db").ne("user"))
            .filter(r.row("db").ne("Prefix"))
            .run(conn)
            .finally(function () {
              conn.close();
            });
  }).then(function (result) {
    res.send(result);
  }).error(function (err) {
    console.log("ERROR: %s:%s", err.name, err.msg);
  });
};

/**
 * Devolve os sensores do site selecionado
 * @param {type} req
 * @param {type} res
 * @returns {undefined}
 */
module.exports.getSensors = function (req, res) {
  r.connect(self.dbData).then(function (conn) {
    return r.db(self.getDataBase(req.params.id))
            .table("ActiveAnt")
            .map(function (w) {
              return {
                "data": w,
                "numdisp": r.db(self.getDataBase(req.params.id))
                        .table("AntDisp")
                        .get(w("nomeAntena"))("host").count().default(0),
                "numap": r.db(self.getDataBase(req.params.id))
                        .table("AntAp")
                        .get(w("nomeAntena"))("host").count().default(0)
              };
            }).orderBy(r.row("data")("nomeAntena")).coerceTo("ARRAY")
            .run(conn)
            .finally(function () {
              conn.close();
            });
  }).then(function (result) {
    res.send(result);
  }).error(function (err) {
    console.log("ERROR: %s:%s", err.name, err.msg);
  });
};

/**
 * Devolve o fabricante do dispositivo com o mac adderess encontrado no site selecionado
 * @param {type} req
 * @param {type} res
 * @returns {undefined}
 */
module.exports.getNameVendorByMac = function (req, res) {
  r.connect(self.dbData).then(function (conn) {
    return r.db(self.getDataBase(req.params.id))
            .table("DispMoveis")
            .get(req.params.mac)("nameVendor")
            .run(conn)
            .finally(function () {
              conn.close();
            });
  }).then(function (result) {
    res.send(result);
  }).error(function (err) {
    console.log("ERROR: %s:%s", err.name, err.msg);
  });
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

/**
 * Devolve a lista de dispositivos ativos por tipo e por sensor
 * @param {type} req
 * @param {type} res
 * @returns {undefined}
 */
module.exports.getActiveDisps = function (req, res) {
  var table = "";
  // seleciona a tabela de acordo com o tipo do dispositivo
  if (req.params.table == "disp") {
    table = "AntDisp";
  } else if (req.params.table == "ap") {
    table = "AntAp";
  } else {
    res.send("erro");
    return;
  }
  r.connect(self.dbData).then(function (conn) {
    return r.db(self.getDataBase(req.params.id))
            .table(table)
            .get(req.params.sensor)
            .do(function (row) {
              return r.branch(
                      row.ne(null),
                      row("host")
                      .filter(function (a) {
                        return a("data").ge(r.now().toEpochTime().sub(60));
                      }).withFields("macAddress", "nameVendor", "Power", "data"),
                      []
                      );
            }).coerceTo("ARRAY")
            .run(conn)
            .finally(function () {
              conn.close();
            });
  }).then(function (result) {
    res.send(result);
  }).error(function (err) {
    console.log("ERROR: %s:%s", err.name, err.msg);
  });
};

// ------------------------------------ Fim Page DashBoard ------------------------------------

//************************************* Page Details *************************************

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
  r.connect(self.dbData).then(function (conn) {
    return r.db(self.getDataBase(req.params.id)).table(table).filter(function (row) {
      return row("disp")("values").contains(function (a) {
        return a("Last_time").contains(function (b) {
          return b.ge(r.ISO8601(min).toEpochTime()).and(b.le(r.ISO8601(max).toEpochTime()));
        });
      });
    }).group("nameVendor").filter(function (a) {
      return a("disp").contains(function (b) {
        return b("name").eq(req.params.sensor);
      });
    }).coerceTo("ARRAY")
            .run(conn)
            .finally(function () {
              conn.close();
            });
  }).then(function (result) {
    res.send(result);
  }).error(function (err) {
    console.log("ERROR: %s:%s", err.name, err.msg);
  });
};

module.exports.getBssisFromAll = function (req, res) {
  r.connect(self.dbData).then(function (conn) {
    return r.db(self.getDataBase(req.params.id)).table("DispMoveis").map(function (row) {
      return  {
        "mac": row("macAddress"),
        "vendor": row("nameVendor"),
        "bssid": row("disp").nth(0)("values")("BSSID").distinct().filter(function (a) {
          return a.ne("(notassociated)").and(a.ne(""));
        })
      };
    }).coerceTo("ARRAY")
            .run(conn)
            .finally(function () {
              conn.close();
            });
  }).then(function (result) {
    res.send(result);
  }).error(function (err) {
    console.log("ERROR: %s:%s", err.name, err.msg);
  });
};

/**
 * Devolve a tabela DispMoveis filtrada pelo nome do sensor
 * @param {type} req
 * @param {type} res
 * @returns {undefined}
 */
module.exports.getDispMoveisbySensor = function (req, res) {
  r.connect(self.dbData).then(function (conn) {
    return r.db(self.getDataBase(req.params.id)).table("DispMoveis").filter(function (row) {
      return row("disp")("name").contains(function (a) {
        return a.match("^" + req.params.sensor + "$");
      });
    }).group("nameVendor")
            .coerceTo("ARRAY")
            .run(conn)
            .finally(function () {
              conn.close();
            });
  }).then(function (result) {
    res.send(result);
  }).error(function (err) {
    console.log("ERROR: %s:%s", err.name, err.msg);
  });
};

/**
 * Decolve a planta do local onde  o sensor de encontra
 * @param {type} req
 * @param {type} res
 * @returns {undefined}
 */
module.exports.getPlantSite = function (req, res) {
  r.connect(self.dbData).then(function (conn) {
    return r.db(self.getDataBase(req.params.id))
            .table("plantSite")
            .get(req.params.sensor)("img")
            .run(conn)
            .finally(function () {
              conn.close();
            });
  }).then(function (result) {
    res.json(result);
  }).error(function (err) {
    console.log("ERROR: %s:%s", err.name, err.msg);
  });
};

// ------------------------------------ Fim Page Details ------------------------------------

//************************************* Page DetailAP *************************************

/**
 * Devolve todos os ap organizados por macaddress e essid 
 * @param {type} req
 * @param {type} res
 * @returns {undefined}
 */
module.exports.getAllAP = function (req, res) {
  r.connect(self.dbData).then(function (conn) {
    return r.db(self.getDataBase(req.params.id))
            .table("AntAp")("host")
            .group("macAddress", "ESSID")
            .run(conn)
            .finally(function () {
              conn.close();
            });
  }).then(function (result) {
    res.send(result);
  }).error(function (err) {
    console.log("ERROR: %s:%s", err.name, err.msg);
  });
};

/**
 * retorna os dispositivos que estiveram ligados a um determinado ap
 * @param {type} req
 * @param {type} res
 * @returns {undefined}
 */
module.exports.getDispConnectedtoAp = function (req, res) {
  r.connect(self.dbData).then(function (conn) {
    return r.db(self.getDataBase(req.params.id))
            .table("DispMoveis")
            .filter(function (row) {
              return row("disp")("values").contains(function (a) {
                return a("BSSID").contains(function (b) {
                  return b.match(req.params.mac);
                });
              });
            }).coerceTo("array")
            .run(conn)
            .finally(function () {
              conn.close();
            });
  }).then(function (result) {
    res.send([result, req.params.mac]);
  }).error(function (err) {
    console.log("ERROR: %s:%s", err.name, err.msg);
  });
};

/**
 * Retorna a data ISO8060 da primeira vez que um AP foi visto
 * @param {type} req
 * @param {type} res
 * @returns {undefined}
 */
module.exports.getApFirstTime = function (req, res) {
  r.connect(self.dbData).then(function (conn) {
    return r.db(self.getDataBase(req.params.id))
            .table("DispAp")
            .get(req.params.mac)("disp")("First_time")
            .min().do(function (result) {
      return [result, r.db(self.getDataBase(req.params.id))
                .table("DispAp")
                .get(req.params.mac)("disp")("values")
                .nth(0)("Last_time").max()];
    }).run(conn)
            .finally(function () {
              conn.close();
            });
  }).then(function (result) {
    res.send(result);
  }).error(function (err) {
    console.log("ERROR: %s:%s", err.name, err.msg);
  });
};

/**
 * Devolve os mac dos clientes organizados pelo fabricante
 * @param {type} req
 * @param {type} res
 * @returns {undefined}
 */
module.exports.getDispMacbyVendor = function (req, res) {
  r.connect(self.dbData).then(function (conn) {
    return r.db(self.getDataBase(req.params.id))
            .table("DispMoveis")
            .group("nameVendor")("macAddress")
            .coerceTo("ARRAY")
            .run(conn)
            .finally(function () {
              conn.close();
            });
  }).then(function (result) {
    res.send(result);
  }).error(function (err) {
    console.log("ERROR: %s:%s", err.name, err.msg);
  });
};

/**
 * Retorna a row referente ao device (mac) 
 * @param {type} req
 * @param {type} res
 * @returns {undefined}
 */
module.exports.getApbyMac = function (req, res) {
  r.connect(self.dbData).then(function (conn) {
    return r.db(self.getDataBase(req.params.id))
            .table("DispAp")
            .get(req.params.mac)
            .run(conn)
            .finally(function () {
              conn.close();
            });
  }).then(function (result) {
    res.send(JSON.stringify(result));
  }).error(function (err) {
    console.log("ERROR: %s:%s", err.name, err.msg);
  });
};


// ------------------------------------ Fim Page DetailAP ------------------------------------

/**
 * Retorna a row referente ao device (mac) 
 * @param {type} req
 * @param {type} res
 * @returns {undefined}
 */
module.exports.getDispbyMac = function (req, res) {
  r.connect(self.dbData).then(function (conn) {
    return r.db(self.getDataBase(req.params.id))
            .table("DispMoveis")
            .get(req.params.mac)
            .run(conn)
            .finally(function () {
              conn.close();
            });
  }).then(function (result) {
    res.send(JSON.stringify(result));
  }).error(function (err) {
    console.log("ERROR: %s:%s", err.name, err.msg);
  });
};

// //************************************* Pedidos Admin Site *************************************

/**
 * Recebe um link, verifica os conteudo e adiciona a tabelas dos fbricantes
 */
module.exports.addorupdatevendors = function (req, res) {
  console.log(req.body.url);
  console.log("Carregar Prefixos.");
  // fas o download da pagina com os prefixos e constroi o array de objectos 
  // para inserir na base de dados
  download(req.body.url, function (data) {
    if (data) {
      console.log("Criacao da lista de prefixos para colocar na base dados.");
      var lines = data.split("\n");
      var docsInsert = [];
      for (var i in lines) {
        var line = lines[i].trim();
        if (line[0] != "#" && line.length > 5 && numberIsHex(line)) {
          var prefix = "";
          var vendor = "";
          var keyPrefix = "";
          var cardinal = line.split("#");
          var a = line.replace(/\s+/g, " ").split(" ");
          var p = a[0];
          if (p[2] == ":") {
            if (p.length < 9) {
              vendor = (typeof cardinal[1] == "undefined") ? a[1] : cardinal[1].trim();
              keyPrefix = p;
              docsInsert.push({
                "prefix": keyPrefix,
                "vendor": vendor.toUpperCase().replace(/[^\w\s]/gi, '').trim()
              });
            }
          } else if (p[2] == "-") {
            var b = p.split("/");
            if (b[0].length < 9) {
              vendor = (typeof cardinal[1] == "undefined") ? a[1] : cardinal[1].trim();
              keyPrefix = b[0].replace(/-/g, ":");
              docsInsert.push({
                "prefix": keyPrefix,
                "vendor": vendor.toUpperCase().replace(/[^\w\s]/gi, '').trim()
              });
            }
          } else {
            if (line.trim() != "") {
              prefix = line.substring(0, 6);
              vendor = line.substring(7, line.length);
              keyPrefix = prefix.substr(0, 2) + ":" + prefix.substr(2, 2) + ":" + prefix.substr(4);
              docsInsert.push({
                "prefix": keyPrefix,
                "vendor": vendor.toUpperCase().replace(/[^\w\s]/gi, '').trim()
              });
            }
          }
        }
      }
      console.log("Insersao da lista de prefixos na base de dados.");
      if (docsInsert.length > 0) {
        console.log(docsInsert.length);

        // Insere de uma vez todos os prefixos na base de dados
        r.connect(self.dbData).then(function (conn) {
          return r.db("Prefix").table("tblPrefix").insert(docsInsert).run(conn)
                  .finally(function () {
                    conn.close();
                  });
        }).then(function (output) {
          console.log("Query output:", output);
          res.json(output);
        }).error(function (err) {
          console.log("Failed:", err);
        });
      } else {
        console.log("sem dados");
        res.json({
          inserted: 0
        });
      }
    } else {
      console.log("error");
    }
  });
};

/**
 * Devolve a lista de sites e os seus sensores
 * @param {type} req
 * @param {type} res
 * @returns {undefined}
 */
module.exports.getsitesAndSensores = function (req, res) {
  r.connect(self.dbData).then(function (conn) {
    return r.dbList()
            .filter(r.row.ne("rethinkdb"))
            .filter(r.row.ne("user"))
            .filter(r.row.ne("Prefix"))
            .map(function (d) {
              return {
                "db": d,
                "numSensor": r.db(d).table("ActiveAnt").count(),
                "sensors": r.db(d).table("ActiveAnt").withFields("nomeAntena", "data").coerceTo("array")
              };
            }).run(conn)
            .finally(function () {
              conn.close();
            });
  }).then(function (result) {
    res.send(JSON.stringify(result));
  }).error(function (err) {
    console.log("ERROR: %s:%s", err.name, err.msg);
  });
};

module.exports.removeSite = function (req, res) {
  console.log("Site Removido - " + req.body.site);
  r.connect(self.dbData).then(function (conn) {
    return r.dbDrop(req.body.site).run(conn)
            .finally(function () {
              conn.close();
            });
  }).then(function (result) {
    res.send(JSON.stringify(result));
  }).error(function (err) {
    console.log("ERROR: %s:%s", err.name, err.msg);
  });
};

/**
 * 
 * @param {type} req
 * @param {type} res
 * @returns {undefined}
 */
module.exports.removeSensor = function (req, res) {
  console.log("Site - " + req.body.site);
  console.log("Sensor removido - " + req.body.sensor);
  r.connect(self.dbData).then(function (conn) {
    return r.db(req.body.site)
            .table("DispMoveis")
            .replace(function (row) {
              return {
                "Probed_ESSIDs": row("Probed_ESSIDs"),
                "macAddress": row("macAddress"),
                "nameVendor": row("nameVendor"),
                "disp": row("disp").filter(function (disp) {
                  return disp("name").match("^" + req.body.sensor + "$").not();
                })};
            }).do(function () {
      return r.db(req.body.site)
              .table("DispMoveis")
              .forEach(function (row) {
                return r.branch(
                        row("disp").isEmpty(),
                        r.db(req.body.site)
                        .table("DispMoveis")
                        .get(row("macAddress"))
                        .delete(),
                        row);
              });
    }).do(function () {
      return r.db(req.body.site)
              .table("DispAp")
              .replace(function (row) {
                return {
                  "Authentication": row("Authentication"),
                  "macAddress": row("macAddress"),
                  "nameVendor": row("nameVendor"),
                  "Cipher": row("Cipher"),
                  "ESSID": row("ESSID"),
                  "Privacy": row("Privacy"),
                  "Speed": row("Speed"),
                  "channel": row("channel"),
                  "disp": row("disp").filter(function (disp) {
                    return disp("name").match("^" + req.body.sensor + "$").not();
                  })};
              }).do(function () {
        return r.db(req.body.site)
                .table("DispAp")
                .forEach(function (row) {
                  return r.branch(
                          row("disp").isEmpty(),
                          r.db(req.body.site)
                          .table("DispAp")
                          .get(row("macAddress")).delete(),
                          row);
                });
      });
    }).do(function () {
      return r.db(req.body.site).table("ActiveAnt").get(req.body.sensor).delete();
    }).do(function () {
      return r.db(req.body.site).table("AntAp").get(req.body.sensor).delete();
    }).do(function () {
      return r.db(req.body.site).table("AntDisp").get(req.body.sensor).delete();
    }).do(function () {
      return  r.db(req.body.site).table("plantSite").get(req.body.sensor).delete();
    }).run(conn).finally(function () {
      conn.close();
    });
  }).then(function (result) {
    res.send(JSON.stringify(result));
  }).error(function (err) {
    console.log("ERROR: %s:%s", err.name, err.msg);
  });
};


// ------------------------------------ Fim Admin Site ------------------------------------



//************************************* Pedidos do Socket *************************************

/**
 * Devolve alista de bases de dados para o socket
 * @param {type} callback
 * @returns {undefined}
 */
module.exports.getAllDataBases = function (callback) {
  r.connect(self.dbData).then(function (conn) {
    return r.dbList().map({"db": r.row})
            .filter(r.row("db").ne("rethinkdb"))
            .filter(r.row("db").ne("user"))
            .filter(r.row("db").ne("Prefix"))
            .run(conn)
            .finally(function () {
              conn.close();
            });
  }).then(function (result) {
    callback(null, result);
  }).error(function (err) {
    callback(err.msg, null);
    console.log("ERROR: %s:%s", err.name, err.msg);
  });
};

/**
 * Cria a ligacao e fica a escuta de alteracoes nas varias tabelas passadas por 
 * parametro de cada site passado por parametro
 * @param {type} database   Site 
 * @param {type} socket     Socket para comunicacao das alteracoes
 * @param {type} table      Tabela em escuta de alteracoes
 * @param {type} nemedisp   Tipo do dispositivo
 * @returns {undefined}
 * 
 */
module.exports.changeTablesDisps = function (database, socket, table, nomedisp) {
  r.connect(self.dbData).then(function (conn) {
    r.db(database).table(table)
            .changes({squash: 1})
            .filter(function (row) {
              return row('old_val').eq(null);
            }).map(function (a) {
      return  r.db(database).table(table).count();
    }).run(conn)
            .then(function (cursor) {
              cursor.each(function (err, item) {
                socket.emit("newDisp", item, nomedisp, database);
              });
            });
  });
};

/**
 * escuta de alteracoes para a criacao do grafico em realtime do power dos 
 * varios dispositivos a tivos no ultimo minuto 
 * @param {type} database   Site
 * @param {type} socket     Socker de comunicacao
 * @param {type} table      Tabela em escuta de alteracoes
 * @param {type} nomedisp   Tipo do dispositivo 
 * @returns {undefined}
 */
module.exports.changeTableAnt = function (database, socket, table, nomedisp) {
  r.connect(self.dbData).then(function (conn) {
    r.db(database)
            .table(table)
            .changes({squash: 1})('new_val')
            .map(function (v) {
              return {
                "sensor": v("nomeAntena"),
                "hosts": v("host").do(function (row) {
                  return row.filter(function (o) {
                    return o("data").ge(r.now().toEpochTime().sub(60));
                  }).withFields("macAddress", "nameVendor", "Power", "data");
                })};
            }).run(conn)
            .then(function (cursor) {
              cursor.each(function (err, item) {
                socket.emit("updateRealTimeChart", item, nomedisp, database);
              });
            });
  });
};

module.exports.changeTableAntForGraph = function (database, socket, table, nomedisp) {
  r.connect(self.dbData).then(function (conn) {
    r.db(database)
            .table(table)
            .changes({squash: 1})
            .map(function (v) {
              var a = v("old_val")("host").count();
              var b = v("new_val")("host").count();
              return {
                "sensor": v("new_val")("nomeAntena"),
                "hosts_new": v("new_val")("host").count(),
                "host_teste": a.ne(b)
              };
            }).filter(function (val) {
      return val("host_teste");
    }).run(conn).then(function (cursor) {
      cursor.each(function (err, item) {
        if (typeof item != "undefined") {
          socket.emit("updateCharTwoBars", item, nomedisp, database);
        }
      });
    });
  });
};

module.exports.changeNewSensorForGraph = function (database, socket, table, nomedisp) {
  r.connect(self.dbData).then(function (conn) {
    r.db(database)
            .table(table)
            .changes({squash: 1})
            .filter(function (row) {
              return row('old_val').eq(null);
            })("new_val")("nomeAntena")
            .run(conn)
            .then(function (cursor) {
              cursor.each(function (err, item) {
                socket.emit("updateCharTwoBars", item, nomedisp, database);
              });
            });
  });
};

/**
 * Escuta de novo sensor adicionado ao site
 * @param {type} database Site
 * @param {type} socket   Socket de comunicacao
 * @returns {undefined}
 */
module.exports.changeActiveAnt = function (database, socket) {
  r.connect(self.dbData).then(function (conn) {
    r.db(database)
            .table("ActiveAnt")
            .changes({squash: 5})('new_val').withFields("nomeAntena", "cpu", "disc", "memory", "data")
            .run(conn)
            .then(function (cursor) {
              cursor.each(function (err, item) {
                socket.emit('changeActiveAnt', item, database);
              });
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
    r.connect(self.dbData).then(function (conn) {
      return r.db(self.getDataBase(iduser)).table("DispMoveis").map(function (a) {
        return {"row": a, "state": a("disp").contains(function (b) {
            return b("values").contains(function (c) {
              return c("Last_time").ge(r.now().toEpochTime().sub(3600));
            });
          })};
      }).filter({"state": true}).without("state")("row")
              .coerceTo("array")
              .run(conn)
              .finally(function () {
                conn.close();
              });
    }).then(function (result) {
      var work = new Worker('./lib/workerGraph.js');
      work.postMessage(result);
      work.onmessage = function (msg) {
        liveActives[self.getDataBase(iduser)].array = msg.data;
        work.terminate();
        socket.emit("getAllDisp", msg.data, self.getDataBase(iduser));
      };

      //Interval de update do grafico nos clientes
      liveActives[self.getDataBase(iduser)].intervalChart = setInterval(function () {
        if (typeof liveActives[self.getDataBase(iduser)] != "undefined" &&
                liveActives[self.getDataBase(iduser)] != null &&
                liveActives[self.getDataBase(iduser)].array != undefined) {
          r.connect(self.dbData).then(function (conn) {
            return r.db(self.getDataBase(iduser)).table("DispMoveis").map(function (row) {
              return  row("disp").do(function (ro) {
                return {"macAddress": row("macAddress"), "values": ro("values").nth(0).orderBy(r.desc("Last_time")).limit(10).orderBy(r.asc("Last_time"))};
              });
            }).map(function (a) {
              return {"macAddress": a('macAddress'), "state": a('values').contains(function (value) {
                  return value("Last_time").ge(r.now().toEpochTime().sub(60));
                })};
            }).filter({"state": true}).count().run(conn).finally(function () {
              conn.close();
            });
          }).then(function (result) {
            if (liveActives[self.getDataBase(iduser)].array) {
              //Atualiza o array do servidor       
              var novaData = new Date(liveActives[self.getDataBase(iduser)].array[liveActives[self.getDataBase(iduser)].array.length - 1].x);
              novaData.addMinutes(1);
              liveActives[self.getDataBase(iduser)].array.shift();
              var x = {x: novaData.toISOString(), y: result * 1};
              liveActives[self.getDataBase(iduser)].array.push(x);
              //Envia para os clientes
              socket.emit("updateChart", x, self.getDataBase(iduser));
            }
          }).error(function (err) {
            console.log("ERROR: interval 1  %s:%s", err.name, err.msg);
          });
        } else {
          clearInterval(this);
        }
      }, 1000 * 60); //De minuto a minuto

    }).error(function (err) {
      console.log("ERROR: interval 2 %s:%s", err.name, err.msg);
    });
  }
};
// --------------------------------- Fim dos pedidos do socket ---------------------------------


module.exports.getLiveActives = function () {
  return liveActives;
};

Date.prototype.addMinutes = function (h) {
  this.setMinutes(this.getMinutes() + h);
  return this;
};

/**
 * Fazo download da pagina passada por parametro
 * @param {type} url
 * @param {type} callback
 * @returns {undefined}
 */
var download = function (url, callback) {
  request(url, function (err, res, body) {
    var data = body;
    callback(data);
  }).on("error", function () {
    callback(null);
  });
};

/**  * Verifica se o carater passado por parametro e um carater hexadecimal
 * @param {type} char
 * @returns {Boolean}
 */
var numberIsHex = function (char) {
  var result = false;
  char = char.replace(/[^\w\s]/gi, '').slice(0, 6);
  char = char.substr(0, 2) + ":" + char.substr(2, 2) + ":" + char.substr(4);
  var urlPattern = /^(([A-Fa-f0-9]{2}[:]){2}[A-Fa-f0-9]{2}[,]?)+$/;
  if (char.match(urlPattern)) {
    result = true;
    //    console.log(char);
  }
  return result;
};