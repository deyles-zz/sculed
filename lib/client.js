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

var nssocket = require('nssocket');
var uuid     = require('node-uuid');

/**
 * Module namespace
 */
module.exports = {
    client: {
        classes:   {},
        objects:   {},
        functions: {}
    }
};

/**
 * Returns a boolean value indicating whether or not the provided value is "empty". 
 * Values considered to be "empty" are as follows:
 * - null
 * - undefined
 * - an array a length of zero
 * 
 * @param {Mixed} value
 * @return {boolean}
 */
module.exports.client.functions.empty = function(value) {
    if (value === null || value === undefined) {
        return true;
    }
    if (Object.prototype.toString.call(value) === '[object Array]') {
        if (value.length == 0) {
            return true;
        }
    }
    return false;
};

/**
 * Represents a socket based "client" for SculeServer. This class encapsulates
 * all logic for NSSocket protocol based interaction with server instances.
 * It should never really ever be used outside this module.
 * 
 * @class {Client}
 */
module.exports.client.classes.Client = function() {
    
    /**
     * @type {NSSocket}
     */
    this.socket    = null;
    
    /**
     * @type {Object}
     */
    this.callbacks = {};
    
    /**
     * A list of all allowed commands
     * 
     * @type {Array}
     */
    this.commands = [
        'new', 
        'destroy', 
        'error', 
        'set', 
        'get', 
        'unset', 
        'push', 
        'pop', 
        'peek', 
        'count',
        'clear',
        'contains',
        'increment',
        'decrement',
        'stats',
        'find',
        'remove',
        'update',
        'countq'
    ];
    
    /**
     * Establises a connection to the specified host, executing the provided
     * callback on error and/or completion
     * 
     * @param {String} host
     * @param {Number} port
     * @param {Function} callback
     * @return {Void}
     */
    this.connect = function(host, port, callback) {
        this.socket = new nssocket.NsSocket();
        this.socket.connect(port, host, callback);
        var __t = this;
        this.commands.forEach(function(command) {
            __t.socket.data([command], __t.factoryHandler());
        });
    };
    
    /**
     * Disconnects an established connection to a SculeServer instance
     * 
     * @return {Void}
     */
    this.disconnect = function() {
        this.socket.end();
        this.socket.destroy();
    };
    
    /**
     * Factories a new "handler" closure - these functions are used to handle
     * server responses for all commands.
     * 
     * @return {Void}
     */
    this.factoryHandler = function() {
        var h = function(data) {
            if (!this.callbacks.hasOwnProperty(data.uuid)) {
                return;
            }
            var error = (data.status === 200) ? undefined : new Error(data.message);
            var callback = this.callbacks[data.uuid];
            delete this.callbacks[data.uuid];
            if (data.hasOwnProperty('data')) {
                callback(error, data.data);
            } else if (data.hasOwnProperty('stats')) {
                callback(error, data.stats);
            } else {
                callback(error, (data.message === 'ok'));    
            }
        };
        return h.bind(this);        
    };
    
    /**
     * Sends a command to the connected server instance. Commands are executed
     * asynchronously, with callbacks being executed when responses are received
     * from the server. Commands are uniquely identified using UUIDs.
     * 
     * @param {Array} namespace
     * @param {Object} data
     * @param {Function} callback
     * @return {Void}
     */
    this.command = function(namespace, data, callback) {
        data.uuid = uuid.v4();
        if (callback) {
            this.callbacks[data.uuid] = callback;
        }
        this.socket.send(namespace, data);
    };
    
};

/**
 * A base class encapsulating logic for issuing data structure implementation
 * specific commands to SculeServer instances
 * 
 * @param {String} type
 * @param {String} name
 * @param {Array} options
 */
