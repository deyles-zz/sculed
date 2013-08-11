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

var uuid     = require('node-uuid');
var assert   = require('assert');
var protocol = require('../lib/protocol');
var core     = require('../lib/core');
core.setDebug(false);

var tests = {};
tests.SocketMock = function() {

    this.response = null;
    this.handlers = {};

    this.data = function(namespace, handler) {
        var key = JSON.stringify(namespace);
        this.handlers[key] = handler;
    };

    this.invoke = function(namespace, data) {
        var key = JSON.stringify(namespace);
        this.handlers[key](data);
    };

    this.send = function(namespace, data) {
        this.response = {
            namespace: namespace,
            data: data
        };        
    };

    this.reset = function() {
        this.response = null;
    };

};

describe('Protocol', function() {
    it('should execute various SculeServer functions locally', function() {
        
        var socket   = new tests.SocketMock();
        var director = core.getDataStructureRegistryDirector();
        protocol.getProtocolAdaptor(director, socket);
        
        var hash = uuid.v4();
        
        /**
         * Tests for constructors
         */ 
        
        socket.invoke(['new'], {
            uuid:     hash,
            key:     'dummy',
            type:    'Collection',
            options: []
        });
        assert.equal('new', socket.response.namespace[0]);
        assert.equal(hash,  socket.response.data.uuid);
        assert.equal('ok',  socket.response.data.message);
        assert.equal(200,   socket.response.data.status);
        socket.reset();
        
        socket.invoke(['new'], {
            uuid:     hash,
            key:     'hashy',
            type:    'HashTable',
            options: [1000]
        });
        assert.equal('new', socket.response.namespace[0]);
        assert.equal(hash,  socket.response.data.uuid);
        assert.equal('ok',  socket.response.data.message);
        assert.equal(200,   socket.response.data.status);
        socket.reset();

        socket.invoke(['new'], {
            uuid:     hash,
            key:     'counter',
            type:    'AtomicCounter',
            options: [0]
        });
        assert.equal('new', socket.response.namespace[0]);
        assert.equal(hash,  socket.response.data.uuid);
        assert.equal('ok',  socket.response.data.message);
        assert.equal(200,   socket.response.data.status);
        socket.reset();

        socket.invoke(['new'], {
            uuid:     hash,
            key:     'stack',
            type:    'LIFOStack',
            options: [0]
        });
        assert.equal('new', socket.response.namespace[0]);
        assert.equal(hash,  socket.response.data.uuid);
        assert.equal('ok',  socket.response.data.message);
        assert.equal(200,   socket.response.data.status);
        socket.reset();

        /**
         * HashTable tests
         */

        socket.invoke(['set'], {
            uuid:     hash,
            key:     'hashy',
            subkey:  'foo',
            value:   'bar'            
        });
        assert.equal('set', socket.response.namespace[0]);
        assert.equal(hash,  socket.response.data.uuid);
        assert.equal('ok',  socket.response.data.message);
        assert.equal(200,   socket.response.data.status);
        socket.reset();

        socket.invoke(['set'], {
            uuid:     hash,
            key:     'hashy',
            subkey:  'foo1',
            value:   'bar1'            
        });
        assert.equal('set', socket.response.namespace[0]);
        assert.equal(hash,  socket.response.data.uuid);
        assert.equal('ok',  socket.response.data.message);
        assert.equal(200,   socket.response.data.status);
        socket.reset();

        socket.invoke(['get'], {
            uuid:     hash,
            key:     'hashy',
            subkey:  'foo'            
        });
        assert.equal('get', socket.response.namespace[0]);
        assert.equal(hash,  socket.response.data.uuid);
        assert.equal('bar', socket.response.data.data);
        assert.equal('ok',  socket.response.data.message);
        assert.equal(200,   socket.response.data.status);
        socket.reset();

        socket.invoke(['count'], {
            uuid:     hash,
            key:     'hashy'          
        });
        assert.equal('count', socket.response.namespace[0]);
        assert.equal(hash,  socket.response.data.uuid);
        assert.equal(2,     socket.response.data.data);
        assert.equal('ok',  socket.response.data.message);
        assert.equal(200,   socket.response.data.status);
        socket.reset();

        socket.invoke(['unset'], {
            uuid:     hash,
            key:     'hashy',
            subkey:  'foo'            
        });
        assert.equal('unset', socket.response.namespace[0]);
        assert.equal(hash,  socket.response.data.uuid);
        assert.equal('ok',  socket.response.data.message);
        assert.equal(200,   socket.response.data.status);
        socket.reset();

        socket.invoke(['count'], {
            uuid:     hash,
            key:     'hashy'          
        });
        assert.equal('count', socket.response.namespace[0]);
        assert.equal(hash,  socket.response.data.uuid);
        assert.equal(1,     socket.response.data.data);
        assert.equal('ok',  socket.response.data.message);
        assert.equal(200,   socket.response.data.status);
        socket.reset();

        socket.invoke(['contains'], {
            uuid:     hash,
            key:     'hashy',
            subkey:  'foo'            
        });
        assert.equal('contains', socket.response.namespace[0]);
        assert.equal(hash,  socket.response.data.uuid);
        assert.equal(false, socket.response.data.data);        
        assert.equal('ok',  socket.response.data.message);
        assert.equal(200,   socket.response.data.status);
        socket.reset();

        socket.invoke(['contains'], {
            uuid:     hash,
            key:     'hashy',
            subkey:  'foo1'            
        });
        assert.equal('contains', socket.response.namespace[0]);
        assert.equal(hash,  socket.response.data.uuid);
        assert.equal(true, socket.response.data.data);        
        assert.equal('ok',  socket.response.data.message);
        assert.equal(200,   socket.response.data.status);
        socket.reset();

        socket.invoke(['clear'], {
            uuid:     hash,
            key:     'hashy'          
        });
        assert.equal('clear', socket.response.namespace[0]);
        assert.equal(hash,  socket.response.data.uuid);
        assert.equal('ok',  socket.response.data.message);
        assert.equal(200,   socket.response.data.status);
        socket.reset();

        socket.invoke(['count'], {
            uuid:     hash,
            key:     'hashy'          
        });
        assert.equal('count', socket.response.namespace[0]);
        assert.equal(hash,  socket.response.data.uuid);
        assert.equal(0,     socket.response.data.data);
        assert.equal('ok',  socket.response.data.message);
        assert.equal(200,   socket.response.data.status);
        socket.reset();

        /**
         * Should throw an error
         */

        socket.invoke(['clear'], {
            uuid:     hash,
            key:     'slashy'          
        });
        assert.equal('error', socket.response.namespace[0]);
        assert.equal(hash,  socket.response.data.uuid);
        assert.equal('key does not exist',  socket.response.data.message);
        assert.equal(404,   socket.response.data.status);
        socket.reset();

        /**
         * Collection tests
         */
        for (var i=0; i < 1000; i++) {
            socket.invoke(['save'], {
                uuid:     hash,
                key:     'dummy',
                object:   {i: i}            
            });
            assert.equal('save', socket.response.namespace[0]);
            assert.equal(hash,  socket.response.data.uuid);
            assert.equal('ok',  socket.response.data.message);
            assert.equal(200,   socket.response.data.status);
            socket.reset();            
        }
        
        socket.invoke(['countq'], {
            uuid:     hash,
            key:     'dummy',
            query:   {},
            conditions: {}
        });
        assert.equal('countq', socket.response.namespace[0]);
        assert.equal(hash,  socket.response.data.uuid);
        assert.equal(1000,     socket.response.data.data);
        assert.equal('ok',  socket.response.data.message);
        assert.equal(200,   socket.response.data.status);
        socket.reset();
        
        socket.invoke(['find'], {
            uuid:     hash,
            key:     'dummy',
            query:   {i:{$gte:500, $lt:600}},
            conditions: {$sort:{i:0}}
        });
        assert.equal('find', socket.response.namespace[0]);
        assert.equal(hash,  socket.response.data.uuid);
        assert.equal(100,     socket.response.data.data.length);
        assert.equal('ok',  socket.response.data.message);
        assert.equal(200,   socket.response.data.status);
        socket.reset();

        socket.invoke(['remove'], {
            uuid:     hash,
            key:     'dummy',
            query:   {i:{$gte:500, $lt:600}},
            conditions: {}
        });
        assert.equal('remove', socket.response.namespace[0]);
        assert.equal(hash,  socket.response.data.uuid);
        assert.equal(100,     socket.response.data.data.length);
        assert.equal('ok',  socket.response.data.message);
        assert.equal(200,   socket.response.data.status);
        socket.reset();

        socket.invoke(['countq'], {
            uuid:     hash,
            key:     'dummy',
            query:   {},
            conditions: {}
        });
        assert.equal('countq', socket.response.namespace[0]);
        assert.equal(hash,  socket.response.data.uuid);
        assert.equal(900,     socket.response.data.data);
        assert.equal('ok',  socket.response.data.message);
        assert.equal(200,   socket.response.data.status);
        socket.reset();
        
        /**
         * Stack tests
         */

        socket.invoke(['count'], {
            uuid:     hash,
            key:     'stack'          
        });
        assert.equal('count', socket.response.namespace[0]);
        assert.equal(hash,  socket.response.data.uuid);
        assert.equal(0,     socket.response.data.data);
        assert.equal('ok',  socket.response.data.message);
        assert.equal(200,   socket.response.data.status);
        socket.reset();

        socket.invoke(['push'], {
            uuid:     hash,
            key:     'stack',
            value:   'foo0'            
        });
        assert.equal('push', socket.response.namespace[0]);
        assert.equal(hash,  socket.response.data.uuid);
        assert.equal('ok',  socket.response.data.message);
        assert.equal(200,   socket.response.data.status);
        socket.reset();

        socket.invoke(['push'], {
            uuid:     hash,
            key:     'stack',
            value:   'foo1'            
        });
        assert.equal('push', socket.response.namespace[0]);
        assert.equal(hash,  socket.response.data.uuid);
        assert.equal('ok',  socket.response.data.message);
        assert.equal(200,   socket.response.data.status);
        socket.reset();

        socket.invoke(['push'], {
            uuid:     hash,
            key:     'stack',
            value:   'foo2'            
        });
        assert.equal('push', socket.response.namespace[0]);
        assert.equal(hash,  socket.response.data.uuid);
        assert.equal('ok',  socket.response.data.message);
        assert.equal(200,   socket.response.data.status);
        socket.reset();

        socket.invoke(['count'], {
            uuid:     hash,
            key:     'stack'          
        });
        assert.equal('count', socket.response.namespace[0]);
        assert.equal(hash,  socket.response.data.uuid);
        assert.equal(3,     socket.response.data.data);
        assert.equal('ok',  socket.response.data.message);
        assert.equal(200,   socket.response.data.status);
        socket.reset();

        socket.invoke(['pop'], {
            uuid:     hash,
            key:     'stack'           
        });
        assert.equal('pop', socket.response.namespace[0]);
        assert.equal(hash,  socket.response.data.uuid);
        assert.equal('foo2',  socket.response.data.data);
        assert.equal('ok',  socket.response.data.message);
        assert.equal(200,   socket.response.data.status);
        socket.reset();

        socket.invoke(['count'], {
            uuid:     hash,
            key:     'stack'          
        });
        assert.equal('count', socket.response.namespace[0]);
        assert.equal(hash,  socket.response.data.uuid);
        assert.equal(2,     socket.response.data.data);
        assert.equal('ok',  socket.response.data.message);
        assert.equal(200,   socket.response.data.status);
        socket.reset();

         /**
          * Counter tests
          */

        socket.invoke(['count'], {
            uuid:     hash,
            key:     'counter'          
        });
        assert.equal('count', socket.response.namespace[0]);
        assert.equal(hash,  socket.response.data.uuid);
        assert.equal(0,     socket.response.data.data);
        assert.equal('ok',  socket.response.data.message);
        assert.equal(200,   socket.response.data.status);
        socket.reset();

        socket.invoke(['increment'], {
            uuid:     hash,
            key:     'counter',
            value:   1
        });
        assert.equal('increment', socket.response.namespace[0]);
        assert.equal(hash,  socket.response.data.uuid);
        assert.equal(1,     socket.response.data.data);
        assert.equal('ok',  socket.response.data.message);
        assert.equal(200,   socket.response.data.status);
        socket.reset();

        socket.invoke(['increment'], {
            uuid:     hash,
            key:     'counter',
            value:   99
        });
        assert.equal('increment', socket.response.namespace[0]);
        assert.equal(hash,  socket.response.data.uuid);
        assert.equal(100,     socket.response.data.data);
        assert.equal('ok',  socket.response.data.message);
        assert.equal(200,   socket.response.data.status);
        socket.reset();

        socket.invoke(['decrement'], {
            uuid:     hash,
            key:     'counter',
            value:   10
        });
        assert.equal('decrement', socket.response.namespace[0]);
        assert.equal(hash,  socket.response.data.uuid);
        assert.equal(90,     socket.response.data.data);
        assert.equal('ok',  socket.response.data.message);
        assert.equal(200,   socket.response.data.status);
        socket.reset();

        socket.invoke(['increment'], {
            uuid:     hash,
            key:     'counter',
            value:   -9
        });
        assert.equal('increment', socket.response.namespace[0]);
        assert.equal(hash,  socket.response.data.uuid);
        assert.equal(81,     socket.response.data.data);
        assert.equal('ok',  socket.response.data.message);
        assert.equal(200,   socket.response.data.status);
        socket.reset();

        socket.invoke(['decrement'], {
            uuid:     hash,
            key:     'counter',
            value:   -9
        });
        assert.equal('decrement', socket.response.namespace[0]);
        assert.equal(hash,  socket.response.data.uuid);
        assert.equal(90,     socket.response.data.data);
        assert.equal('ok',  socket.response.data.message);
        assert.equal(200,   socket.response.data.status);
        socket.reset();

        socket.invoke(['count'], {
            uuid:     hash,
            key:     'counter'          
        });
        assert.equal('count', socket.response.namespace[0]);
        assert.equal(hash,  socket.response.data.uuid);
        assert.equal(90,     socket.response.data.data);
        assert.equal('ok',  socket.response.data.message);
        assert.equal(200,   socket.response.data.status);
        socket.reset();

        socket.invoke(['clear'], {
            uuid:     hash,
            key:     'counter'          
        });
        assert.equal('clear', socket.response.namespace[0]);
        assert.equal(hash,  socket.response.data.uuid);
        assert.equal('ok',  socket.response.data.message);
        assert.equal(200,   socket.response.data.status);
        socket.reset();

        socket.invoke(['count'], {
            uuid:     hash,
            key:     'counter'          
        });
        assert.equal('count', socket.response.namespace[0]);
        assert.equal(hash,  socket.response.data.uuid);
        assert.equal(0,     socket.response.data.data);
        assert.equal('ok',  socket.response.data.message);
        assert.equal(200,   socket.response.data.status);
        socket.reset();

        /**
         * Tests for destructors
         */

        socket.invoke(['destroy'], {
            uuid:     hash,
            key:     'hashy'          
        });
        assert.equal('destroy', socket.response.namespace[0]);
        assert.equal(hash,  socket.response.data.uuid);
        assert.equal('ok',  socket.response.data.message);
        assert.equal(200,   socket.response.data.status);
        socket.reset();
       
        /**
         * Tests for statistics
         */
        socket.invoke(['stats'], {
            uuid: hash
        });
        assert.equal('stats', socket.response.namespace[0]);
        assert.equal(hash,  socket.response.data.uuid);
        assert.equal('ok',  socket.response.data.message);
        assert.equal(200,   socket.response.data.status);
        assert.equal(0, socket.response.data.stats.uptime_s);
        socket.reset();       
       
        socket.invoke(['destroy'], {
            uuid:     hash,
            key:     'counter'          
        });
        assert.equal('destroy', socket.response.namespace[0]);
        assert.equal(hash,  socket.response.data.uuid);
        assert.equal('ok',  socket.response.data.message);
        assert.equal(200,   socket.response.data.status);
        socket.reset();

        socket.invoke(['destroy'], {
            uuid:     hash,
            key:     'stack'          
        });
        assert.equal('destroy', socket.response.namespace[0]);
        assert.equal(hash,  socket.response.data.uuid);
        assert.equal('ok',  socket.response.data.message);
        assert.equal(200,   socket.response.data.status);
        socket.reset();
       
    });
});