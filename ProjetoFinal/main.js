var cp = require('child_process');
var Server = require('./lib/server');
var ServerSocket = require('./lib/socket');
var r = require('rethinkdb');
var connection = null;
var dbConfig = {
    host: '185.15.22.55',
    port: 28015,
    db: 'Teste2',
    tables: {
        'cliente': 'macCliente',
        'ap': 'BSSID',
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
    });
});

setTimeout(function () {
    new ServerSocket(8888, r, connection, dbConfig).start();
    new Server(8080, r, connection, dbConfig).start();
}, 1000);