module.exports.client.classes.DataStructure = function(type, name, options) {

    /**
     * @type {Client}
     */
    this.client  = module.exports.client.objects.client;
    
    /**
     * @type {String}
     */
    this.type    = type;
    
    /**
     * @type {Array}
     */
    this.options = options;
    
    /**
     * @type {String}
     */
    this.name    = name;
    if (!this.name) {
        this.name = uuid.v4();
    }

    this.construct = function(callback) {
        var data = {
            type:    this.type,
            key:     this.name,
            options: this.options
        };
        this.client.command(['new'], data, callback);
    };
        
    this.destroy = function(callback) {
        var data = {
            key: this.name
        };
        this.client.command(['destroy'], data, callback);        
    }; 

    this.increment = function(value, callback) {
        var data = {
            key:   this.name,
            value: value
        };
        this.client.command(['increment'], data, callback);
    };

    this.decrement = function(value, callback) {
        var data = {
            key:   this.name,
            value: value
        };
        this.client.command(['decrement'], data, callback);
    };

    this.set = function(subkey, value, callback) {
        var data = {
            key:    this.name,
            subkey: subkey,
            value:  value
        };
        this.client.command(['set'], data, callback);
    };

    this.get = function(subkey, callback) {
        var data = {
            key:    this.name,
            subkey: subkey
        };
        this.client.command(['get'], data, callback);
    };

    this.unset = function(subkey, callback) {
        var data = {
            key:    this.name,
            subkey: subkey
        };
        this.client.command(['unset'], data, callback);
    };

    this.push = function(value, callback) {
        var data = {
            key:   this.name,
            value: value
        };
        this.client.command(['push'], data, callback);
    };

    this.pop = function(callback) {
        var data = {
            key: this.name
        };
        this.client.command(['pop'], data, callback);
    };

    this.peek = function(callback) {
        var data = {
            key: this.name
        };
        this.client.command(['peek'], data, callback);
    };

    this.count = function(callback) {
        var data = {
            key: this.name
        };
        this.client.command(['count'], data, callback);
    };

    this.clear = function(subkey, callback) {
        var data = {
            key: this.name
        };
        this.client.command(['clear'], data, callback);
    };

    this.contains = function(subkey, callback) {
        var data = {
            key:     this.name,
            subkey:  subkey
        };
        this.client.command(['contains'], data, callback);
    };

    this.find = function(query, conditions, callback) {
        var data = {
            key:        this.name,
            query:      query,
            conditions: conditions
        };
        this.client.command(['find'], data, callback);
    };

    this.save = function(object, callback) {
        var data = {
            key:    this.name,
            object: object
        };
        this.client.command(['save'], data, callback);
    };

    this.update = function(query, updates, conditions, upsert, callback) {
        var data = {
            key:        this.name,
            query:      query,
            updates:    updates,
            conditions: conditions,
            upsert:     upsert
        };
        this.client.command(['update'], data, callback);
    };

    this.remove = function(query, conditions, callback) {
        var data = {
            key:        this.name,
            query:      query,
            conditions: conditions
        };
        this.client.command(['remove'], data, callback);
    };

    this.countq = function(query, conditions, callback) {
        var data = {
            key:        this.name,
            query:      query,
            conditions: conditions
        };
        this.client.command(['countq'], data, callback);
    };

};

module.exports.client.classes.Collection = function(name, options, callback) {

    if (module.exports.client.functions.empty(options)) {
        options = [];
    }
    
    this.struct = module.exports.getDataStructure('Collection', name, options);
    
    this.find = function(query, conditions, callback) {
        this.struct.find(query, conditions, callback);
    };

    this.save = function(object, callback) {
        this.struct.save(object, callback);
    };

    this.update = function(query, updates, conditions, upsert, callback) {
        this.struct.update(query, updates, conditions, upsert, callback);
    };

    this.remove = function(query, conditions, callback) {
        this.struct.remove(query, conditions, callback);
    };

    this.count = function(query, conditions, callback) {
        this.struct.countq(query, conditions, callback);
    };    
    
    this.clear = function(callback) {
        this.struct.clear(callback);
    };    
    
    this.struct.construct(callback);    
    
};

