var client = require('../lib/client.js');
var uuid   = require('node-uuid');

var counter;
var queue;
var hash;

client.connect('127.0.0.1', 72853, function() {
    counter = client.getCounter('counter', null, function(err, data) { startCounterTests(); });
    queue   = client.getQueue('queue', null, function(err, data) { startQueueTests(); });
    hash    = client.getHashTable('hash', null, function(err, data) { startHashTableTests(); });
});

function startHashTableTests() {
    setInterval(function() {
        if (!hash) {
            return;
        }
        for (var i=0; i < 1000; i++) {
            var key = uuid.v4();
            hash.set(key, (new Date()).getTime());
        }
    }, 1000);
    setInterval(function() {
        if (!hash) {
            return;
        }  
        for (var i=0; i < 100; i++) {
            hash.contains(uuid.v4());
        }
    }, 1500);  
};

function startQueueTests() {
    setInterval(function() {
        if (!queue) {
            return;
        }
        queue.dequeue(function(err, data) {});
    }, 100);
    setInterval(function() {
        if (!queue) {
            return;
        }    
        for (var i=0; i < 1000; i++) {
            queue.enqueue('new_' + (new Date()).getTime());
        }
    }, 500);
};

function startCounterTests() {
    setInterval(function() {
        if (!counter) {
            return;
        }    
        counter.increment(1);
    }, 50);
    setInterval(function() {
        if (!counter) {
            return;
        }    
        counter.count();
    }, 250);    
};

setInterval(function() {
    client.getStatistics(function(err, data) {
        console.log(data);
    });
}, 10000);