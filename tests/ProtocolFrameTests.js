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

var protocol = require('../lib/protocol');

exports['test ProtocolFrame'] = function(beforeExit, assert) {   
    var frame = protocol.getProtocolFrame();
    frame.addChunk('Command', 'new');
    frame.addChunk('Class', 'BitSet');
    assert.equal(frame.getChunk('Command'), 'new');
    assert.equal(frame.getChunk('Class'), 'BitSet');
    assert.equal(frame.getCommand(), 'new');
    assert.equal(frame.getClass(), 'BitSet');
};

exports['test ProtocolFrameOptions'] = function(beforeExit, assert) {   
    var frame = protocol.getProtocolFrame();
    frame.addChunk('Options', 'test1, test2, test3,test4');
    assert.equal(JSON.stringify(frame.getOptions()), JSON.stringify(["test1","test2","test3","test4"]));
};

exports['test ProtocolFrameParser'] = function(beforeExit, assert) {
    var parser = protocol.getProtocolFrameParser();
    var frame  = parser.parse("Command\tnew\nKey\tmynewbplustree\nClass\tBPlusTree\nOptions\t30000, 5000\n\r");
    assert.equal(frame.getCommand(), 'new');
    assert.equal(frame.getClass(), 'BPlusTree');
    assert.equal(frame.getKey(), 'mynewbplustree');
    assert.equal(JSON.stringify(frame.getOptions()), JSON.stringify(['30000', '5000']));
};