var client = require('../lib/client.js');
var uuid   = require('node-uuid');

client.connect('127.0.0.1', 72853, function() {
});

setInterval(function() {
    client.getStatistics(function(err, data) {
        if (!data) {
            return;
        }
        console.log(JSON.stringify(data));
    });
}, 10000);