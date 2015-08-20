/* global module */

require('colors');
var cp = require('child_process');
var fs = require('fs');
var ini = require('ini');
var Worker = require('workerjs');

module.exports.getdispwlan = function (req, res) {
  cp.exec("sudo ifconfig -a | grep 'wlan' | tr -s ' ' | cut -d' ' -f1,5", function (error, stdout, stderr) {
    res.json(stdout);
    if (error !== null) {
      console.log('exec error: ' + error);
    }
  });
};

module.exports.getdispmon = function (req, res) {
  cp.exec("sudo ifconfig -a | grep 'mon' | tr -s ' ' | cut -d' ' -f1", function (error, stdout, stderr) {
    res.json(stdout);
    if (error !== null) {
      console.log('exec error: ' + error);
    }
  });
};

module.exports.checkmonitorstart = function (req, res) {
  cp.exec("ps aux | grep 'air' | grep -v 'color' | grep -v 'grep'", function (error, stdout, stderr) {
    res.json(stdout);
  });
};


module.exports.getinifileparams = function (req, res) {
  var fileconfig = './ConfigSKT.ini';
  var configexist = checkconfigexist(fileconfig);
  var datavals = [];
  if (configexist) {
    var config = ini.parse(fs.readFileSync(fileconfig, 'utf-8'));
    datavals = {
      globalconfig: config.global.config,
      databasesitename: config.database.sitename,
      databasehost: config.database.host,
      databaseport: config.database.port,
      databasepass: config.database.projectname,
      autostart : config.global.autostart,
      localsensormorada: config.localsensor.morada,
      localsensornomeSensor: config.localsensor.nomeSensor,
      localsensorlatitude: config.localsensor.latitude,
      localsensorlongitude: config.localsensor.longitude,
      localsensorposx: config.localsensor.posx,
      localsensorposy: config.localsensor.posy
    };
  } else {
    datavals = {"globalconfig": 0};
  }
  res.json(datavals);
};

module.exports.createmonitor = function (req, res) {
  console.log("Create Monitor");
  // para executar este comando e necessario adicionar previlegios de root ao utilizador
  cp.exec("sudo airmon-ng start '" + req.body.wifi + "' | grep 'monitor' | tr -s ' '| cut -d' ' -f5", function (error, stdout, stderr) {
    res.json(stdout);
    if (error !== null) {
      console.log('exec error: ' + error);
    }
  });
};

module.exports.savesettings = function (req, res) {
  var fini = "; isto e um comentario\n[global]" +
          "\nconfig = true" +
          "\nautostart = " + req.body.data.autostart +
          "\n\n; definicao da base de dados\n[database]" +
          "\nsitename= " + req.body.data.sitename +
          "\nhost = " + req.body.data.host +
          "\nport = " + req.body.data.port +
          "\nprojectname = " + req.body.data.password +
          "\n\n; local do sensor\n[localsensor]" +
          "\ncheckposition = false" +
          "\nmorada = " + req.body.data.morada +
          "\nnomeSensor = " + req.body.data.nomeSensor +
          "\nlatitude = " + req.body.data.latitude +
          "\nlongitude = " + req.body.data.longitude +
          "\nposx = " + req.body.data.posx +
          "\nposy = " + req.body.data.posy +
          "\n\n; definicoes airmon\n[airmon_cfg]" +
          "\ntag1nome = IPSERVER" +
          "\ntag1ip = 127.0.0.1" +
          "\ntag2nome = PORTSERVER" +
          "\ntag2port = 8888";

  fs.writeFile("./ConfigSKT.ini", fini, function (err) {
    if (err) {
      res.json(err);
    }
    res.json("save");
  });
};

module.exports.startmonitor = function (req, res) {
  cp.fork('./lib/mainSKT.js');
  res.json("Start Monitor");
  console.log("Start Monitor");
};

module.exports.stoptmonitor = function (req, res) {
  console.log("Stop monitor");
  cp.exec("sudo ./stopAir.sh", function (error, stdout, stderr) {
    res.json(stdout);
//    console.log(stdout);
//    console.log('stderr: ' + stderr);
    if (error !== null) {
      console.log('exec error: ' + error);
    }
  });
};


module.exports.restartsystem = function (req, res) {
  res.json("reboot");
  console.log("System Reboot");
  cp.exec("sudo reboot", function (error, stdout, stderr) {
    if (error !== null) {
      console.log('exec error: ' + error);
    }
  });
};

module.exports.poweroffsystem = function (req, res) {
  res.json("PowerOff");
  console.log("System Poweroff");
  cp.exec("sudo poweroff", function (error, stdout, stderr) {
    if (error !== null) {
      console.log('exec error: ' + error);
    }
  });
};

var checkconfigexist = function (file) {
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