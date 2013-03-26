module.exports = {
    protocol: {
        classes:   {},
        variables: {},
        objects:   {}
    }
};

module.exports.protocol.variables.commands = {
    'new'      : true,
    'destroy'  : true,
    'count'    : true,
    'contains' : true,
    'get'      : true,
    'set'      : true,
    'range'    : true,
    'put'      : true,
    'push'     : true,
    'pop'      : true,
    'peek'     : true,
    'clear'    : true,
    'increment': true,
    'decrement': true
};

module.exports.protocol.variables.types = {
    's' : true,
    'i' : true,
    'f' : true
};

module.exports.protocol.variables.keys = {
    'Command' : true,
    'Key'     : true,
    'SubKey'  : true,
    'RangeDef': true,
    'Class'   : true,
    'Options' : true,
    'Value'   : true,
    'Message' : true,
    'Status'  : true,
    'Data'    : true
};

module.exports.protocol.classes.ProtocolFrame = function() {
    
    this.chunks = {};
    this.list   = {
        'Options': true,
        'RangeDef': true
    };
    
    this.containsChunk = function(key) {
        return this.chunks.hasOwnProperty(key);
    };
    
    this.addListChunk = function(key, value) {
        value = value.split(',');
        for (var i=0; i < value.length; i++) {
            value[i] = this.parseChunk(value[i].trim());
        }
        this.chunks[key] = value;
    };
    
    this.addChunk = function(key, value) {
        if (!module.exports.protocol.variables.keys.hasOwnProperty(key)) {
            throw 'unrecognized key: ' + key;
        }
        if (key === 'Command' && !module.exports.protocol.variables.commands.hasOwnProperty(value)) {
            throw 'unrecognized command: ' + value;
        }
        if (this.list.hasOwnProperty(key)) {
            this.addListChunk(key, value);
        } else {
            this.chunks[key] = this.parseChunk(value);
        }
    };
    
    this.getChunk = function(key) {
        if (!this.containsChunk(key)) {
            return undefined;
        }
        return this.chunks[key];
    };

    this.parseChunk = function(chunk) {
        if (!chunk.match) {
            return chunk;
        }
        if (!chunk.match(/^[isf]{1,}\:/)) {
            return chunk;
        }
        var chunks = chunk.split(/\:/);
        var rest   = JSON.parse(chunks.splice(1).join(':'));
        switch (chunks[0]) {
            case 'i':
                rest = parseInt(rest);
                break;
                
            case 'f':
                rest = parseFloat(rest);
                break;
        }
        return rest;
    };

    this.getCommand = function() {
        return this.getChunk('Command');
    };
    
    this.getKey = function() {
        return this.getChunk('Key');
    };
    
    this.getSubKey = function() {
        return this.getChunk('SubKey');
    };
    
    this.getRangeDef = function() {
        return this.getChunk('RangeDef');
    };
    
    this.getClass = function() {
        return this.getChunk('Class');
    };
    
    this.getOptions = function() {
        return this.getChunk('Options');
    };
    
    this.getValue = function() {
        return this.getChunk('Value');
    };
    
    this.toString = function() {
        var f = [];
        for (var k in this.chunks) {
            if (this.chunks.hasOwnProperty(k)) {
                f.push(k + '\t' + this.chunks[k]);
            }
        }
        return f.join('\n') + '\n\r';
    };
    
};

module.exports.protocol.classes.ProtocolFrameParser = function() {

    this.parse = function(frame) {
        var f      = new module.exports.protocol.classes.ProtocolFrame();
        var chunks = frame.toString().trim().split(/\n/);
        chunks.forEach(function(chunk) {
            if (chunk.trim().length == 0) {
                return;
            }
            var c = chunk.split(/\t/);
            var k = c.shift();
            var v = c.join('\t');
            f.addChunk(k, v);
        });
        return f;
    };

};

module.exports.protocol.classes.ProtocolAdaptor = function(director, socket) {
    
    this.handlers = {};
    this.parser   = new module.exports.protocol.classes.ProtocolFrameParser();
    this.director = director;
    this.socket   = socket;
    
    this.registerHandler = function(command, handler) {
        if (!this.handlers.hasOwnProperty(command)) {
            this.handlers[command] = handler;
        }
    };
    
    this.handle = function(frame) {
        try {
            var f = this.parser.parse(frame);
            if (!this.handlers.hasOwnProperty(f.getCommand())) {
                throw 'unhandled command ' + f.getCommand();
            }
            this.handlers[f.getCommand()](this, f);
        } catch (e) {
            var response = new module.exports.protocol.classes.ProtocolFrame();
            response.addChunk('Message', e.toString());
            response.addChunk('Status',  500);
            this.respond(response);
        }
    };
    
    this.validate = function(frame, required) {
        for (var i=0; i < required.length; i++) {
            if (!frame.containsChunk(required[i])) {
                throw 'Badly formed protocol frame';
            }
        }
    };
    
    this.respond = function(frame) {
        if (this.socket === undefined) {
            console.log(frame.toString());
        } else {
            this.socket.write(frame.toString());
            this.socket.pipe(socket);
        }
    };
    
};

