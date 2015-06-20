/* global module, require */


var express = require('express');
var http = require('http');
var socketio = require('socket.io');
var fs = require('fs');
var bodyParser = require('body-parser');

/**
 *
 * @param {type} port
 * @returns {Server}
 */
var Server = function (port) {
    this.port = port;
    this.app = express();
    this.server = http.Server(this.app);
    this.io = socketio(this.server);

    this.app.use(bodyParser.urlencoded({
        extended: true
    }));
    this.app.use(bodyParser.json());


};
/**
 *
 * @returns {undefined}
 */
Server.prototype.start = function () {
    this.server.listen(this.port);
    var allowCrossDomain = function (req, res, next) {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Authorization, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date');
        next();
    };
    this.app.use(allowCrossDomain);
    // fornece ao cliente a pagina index.html
    this.app.use(express.static(__dirname + './../www'));
    var self = this;
    this.io.on('connection', function (socket) {

        var address = socket.request.connection._peername;

    });
    console.log('A aguardar por clientes...');
};

/**
 *
 * @param {type} port
 * @returns {Server}
 */
module.exports = Server;
