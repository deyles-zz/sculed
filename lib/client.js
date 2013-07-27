var nssocket = require('nssocket');
var uuid     = require('node-uuid');

module.exports = {
    client: {
        classes:   {},
        objects:   {},
        functions: {}
    }
};

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

module.exports.client.classes.Client = function() {
    
    this.socket    = null;
    this.callbacks = {}; 
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
        'decrement'
    ];
    
    this.connect = function(host, port, callback) {
        this.socket = new nssocket.NsSocket();
        this.socket.connect(port, host, callback);
        var __t = this;
        this.commands.forEach(function(command) {
            __t.socket.data([command], __t.factoryHandler());
        })
    };
    
    this.disconnect = function() {
        this.socket.end();
        this.socket.destroy();
    };
    
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
            } else {
                callback(error, (data.message === 'ok'));    
            }
        };
        return h.bind(this);        
    };
       
    this.command = function(namespace, data, callback) {
        data.uuid = uuid.v4();
        if (callback) {
            this.callbacks[data.uuid] = callback;
        }
        this.socket.send(namespace, data);
    };
    
};

module.exports.client.classes.DataStructure = function(type, name, options) {

    this.client  = module.exports.client.objects.client;
    this.type    = type;
    this.options = options;
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

};

module.exports.client.classes.AtomicCounter = function(name, options, callback) {
    
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

module.exports.getDataStructure = function(type, name, options) {
    return new module.exports.client.classes.DataStructure(type, name, options);
};

module.exports.getAtomicCounter = function(name, options, callback) {
    return new module.exports.client.classes.AtomicCounter(name, options, callback);
};

module.exports.getHashTable = function(name, options, callback) {
    return new module.exports.client.classes.HashTable(name, options, callback);
};

module.exports.connect = function(host, port, callback) {
    module.exports.client.objects.client = new module.exports.client.classes.Client();
    module.exports.client.objects.client.connect(host, port, callback);
};

module.exports.disconnect = function() {
    module.exports.client.objects.client.disconnect();
};