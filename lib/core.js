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
var protocol = require('./protocol');
var proxy    = require('./proxy');

/**
 * Module namespace
 */
module.exports = {
    core: {
        classes:   {},
        variables: {
            debug: false
        },
        objects:   {}
    },
    scule: null
};

/**
 * SculeJS imports
 */
module.exports.scule = require('sculejs');
proxy.setScule(module.exports.scule);

/**
 * A simple hash table based registry for data structure instances.
 * Structures are keyed by "name" - that is, the name given to them
 * by the calling spoke. This class extends the SculeJS HashTable class.
 * 
 * @class {DataStructureRegistry}
 * @extends {HashTable}
 */
module.exports.core.classes.DataStructureRegistry = function() {
    
    module.exports.scule.datastructures.classes.HashTable.call(this, 100000);
    
};

/**
 * An abstract factory for data structure proxy instances. Given a class name
 * and options it will return a new instance of the specified data structure
 * proxy.
 * 
 * @class {DataStructureSpawner}
 */
module.exports.core.classes.DataStructureSpawner = function() {

    /**
     * Spawns a new proxy instance corresponding to the given class name
     * and using the provided options.
     * 
     * @param {String} className
     * @param {Array} options
     */
    this.spawn = function(className, options) {
        return proxy.factoryProxy(className, options);
    };

};

/**
 * A container used to aggregate server statistics at run time
 * 
 * @class {ServerStatistics}
 */
module.exports.core.classes.ServerStatistics = function() {

    /**
     * @type {Number}
     */
    this.writes     = 0;
    this.reads      = 0;
    this.timestamp  = (new Date()).getTime();
    
    /**
     * @type {Object}
     */
    this.statistics = {};

    /**
     * Adds a new key to the aggregation. The provided key corresponds to the name
     * given to a data structure when it is instantiated.
     * 
     * @param {String} key
     * @param {String} type
     * @return {boolean}
     */
    this.addKey = function(key, type) {
        if (this.statistics.hasOwnProperty(key)) {
            return false;
        }
        this.statistics[key] = {
            type:      type,
            create_ts: (new Date()).getTime(),
            reads:     0,
            writes:    0
        };
        return true;
    };

    /**
     * Removes an existing key from the aggregation.
     * 
     * @param {String} key
     * @return {boolean}
     */
    this.removeKey = function(key) {
        if (!this.statistics.hasOwnProperty(key)) {
            false;
        }        
        delete this.statistics[key];
        return true;
    };

    /**
     * Logs a write operation to the statistics aggregation
     * 
     * @return {Void}
     */
    this.logWrite = function(key) {
        this.writes++;
        this.statistics[key].writes++;
    };

    /**
     * Logs a read operation to the statistics aggregation
     * 
     * @return {Void}
     */
    this.logRead = function(key) {
        this.reads++;
        this.statistics[key].reads++;
    };

    /**
     * Returns a representation of the aggregate runtime statistics
     * for the server as a plain old JavaScript object
     * 
     * @return {Object}
     */
    this.serialize = function() {
        var diff     = ((new Date()).getTime() - this.timestamp);
        var uptime_s = (diff > 0) ? Math.floor(diff/1000) : 0;
        var trans    = (this.writes + this.reads);
        var trans_s  = (trans > 0 && uptime_s > 0) ? (trans/uptime_s) : 0;
        return {
            uptime_s:   uptime_s,
            trans_s:    trans_s,
            writes:     this.writes,
            reads:      this.reads,
            trans:      trans,
            start_ts:   this.timestamp,
            statistics: this.statistics
        };
    };

};

/**
 * A delegate used to facilitate interaction with the global data structure
 * registry instance.
 * 
 * @class {DataStructureRegistryDirector}
 */
