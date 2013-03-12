var proxy  = require('./proxy');

module.exports = {
    core: {
        classes:   {},
        variables: {},
        objects:   {}
    }
};

module.exports.core.classes.DataStructureRegistry = function() {
    
    proxy.scule.datastructures.Scule.classes.HashTable.call(this, 100000);
    
};

module.exports.core.classes.DataStructureSpawner = function() {

    this.spawn = function(className, options) {
        return proxy.factoryProxy(className, options);
    };

};

module.exports.core.classes.DataStructureRegistryDirector = function() {

    this.registry = new module.exports.core.classes.DataStructureRegistry();
    this.spawner  = new module.exports.core.classes.DataStructureSpawner();

    this.getDataStructure = function(key) {
        if (!this.registry.contains(key)) {
            return undefined;
        }
        return this.registry.get(key);
    };

    this.destroyDataStructure = function(key) {
        this.registry.remove(key);
    };

    this.spawnDataStructure = function(key, className, options) {
        if (this.registry.contains(key)) {
            throw 'data structure corresponding to key ' + key + ' already exists';
        }
        var o = {
            __class: className,
            __options: options,
            __struct: this.spawner.spawn(className, options)
        };
        this.registry.put(key, o);
        return o.__struct;
    };

};

module.exports.getDataStructureRegistry = function() {
    return new module.exports.core.classes.DataStructureRegistry();
};

module.exports.getDataStructureSpawner = function() {
    return new module.exports.core.classes.DataStructureSpawner();
};

module.exports.getDataStructureRegistryDirector = function() {
    return new module.exports.core.classes.DataStructureRegistryDirector();
};