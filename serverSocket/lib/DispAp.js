/* global module */

var r = require('rethinkdb');
var connectdb = require("./ConnectDb");

var self = this;

module.exports.insertDispAp = function (valsAp, client) {
  connectdb.onConnect(function (err, conn) {
    r.db(self.dbConfig.db).table("DispAp").get(valsAp[0]).replace(function (row) {
      return r.branch(
              row.eq(null),
              {
                "macAddress": valsAp[0],
                "nameVendor": r.db(self.dbConfig.db).table("tblPrefix").get(valsAp[0].substring(0, 8)).getField("vendor").default(""),
                "disp": [{
                    name: client,
                    "values": [{
                        "First_time": r.now().inTimezone("+01:00"),
                        "Last_time": r.now().inTimezone("+01:00"),
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
                      "First_time": r.db(self.dbConfig.db).table("DispAp").get(valsAp[0]).do(function (row) {
                        return  row("disp")("values").nth(0).getField("First_time");
                      }).limit(1).nth(0),
                      "Last_time": r.now().inTimezone("+01:00"),
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
              {"macAddress": valsAp[0],
                "nameVendor": r.db(self.dbConfig.db).table("tblPrefix").get(valsAp[0].substring(0, 8)).getField("vendor").default(""), "disp": row('disp').append({
                  name: client,
                  "values": [{
                      "First_time": r.now().inTimezone("+01:00"), //(typeof valsAp[1] == "undefined") ? "" : valsAp[1],
                      "Last_time": r.now().inTimezone("+01:00"), //(typeof valsAp[2] == "undefined") ? "" : valsAp[2],
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