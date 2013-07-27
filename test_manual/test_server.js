var net = require('net');

var i = 0;
var socket = net.createConnection(72853, 'localhost');
socket.setNoDelay(true);
socket.on('connect', function() {
        console.log('connected');
        socket.write("Command\tnew\nKey\tmynewhashtable\nClass\tHashTable\nOptions\t3000\n\r", function() {
    });
});
socket.on('data', function(frame) {
    console.log(frame.toString() + "\n\n");
    i++;
    socket.write("Command\tset\nKey\tmynewhashtable\nSubKey\tkey" + i + "\nValue\tvalue" + i + "\n\r");
});