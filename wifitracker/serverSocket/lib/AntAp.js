/* global module */

var r = require('rethinkdb');
var connectdb = require("./ConnectDb");

var self = this;

module.exports.insertAntAp = function (valuesAp, client) {
  connectdb.onConnect(function (err, conn) {
    r.db(self.dbConfig.db).table("AntAp").get(client).replace(function (row) {
      return r.branch(
              row.eq(null),
              {
                "nomeAntena": client,
                "host": [{
                    "macAddress": valuesAp[0],
                    "channel": (typeof valuesAp[3] == "undefined") ? "" : valuesAp[3],
                    "Privacy": (typeof valuesAp[5] == "undefined") ? "" : valuesAp[5],
                    "Cipher": (valuesAp.length == 14) ? ((typeof valuesAp[6] == "undefined") ? "" : (typeof valuesAp[6].split(",")[0] == "undefined") ? "" : valuesAp[6].split(",")[0]) : valuesAp[6],
                    "Authentication": (valuesAp.length == 14) ? ((typeof valuesAp[6] == "undefined") ? "" : (typeof valuesAp[6].split(",")[1] == "undefined") ? "" : valuesAp[6].split(",")[1]) : valuesAp[7],
                    "ESSID": (valuesAp.length == 14) ? ((typeof valuesAp[12] == "undefined") ? "" : valuesAp[12]) : ((typeof valuesAp[13] == "undefined") ? "" : valuesAp[13]),
                    "data": r.now().inTimezone("+01:00"),
                    "Power": (valuesAp.length == 14) ? ((typeof valuesAp[7] == "undefined") ? "" : valuesAp[7]) : ((typeof valuesAp[8] == "undefined") ? "" : valuesAp[8]),
                    "nameVendor": r.db(self.dbConfig.db).table("tblPrefix").get(valuesAp[0].substring(0, 8)).getField("vendor").default("")
                  }]
              },
      r.branch(
              row("host")("macAddress").contains(valuesAp[0]),
              row.merge({
                "host": row("host").map(function (d) {
                  return r.branch(
                          d("macAddress").eq(valuesAp[0]).default(false),
                          {
                            "macAddress": valuesAp[0],
                            "channel": (typeof valuesAp[3] == "undefined") ? "" : valuesAp[3],
                            "Privacy": (typeof valuesAp[5] == "undefined") ? "" : valuesAp[5], "Cipher": (valuesAp.length == 14) ? ((typeof valuesAp[6] == "undefined") ? "" : (typeof valuesAp[6].split(",")[0] == "undefined") ? "" : valuesAp[6].split(",")[0]) : valuesAp[6],
                            "Authentication": (valuesAp.length == 14) ? ((typeof valuesAp[6] == "undefined") ? "" : (typeof valuesAp[6].split(",")[1] == "undefined") ? "" : valuesAp[6].split(",")[1]) : valuesAp[7],
                            "ESSID": (valuesAp.length == 14) ? ((typeof valuesAp[12] == "undefined") ? "" : valuesAp[12]) : ((typeof valuesAp[13] == "undefined") ? "" : valuesAp[13]),
                            "data": r.now().inTimezone("+01:00"),
                            "Power": (valuesAp.length == 14) ? ((typeof valuesAp[7] == "undefined") ? "" : valuesAp[7]) : ((typeof valuesAp[8] == "undefined") ? "" : valuesAp[8]),
                            "nameVendor": r.db(self.dbConfig.db).table("tblPrefix").get(valuesAp[0].substring(0, 8)).getField("vendor").default("")
                          }, d)
                })
              }),
              {
                "nomeAntena": client,
                "host": row("host").append({
                  "macAddress": valuesAp[0], "channel": (typeof valuesAp[3] == "undefined") ? "" : valuesAp[3],
                  "Privacy": (typeof valuesAp[5] == "undefined") ? "" : valuesAp[5],
                  "Cipher": (valuesAp.length == 14) ? ((typeof valuesAp[6] == "undefined") ? "" : (typeof valuesAp[6].split(",")[0] == "undefined") ? "" : valuesAp[6].split(",")[0]) : valuesAp[6],
                  "Authentication": (valuesAp.length == 14) ? ((typeof valuesAp[6] == "undefined") ? "" : (typeof valuesAp[6].split(",")[1] == "undefined") ? "" : valuesAp[6].split(",")[1]) : valuesAp[7],
                  "ESSID": (valuesAp.length == 14) ? ((typeof valuesAp[12] == "undefined") ? "" : valuesAp[12]) : ((typeof valuesAp[13] == "undefined") ? "" : valuesAp[13]),
                  "data": r.now().inTimezone("+01:00"),
                  "Power": (valuesAp.length == 14) ? ((typeof valuesAp[7] == "undefined") ? "" : valuesAp[7]) : ((typeof valuesAp[8] == "undefined") ? "" : valuesAp[8]),
                  "nameVendor": r.db(self.dbConfig.db).table("tblPrefix").get(valuesAp[0].substring(0, 8)).getField("vendor").default("")
                })}));
    }, {nonAtomic: true}).run(conn, function (err, result) {
      if (err) {
        console.log("ERROR: %s:%s", err.name, err.msg);
      }
      console.log(result);
      conn.close();
    });
  });
};