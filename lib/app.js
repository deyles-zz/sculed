var sys      = require('sys');
var net      = require('net');
var scule    = require('sculejs');
var protocol = require('./protocol');

var core     = require('./core');
core.setScule(scule);

var clients  = scule.getHashTable(1000);
var director = core.getDataStructureRegistryDirector();

var server = net.createServer(function(socket) {
    
    sys.puts('Connected: ' + socket.remoteAddress + ':' + socket.remotePort); 
    var handler = protocol.getProtocolAdaptor(director, socket);
    
    socket.name = socket.remoteAddress + ":" + socket.remotePort;
    clients.put(socket.name, {socket:socket, handler:handler});
    
    socket.on('data', function(data) {
        handler.handle(data);
    });
    
    socket.on('end', function(data) {
        clients.remove(socket.name);
        socket.destroy();
    });
    
    socket.on('close', function(data) {
        clients.remove(socket.name);
        socket.destroy();
    });
    
    socket.on('error', function(data) {
        clients.remove(socket.name);
        socket.destroy();
    });
    
});

server.setMaxListeners(1000);
server.listen (72853, function() {});