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
var protocol = require('../lib/protocol');
var core     = require('../lib/core');

describe('Protocol', function() {
    it('should execute various SculeServer functions locally', function() {
        var director = core.getDataStructureRegistryDirector();
        var handler  = protocol.getProtocolAdaptor(director);
        handler.handle("Command\tnew\nKey\tmynewhashtable\nClass\tHashTable\nOptions\t3000\n\r");
        handler.handle("Command\tnew\nKey\tmycounter\nClass\tAtomicCounter\nOptions\t0\n\r");
        handler.handle("Command\tnew\nKey\tmyqueue\nClass\tQueue\nOptions\t\n\r");
        handler.handle("Command\tnew\nKey\tmybtree\nClass\tBinarySearchTree\nOptions\t3000, 500\n\r");

        assert.equal(true, director.registry.contains('mynewhashtable'));

        var o = director.getDataStructure('mynewhashtable');
        assert.equal(o.__class, 'HashTable');
        assert.equal(JSON.stringify(o.__options), JSON.stringify([ '3000' ]));
        assert.ok(o.__struct);

        for (var i=0; i < 100; i++) {
            handler.handle("Command\tset\nKey\ts:\"mybtree\"\nSubKey\ti:" + i + "\nValue\ts:\"value" + i + "\"\n\r");
        }
        handler.handle("Command\tget\nKey\tmybtree\nSubKey\ti:1\n\r");
        handler.handle("Command\trange\nKey\ts:\"mybtree\"\nRangeDef\ti:1, i:18, i:1, i:0\n\r");

        handler.handle("Command\tpush\nKey\tmyqueue\nValue\tvalue1\n\r");
        handler.handle("Command\tpush\nKey\tmyqueue\nValue\tvalue2\n\r");
        handler.handle("Command\tpush\nKey\tmyqueue\nValue\tvalue3\n\r");
        handler.handle("Command\tpush\nKey\tmyqueue\nValue\tvalue4\n\r");
        handler.handle("Command\tpeek\nKey\tmyqueue\n\r");
        handler.handle("Command\tpop\nKey\tmyqueue\n\r");
        handler.handle("Command\tpop\nKey\tmyqueue\n\r");
        handler.handle("Command\tpop\nKey\tmyqueue\n\r");

        handler.handle("Command\tcount\nKey\tmynewhashtable\n\r");
        handler.handle("Command\tset\nKey\tmynewhashtable\nSubKey\tkey1\nValue\tvalue1\n\r");
        handler.handle("Command\tset\nKey\tmynewhashtable\nSubKey\tkey2\nValue\tvalue2\n\r");
        handler.handle("Command\tset\nKey\tmynewhashtable\nSubKey\tkey3\nValue\t\"here is a binary safe string\"\n\r");
        handler.handle("Command\tget\nKey\tmynewhashtable\nSubKey\tkey1\n\r");
        handler.handle("Command\tget\nKey\tmynewhashtable\nSubKey\tkey3\n\r");

        handler.handle("Command\tcontains\nKey\tmynewhashtable\nSubKey\tkey3\n\r");
        handler.handle("Command\tclear\nKey\tmynewhashtable\n\r");
        handler.handle("Command\tcontains\nKey\tmynewhashtable\nSubKey\tkey3\n\r");

        handler.handle("Command\tincrement\nKey\tmycounter\nValue\ti:1\n\r");
        handler.handle("Command\tincrement\nKey\tmycounter\nValue\ti:1\n\r");
        handler.handle("Command\tincrement\nKey\tmycounter\nValue\ti:1\n\r");
        handler.handle("Command\tcount\nKey\tmycounter\n\r");
        handler.handle("Command\tdecrement\nKey\tmycounter\nValue\ti:1\n\r");
        handler.handle("Command\tcount\nKey\tmycounter\n\r");

        handler.handle("Command\tdestroy\nKey\tmynewhashtable\n\r");
        handler.handle("Command\tdestroy\nKey\tmycounter\n\r");
        handler.handle("Command\tdestroy\nKey\tmyqueue\n\r");
        handler.handle("Command\tdestroy\nKey\tmybtree\n\r");

        assert.equal(false, director.registry.contains('mynewhashtable'));        
    });
});