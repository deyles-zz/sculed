module.exports = {
    protocol: {
        classes:   {},
        variables: {},
        objects:   {}
    }
};

module.exports.protocol.classes.ProtocolAdaptor = function(director, socket) {
    
    this.handlers = {};
    this.director = director;
    this.socket   = socket;
    
    this.registerHandler = function(namespace, handler) {
        handler = handler.bind(this);
        var wrapper = function(data) {
            if (!data.hasOwnProperty('uuid')) {
                return;
            }
            if (!data.hasOwnProperty('key')) {
                return;
            }            
            if (!this.director.containsDataStructure(data.key)) {
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
    
    this.validate = function(data, required) {
        for (var i=0; i < required.length; i++) {
            if (!data.hasOwnProperty(required[i])) {
                throw new Error('badly formed protocol frame');
            }
        }
    };    
    
    this.setupConstructor = function() {
        var callback = function(data) {
            try {
                this.validate(data, ['type', 'options']);
                this.director.spawnDataStructure(data.key, data.type, data.options);
                var response = {
                    uuid: data.uuid,
                    message: 'ok',
                    status:  200
                };
                this.socket.send(['new'], response);
            } catch (e) {
                this.socket.send(['error'], {
                    message: e.message, 
                    status: 500, 
                    uuid: data.uuid
                });
            }        
        };
        callback = callback.bind(this);
        this.socket.data(['new'], callback);
    };
    
    this.setupStatistics = function() {
        var callback = function(data) {
            var response = {
                uuid: data.uuid,
                message: 'ok',
                status:  200,
                stats:   {}
            };
            var registry = this.director.getRegistry();
            var k = registry.getKeys();
            registry.getKeys().forEach(function(key) {
                var o = registry.get(key);
                response.stats[key] = {
                    created: o.__timestamp,
                    alive:   ((new Date()).getTime() - o.__timestamp),
                    type:    o.__class,
                    options: o.__options,
                    length:  o.__struct.count(),
                    reads:   o.__reads,
                    writes:  o.__writes
                };
            });
            this.socket.send(['stats'], response);
        };
        callback = callback.bind(this);
        this.socket.data(['stats'], callback);        
    };
    
    this.setupConstructor();
    this.setupStatistics();
    
};

module.exports.protocol.classes.ProtocolAdaptorDecorator = function() {
    
    this.decorate = function(o) {
        
        /**
         * Handler for the destroy command
         */
        o.registerHandler(['destroy'], function(data) {
            this.director.destroyDataStructure(data.key);
            var response = {
                uuid: data.uuid,
                message: 'ok',
                status:  200
            };
            this.socket.send(['destroy'], response);
        });
        
        /**
         * Handler for the count command
         */
        o.registerHandler(['count'], function(data) {
            var struct = this.director.getDataStructure(data.key);
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

module.exports.getProtocolAdaptorDecorator = function() {
    return new module.exports.protocol.classes.ProtocolAdaptorDecorator()
};

module.exports.getProtocolAdaptor = function(director, socket) {
    var adaptor   = new module.exports.protocol.classes.ProtocolAdaptor(director, socket);
    var decorator = new module.exports.protocol.classes.ProtocolAdaptorDecorator();
    decorator.decorate(adaptor);
    return adaptor;
};