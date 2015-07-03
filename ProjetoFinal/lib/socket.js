/* global process, module, assert, result */

var net = require('net');
var r = require('rethinkdb');
var socketio = require('socket.io');
var connection = null;
var dbConfig = {
    host: '185.15.22.55',
    port: 28015,
    db: 'Clientes',
    tables: {
        'cliente': 'macCliente',
        'ap': 'BSSID'
    }
};

var ServerSocket = function (port) {
    this.port = port;
    this.net = require('net');
    this.serverSck = net.createServer(this.net);
    this.clienteSend = "default";
};

r.connect({
    host: dbConfig.host,
    port: dbConfig.port}, function (err, conn) {
    if (err) {
        throw err;
    }
    connection = conn;
    console.log("Connected to ReThinkdb DataBase.");
});

ServerSocket.prototype.start = function () {
    this.serverSck.listen(this.port);
// Create a server instance, and chain the listen function to it
// The function passed to net.createServer() becomes the event handler for the 'connection' event
// The sock object the callback function receives UNIQUE for each connection
//    this.serverSck(function (sock) {
    r.connect({host: dbConfig.host, port: dbConfig.port}, function (err, connection) {
        r.dbCreate(dbConfig.db).run(connection, function (err, result) {
            if (err) {
                console.log(JSON.stringify(err));
            }
            for (var tbl in dbConfig.tables) {
                (function (tableName) {
                    r.db(dbConfig.db).tableCreate(tableName, {primaryKey: dbConfig.tables[tbl]}).run(connection, function (err, result) {
                        if (err) {
                            console.log(JSON.stringify(err));
                        }
                    });
                })(tbl);
            }
        });
    });
    this.serverSck.on('connection', function (sock) {
        // We have a connection - a socket object is assigned to the connection automatically
        console.log('CONNECTED: ' + sock.remoteAddress + ':' + sock.remotePort);
        // Add a 'data' event handler to this instance of socket
        sock.on('data', function (data) {
            var client = this.clienteSend;
            var aux = data.toString();
            var resultLine = aux.split("\r\n");
            for (var i = 0, max = resultLine.length; i < max; i++) {
                var line = resultLine[i];
                if (line[2] == ":" && line.length > 4) {
                    var result = line.split(", ");
                    if (result.length < 7) {
                        r.db("Clientes").table("cliente").get(result[0]).replace(function (row) {
                            return r.branch(
                                    row.eq(null),
                                    {
                                        "macCliente": result[0],
                                        "disp": [{
                                                name: client,
                                                "values": [{
                                                        "First_time": (typeof result[1] == "undefined") ? "" : result[1],
                                                        "Last_time": (typeof result[2] == "undefined") ? "" : result[2],
                                                        "Power": (typeof result[3] == "undefined") ? "" : result[3],
                                                        "packets": (typeof result[4] == "undefined") ? "" : result[4],
                                                        "BSSID": (typeof result[5] === "undefined") ? "" : result[5],
                                                        "Probed_ESSIDs": (typeof result[6] == "undefined") ? "" : result[6]
                                                    }]
                                            }]
                                    },
                            r.branch(
                                    row("disp")("name").contains(client),
                                    row.merge({
                                        "disp": row('disp').map(function (d) {
                                            return r.branch(
                                                    d('name').eq(client).default(false),
                                                    d.merge({values: d('values').append({
                                                            "First_time": (typeof result[1] == "undefined") ? "" : result[1],
                                                            "Last_time": (typeof result[2] == "undefined") ? "" : result[2],
                                                            "Power": (typeof result[3] == "undefined") ? "" : result[3],
                                                            "packets": (typeof result[4] == "undefined") ? "" : result[4],
                                                            "BSSID": (typeof result[5] === "undefined") ? "" : result[5],
                                                            "Probed_ESSIDs": (typeof result[6] == "undefined") ? "" : result[6]
                                                        })}),
                                                    d);
                                        })}),
                                    {
                                        "macCliente": result[0],
                                        "disp": row("disp").append({
                                            "name": client,
                                            "values": [{
                                                    "First_time": (typeof result[1] == "undefined") ? "" : result[1],
                                                    "Last_time": (typeof result[2] == "undefined") ? "" : result[2],
                                                    "Power": (typeof result[3] == "undefined") ? "" : result[3],
                                                    "packets": (typeof result[4] == "undefined") ? "" : result[4],
                                                    "BSSID": (typeof result[5] === "undefined") ? "" : result[5],
                                                    "Probed_ESSIDs": (typeof result[6] == "undefined") ? "" : result[6]
                                                }]
                                        })
                                    }))
                        }).run(connection, function (err, res) {
                            if (err) {
                                console.log(JSON.stringify(err));
                            }

                            console.log(client);
                            console.log(res);
                        });
                    } else {
                        r.db("Clientes").table("ap").get(result[0]).replace(function (row) {
                            return r.branch(
                                    row.eq(null),
                                    {
                                        "BSSID": result[0],
                                        "disp": [{
                                                name: client,
                                                "antena": [{
                                                        "First_time_seen": (typeof result[1] === "undefined") ? "" : result[1],
                                                        "Last_time_seen": (typeof result[2] === "undefined") ? "" : result[2],
                                                        "channel": (typeof result[3] === "undefined") ? "" : result[3],
                                                        "Speed": (typeof result[4] === "undefined") ? "" : result[4],
                                                        "Privacy": (typeof result[5] === "undefined") ? "" : result[5],
                                                        "Cipher": (typeof result[6] === "undefined") ? "" : (typeof result[6].split(" ")[0] === "undefined") ? "" : result[6].split(" ")[0],
                                                        "Authentication": (typeof result[6] === "undefined") ? "" : (typeof result[6].split(" ")[1] === "undefined") ? "" : result[6].split(" ")[1],
                                                        "Power": (typeof result[7] === "undefined") ? "" : result[7],
                                                        "beacons": (typeof result[8] === "undefined") ? "" : result[8],
                                                        "IV": (typeof result[9] === "undefined") ? "" : result[9],
                                                        "LAN_IP": (typeof result[10] === "undefined") ? "" : result[10],
                                                        "ID_length": (typeof result[11] === "undefined") ? "" : result[11],
                                                        "ESSID": (typeof result[12] === "undefined") ? "" : result[12],
                                                        "key": (typeof result[13] === "undefined") ? "" : result[13]
                                                    }]
                                            }]
                                    },
                            r.branch(
                                    row("disp")("name").contains(client),
                                    row.merge({
                                        "disp": row('disp').map(function (d) {
                                            return r.branch(d('name').eq(client).default(false), d.merge({antena: d('antena').append({
                                                    "First_time_seen": (typeof result[1] === "undefined") ? "" : result[1],
                                                    "Last_time_seen": (typeof result[2] === "undefined") ? "" : result[2],
                                                    "channel": (typeof result[3] === "undefined") ? "" : result[3],
                                                    "Speed": (typeof result[4] === "undefined") ? "" : result[4],
                                                    "Privacy": (typeof result[5] === "undefined") ? "" : result[5],
                                                    "Cipher": (typeof result[6] === "undefined") ? "" : (typeof result[6].split(" ")[0] === "undefined") ? "" : result[6].split(" ")[0],
                                                    "Authentication": (typeof result[6] === "undefined") ? "" : (typeof result[6].split(" ")[1] === "undefined") ? "" : result[6].split(" ")[1],
                                                    "Power": (typeof result[7] === "undefined") ? "" : result[7],
                                                    "beacons": (typeof result[8] === "undefined") ? "" : result[8],
                                                    "IV": (typeof result[9] === "undefined") ? "" : result[9],
                                                    "LAN_IP": (typeof result[10] === "undefined") ? "" : result[10],
                                                    "ID_length": (typeof result[11] === "undefined") ? "" : result[11],
                                                    "ESSID": (typeof result[12] === "undefined") ? "" : result[12],
                                                    "key": (typeof result[13] === "undefined") ? "" : result[13]
                                                })}), d);
                                        })}),
                                    {
                                        "BSSID": result[0],
                                        "disp": row('disp').append({
                                            name: client,
                                            "antena": [{
                                                    "First_time_seen": (typeof result[1] === "undefined") ? "" : result[1],
                                                    "Last_time_seen": (typeof result[2] === "undefined") ? "" : result[2],
                                                    "channel": (typeof result[3] === "undefined") ? "" : result[3],
                                                    "Speed": (typeof result[4] === "undefined") ? "" : result[4],
                                                    "Privacy": (typeof result[5] === "undefined") ? "" : result[5],
                                                    "Cipher": (typeof result[6] === "undefined") ? "" : (typeof result[6].split(" ")[0] === "undefined") ? "" : result[6].split(" ")[0],
                                                    "Authentication": (typeof result[6] === "undefined") ? "" : (typeof result[6].split(" ")[1] === "undefined") ? "" : result[6].split(" ")[1],
                                                    "Power": (typeof result[7] === "undefined") ? "" : result[7],
                                                    "beacons": (typeof result[8] === "undefined") ? "" : result[8],
                                                    "IV": (typeof result[9] === "undefined") ? "" : result[9],
                                                    "LAN_IP": (typeof result[10] === "undefined") ? "" : result[10],
                                                    "ID_length": (typeof result[11] === "undefined") ? "" : result[11],
                                                    "ESSID": (typeof result[12] === "undefined") ? "" : result[12],
                                                    "key": (typeof result[13] === "undefined") ? "" : result[13]
                                                }]
                                        })
                                    }))
                        }).run(connection, function (err, res) {
                            if (err) {
                                console.log(JSON.stringify(err));
                            }

                            console.log(client);
                            console.log(res);
                        });
                    }
                } else {
                    if (line[0] == "a" && line[1] == "n" && line[2] == "t") {
                        this.clienteSend = line;

                        console.log(this.clienteSend);
                    }
                }
            }
            console.log('--------------------------------------------------------');
        });
        // Add a 'close' event handler to this instance of socket
        sock.on('disconnect', function (data) {
            console.log('CLOSED: ' + sock.remoteAddress + ' ' + sock.remotePort);
        });
    });


    // Listen to new device being inserted
    r.db("Teste").table("cliente").changes().run()
            .then(function (cursor) {
                cursor.each(function (err, row) {
                    socket.emit('newDevice', row.disp);
                });
            })
            .catch(function (err) {
                console.log('err', err);
            });

    console.log('Server listening on : ' + this.port);
};
//excepcoes para os erros encontrados
//process.on('uncaughtException', function (err) {
//    console.log('Excepcao capturada: ' + err);
//});
module.exports = ServerSocket;