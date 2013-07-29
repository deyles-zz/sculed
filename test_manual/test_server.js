var client = require('../lib/client.js');
var uuid   = require('node-uuid');

var queue;

client.connect('127.0.0.1', 72853, function() {
    queue = client.getQueue('queue', null, function(err, data) {
        startQueueTests();
    });
});

var j = 0;
function startQueueTests() {
    setInterval(function() {
        if (!queue) {
            return;
        }
        queue.enqueue(JSON.stringify({"type":"event", "seq":(j++)}), function(err, data) {
            
        });
    }, 50)
    setInterval(function() {
        if (!queue) {
            return;
        }
        queue.dequeue(function(err, data) {
            if (err || data === null) {
                return;
            }
            console.log(data);
        });
    }, 100);
};