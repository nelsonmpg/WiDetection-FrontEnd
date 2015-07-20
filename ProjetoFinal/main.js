var cp = require('child_process');
var http = require('http');
var r = require('rethinkdb');
var dbData;
var url = "http://web.stanford.edu/dept/its/projects/desktop/snsr/nmap-mac-prefixes.txt";

var dbConfig = {
  host: '185.15.22.55',
  port: 28015,
  db: 'ProjetoFinal',
  tables: {
    'DispMoveis': 'macAddress',
    'DispAp': 'macAddress',
    "AntDisp": "nomeAntena",
    "AntAp": "nomeAntena",
    "ActiveAnt": "nomeAntena",
    "tblPrefix": "prefix"
  }
};

dbData = {
  host: dbConfig.host,
  port: dbConfig.port}, function (err, conn) {
  if (err) {
    throw err;
  }
  console.log("Connected to ReThinkdb DataBase.");
};

function startServers() {
  var args1 = {port: 8080, configdb: dbConfig};
  var child1 = cp.fork('./lib/server');
  child1.send(args1);

  var args2 = {port: 8888, configdb: dbConfig};
  var child2 = cp.fork('./lib/socket');
  child2.send(args2);

  console.log("****************** Servers Start ******************");
}

r.connect({host: dbConfig.host, port: dbConfig.port}, function (err, connection) {
  return r.dbCreate(dbConfig.db).run(connection, function (err, result) {
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
}).then(function (output) {
  r.connect(dbData).then(function (conn) {
    return r.db(dbConfig.db)
            .wait()("status_changes")("new_val")("status")("ready_for_writes").run(conn)
            .finally(function () {
              conn.close();
            });
  }).then(function (resul) {
    console.log("Tabela 'tblPrefix' Ok - " + resul);
    carregarPrefixos();
  }).error(function (err) {
    console.log(err);
  });
}).error(function (err) {
  console.log(err);
});

function carregarPrefixos() {

//r.connect(dbData).then(function (conn) {
//    return r.db(dbConfig.db).table('ActiveAnt').delete().run(conn)
//            .finally(function () {
//                conn.close();
//            });
//}).then(function (output) {
//    console.log(output);
//}).error(function (err) {
//    console.log(err);
//});

  r.connect(dbData).then(function (conn) {
    return r.db(dbConfig.db).table("tblPrefix").coerceTo("array").count().run(conn)
            .finally(function () {
              conn.close();
            });
  }).then(function (resul) {
    // teste se a tabela dos prefixos esta vazia
    if (!(resul > 0) || typeof resul == "undefined") {
      download(url, function (data) {
        if (data) {
          var lines = data.split("\n");
          var docsInsert = [];
          for (var i in lines) {
            var line = lines[i].trim();
            if (line[0] != "#" && line.length > 5) {
              var prefix = line.substring(0, 6);
              var vendor = line.substring(7, line.length);
              var keyPrefix = prefix.substr(0, 2) + ":" + prefix.substr(2, 2) + ":" + prefix.substr(4);
              docsInsert.push({
                "prefix": keyPrefix,
                "vendor": vendor
              });
            }
          }
          r.connect(dbData).then(function (conn) {
            return r.db(dbConfig.db).table("tblPrefix").insert(docsInsert).run(conn)
                    .finally(function () {
                      conn.close();
                    });
          }).then(function (output) {
            console.log("Query output:", output);
          }).error(function (err) {
            console.log("Failed:", err);
          });
//                    startServers();
        } else {
          console.log("error");
        }
      });
    }
    startServers();
  }).error(function (err) {
    console.log(err);
  });
}


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