module.exports.client.classes.Stack = function(name, options, callback) {
    
    if (module.exports.client.functions.empty(options)) {
        options = [];
    }
    
    this.struct = module.exports.getDataStructure('LIFOStack', name, options);
    
    this.push = function(value, callback) {
        this.struct.push(value, callback);
    };

    this.peek = function(callback) {
        this.struct.peek(callback);
    };

    this.pop = function(callback) {
        this.struct.pop(callback);
    };

    this.clear = function(callback) {
        this.struct.clear(callback);
    };
    
    this.count = function(callback) {
        this.struct.count(callback);
    };
    
    this.struct.construct(callback);
    
};

module.exports.client.classes.Queue = function(name, options, callback) {
    
    if (module.exports.client.functions.empty(options)) {
        options = [];
    }
    
    this.struct = module.exports.getDataStructure('Queue', name, options);
    
    this.enqueue = function(value, callback) {
        this.struct.push(value, callback);
    };

    this.dequeue = function(callback) {
        this.struct.pop(callback);
    };

    this.purge = function(callback) {
        this.struct.clear(callback);
    };
    
    this.count = function(callback) {
        this.struct.count(callback);
    };
    
    this.struct.construct(callback);
    
};

module.exports.client.classes.Counter = function(name, options, callback) {
    
    if (module.exports.client.functions.empty(options)) {
        options = [0];
    }
    
    this.struct = module.exports.getDataStructure('AtomicCounter', name, options);
    
    this.increment = function(value, callback) {
        if (typeof value === 'undefined') {
            value = 1;
        }
        this.struct.increment(value, callback);
    };
    
    this.decrement = function(value, callback) {
        if (typeof value === 'undefined') {
            value = 1;
        }
        this.struct.decrement(value, callback);
    };
    
    this.clear = function(callback) {
        this.struct.clear(callback);
    };
    
    this.count = function(callback) {
        this.struct.count(callback);
    };
    
    this.struct.construct(callback);
    
};

module.exports.client.classes.HashTable = function(name, options, callback) {
    
    if (module.exports.client.functions.empty(options)) {
        options = [1000];
    }
    
    this.struct = module.exports.getDataStructure('HashTable', name, options);
    
    this.get = function(key, callback) {
        this.struct.get(key, callback);
    };

    this.set = function(key, value, callback) {
        this.struct.set(key, value, callback);
    };

    this.unset = function(key, callback) {
        this.struct.unset(key, callback);
    };

    this.clear = function(callback) {
        this.struct.clear(callback);
    };
    
    this.count = function(callback) {
        this.struct.count(callback);
    };    

    this.contains = function(key, callback) {
        this.struct.contains(key, callback);
    };    

    this.struct.construct(callback);
    
};

module.exports.client.classes.LRUCache = function(name, options, callback) {
    
    if (module.exports.client.functions.empty(options)) {
        options = [1000];
    }
    
    this.struct = module.exports.getDataStructure('LRUCache', name, options);
    
    this.get = function(key, callback) {
        this.struct.get(key, callback);
    };

    this.set = function(key, value, callback) {
        this.struct.set(key, value, callback);
    };

    this.unset = function(key, callback) {
        this.struct.unset(key, callback);
    };

    this.clear = function(callback) {
        this.struct.clear(callback);
    };
    
    this.count = function(callback) {
        this.struct.count(callback);
    };    

    this.contains = function(key, callback) {
        this.struct.contains(key, callback);
    };    

    this.struct.construct(callback);
    
};

module.exports.client.classes.BloomFilter = function(name, options, callback) {
    
    if (module.exports.client.functions.empty(options)) {
        options = [1000];
    }
    
    this.struct = module.exports.getDataStructure('BloomFilter', name, options);
    
    this.get = function(key, callback) {
        this.struct.get(key, callback);
    };

    this.set = function(key, value, callback) {
        this.struct.set(key, value, callback);
    };

    this.unset = function(key, callback) {
        this.struct.unset(key, callback);
    };

    this.clear = function(callback) {
        this.struct.clear(callback);
    };
    
    this.count = function(callback) {
        this.struct.count(callback);
    };    

    this.contains = function(key, callback) {
        this.struct.contains(key, callback);
    };    

    this.struct.construct(callback);
    
};

