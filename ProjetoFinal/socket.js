/* global process */

var net = require('net');

var HOST = '192.168.1.93';
var PORT = 8888;

// Create a server instance, and chain the listen function to it
// The function passed to net.createServer() becomes the event handler for the 'connection' event
// The sock object the callback function receives UNIQUE for each connection
net.createServer(function (sock) {

    // We have a connection - a socket object is assigned to the connection automatically
    console.log('CONNECTED: ' + sock.remoteAddress + ':' + sock.remotePort);

    // Add a 'data' event handler to this instance of socket
    sock.on('data', function (data) {

        console.log('DATA ' + sock.remoteAddress + ':\n' + data);
        // Write the data back to the socket, the client will receive it as data from the server
//        sock.write('You said "' + data + '"');
        console.log('--------------------------------------------------------');

    });

    // Add a 'close' event handler to this instance of socket
    sock.on('disconnect', function (data) {
        console.log('CLOSED: ' + sock.remoteAddress + ' ' + sock.remotePort);
    });

}).listen(PORT);

console.log('Server listening on ' + HOST + ':' + PORT);

//excepcoes para os erros encontrados
process.on('uncaughtException', function (err) {
    console.log('Excepcao capturada: ' + err);
});