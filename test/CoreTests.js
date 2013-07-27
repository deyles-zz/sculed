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
var scule  = require('sculejs');

describe('Core', function() {
    it('should add a new hash table instance to the data structure registry', function() {
        var registry = core.getDataStructureRegistry();
        registry.put('mynewhashtable', scule.getHashTable(1500));
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
            assert.equal(e, 'data structure corresponding to key test already exists');
        }
        assert.equal(true, exception);        
    });
});