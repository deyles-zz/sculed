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

/**
 * Module namespace
 */
module.exports = {
    protocol: {
        classes:   {},
        variables: {},
        objects:   {}
    }
};

/**
 * A protocol adaptor that handles parsing and interpreting incoming messages
 * and generating responses. The protocol SculeServer implements is block level,
 * built on top of the NSSocket protocol, and uses TCP as a transport.
 * 
 * @class {ProtocolAdaptor}
 * @param {DataStructureRegistryDirector} director
 * @param {NSSocket} socket 
 */
module.exports.protocol.classes.ProtocolAdaptor = function(director, socket) {
    
    /**
     * @type {Object}
     */
    this.handlers = {};
    this.meta     = {
        'new': true, 
        'stats': true
    };
    this.stats    = {
        'stats': true
    };
    
    /**
     * @type {DataStructureRegistryDirector}
     */
    this.director = director;
    
    /**
     * @type {NSSocket}
     */
    this.socket   = socket;
        
    /**
     * Registers a message namespace handler with the adaptor. Handlers are 
     * closures that encapsulate logic specific to a given message type.
     * 
     * @param {Array} namespace
     * @param {Function} handler
     * @return {Void}
     */
    this.registerHandler = function(namespace, handler) {
        handler = handler.bind(this);
        var wrapper = function(data) {
            if (!data.hasOwnProperty('uuid')) {
                return;
            }
            if (!this.stats.hasOwnProperty(namespace[0]) 
                && !data.hasOwnProperty('key')) {
                return;
            }            
            if (!this.meta.hasOwnProperty(namespace[0])
                && !this.director.containsDataStructure(data.key)) {
                this.socket.send(['error'], {
                    message: 'key does not exist',
                    status:  404,
                    uuid:    data.uuid
                });
                return;                
            }
            try {
                handler(data);
            } catch (e) {
                this.socket.send(['error'], {
                    message: e.message, 
                    status: 500, 
                    uuid: data.uuid
                });
            }
        };
        wrapper = wrapper.bind(this);
        this.socket.data(namespace, wrapper);
    };
    
    /**
     * Validates the provided object to ensure it contains provided list of fields.
     * This function will throw an exception if it encounters an object that does
     * not contain all required keys.
     * 
     * @param {Object} data
     * @param {Array} required
     * @return {boolean}
     * @throws {Error}
     */
    this.validate = function(data, required) {
        for (var i=0; i < required.length; i++) {
            if (!data.hasOwnProperty(required[i])) {
                throw new Error('badly formed protocol frame');
            }
        }
        return true;
    };
    
};

/**
 * A decorator pattern implementation that adds handler logic to {ProtocolAdaptor}
 * instances.
 * 
 * @see {ProtocolAdaptor}
 * @class {ProtocolAdaptorDecorator}
 */
