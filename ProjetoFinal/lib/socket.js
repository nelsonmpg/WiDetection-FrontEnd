/* global process, module, assert, result */

var net = require('net');
var connection = null;
var dbConfig = "";
var r;

var ServerSocket = function (port, dbr, con, configdb) {
    this.port = port;
    this.net = require('net');
    this.serverSck = net.createServer(this.net);
    this.clienteSend = "default";
    r = dbr;
    connection = con;
    dbConfig = configdb;
};

ServerSocket.prototype.start = function () {
    this.serverSck.listen(this.port);

    this.serverSck.on('connection', function (sock) {

        // We have a connection - a socket object is assigned to the connection automatically
        console.log('CONNECTED: IP - ' + sock.remoteAddress + ' Port - ' + sock.remotePort);

        // Add a 'data' event handler to this instance of socket
        sock.on('data', function (data) {
            var client = this.clienteSend;
            var aux = data.toString();
            var resultLine = aux.split("\r\n");
            for (var i in resultLine) {
                var line = resultLine[i];
                if (line[2] == ":" && line.length > 4) {
                    var result = line.split(", ");
                    if (result.length < 8) {
                        var valsHost = result;
                        r.db(dbConfig.db).table("cliente").get(valsHost[0]).replace(function (row) {
                            return r.branch(
                                    row.eq(null),
                                    {
                                        "macAddress": valsHost[0],
                                        "nameVendor": r.db(dbConfig.db).table("tblPrefix").get(valsHost[0].substring(0, 8)).getField("vendor").default(""),
                                        "disp": [{
                                                name: client,
                                                "values": [{
                                                        "First_time": r.now(), //(typeof valsHost[1] == "undefined") ? "" : valsHost[1],
                                                        "Last_time": r.now(), //(typeof valsHost[2] == "undefined") ? "" : valsHost[2],
                                                        "Power": (typeof valsHost[3] == "undefined") ? "" : valsHost[3],
                                                        "packets": (typeof valsHost[4] == "undefined") ? "" : valsHost[4],
                                                        "BSSID": (typeof valsHost[5] == "undefined") ? "" : valsHost[5],
                                                        "Probed_ESSIDs": (typeof valsHost[6] == "undefined") ? "" : valsHost[6]
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
                                                            "First_time": r.db(dbConfig.db).table("cliente").get(valsHost[0]).do(function (row) {
                                                                return  row("disp")("values").nth(0).getField("First_time")
                                                            }).limit(1).nth(0),
                                                            "Last_time": r.now(),
                                                            "Power": (typeof valsHost[3] == "undefined") ? "" : valsHost[3],
                                                            "packets": (typeof valsHost[4] == "undefined") ? "" : valsHost[4],
                                                            "BSSID": (typeof valsHost[5] == "undefined") ? "" : valsHost[5],
                                                            "Probed_ESSIDs": (typeof valsHost[6] == "undefined") ? "" : valsHost[6]
                                                        })}),
                                                    d);
                                        })}),
                                    {
                                        "macAddress": valsHost[0],
                                        "nameVendor": r.db(dbConfig.db).table("tblPrefix").get(valsHost[0].substring(0, 8)).getField("vendor").default(""),
                                        "disp": row("disp").append({
                                            "name": client,
                                            "values": [{
                                                    "First_time": r.now(), //(typeof valsHost[1] == "undefined") ? "" : valsHost[1],
                                                    "Last_time": r.now(), //(typeof valsHost[2] == "undefined") ? "" : valsHost[2],
                                                    "Power": (typeof valsHost[3] == "undefined") ? "" : valsHost[3],
                                                    "packets": (typeof valsHost[4] == "undefined") ? "" : valsHost[4],
                                                    "BSSID": (typeof valsHost[5] == "undefined") ? "" : valsHost[5],
                                                    "Probed_ESSIDs": (typeof valsHost[6] == "undefined") ? "" : valsHost[6]
                                                }]
                                        })
                                    }))
                        }, {nonAtomic: true}).run(connection, function (err, res) {
                            if (err) {
                                console.log(JSON.stringify(err));
                            }

//                            console.log(client);
                            console.log(res);
                        });
                    } else {
                        var valsAp = result;
                        r.db(dbConfig.db).table("ap").get(valsAp[0]).replace(function (row) {
                            return r.branch(
                                    row.eq(null),
                                    {
                                        "macAddress": valsAp[0],
                                        "nameVendor": r.db(dbConfig.db).table("tblPrefix").get(valsAp[0].substring(0, 8)).getField("vendor").default(""),
                                        "disp": [{
                                                name: client,
                                                "values": [{
                                                        "First_time": r.now(),
                                                        "Last_time": r.now(),
                                                        "channel": (typeof valsAp[3] == "undefined") ? "" : valsAp[3],
                                                        "Speed": (typeof valsAp[4] == "undefined") ? "" : valsAp[4],
                                                        "Privacy": (typeof valsAp[5] == "undefined") ? "" : valsAp[5],
                                                        "Cipher": (valsAp.length == 14) ? ((typeof valsAp[6] == "undefined") ? "" : (typeof valsAp[6].split(",")[0] == "undefined") ? "" : valsAp[6].split(",")[0]) : valsAp[6],
                                                        "Authentication": (valsAp.length == 14) ? ((typeof valsAp[6] == "undefined") ? "" : (typeof valsAp[6].split(",")[1] == "undefined") ? "" : valsAp[6].split(",")[1]) : valsAp[7],
                                                        "Power": (valsAp.length == 14) ? ((typeof valsAp[7] == "undefined") ? "" : valsAp[7]) : ((typeof valsAp[8] == "undefined") ? "" : valsAp[8]),
                                                        "beacons": (valsAp.length == 14) ? ((typeof valsAp[8] == "undefined") ? "" : valsAp[8]) : ((typeof valsAp[9] == "undefined") ? "" : valsAp[9]),
                                                        "IV": (valsAp.length == 14) ? ((typeof valsAp[9] == "undefined") ? "" : valsAp[9]) : ((typeof valsAp[10] == "undefined") ? "" : valsAp[10]),
                                                        "LAN_IP": (valsAp.length == 14) ? ((typeof valsAp[10] == "undefined") ? "" : valsAp[10]) : ((typeof valsAp[11] == "undefined") ? "" : valsAp[11]),
                                                        "ID_length": (valsAp.length == 14) ? ((typeof valsAp[11] == "undefined") ? "" : valsAp[11]) : ((typeof valsAp[12] == "undefined") ? "" : valsAp[12]),
                                                        "ESSID": (valsAp.length == 14) ? ((typeof valsAp[12] == "undefined") ? "" : valsAp[12]) : ((typeof valsAp[13] == "undefined") ? "" : valsAp[13]),
                                                        "key": (valsAp.length == 14) ? ((typeof valsAp[13] == "undefined") ? "" : valsAp[13]) : ((typeof valsAp[14] == "undefined") ? "" : valsAp[14])
                                                    }]
                                            }]
                                    },
                            r.branch(
                                    row("disp")("name").contains(client),
                                    row.merge({
                                        "disp": row('disp').map(function (d) {
                                            return r.branch(d('name').eq(client).default(false), d.merge({values: d("values").append({
                                                    "First_time": r.db(dbConfig.db).table("ap").get(valsAp[0]).do(function (row) {
                                                        return  row("disp")("values").nth(0).getField("First_time")
                                                    }).limit(1).nth(0),
                                                    "Last_time": r.now(),
                                                    "channel": (typeof valsAp[3] == "undefined") ? "" : valsAp[3],
                                                    "Speed": (typeof valsAp[4] == "undefined") ? "" : valsAp[4],
                                                    "Privacy": (typeof valsAp[5] == "undefined") ? "" : valsAp[5],
                                                    "Cipher": (valsAp.length == 14) ? ((typeof valsAp[6] == "undefined") ? "" : (typeof valsAp[6].split(",")[0] == "undefined") ? "" : valsAp[6].split(",")[0]) : valsAp[6],
                                                    "Authentication": (valsAp.length == 14) ? ((typeof valsAp[6] == "undefined") ? "" : (typeof valsAp[6].split(",")[1] == "undefined") ? "" : valsAp[6].split(",")[1]) : valsAp[7],
                                                    "Power": (valsAp.length == 14) ? ((typeof valsAp[7] == "undefined") ? "" : valsAp[7]) : ((typeof valsAp[8] == "undefined") ? "" : valsAp[8]),
                                                    "beacons": (valsAp.length == 14) ? ((typeof valsAp[8] == "undefined") ? "" : valsAp[8]) : ((typeof valsAp[9] == "undefined") ? "" : valsAp[9]),
                                                    "IV": (valsAp.length == 14) ? ((typeof valsAp[9] == "undefined") ? "" : valsAp[9]) : ((typeof valsAp[10] == "undefined") ? "" : valsAp[10]),
                                                    "LAN_IP": (valsAp.length == 14) ? ((typeof valsAp[10] == "undefined") ? "" : valsAp[10]) : ((typeof valsAp[11] == "undefined") ? "" : valsAp[11]),
                                                    "ID_length": (valsAp.length == 14) ? ((typeof valsAp[11] == "undefined") ? "" : valsAp[11]) : ((typeof valsAp[12] == "undefined") ? "" : valsAp[12]),
                                                    "ESSID": (valsAp.length == 14) ? ((typeof valsAp[12] == "undefined") ? "" : valsAp[12]) : ((typeof valsAp[13] == "undefined") ? "" : valsAp[13]),
                                                    "key": (valsAp.length == 14) ? ((typeof valsAp[13] == "undefined") ? "" : valsAp[13]) : ((typeof valsAp[14] == "undefined") ? "" : valsAp[14])
                                                })}), d);
                                        })}),
                                    {
                                        "macAddress": valsAp[0],
                                        "nameVendor": r.db(dbConfig.db).table("tblPrefix").get(valsAp[0].substring(0, 8)).getField("vendor").default(""),
                                        "disp": row('disp').append({
                                            name: client,
                                            "values": [{
                                                    "First_time": r.now(), //(typeof valsAp[1] == "undefined") ? "" : valsAp[1],
                                                    "Last_time": r.now(), //(typeof valsAp[2] == "undefined") ? "" : valsAp[2],
                                                    "channel": (typeof valsAp[3] == "undefined") ? "" : valsAp[3],
                                                    "Speed": (typeof valsAp[4] == "undefined") ? "" : valsAp[4],
                                                    "Privacy": (typeof valsAp[5] == "undefined") ? "" : valsAp[5],
                                                    "Cipher": (valsAp.length == 14) ? ((typeof valsAp[6] == "undefined") ? "" : (typeof valsAp[6].split(",")[0] == "undefined") ? "" : valsAp[6].split(",")[0]) : valsAp[6],
                                                    "Authentication": (valsAp.length == 14) ? ((typeof valsAp[6] == "undefined") ? "" : (typeof valsAp[6].split(",")[1] == "undefined") ? "" : valsAp[6].split(",")[1]) : valsAp[7],
                                                    "Power": (valsAp.length == 14) ? ((typeof valsAp[7] == "undefined") ? "" : valsAp[7]) : ((typeof valsAp[8] == "undefined") ? "" : valsAp[8]),
                                                    "beacons": (valsAp.length == 14) ? ((typeof valsAp[8] == "undefined") ? "" : valsAp[8]) : ((typeof valsAp[9] == "undefined") ? "" : valsAp[9]),
                                                    "IV": (valsAp.length == 14) ? ((typeof valsAp[9] == "undefined") ? "" : valsAp[9]) : ((typeof valsAp[10] == "undefined") ? "" : valsAp[10]),
                                                    "LAN_IP": (valsAp.length == 14) ? ((typeof valsAp[10] == "undefined") ? "" : valsAp[10]) : ((typeof valsAp[11] == "undefined") ? "" : valsAp[11]),
                                                    "ID_length": (valsAp.length == 14) ? ((typeof valsAp[11] == "undefined") ? "" : valsAp[11]) : ((typeof valsAp[12] == "undefined") ? "" : valsAp[12]),
                                                    "ESSID": (valsAp.length == 14) ? ((typeof valsAp[12] == "undefined") ? "" : valsAp[12]) : ((typeof valsAp[13] == "undefined") ? "" : valsAp[13]),
                                                    "key": (valsAp.length == 14) ? ((typeof valsAp[13] == "undefined") ? "" : valsAp[13]) : ((typeof valsAp[14] == "undefined") ? "" : valsAp[14])
                                                }]
                                        })
                                    }))
                        }, {nonAtomic: true}).run(connection, function (err, res) {
                            if (err) {
                                console.log(JSON.stringify(err));
                            }
//                            console.log(client);
                            console.log(res);
                        });
                    }
                } else {
                    if (line[0] == "a" && line[1] == "n" && line[2] == "t") {
                        this.clienteSend = line.replace(/(\r\n|\n|\r)/gm, "");

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


    console.log('Server Socket Wait : ' + this.port);
};
//excepcoes para os erros encontrados
//process.on('uncaughtException', function (err) {
//    console.log('Excepcao capturada: ' + err);
//});
module.exports = ServerSocket;