/* global module */

var r = require('rethinkdb');
var connectdb = require("./ConnectDb");

var self = this;

module.exports.insertActiveAnt = function (client, latitude, longitude, local) {
  connectdb.onConnect(function (err, conn) {
    r.db(self.dbConfig.db).table("ActiveAnt").get(client).replace(function (row) {
      return r.branch(
              row.eq(null),
              {
                "nomeAntena": client,
                "latitude": latitude,
                "longitude": longitude,
                "local": local,
                "data": r.now().inTimezone("+01:00")
              },
      {
        "nomeAntena": client,
        "latitude": latitude,
        "longitude": longitude,
        "local": local,
        "data": r.now().inTimezone("+01:00")
      });
    }).run(conn, function (err, result) {
      if (err) {
        console.log("ERROR: %s:%s", err.name, err.msg);
      }
      console.log(result);
      conn.close();
    });
  });
};