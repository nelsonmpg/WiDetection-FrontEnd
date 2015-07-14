/* global module, require */

var express = require('express');
var http = require('http');
var socketio = require('socket.io');
var fs = require('fs');
var bodyParser = require('body-parser');
var r = require('rethinkdb');
var dbConfig = "";
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
    dbConfig = configdb;
    dbData = {
        host: dbConfig.host,
        port: dbConfig.port}, function (err, conn) {
        if (err) {
            throw err;
        }
//        connection = conn;
        console.log("Connected to ReThinkdb DataBase.");
    };


//    r.connect({
//        host: dbConfig.host,
//        port: dbConfig.port}, function (err, conn) {
//        if (err) {
//            throw err;
//        }
////        connection = conn;
//        console.log("Connected to ReThinkdb DataBase.");
//    });
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
    this.app.use(express.static(__dirname + './../www'));

//app.get("/fellowship/species/:species", function(req, res) {
//  r.connect().then(function(conn) {
//    return r.db("test").table("fellowship")
//            .filter({species: req.params.species}).run(conn)
//        .finally(function() { conn.close(); });
//  })
//  .then(function(cursor) { return cursor.toArray(); })
//  .then(function(output) { res.json(output); })
//  .error(function(err) { res.status(500).json({err: err}); })
//});

    this.app.get("/getDispsAtive/:disp/:ant", function (req, res) {
        var tabela = "";
        if (req.params.disp.trim() == "Dispositivos Moveis") {
            tabela = "AntDisp";
        } else if (req.params.disp.trim() == "Access Points") {
            tabela = "AntAp";
        } else {
            console.log("Erro Tabela");
            return;
        }
        console.log("--- Pedido ---");
        r.connect(dbData).then(function (connection) {
            return r.db("ProjetoFinal").table("AntDisp").get("ant-NelsonTest").coerceTo('array').run(connection)
                    .finally(function () {
                        connection.close();
                    });
        }).then(function (output) {
            console.log("--- Resposta ---");
            console.log(output);
            res.json(output);
        }).error(function (err) {
            console.log(err);
            res.status(500).json({err: err});
        });
    });
//            console.log("--- Resposta ---");
//            res.json(resul);


    this.app.get("/getAllClientes/:disp", function (req, res) {
        var tabela = "";
//        console.log(req.params.disp);
        if (req.params.disp.trim() == "Dispositivos Moveis") {
            tabela = "DispMoveis";
        } else if (req.params.disp.trim() == "Access Points") {
            tabela = "DispAp";
        } else {
            console.log("Erro Tabela");
            return;
        }

        console.log("--- Pedido");
        r.connect(dbData).then(function (conn) {
            return r.db(dbConfig.db).table(tabela).pluck(
                    "macAddress",
                    "nameVendor",
                    {"disp": {
                            "name": true,
                            "values": {
                                "Power": true,
                                "First_time": true,
                                "Last_time": true
                            }
                        }
                    }
            ).coerceTo('array').run(conn).finally(function () {
                conn.close();
            });
        }).then(function (output) {
            res.json(output);
        }).error(function (err) {
            res.status(500).json({err: err});
        });
    });

    //r.connect().then(function(conn) {
//.run(conn)
//        .finally(function() { conn.close(); });
//  })
//  .then(function(cursor) { return cursor.toArray(); })
//  .then(function(output) { res.json(output); })
//  .error(function(err) { res.status(500).json({err: err}); })


    this.app.get("/getAntenasAtivas", function (req, res) {
        console.log("Pedido");
        r.connect(dbData).then(function (conn) {
            return r.db(dbConfig.db).table('ActiveAnt').filter(function (row) {
                return r.now().do(function (time) {
                    return row("data").gt(r.time(
                            time.year(),
                            time.month(),
                            time.day(),
                            time.hours(),
                            time.minutes().sub(5),
                            time.seconds(),
                            time.timezone()
                            ));
                });
            }).coerceTo("array").run(conn).finally(function () {
                conn.close();
            });
        }).then(function (output) {
            res.json(output);
        }).error(function (err) {
            res.status(500).json({err: err});
        });
    });

//app.get("/fellowship/species/:species", function(req, res) {
//  r.connect().then(function(conn) {
//    return r.db("test").table("fellowship")
//            .filter({species: req.params.species}).run(conn)
//        .finally(function() { conn.close(); });
//  })
//  .then(function(cursor) { return cursor.toArray(); })
//  .then(function(output) { res.json(output); })
//  .error(function(err) { res.status(500).json({err: err}); })
//});


    /**
     * retornar antenas ativas
     * Falta alterar a consulta para retornar apenas as activas
     */
    this.app.get("/getAntActive/", function (req, res) {
        r.connect(dbData).then(function (conn) {
            return r.db("ProjetoFinal").table('ActiveAnt').coerceTo('array')
                    .run(conn)
                    .finally(function () {
                        conn.close();
                    });
        }).then(function (output) {
            res.json(output);
        }).error(function (err) {
            res.status(500).json({err: err});
        });
    });


    var self = this;
    this.io.on('connection', function (socket) {
        var c = socket.request.connection._peername;
        console.log("++++++++++++++++++++++++++++++++++++++++++++++++++++");
        console.log("Connected - " + c.address + " : " + c.port);
        console.log("++++++++++++++++++++++++++++++++++++++++++++++++++++");


        r.connect(dbData).then(function (c) {
            return r.db(dbConfig.db).table("DispMoveis").changes().run(c);
        }).then(function (cursor) {
            cursor.each(function (err, item) {
                socket.emit("newDevice", item);
            });
        });

        r.connect(dbData).then(function (c) {
            return r.db(dbConfig.db).table("DispAp").changes().run(c);
        }).then(function (cursor) {
            cursor.each(function (err, item) {
                socket.emit("newDevice", item);
            });
        });

    });
    console.log('Server HTTP Wait ' + this.port);
};
process.on("message", function (data) {
    new Server(data.port, data.configdb).start();
});


/**
 *
 * @param {type} port
 * @returns {Server}
 */
module.exports = Server;
