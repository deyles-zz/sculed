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

var assert   = require('assert');
var factory  = require('../lib/proxy');

var scule  = require('sculejs');
factory.setScule(scule);

describe('Proxy', function() {
    it('should create a new HashMapProxy and test accessors', function() {
        var proxy = factory.factoryProxy('HashMap', [1000]);
        assert.ok(proxy);
        proxy.set('key1', 'value1');
        proxy.set('key2', 'value2');
        proxy.set('key3', 'value3');
        assert.equal(proxy.get('key1'), 'value1');
        assert.equal(proxy.get('key3'), 'value3');
        assert.equal(proxy.count(), 3);
        proxy.unset('key2');
        assert.equal(proxy.count(), 2);
        proxy.clear();
        assert.equal(proxy.count(), 0);        
    });
    it('should create a new HashTableProxy and test accessors', function() {
        var proxy = factory.factoryProxy('HashTable', [1000]);
        assert.ok(proxy);
        proxy.set('key1', 'value1');
        proxy.set('key2', 'value2');
        proxy.set('key3', 'value3');
        assert.equal(proxy.get('key1'), 'value1');
        assert.equal(proxy.get('key3'), 'value3');
        assert.equal(proxy.count(), 3);
        proxy.unset('key2');
        assert.equal(proxy.count(), 2);
        proxy.clear();
        assert.equal(proxy.count(), 0);            
    });
    it('should create a new AtomicCounterProxy and test accessors', function() {
        var proxy = factory.factoryProxy('AtomicCounter', [1000]);
        assert.ok(proxy);
        proxy.increment(2);
        assert.equal(proxy.count(), 1002);
        proxy.increment(2);
        assert.equal(proxy.count(), 1004);
        proxy.decrement();
        assert.equal(proxy.count(), 1003);
        proxy.decrement(2);
        assert.equal(proxy.count(), 1001);        
    });
    it('should create a new LRUCacheProxy and test accessors', function() {
        var proxy = factory.factoryProxy('LRUCache', [1000]);
        assert.ok(proxy);
        proxy.set('key1', 'value1');
        proxy.set('key2', 'value2');
        proxy.set('key3', 'value3');
        assert.equal(proxy.get('key1'), 'value1');
        assert.equal(proxy.get('key3'), 'value3');
        assert.equal(proxy.count(), 3);
        proxy.unset('key2');
        assert.equal(proxy.count(), 2);
        proxy.clear();
        assert.equal(proxy.count(), 0);        
    });
    it('should create a new BitSetProxy and test accessors', function() {
        var proxy = factory.factoryProxy('BitSet', [1000]);
        assert.ok(proxy);        
    });
    it('should create a new BloomFilterProxy and test accessors', function() {
        var proxy = factory.factoryProxy('BloomFilter', [1000]);
        assert.ok(proxy);        
    });
    it('should create a new BinarySearchTreeProxy and test accessors', function() {
        var proxy = factory.factoryProxy('BinarySearchTree', []);
        assert.ok(proxy);
        proxy.set('key1', 'value1');
        proxy.set('key2', 'value2');
        proxy.set('key3', 'value3');
        assert.equal(proxy.get('key1'), 'value1');
        assert.equal(proxy.get('key3'), 'value3');
        assert.equal(proxy.count(), 3);
        proxy.unset('key2');
        assert.equal(proxy.count(), 2);
        proxy.clear();
        assert.equal(proxy.count(), 0);        
    });
    it('should create a new QueueProxy and test accessors', function() {
        var proxy = factory.factoryProxy('Queue', []);
        assert.ok(proxy);
        proxy.push('value1');
        proxy.push('value2');
        proxy.push('value3');
        proxy.push('value4');
        proxy.push('value5');
        assert.equal(proxy.peek(), 'value1');
        assert.equal(proxy.count(), 5);
        proxy.pop();
        assert.equal(proxy.count(), 4);
        proxy.pop();
        assert.equal(proxy.count(), 3);
        proxy.clear();
        assert.equal(proxy.count(), 0);
        assert.equal(proxy.peek(), null);        
    });
    it('should create a new FIFOStackProxy and test accessors', function() {
        var proxy = factory.factoryProxy('FIFOStack', []);
        assert.ok(proxy);
        proxy.push('value1');
        proxy.push('value2');
        proxy.push('value3');
        proxy.push('value4');
        proxy.push('value5');
        assert.equal(proxy.peek(), 'value1');
        assert.equal(proxy.count(), 5);
        proxy.pop();
        assert.equal(proxy.count(), 4);
        proxy.pop();
        assert.equal(proxy.count(), 3);
        proxy.clear();
        assert.equal(proxy.count(), 0);
        assert.equal(proxy.peek(), null);            
    });
    it('should create a new LIFOStackProxy and test accessors', function() {
        var proxy = factory.factoryProxy('LIFOStack', []);
        assert.ok(proxy);
        proxy.push('value1');
        proxy.push('value2');
        proxy.push('value3');
        proxy.push('value4');
        proxy.push('value5');
        assert.equal(proxy.peek(), 'value5');
        assert.equal(proxy.count(), 5);
        proxy.pop();
        assert.equal(proxy.count(), 4);
        proxy.pop();
        assert.equal(proxy.count(), 3);
        proxy.clear();
        assert.equal(proxy.count(), 0);
        assert.equal(proxy.peek(), null);        
    });
    it('should create a new LinkedListProxy and test accessors', function() {
        var proxy = factory.factoryProxy('LinkedList', []);
        assert.ok(proxy);
        proxy.push('value1');
        proxy.push('value2');
        proxy.push('value3');
        proxy.push('value4');
        proxy.push('value5');
        assert.equal(proxy.peek(), 'value1');
        assert.equal(proxy.count(), 5);
        proxy.pop();
        assert.equal(proxy.count(), 4);
        proxy.pop();
        assert.equal(proxy.count(), 3);
        proxy.clear();
        assert.equal(proxy.count(), 0);
        assert.equal(proxy.peek(), null);          
    });
    it('should create a new DoublyLinkedListProxy and test accessors', function() {
        var proxy = factory.factoryProxy('DoublyLinkedList', []);
        assert.ok(proxy);
        proxy.push('value1');
        proxy.push('value2');
        proxy.push('value3');
        proxy.push('value4');
        proxy.push('value5');
        assert.equal(proxy.peek(), 'value1');
        assert.equal(proxy.count(), 5);
        proxy.pop();
        assert.equal(proxy.count(), 4);
        proxy.pop();
        assert.equal(proxy.count(), 3);
        proxy.clear();
        assert.equal(proxy.count(), 0);
        assert.equal(proxy.peek(), null);        
    });
});