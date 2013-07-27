/**
 * Copyright (c) 2013, Dan Eyles (dan@irlgaming.com)
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of IRL Gaming nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL IRL Gaming BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

var assert = require('assert');
var core   = require('../lib/core');
core.setDebug(false);

describe('Core', function() {
    it('should add a new hash table instance to the data structure registry', function() {
        var registry = core.getDataStructureRegistry();
        registry.put('mynewhashtable', 'foo');
        assert.equal(true, registry.contains('mynewhashtable'));        
    });
    it('should spawn several different data structures', function() {
        var spawner = core.getDataStructureSpawner();
        var table   = spawner.spawn('HashTable', [5000]);
        assert.ok(table);
        var bitset  = spawner.spawn('BitSet', [5000, 300]);
        assert.ok(bitset);
        var list    = spawner.spawn('LinkedList', []);
        assert.ok(list);
        var cache   = spawner.spawn('LRUCache', [100]);
        assert.ok(cache);        
    });
    it('should construct a new hash table then throw an exception when attempting to create another instance with the same name', function() {
        var director = core.getDataStructureRegistryDirector();
        var struct   = director.spawnDataStructure('test', 'HashTable', [1000]);
        assert.ok(struct);
        var exception = false;
        try {
            director.spawnDataStructure('test', 'HashTable', [1000]);
        } catch (e) {
            exception = true;
            assert.equal(e.message, 'data structure corresponding to key test already exists');
        }
        assert.equal(true, exception);        
    });
    describe('ServerStatistics', function() {
        it('should add a new struct key to the statistics object', function() {
            var stats = core.getServerStatistics();
            stats.addKey('test', 'HashTable');
            assert.equal(true, stats.statistics.hasOwnProperty('test'));
            assert.equal('HashTable', stats.statistics.test.type);
            assert.equal(0, stats.statistics.test.reads);
            assert.equal(0, stats.statistics.test.writes);
        });
        it('should remove a struct key from the statistics object', function() {
            var stats = core.getServerStatistics();
            stats.addKey('test', 'HashTable');
            stats.removeKey('test');
            assert.equal(false, stats.statistics.hasOwnProperty('test'));
        });
        it('should increment the number of writes on a struct key', function() {
            var stats = core.getServerStatistics();
            stats.addKey('test', 'HashTable');
            stats.logWrite('test');
            assert.equal(1, stats.writes);
            assert.equal(0, stats.statistics.test.reads);
            assert.equal(1, stats.statistics.test.writes);
            stats.logWrite('test');
            assert.equal(2, stats.writes);
            assert.equal(2, stats.statistics.test.writes); 
            stats.addKey('test2', 'BinarySearchTree');
            stats.logWrite('test2');
            assert.equal(3, stats.writes);
            assert.equal(0, stats.statistics.test.reads);
            assert.equal(2, stats.statistics.test.writes);            
        });
        it('should increment the number of reads on a struct key', function() {
            var stats = core.getServerStatistics();
            stats.addKey('test', 'HashTable');
            stats.logRead('test');
            assert.equal(0, stats.writes);
            assert.equal(1, stats.statistics.test.reads);
            assert.equal(1, stats.statistics.test.reads);
            stats.logRead('test');
            assert.equal(2, stats.reads);
            assert.equal(2, stats.statistics.test.reads); 
            stats.addKey('test2', 'BinarySearchTree');
            stats.logRead('test2');
            assert.equal(3, stats.reads);
            assert.equal(0, stats.statistics.test.writes);
            assert.equal(2, stats.statistics.test.reads);            
        });
        it('should serialize server statistics', function() {
            var stats = core.getServerStatistics();
            stats.timestamp = (new Date()).getTime() - (5000 * 10);
            stats.addKey('test', 'HashTable');
            for (var i=0; i < 100; i++) {
                stats.logRead('test');
                stats.logWrite('test');
                stats.logWrite('test');
            }
            stats.addKey('test2', 'BinarySearchTree');
            for (var j=0; j < 100; j++) {
                stats.logRead('test2');
                stats.logWrite('test2');
            }
            var o = stats.serialize();
            assert.equal(50, o.uptime_s);
            assert.equal(10, o.trans_s);
            assert.equal(300, o.writes);
            assert.equal(200, o.reads);
            assert.equal(500, o.trans);
            assert.equal(true, o.statistics.hasOwnProperty('test'));
            assert.equal(100, o.statistics.test.reads);
            assert.equal(200, o.statistics.test.writes);
            assert.equal(true, o.statistics.hasOwnProperty('test2'));
            assert.equal(100, o.statistics.test2.reads);
            assert.equal(100, o.statistics.test2.writes);
        });
    });
});