/* global module */

var r = require('rethinkdb');
var connectdb = require("./ConnectDb");

var self = this;

module.exports.insertDispMovel = function (valsHost, client) {
  connectdb.onConnect(function (err, conn) {
    r.db(self.dbConfig.db).table("DispMoveis").get(valsHost[0]).replace(function (row) {
      return r.branch(
              row.eq(null),
              {
                "macAddress": valsHost[0],
                "nameVendor": r.db(self.dbConfig.db).table("tblPrefix").get(valsHost[0].substring(0, 8)).getField("vendor").default(""),
                "disp": [{
                    name: client,
                    "values": [{
                        "First_time": r.now().inTimezone("+01:00"), //(typeof valsHost[1] == "undefined") ? "" : valsHost[1],
                        "Last_time": r.now().inTimezone("+01:00"), //(typeof valsHost[2] == "undefined") ? "" : valsHost[2],
                        "Power": (typeof valsHost[3] == "undefined") ? "" : valsHost[3],
                        "packets": (typeof valsHost[4] == "undefined") ? "" : valsHost[4],
                        "BSSID": (typeof valsHost[5] == "undefined") ? "" : valsHost[5].replace(/,| /g, ""),
                        "Probed_ESSIDs": (typeof valsHost[6] == "undefined") ? "" : valsHost[6].split(",")
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
                              "First_time": r.db(self.dbConfig.db).table("DispMoveis").get(valsHost[0]).do(function (row) {
                                return  row("disp")("values").nth(0).getField("First_time");
                              }).limit(1).nth(0),
                              "Last_time": r.now().inTimezone("+01:00"),
                              "Power": (typeof valsHost[3] == "undefined") ? "" : valsHost[3],
                              "packets": (typeof valsHost[4] == "undefined") ? "" : valsHost[4],
                              "BSSID": (typeof valsHost[5] == "undefined") ? "" : valsHost[5].replace(/,| /g, ""),
                              "Probed_ESSIDs": (typeof valsHost[6] == "undefined") ? "" : r.db(self.dbConfig.db)
                                      .table("DispMoveis")
                                      .get(valsHost[0])
                                      .do(function (row) {
                                        return r.branch(
                                                row.eq(null),
                                                "",
                                                row("disp")
                                                .filter({"name": client})
                                                .do(function (row1) {
                                                  return r.branch(
                                                          row1.eq([]),
                                                          "",
                                                          row1.nth(0)("values")
                                                          .orderBy(r.desc("Last_time"))
                                                          .limit(1)("Probed_ESSIDs")
                                                          .nth(0)
                                                          .setUnion(valsHost[6].split(","))
                                                          );
                                                }));
                                      })})}),
                          d);
                })}),
              {"macAddress": valsHost[0],
                "nameVendor": r.db(self.dbConfig.db).table("tblPrefix").get(valsHost[0].substring(0, 8)).getField("vendor").default(""),
                "disp": row("disp").append({
                  "name": client,
                  "values": [{
                      "First_time": r.now().inTimezone("+01:00"), //(typeof valsHost[1] == "undefined") ? "" : valsHost[1],
                      "Last_time": r.now().inTimezone("+01:00"), //(typeof valsHost[2] == "undefined") ? "" : valsHost[2],
                      "Power": (typeof valsHost[3] == "undefined") ? "" : valsHost[3],
                      "packets": (typeof valsHost[4] == "undefined") ? "" : valsHost[4],
                      "BSSID": (typeof valsHost[5] == "undefined") ? "" : valsHost[5].replace(/,| /g, ""),
                      "Probed_ESSIDs": (typeof valsHost[6] == "undefined") ? "" : r.db(self.dbConfig.db)
                              .table("DispMoveis")
                              .get(valsHost[0])
                              .do(function (row) {
                                return r.branch(
                                        row.eq(null),
                                        "",
                                        row("disp")
                                        .filter({"name": client})
                                        .do(function (row1) {
                                          return r.branch(
                                                  row1.eq([]),
                                                  "",
                                                  row1.nth(0)("values")
                                                  .orderBy(r.desc("Last_time"))
                                                  .limit(1)("Probed_ESSIDs")
                                                  .nth(0)
                                                  .setUnion(valsHost[6].split(",")));
                                        }));
                              })}]})}));
    }, {nonAtomic: true}).run(conn, function (err, result) {
      if (err) {
        console.log("ERROR: %s:%s", err.name, err.msg);
      }
      console.log(result);
      conn.close();
    });
  });
};