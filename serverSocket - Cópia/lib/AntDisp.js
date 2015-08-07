/* global module, client */

var r = require('rethinkdb');
var connectdb = require("./ConnectDb");

var self = this;

module.exports.insertAntDisp = function (valuesHst, client) {
  connectdb.onConnect(function (err, conn) {
    r.db(self.dbConfig.db).table("AntDisp").get(client).replace(function (row) {
      return r.branch(
              row.eq(null),
              {
                "nomeAntena": client,
                "host": [{"macAddress": valuesHst[0],
                    "data": r.now().inTimezone("+01:00").toEpochTime(),
                    "Power": (typeof valuesHst[3] == "undefined") ? "" : valuesHst[3],
                    "BSSID": (typeof valuesHst[5] == "undefined") ? "" : valuesHst[5].replace(/,| /g, ""),
                    "nameVendor": r.db(self.dbConfig.db).table("tblPrefix").get(valuesHst[0].substring(0, 8)).getField("vendor").default("")
                  }]
              },
      r.branch(
              row("host")("macAddress").contains(valuesHst[0]),
              row.merge({
                "host": row("host").map(function (d) {
                  return r.branch(
                          d("macAddress").eq(valuesHst[0]).default(false),
                          {
                            "macAddress": valuesHst[0],
                            "data": r.now().inTimezone("+01:00").toEpochTime(),
                            "Power": (typeof valuesHst[3] == "undefined") ? "" : valuesHst[3],
                            "BSSID": (typeof valuesHst[5] == "undefined") ? "" : valuesHst[5].replace(/,| /g, ""),
                            "nameVendor": r.db(self.dbConfig.db).table("tblPrefix").get(valuesHst[0].substring(0, 8)).getField("vendor").default("")
                          },
                  d);
                })}),
              {
                "nomeAntena": client,
                "host": row("host").append({
                  "macAddress": valuesHst[0],
                  "data": r.now().inTimezone("+01:00").toEpochTime(),
                  "Power": (typeof valuesHst[3] == "undefined") ? "" : valuesHst[3],
                  "BSSID": (typeof valuesHst[5] == "undefined") ? "" : valuesHst[5].replace(/,| /g, ""),
                  "nameVendor": r.db(self.dbConfig.db).table("tblPrefix").get(valuesHst[0].substring(0, 8)).getField("vendor").default("")
                })}));
    }, {nonAtomic: true}).run(conn, function (err, result) {
      if (err) {
        console.log("ERROR: %s:%s", err.name, err.msg);
      }
//      console.log(result);
      conn.close();
    });
  });
};