module.exports.client.classes.BitSet = function(name, options, callback) {
    
    if (module.exports.client.functions.empty(options)) {
        options = [1000];
    }
    
    this.struct = module.exports.getDataStructure('BitSet', name, options);
    
    this.get = function(key, callback) {
        this.struct.get(key, callback);
    };

    this.set = function(key, value, callback) {
        this.struct.set(key, value, callback);
    };

    this.unset = function(key, callback) {
        this.struct.unset(key, callback);
    };

    this.clear = function(callback) {
        this.struct.clear(callback);
    };
    
    this.count = function(callback) {
        this.struct.count(callback);
    };    

    this.contains = function(key, callback) {
        this.struct.contains(key, callback);
    };    

    this.struct.construct(callback);
    
};

module.exports.client.classes.BinarySearchTree = function(name, options, callback) {
    
    if (module.exports.client.functions.empty(options)) {
        options = [];
    }
    
    this.struct = module.exports.getDataStructure('BinarySearchTree', name, options);
    
    this.get = function(key, callback) {
        this.struct.get(key, callback);
    };

    this.set = function(key, value, callback) {
        this.struct.set(key, value, callback);
    };

    this.unset = function(key, callback) {
        this.struct.unset(key, callback);
    };

    this.clear = function(callback) {
        this.struct.clear(callback);
    };
    
    this.count = function(callback) {
        this.struct.count(callback);
    };    

    this.contains = function(key, callback) {
        this.struct.contains(key, callback);
    };    

    this.struct.construct(callback);
    
};

/**
 * Returns the aggregated statistics for the server. The provided callback should
 * accept two parameters: an error instance, and an object representing the server
 * statistics.
 * 
 * @param {Function} callback
 * @return {Void}
 */
module.exports.getStatistics = function(callback) {
    module.exports.client.objects.client.command(['stats'], {}, callback);
};

module.exports.getDataStructure = function(type, name, options) {
    return new module.exports.client.classes.DataStructure(type, name, options);
};

module.exports.getStack = function(name, options, callback) {
    return new module.exports.client.classes.Stack(name, options, callback);
};

module.exports.getQueue = function(name, options, callback) {
    return new module.exports.client.classes.Queue(name, options, callback);
};

module.exports.getCounter = function(name, options, callback) {
    return new module.exports.client.classes.Counter(name, options, callback);
};

module.exports.getHashTable = function(name, options, callback) {
    return new module.exports.client.classes.HashTable(name, options, callback);
};

module.exports.getBinarySearchTree = function(name, options, callback) {
    return new module.exports.client.classes.BinarySearchTree(name, options, callback);
};

module.exports.getBloomFilter = function(name, options, callback) {
    return new module.exports.client.classes.BloomFilter(name, options, callback);
};

module.exports.getBitSet = function(name, options, callback) {
    return new module.exports.client.classes.BitSet(name, options, callback);
};

module.exports.getLRUCache = function(name, options, callback) {
    return new module.exports.client.classes.LRUCache(name, options, callback);
};

module.exports.getCollection = function(name, options, callback) {
    return new module.exports.client.classes.Collection(name, options, callback);
};

/**
 * Connects to a SculeServer instance running on the specified host and port. The
 * provided callback is executed on connect.
 * 
 * @param {String} host
 * @param {Number} port
 * @param {Function} callback
 * @return {Void}
 */
module.exports.connect = function(host, port, callback) {
    module.exports.client.objects.client = new module.exports.client.classes.Client();
    module.exports.client.objects.client.connect(host, port, callback);
};

/**
 * Disconnects from the connected SculeServer instance
 * 
 * @return {Void}
 */
module.exports.disconnect = function() {
    module.exports.client.objects.client.disconnect();
};