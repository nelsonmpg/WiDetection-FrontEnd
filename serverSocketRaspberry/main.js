/* global module */

require('colors');
var cp = require('child_process');
var fs = require('fs');
var ini = require('ini');
var crypto = require('crypto');

var Main = function () {
  var args;
  if (this.checkconfigexist('./MainConfig.ini')) {
    this.config2 = ini.parse(fs.readFileSync('./MainConfig.ini', 'utf-8'));
    args = {
      host: this.config2.database.host,
      port: this.config2.database.port,
      authKey: crypto.createHash('sha1').update(this.config2.database.projectname).digest('hex')
    };
    var child2 = cp.fork('./lib/serverHTTP');
    child2.send({"serverdata" : args});
    return;
  }
  console.log("MainConfig not exist ! ! !".red);
};

Main.prototype.checkconfigexist = function (file) {
  var config;
  try {
    // try to get the override configuration file if it exists
    fs.readFileSync(file);
    config = true;
  } catch (e) {
    // otherwise, node.js barfed and we have to clean it up
    // use the default file
    config = false;
  }
  return config;
};

new Main();

module.exports = Main;