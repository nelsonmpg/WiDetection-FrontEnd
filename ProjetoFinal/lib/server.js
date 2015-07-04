/* global module, require */

var url = "http://web.stanford.edu/dept/its/projects/desktop/snsr/nmap-mac-prefixes.txt";
var express = require('express');
var http = require('http');
var socketio = require('socket.io');
var fs = require('fs');
var bodyParser = require('body-parser');
var connection = null;
var dbConfig = "";
var r;

/**
 * 
 * @param {type} port
 * @param {type} dbr
 * @param {type} con
 * @param {type} configdb
 * @returns {Server}
 */

var Server = function (port, dbr, con, configdb) {
    this.port = port;
    this.app = express();
    this.server = http.Server(this.app);
    this.io = socketio(this.server);
    r = dbr;
    connection = con;
    dbConfig = configdb;

    this.app.use(bodyParser.urlencoded({
        extended: true
    }));
    this.app.use(bodyParser.json());

    this.app.get("/getClientes/:database/:table/:host", function (req, res) {
        r.db(req.params.database).table(req.params.table).get(req.params.host).run(connection, function (err, resul) {
            if (err) {
                res.json(err);
            }
            res.json(resul);
        });
    });

    this.app.get("/updatePrefix", function (req, res) {
        download(url, function (data) {
            if (data) {
                var lines = data.split("\n");
                for (var i in lines) {
                    var line = lines[i].trim();
                    if (line[0] != "#" && line.length > 5) {
                        var prefix = line.substring(0, 6);
                        var vendor = line.substring(7, line.length);
                        r.db(dbConfig.db).table("tblPrefix").insert({
                            prefix: prefix,
                            "vendor": vendor
                        }).run(connection, function (err, resul) {
                            if (err) {
                                res.json(err);
                            }
                            console.log(resul);
                        });
                    }
                }
            } else {
                res.json("error");
                console.log("error");
            }
        });
        res.json("A atualizar prefixos.");
    });

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
    var self = this;
    this.io.on('connection', function (socket) {

        var address = socket.request.connection._peername;

    });
    console.log('Server HTTP Wait ' + this.port);
};

/**
 *
 * @param {type} port
 * @returns {Server}
 */
module.exports = Server;


function download(url, callback) {
    http.get(url, function (res) {
        var data = "";
        res.on('data', function (chunk) {
            data += chunk;
        });
        res.on("end", function () {
            callback(data);
        });
    }).on("error", function () {
        callback(null);
    });
}