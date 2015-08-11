/* global module */

var r = require('rethinkdb');
var connectdb = require("./ConnectDb");

var self = this;

module.exports.insertActiveAnt = function (client, latitude, longitude, local) {
  r.connect(self.dbData).then(function (conn) {
    return r.db(self.dbConfig.db).table("ActiveAnt").get(client).replace(function (row) {
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
    }).run(conn)
            .finally(function () {
              conn.close();
            });
  }).then(function (output) {
//    console.log("Query output:", output);
  }).error(function (err) {
    console.log("***************** Active Ant **************************");
    console.log("Failed:", err);
  });
};

module.exports.updateActiveAnt = function (client) {
  r.connect(self.dbData).then(function (conn) {
    return  r.db(self.dbConfig.db)
            .table("ActiveAnt")
            .get(client)
            .update({
              "data": r.now().inTimezone("+01:00")
            }).run(conn)
            .finally(function () {
              conn.close();
            });
  }).then(function (output) {
//    console.log("Query output:", output);
  }).error(function (err) {
    console.log("***************** Active Ant Update **************************");
    console.log("Failed:", err);
  });
};