var client = require('../lib/client.js');
var uuid   = require('node-uuid');

var queue;

client.connect('166.78.153.91', 72853, function() {
    queue = client.getQueue('queue', null, function(err, data) {
        startQueueTests();
    });
});

function startQueueTests() {
    setInterval(function() {
        if (!queue) {
            return;
        }
        queue.dequeue(function(err, data) {
            console.log(data);
        });
    }, 100);
};