var nssocket = require('nssocket');
var scule    = require('sculejs');
var protocol = require('./protocol');
var core     = require('./core');

core.setScule(scule);
var clients  = scule.getHashTable(1000);
var director = core.getDataStructureRegistryDirector();

var server = nssocket.createServer(function(socket) {
    var handler = protocol.getProtocolAdaptor(director, socket);    
    socket.name = socket.remoteAddress + ":" + socket.remotePort;
    clients.put(socket.name, {socket:socket, handler:handler});
});
server.setMaxListeners(0);
server.listen (72853, function() {});