/* global process, module, assert */

var net = require('net');
var r = require('rethinkdb');
var clienteSend = "";
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
r.connect({
    host: dbConfig.host,
    port: dbConfig.port}, function (err, conn) {
    if (err) {
        throw err;
    }
    connection = conn;
    console.log("Connected to ReThinkdb DataBase.");
});
var HOST = '192.168.41.1';
var PORT = 8888;
// Create a server instance, and chain the listen function to it
// The function passed to net.createServer() becomes the event handler for the 'connection' event
// The sock object the callback function receives UNIQUE for each connection
net.createServer(function (sock) {
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
    // We have a connection - a socket object is assigned to the connection automatically
    console.log('CONNECTED: ' + sock.remoteAddress + ':' + sock.remotePort);
    // Add a 'data' event handler to this instance of socket
    sock.on('data', function (data) {

//        console.log('DATA ' + sock.remoteAddress + ':\n' + data);
//console.log("-" + data.toString() + "-");
        var aux = data.toString();
        var resultLine = aux.split("\r\n");
        for (var i = 0, max = resultLine.length; i < max; i++) {
            var line = resultLine[i];
            if (line[2] == ":" && line.length > 4) {
                var result = line.split(", ");
                if (result.length < 7) {
                    r.db(dbConfig.db).table("cliente")
                            .insert({
                                "macCliente": result[0],
//                                "disp": [{
//                                        name: clienteSend,
                                        "values": [{
                                                "First_time": (typeof result[1] === "undefined") ? "" : result[1],
                                                "Last_time": (typeof result[2] === "undefined") ? "" : result[2],
                                                "Power": (typeof result[3] === "undefined") ? "" : result[3],
                                                "packets": (typeof result[4] === "undefined") ? "" : result[4],
                                                "BSSID": (typeof result[5] === "undefined") ? "" : result[5],
                                                "Probed_ESSIDs": (typeof result[6] === "undefined") ? "" : result[6]
                                            }]
//                                    }]
                            }).run(connection, function (err, res) {
//                        if (err) {
//                            console.log(JSON.stringify(err));
//                        }
//                        console.log(res);
                        if (typeof res != "undefined") {
                            if (res.errors == 1) {
                                r.db(dbConfig.db).table("cliente")
                                        .get(result[0])
                                        .update({
                                            "values": r.row("values").append({
                                                "First_time": (typeof result[1] === "undefined") ? "" : result[1],
                                                "Last_time": (typeof result[2] === "undefined") ? "" : result[2],
                                                "Power": (typeof result[3] === "undefined") ? "" : result[3],
                                                "packets": (typeof result[4] === "undefined") ? "" : result[4],
                                                "BSSID": (typeof result[5] === "undefined") ? "" : result[5],
                                                "Probed_ESSIDs": (typeof result[6] === "undefined") ? "" : result[6]
                                            })
                                        }).run(connection, function (err, result) {
                                    if (err) {
                                        console.log(JSON.stringify(err));
                                    }
                                    console.log(result);
                                });
                            }
                        }
                    });
                } else {
//                    r.db(dbConfig.db).table("ap")
//                            .insert({
//                                "BSSID": result[0],
////                                "disp": [{
////                                        name: clienteSend,
//                                "antena": [{
//                                        "First_time_seen": (typeof result[1] === "undefined") ? "" : result[1],
//                                        "Last_time_seen": (typeof result[2] === "undefined") ? "" : result[2],
//                                        "channel": (typeof result[3] === "undefined") ? "" : result[3],
//                                        "Speed": (typeof result[4] === "undefined") ? "" : result[4],
//                                        "Privacy": (typeof result[5] === "undefined") ? "" : result[5],
//                                        "Cipher": (typeof result[6].split(" ")[0] === "undefined") ? "" : result[6].split(" ")[0],
//                                        "Authentication": (typeof result[6].split(" ")[1] === "undefined") ? "" : result[6].split(" ")[1],
//                                        "Power": (typeof result[7] === "undefined") ? "" : result[7],
//                                        "beacons": (typeof result[8] === "undefined") ? "" : result[8],
//                                        "IV": (typeof result[9] === "undefined") ? "" : result[9],
//                                        "LAN_IP": (typeof result[10] === "undefined") ? "" : result[10],
//                                        "ID_length": (typeof result[11] === "undefined") ? "" : result[11],
//                                        "ESSID": (typeof result[12] === "undefined") ? "" : result[12],
//                                        "key": (typeof result[13] === "undefined") ? "" : result[13]
//                                    }]
////                                    }]
//                            }).run(connection, function (err, result) {
////                        if (err) {
////                            console.log(JSON.stringify(err));
////                        }
////                        console.log(result);
//                        if (typeof res != "undefined") {
//                            if (res.errors == 1) {
//                                r.db(dbConfig.db).table("ap")
//                                        .get(result[0])
//                                        .update({
//                                            "antena": r.row("antena").append({
//                                                "First_time_seen": (typeof result[1] === "undefined") ? "" : result[1],
//                                                "Last_time_seen": (typeof result[2] === "undefined") ? "" : result[2],
//                                                "channel": (typeof result[3] === "undefined") ? "" : result[3],
//                                                "Speed": (typeof result[4] === "undefined") ? "" : result[4],
//                                                "Privacy": (typeof result[5] === "undefined") ? "" : result[5],
//                                                "Cipher": (typeof result[6].split(" ")[0] === "undefined") ? "" : result[6].split(" ")[0],
//                                                "Authentication": (typeof result[6].split(" ")[1] === "undefined") ? "" : result[6].split(" ")[1],
//                                                "Power": (typeof result[7] === "undefined") ? "" : result[7],
//                                                "beacons": (typeof result[8] === "undefined") ? "" : result[8],
//                                                "IV": (typeof result[9] === "undefined") ? "" : result[9],
//                                                "LAN_IP": (typeof result[10] === "undefined") ? "" : result[10],
//                                                "ID_length": (typeof result[11] === "undefined") ? "" : result[11],
//                                                "ESSID": (typeof result[12] === "undefined") ? "" : result[12],
//                                                "key": (typeof result[13] === "undefined") ? "" : result[13]
//                                            })
//                                        }).run(connection, function (err, result) {
//                                    if (err) {
//                                        console.log(JSON.stringify(err));
//                                    }
//                                    console.log(result);
//                                });
//                            }
//                        }
//                    });
                }
//                console.log("-- " + clienteSend);
//                for (var i = 0, max = result.length; i < max; i++) {
//                    console.log(i + "   - " + result[i]);
//                }
            } else {
                if (line[0] == "a") {
                    clienteSend = line;
                }
                console.log(line);
            }
        }
        console.log('--------------------------------------------------------');
    });
// Add a 'close' event handler to this instance of socket
    sock.on('disconnect', function (data) {
        console.log('CLOSED: ' + sock.remoteAddress + ' ' + sock.remotePort);
    });
}).listen(PORT);
console.log('Server listening on ' + HOST + ':' + PORT);
//excepcoes para os erros encontrados
//process.on('uncaughtException', function (err) {
//    console.log('Excepcao capturada: ' + err);
//});