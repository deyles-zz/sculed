var client = require('../lib/client.js');

var counter;
var table;

client.connect('127.0.0.1', 72853, function() { 
    counter = client.getAtomicCounter('mycounter', null, function(err, data) {
        testCounter();
    });
    table = client.getHashTable('lookup', null, function(err, data) {
        testHashTable();
    });
});

function testCounter() {
    for (var i=0; i < 1000; i++) {
        counter.increment(1);
    }
    counter.count(function(err, data) {
        console.log(data);
    });
};

function testHashTable() {
    var i = 0;
    for (i=0; i < 1000; i++) {
        table.set('key' + i, 'value' + i, function(err, data) {
            console.log(data);
        });
    }
    for (i=0; i < 1000; i++) {
        table.get('key' + i, function(err, data) {
            console.log(data);
        });
    }    
};