var cp = require('child_process');
var http = require('http');
var Server = require('./lib/server');
var ServerSocket = require('./lib/socket');
var r = require('rethinkdb');

var url = "http://web.stanford.edu/dept/its/projects/desktop/snsr/nmap-mac-prefixes.txt";
var connection = null;
var dbConfig = {
    host: '185.15.22.55',
    port: 28015,
    db: 'Teste4',
    tables: {
        'cliente': 'macAddress',
        'ap': 'macAddress',
        "tblPrefix": "prefix"
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
        download(url, function (data) {
            if (data) {
                var lines = data.split("\n");
                for (var i in lines) {
                    var line = lines[i].trim();
                    if (line[0] != "#" && line.length > 5) {
                        var prefix = line.substring(0, 6);
                        var vendor = line.substring(7, line.length);
                        var keyPrefix = prefix.substr(0, 2) + ":" + prefix.substr(2, 2) + ":" + prefix.substr(4);
                        r.db(dbConfig.db).table("tblPrefix").get(keyPrefix).replace(function (row) {
                            return r.branch(
                                    row.eq(null),
                                    {
                                        "prefix": keyPrefix,
                                        "vendor": vendor
                                    }, row)
                        }).run(connection, function (err, resul) {
                            if (err) {
                                res.json(err);
                            }
//                            console.log(resul);
                        });
                    }
                }
            } else {
                console.log("error");
            }
        });
    });
});

setTimeout(function () {
    new ServerSocket(8888, r, connection, dbConfig).start();
    new Server(8080, r, connection, dbConfig).start();
}, 5000);

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
