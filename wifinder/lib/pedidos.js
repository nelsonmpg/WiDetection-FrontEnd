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

/**
 * 
 * @param {type} req
 * @param {type} res
 * @returns {undefined}
 */
module.exports.getAllDisp = function (req, res) {
    var sock = req.params.sock;
    if (liveActives[self.getDataBase(sock)] != undefined) {
        res.json(liveActives[self.getDataBase(sock)].array);
    } else {
        liveActives[self.getDataBase(sock)] = {};
        connectdb.onConnect(function (err, conn) {
            r.db(self.getDataBase(sock))
                    .table('DispMoveis')
                    .coerceTo("ARRAY")
                    .run(conn, function (err, result) {
                        if (err) {
                            console.log("ERROR: %s:%s", err.name, err.msg);
                        } else {

                            var work = new Worker('./lib/workerGraph.js');
                            work.postMessage(result);
                            work.onmessage = function (msg) {
                                liveActives[self.getDataBase(sock)].array = msg.data;
                                work.terminate();
                                res.json(msg.data);
                            };

                            //Interval de update do grafico nos clientes
                            liveActives[self.getDataBase(sock)].intervalChart = setInterval(function () {
                                if (typeof liveActives[self.getDataBase(sock)] != "undefined") {
                                    //a ultima data do array
                                    var nextDate = new Date(liveActives[self.getDataBase(sock)].array[liveActives[self.getDataBase(sock)].array.length - 1].x);
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
                                        r.db(self.getDataBase(sock)).table("DispMoveis").map(function (row) {
                                            return  row("disp").do(function (ro) {
                                                return {"macAddress": row("macAddress"), "nameVendor": row("nameVendor"), "values": ro("values").nth(0).orderBy(r.desc("Last_time")).limit(10).orderBy(r.asc("Last_time"))};
                                            });
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
                                                })};
                                        }).filter({"state": true})
                                                .count().run(conn, function (err, result) {
                                            if (err) {
                                                console.log("ERROR: %s:%s", err.name, err.msg);
                                            } else {
                                                //Atualiza o array do servidor       
                                                var novaData = new Date(liveActives[self.getDataBase(sock)].array[liveActives[self.getDataBase(sock)].array.length - 1].x);
                                                novaData.addMinutes(1);
                                                liveActives[self.getDataBase(sock)].array.shift();
                                                var x = {x: novaData.toISOString(), y: result * 1};
                                                liveActives[self.getDataBase(sock)].array.push(x);
                                            }
                                            conn.close();
                                        });
                                    });
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