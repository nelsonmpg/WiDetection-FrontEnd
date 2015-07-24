require('colors');

var express = require('express');
var r = require('rethinkdb');//,
//var bodyParser = require('body-parser');
//    debug = require('debug')('rdb'),
//    assert = require('assert'),
self = this;

exports.getNameVendorByMac = function (req, res) {
  console.log(self.getDataBase(req.params.sock));
  r.connect(self.dbData).then(function (conn) {
    return r.db(self.getDataBase(req.params.sock)).
            table("DispMoveis").get(req.params.mac)("nameVendor")
//              .finally(function () {
//                conn.close();
//              })
  }).then(function (output) {
    console.log(output.yellow);
    res.json(output);
  }).error(function (err) {
    res.status(500).json({err: err});
  });
};