module.exports.core.classes.DataStructureRegistryDirector = function() {

    /**
     * @type {DataStructureRegistry}
     */
    this.registry   = new module.exports.core.classes.DataStructureRegistry();
    
    /**
     * @type {DataStructureSpawner}
     */
    this.spawner    = new module.exports.core.classes.DataStructureSpawner();
    
    /**
     * @type {ServerStatistics}
     */
    this.statistics = new module.exports.core.classes.ServerStatistics();

    /**
     * Returns the global ServerStatistics instance for the server
     * 
     * @return {ServerStatistics}
     */
    this.getStatistics = function() {
        return this.statistics;
    };

    /**
     * Returns the global DataStructureRegistry instance for the server
     * 
     * @return {DataStructureRegistry}
     */
    this.getRegistry = function() {
        return this.registry;
    };

    /**
     * Returns a boolean flag indicating whether or not the provided key exists
     * inside the registry.
     * 
     * @param {String} key
     * @return {boolean}
     */
    this.containsDataStructure = function(key) {
        return this.registry.contains(key);
    };

    /**
     * Returns the data structure proxy instance corresponding to the provided key.
     * 
     * @param {String} key
     * @return {DataStructurProxy|undefined}
     */
    this.getDataStructure = function(key) {
        if (!this.registry.contains(key)) {
            return undefined;
        }
        return this.registry.get(key);
    };

    /**
     * Removes the data structure proxy instance corresponding to the provided key
     * from the registry.
     * 
     * @param {String} key
     * @return {Void}
     */
    this.destroyDataStructure = function(key) {
        module.exports.log('destroying struct: ' + key);
        this.registry.remove(key);
    };

    /**
     * Spawns a new data structure proxy instance and adds it to the registry. This
     * function will throw an error if the provided key already exists in the registry.
     * 
     * @param {String} key
     * @param {String} className
     * @param {Array} options
     * @return {DataStructureProxy}
     * @throws {Error}
     */
    this.spawnDataStructure = function(key, className, options) {
        if (this.registry.contains(key)) {
            throw new Error('data structure corresponding to key ' + key + ' already exists');
        }
        module.exports.log('spawning new struct: ' + key + ' => ' + className);
        var o = {
            __class: className,
            __options: options,
            __struct: this.spawner.spawn(className, options)
        };
        this.registry.put(key, o);
        return o.__struct;
    };

};

/**
 * Returns a new {ServerStatistics} instance
 * 
 * @return {ServerStatistics}
 */
module.exports.getServerStatistics = function() {
    return new module.exports.core.classes.ServerStatistics();
};

/**
 * Returns a new {DataStructureRegistry} instance
 * 
 * @return {DataStructureRegistry}
 */
module.exports.getDataStructureRegistry = function() {
    return new module.exports.core.classes.DataStructureRegistry();
};

/**
 * Returns a new {DataStructureSpawner} instance
 * 
 * @return {DataStructureSpawner}
 */
module.exports.getDataStructureSpawner = function() {
    return new module.exports.core.classes.DataStructureSpawner();
};

/**
 * Returns a new {DataStructureRegistryDirector} instance
 * 
 * @return {DataStructureRegistryDirector}
 */
module.exports.getDataStructureRegistryDirector = function() {
    return new module.exports.core.classes.DataStructureRegistryDirector();
};

/**
 * Creates a new SculeServer instance - the calling spoke should call the listen
 * function on the new server instance with a port number and callback.
 * 
 * @return {NSSocket}
 * @throws {Error}
 */
module.exports.getServer = function() {
    var director = module.exports.getDataStructureRegistryDirector();
    var server   = nssocket.createServer(function(socket) {
        module.exports.log('new connection: ' + socket.socket.remoteAddress + ':' + socket.socket.remotePort);
        protocol.getProtocolAdaptor(director, socket);    
    });
    server.setMaxListeners(0);
    return server;    
};

/**
 * Logs a message to the console
 * 
 * @param {String} message
 * @return {Void}
 * @see {setDebug}
 */
module.exports.log = function(message) {
    if (module.exports.core.variables.debug) {
        console.log(message);
    }
};

/**
 * Sets a boolean flag indicating whether or not to log messages to the console.
 * By default this is false.
 * 
 * @param {boolean} debug
 * @return {Void}
 */
module.exports.setDebug = function(debug) {
    module.exports.core.variables.debug = debug;
};