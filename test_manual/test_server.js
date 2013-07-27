var client = require('../lib/client.js');

var counter;
var queue;

//client.connect('166.78.12.141', 72853, function() { 
client.connect('127.0.0.1', 72853, function() {
    counter = client.getCounter('counter', null, function(err, data) {});
    queue = client.getQueue('queue', null, function(err, data) {});
});

setInterval(function() {
    queue.dequeue(function(err, data) {});
}, 100);

setInterval(function() {
    queue.enqueue('new_' + (new Date()).getTime());
}, 150);

setInterval(function() {
    counter.increment(1);
}, 50);

setInterval(function() {
    client.getStatistics(function(err, data) {
        console.log(data);
    });
}, 10000);