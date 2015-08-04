/* global process, module */

var r = require('rethinkdb');

var self = this;

module.exports.onConnect = function (callback) {
  r.connect(self.dbData, function (err, conn) {
    if (err) {
      console.log("ERROR: %s:%s", err.name, err.msg);
      process.exit(1);
    } else {
      callback(err, conn);
    }
  });
};