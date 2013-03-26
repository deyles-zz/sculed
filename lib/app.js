var net      = require('net');
var protocol = require('./protocol');
var core     = require('./core');

var director = core.getDataStructureRegistryDirector();
var handler  = null;

var server = net.createServer(function(socket) {
    if (!handler) {
        handler = protocol.getProtocolAdaptor(director, socket);
    }
    socket.on('data', function(data) {
        handler.handle(data);
    });
});

server.setMaxListeners(1000);
server.listen (72853, function() {});