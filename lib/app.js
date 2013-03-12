var net      = require('net');
var protocol = require('./protocol');
var sculedb  = require('com.scule.db');
var sculeds  = require('com.scule.datastructures');

var server = net.createServer(function (socket) {
    socket.on('data', function(data) {
        
    });
});

server.listen (72853, function() {});