module.exports.protocol.classes.ProtocolAdaptorDecorator = function() {
    
    this.decorate = function(o) {
        /**
         * Handler for the new command
         */
        o.registerHandler('new', function(adaptor, frame) {
            adaptor.validate(frame, ['Key', 'Class', 'Options']);
            adaptor.director.spawnDataStructure(frame.getKey(), frame.getClass(), frame.getOptions());
            var response = new module.exports.protocol.classes.ProtocolFrame();
            response.addChunk('Command', frame.getCommand());
            response.addChunk('Message', 'ok');
            response.addChunk('Status',  200);
            adaptor.respond(response);            
        });
        /**
         * Handler for the destroy command
         */
        o.registerHandler('destroy', function(adaptor, frame) {
            adaptor.validate(frame, ['Key']);
            adaptor.director.destroyDataStructure(frame.getKey());
            var response = new module.exports.protocol.classes.ProtocolFrame();
            response.addChunk('Command', frame.getCommand());
            response.addChunk('Message', 'ok');
            response.addChunk('Status',  200);
            adaptor.respond(response);            
        });
        /**
         * Handler for the count command
         */
        o.registerHandler('count', function(adaptor, frame) {
            adaptor.validate(frame, ['Key']);
            var struct   = adaptor.director.getDataStructure(frame.getKey());
            var response = new module.exports.protocol.classes.ProtocolFrame();
            response.addChunk('Command', frame.getCommand());
            if (struct === undefined) {
                response.addChunk('Message', 'key does not exist');
                response.addChunk('Status',  404);                
            } else {
                response.addChunk('Data',    struct.__struct.count());
                response.addChunk('Status',  200);  
            }
            adaptor.respond(response);            
        });
        /**
         * Handler for the range command
         */
        o.registerHandler('range', function(adaptor, frame) {
            adaptor.validate(frame, ['Key','RangeDef']);
            var struct   = adaptor.director.getDataStructure(frame.getKey());
            var response = new module.exports.protocol.classes.ProtocolFrame();
            response.addChunk('Command', frame.getCommand());
            if (struct === undefined) {
                response.addChunk('Message', 'key does not exist');
                response.addChunk('Status',  404);                
            } else {
                var def = frame.getRangeDef();
                while (def.length < 4) {
                    def.push(0);
                }
                response.addChunk('Key',       frame.getKey());
                response.addChunk('RangeDef',  def.join(', ').trim());
                response.addChunk('Data',      struct.__struct.range(def[0], def[1], def[2], def[3]));
                response.addChunk('Status',    200);  
            }
            adaptor.respond(response);            
        });        
        /**
         * Handler for the set command
         */
        o.registerHandler('get', function(adaptor, frame) {
            adaptor.validate(frame, ['Key','SubKey']);
            var struct   = adaptor.director.getDataStructure(frame.getKey());
            var response = new module.exports.protocol.classes.ProtocolFrame();
            response.addChunk('Command', frame.getCommand());
            if (struct === undefined) {
                response.addChunk('Message', 'key does not exist');
                response.addChunk('Status',  404);                
            } else {
                response.addChunk('Key',     frame.getKey());
                response.addChunk('SubKey',  frame.getSubKey());
                response.addChunk('Data',    struct.__struct.get(frame.getSubKey(), frame.getValue()));
                response.addChunk('Status',  200);  
            }
            adaptor.respond(response);            
        });        
        /**
         * Handler for the set command
         */
        o.registerHandler('set', function(adaptor, frame) {
            adaptor.validate(frame, ['Key']);
            var struct   = adaptor.director.getDataStructure(frame.getKey());
            var response = new module.exports.protocol.classes.ProtocolFrame();
            response.addChunk('Command', frame.getCommand());
            if (struct === undefined) {
                response.addChunk('Message', 'key does not exist');
                response.addChunk('Status',  404);                
            } else {
                response.addChunk('Key', frame.getKey());
                response.addChunk('SubKey', frame.getSubKey());
                struct.__struct.set(frame.getSubKey(), frame.getValue());
                response.addChunk('Status',  200);  
            }
            adaptor.respond(response);            
        });
        /**
         * Handler for the push command
         */
        o.registerHandler('push', function(adaptor, frame) {
            adaptor.validate(frame, ['Key', 'Value']);
            var struct   = adaptor.director.getDataStructure(frame.getKey());
            var response = new module.exports.protocol.classes.ProtocolFrame();
            response.addChunk('Command', frame.getCommand());
            if (struct === undefined) {
                response.addChunk('Message', 'key does not exist');
                response.addChunk('Status',  404);                
            } else {
                response.addChunk('Key', frame.getKey());
                struct.__struct.push(frame.getValue());
                response.addChunk('Status',  200);  
            }
            adaptor.respond(response);            
        });       
        /**
         * Handler for the pop command
         */
        o.registerHandler('pop', function(adaptor, frame) {
            adaptor.validate(frame, ['Key']);
            var struct   = adaptor.director.getDataStructure(frame.getKey());
            var response = new module.exports.protocol.classes.ProtocolFrame();
            response.addChunk('Command', frame.getCommand());
            if (struct === undefined) {
                response.addChunk('Message', 'key does not exist');
                response.addChunk('Status',  404);                
            } else {
                response.addChunk('Key', frame.getKey());
                response.addChunk('Data', struct.__struct.pop());
                response.addChunk('Status',  200);  
            }
            adaptor.respond(response);            
        });
        /**
         * Handler for the peek command
         */
        o.registerHandler('peek', function(adaptor, frame) {
            adaptor.validate(frame, ['Key']);
            var struct   = adaptor.director.getDataStructure(frame.getKey());
            var response = new module.exports.protocol.classes.ProtocolFrame();
            response.addChunk('Command', frame.getCommand());
            if (struct === undefined) {
                response.addChunk('Message', 'key does not exist');
                response.addChunk('Status',  404);                
            } else {
                response.addChunk('Key', frame.getKey());
                response.addChunk('Data', struct.__struct.peek());
                response.addChunk('Status',  200);  
            }
            adaptor.respond(response);            
        });        
        /**
         * Handler for the contains command
         */
        o.registerHandler('contains', function(adaptor, frame) {
            adaptor.validate(frame, ['Key']);
            var struct   = adaptor.director.getDataStructure(frame.getKey());
            var response = new module.exports.protocol.classes.ProtocolFrame();
            response.addChunk('Command', frame.getCommand());
            if (struct === undefined) {
                response.addChunk('Message', 'key does not exist');
                response.addChunk('Status',  404);                
            } else {
                response.addChunk('Key', frame.getKey());
                response.addChunk('SubKey', frame.getSubKey());
                response.addChunk('Data', struct.__struct.contains(frame.getSubKey()));
                response.addChunk('Status',  200);  
            }
            adaptor.respond(response);            
        });        
        /**
         * Handler for the unset command
         */
        o.registerHandler('unset', function(adaptor, frame) {
            adaptor.validate(frame, ['Key']);
            var struct   = adaptor.director.getDataStructure(frame.getKey());
            var response = new module.exports.protocol.classes.ProtocolFrame();
            response.addChunk('Command', frame.getCommand());
            if (struct === undefined) {
                response.addChunk('Message', 'key does not exist');
                response.addChunk('Status',  404);                
            } else {
                struct.__struct.unset(frame.getSubKey());
                response.addChunk('Status',  200);  
            }
            adaptor.respond(response);            
        }); 
        /**
         * Handler for the increment command
         */
        o.registerHandler('increment', function(adaptor, frame) {
            adaptor.validate(frame, ['Key']);
            var struct   = adaptor.director.getDataStructure(frame.getKey());
            var response = new module.exports.protocol.classes.ProtocolFrame();
            response.addChunk('Command', frame.getCommand());
            if (struct === undefined) {
                response.addChunk('Message', 'key does not exist');
                response.addChunk('Status',  404);                
            } else {
                var value = frame.getValue();
                if (value === null) {
                    value = 0;
                } else {
                    value = parseInt(value);
                }
                struct.__struct.increment(value);
                response.addChunk('Data', struct.__struct.count());
                response.addChunk('Status',  200);  
            }
            adaptor.respond(response);            
        });
        /**
         * Handler for the decrement command
         */
        o.registerHandler('decrement', function(adaptor, frame) {
            adaptor.validate(frame, ['Key']);
            var struct   = adaptor.director.getDataStructure(frame.getKey());
            var response = new module.exports.protocol.classes.ProtocolFrame();
            response.addChunk('Command', frame.getCommand());
            if (struct === undefined) {
                response.addChunk('Message', 'key does not exist');
                response.addChunk('Status',  404);                
            } else {
                var value = frame.getValue();
                if (value === null) {
                    value = 0;
                } else {
                    value = parseInt(value);
                }                
                struct.__struct.decrement(value);
                response.addChunk('Data', struct.__struct.count());
                response.addChunk('Status',  200);  
            }
            adaptor.respond(response);            
        });        
        
        /**
         * Handler for the clear command
         */
        o.registerHandler('clear', function(adaptor, frame) {
            var struct   = adaptor.director.getDataStructure(frame.getKey());
            var response = new module.exports.protocol.classes.ProtocolFrame();
            response.addChunk('Command', frame.getCommand());
            if (struct === undefined) {
                response.addChunk('Message', 'key does not exist');
                response.addChunk('Status',  404);                
            } else {
                struct.__struct.clear();
                response.addChunk('Status',  200);  
            }
            adaptor.respond(response);
        });        
    };
    
};

module.exports.getProtocolAdaptor = function(director, socket) {
    var adaptor   = new module.exports.protocol.classes.ProtocolAdaptor(director, socket);
    var decorator = new module.exports.protocol.classes.ProtocolAdaptorDecorator();
    decorator.decorate(adaptor);
    return adaptor;
};

module.exports.getProtocolFrameParser = function() {
    return new module.exports.protocol.classes.ProtocolFrameParser();
};

module.exports.getProtocolFrame = function() {
    return new module.exports.protocol.classes.ProtocolFrame();
};