module.exports.protocol.classes.ProtocolAdaptorDecorator = function() {
    
    /**
     * Adds handler closures to {ProtocolAdaptor} instances
     * 
     * @param {ProtocolAdaptor} o
     * @return {Void}
     * @see {ProtocolAdaptor.registerHandler}
     */
    this.decorate = function(o) {
        
        /**
         * Handler for server statistics
         */
        o.registerHandler(['stats'], function(data) {
            var response = {
                uuid: data.uuid,
                message: 'ok',
                status:  200,
                stats: this.director.getStatistics().serialize()
            };
            this.socket.send(['stats'], response);
        });
        
        /**
         * Handler for constructor calls
         */        
        o.registerHandler(['new'], function(data) {
            this.validate(data, ['type', 'options']);
            this.director.spawnDataStructure(data.key, data.type, data.options);
            this.director.getStatistics().addKey(data.key, data.type);
            this.director.getStatistics().logTransaction(data.key, 'new');
            var response = {
                uuid: data.uuid,
                message: 'ok',
                status:  200
            };
            this.socket.send(['new'], response);            
        });
        
        /**
         * Handler for the destroy command
         */
        o.registerHandler(['destroy'], function(data) {
            this.director.destroyDataStructure(data.key);
            this.director.getStatistics().removeKey(data.key);
            var response = {
                uuid: data.uuid,
                message: 'ok',
                status:  200
            };
            this.socket.send(['destroy'], response);
        });
        
        /**
         * Handler for the find command
         */        
        o.registerHandler(['find'], function(data) {
            var struct = this.director.getDataStructure(data.key);
            this.director.getStatistics().logTransaction(data.key, 'find');
            var response = {};
            struct.__reads++;
            response.uuid    = data.uuid;
            response.data    = struct.__struct.find(data.query, data.conditions);
            response.message = 'ok';
            response.status  = 200;
            this.socket.send(['find'], response);            
        }); 
        
        /**
         * Handler for the save command
         */        
        o.registerHandler(['save'], function(data) {
            var struct = this.director.getDataStructure(data.key);
            this.director.getStatistics().logTransaction(data.key, 'save');
            var response = {};
            struct.__reads++;
            response.uuid    = data.uuid;
            response.data    = struct.__struct.save(data.object);
            response.message = 'ok';
            response.status  = 200;
            this.socket.send(['save'], response);            
        });         
        
        /**
         * Handler for the remove command
         */        
        o.registerHandler(['remove'], function(data) {
            var struct = this.director.getDataStructure(data.key);
            this.director.getStatistics().logTransaction(data.key, 'remove');
            var response = {};
            struct.__writes++;
            response.uuid    = data.uuid;
            response.data    = struct.__struct.remove(data.query, data.conditions);
            response.message = 'ok';
            response.status  = 200;
            this.socket.send(['remove'], response);            
        });        
        
        /**
         * Handler for the countq command
         */        
        o.registerHandler(['countq'], function(data) {
            var struct = this.director.getDataStructure(data.key);
            this.director.getStatistics().logTransaction(data.key, 'countq');
            var response = {};
            struct.__reads++;
            response.uuid    = data.uuid;
            response.data    = struct.__struct.countq(data.query, data.conditions);
            response.message = 'ok';
            response.status  = 200;
            this.socket.send(['countq'], response);            
        });        
        
        /**
         * Handler for the update command
         */        
        o.registerHandler(['update'], function(data) {
            var struct = this.director.getDataStructure(data.key);
            this.director.getStatistics().logTransaction(data.key, 'update');
            var response = {};
            struct.__writes++;
            response.uuid    = data.uuid;
            response.data    = struct.__struct.update(data.query, data.updates, data.conditions, data.upsert);
            response.message = 'ok';
            response.status  = 200;
            this.socket.send(['update'], response);            
        });        
        
        /**
         * Handler for the count command
         */
        o.registerHandler(['count'], function(data) {
            var struct = this.director.getDataStructure(data.key);
            this.director.getStatistics().logTransaction(data.key, 'count');
            var response = {};
            struct.__reads++;
            response.uuid    = data.uuid;
            response.data    = struct.__struct.count();
            response.message = 'ok';
            response.status  = 200;
            this.socket.send(['count'], response);
        });
        
        /**
         * Handler for the set command
         */
        o.registerHandler(['get'], function(data) {
            this.validate(data, ['subkey']);
            var struct   = this.director.getDataStructure(data.key);
            this.director.getStatistics().logTransaction(data.key, 'get');
            var response = {};
            struct.__reads++;
            response.uuid    = data.uuid;
            response.data    = struct.__struct.get(data.subkey);
            response.message = 'ok';
            response.status  = 200;
            this.socket.send(['get'], response);
        });
        
        /**
         * Handler for the set command
         */
        o.registerHandler(['set'], function(data) {
            this.validate(data, ['subkey']);
            var struct   = this.director.getDataStructure(data.key);
            this.director.getStatistics().logTransaction(data.key, 'set');
            var response = {};
            struct.__writes++;
            struct.__struct.set(data.subkey, data.value);
            response.uuid    = data.uuid;
            response.message = 'ok';
            response.status  = 200;
            this.socket.send(['set'], response);
        });
        
        /**
         * Handler for the push command
         */
        o.registerHandler(['push'], function(data) {
            this.validate(data, ['value']);
            var struct   = this.director.getDataStructure(data.key);
            this.director.getStatistics().logTransaction(data.key, 'push');
            var response = {};
            struct.__writes++;
            struct.__struct.push(data.value);
            response.uuid    = data.uuid;
            response.message = 'ok';
            response.status  = 200;
            this.socket.send(['push'], response);
        });
        
        /**
         * Handler for the pop command
         */
        o.registerHandler(['pop'], function(data) {
            var struct   = this.director.getDataStructure(data.key);
            this.director.getStatistics().logTransaction(data.key, 'pop');
            var response = {};
            struct.__reads++;
            struct.__writes++;
            response.uuid    = data.uuid;
            response.data    = struct.__struct.pop();
            response.message = 'ok';
            response.status  = 200;
            this.socket.send(['pop'], response);
        });
        
        /**
         * Handler for the peek command
         */
        o.registerHandler(['peek'], function(data) {
            var struct   = this.director.getDataStructure(data.key);
            this.director.getStatistics().logTransaction(data.key, 'peek');
            var response = {};
            struct.__reads++;
            struct.__struct.push(data.value);
            response.uuid    = data.uuid;
            response.data    = struct.__struct.peek();
            response.message = 'ok';
            response.status  = 200;
            this.socket.send(['peek'], response);
        });
        
        /**
         * Handler for the contains command
         */
        o.registerHandler(['contains'], function(data) {
            var struct   = this.director.getDataStructure(data.key);
            this.director.getStatistics().logTransaction(data.key, 'contains');
            var response = {};
            struct.__reads++;
            response.uuid    = data.uuid;
            response.data    = struct.__struct.contains(data.subkey);
            response.message = 'ok';
            response.status  = 200;
            this.socket.send(['contains'], response);
        });
        
        /**
         * Handler for the unset command
         */
        o.registerHandler(['unset'], function(data) {
            var struct   = this.director.getDataStructure(data.key);
            this.director.getStatistics().logTransaction(data.key, 'unset');
            var response = {};
            struct.__writes++;
            struct.__struct.unset(data.subkey);
            response.uuid    = data.uuid;
            response.message = 'ok';
            response.status  = 200;
            this.socket.send(['unset'], response);            
        }); 
        
        /**
         * Handler for the increment command
         */
        o.registerHandler(['increment'], function(data) {
            var struct   = this.director.getDataStructure(data.key);
            this.director.getStatistics().logTransaction(data.key, 'increment');
            var response = {};
            struct.__writes++;
            struct.__struct.increment(parseInt(data.value));
            response.uuid    = data.uuid;
            response.data    = struct.__struct.count();
            response.message = 'ok';
            response.status  = 200;
            this.socket.send(['increment'], response);
        });
        
        /**
         * Handler for the decrement command
         */
        o.registerHandler(['decrement'], function(data) {
            var struct   = this.director.getDataStructure(data.key);
            this.director.getStatistics().logTransaction(data.key, 'decrement');
            var response = {};
            struct.__writes++;
            struct.__struct.decrement(parseInt(data.value));
            response.uuid    = data.uuid;
            response.data    = struct.__struct.count();
            response.message = 'ok';
            response.status  = 200;
            this.socket.send(['decrement'], response);            
        });        
        
        /**
         * Handler for the clear command
         */
        o.registerHandler(['clear'], function(data) {
            var struct   = this.director.getDataStructure(data.key);
            this.director.getStatistics().logTransaction(data.key, 'clear');
            var response = {};
            struct.__writes++;
            struct.__struct.clear();
            response.uuid    = data.uuid;
            response.message = 'ok';
            response.status  = 200;
            this.socket.send(['clear'], response);
        });        
    };
    
};

/**
 * Returns a new {ProtocolAdaptorDecorator} instance
 * 
 * @return {ProtocolAdaptorDecorator}
 */
module.exports.getProtocolAdaptorDecorator = function() {
    return new module.exports.protocol.classes.ProtocolAdaptorDecorator()
};

/**
 * Returns a new, fully configured {ProtocolAdaptor} instance
 * 
 * @param {DataStructureRegistryDirector} director
 * @param {NSSocket} socket
 * @return {ProtocolAdaptor} 
 */
module.exports.getProtocolAdaptor = function(director, socket) {
    var adaptor   = new module.exports.protocol.classes.ProtocolAdaptor(director, socket);
    var decorator = new module.exports.protocol.classes.ProtocolAdaptorDecorator();
    decorator.decorate(adaptor);
    return adaptor;
};