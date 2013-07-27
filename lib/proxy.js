module.exports = {
    proxy: {
        classes:   {},
        variables: {},
        objects:   {}
    },
    scule: null
};

module.exports.proxy.classes.DataStructureProxy = function() {

    this.get = function(key) {
        throw 'unsupported operation';
    };

    this.set = function(key, value) {
        throw 'unsupported operation';
    };

    this.unset = function(key, value) {
        throw 'unsupported operation';
    };

    this.contains = function(key) {
        throw 'unsupported operation';
    };

    this.range = function(min, max, includeMin, includeMax) {
        throw 'unsupported operation';
    };

    this.push = function(value) {
        throw 'unsupported operation';
    };

    this.pop = function() {
        throw 'unsupported operation';
    };

    this.peek = function() {
        throw 'unsupported operation';
    };

    this.clear = function() {
        throw 'unsupported operation';
    };

    this.count = function() {
        throw 'unsupported operation';
    };

    this.increment = function(value) {
        throw 'unsupported operation';
    };

    this.decrement = function(value) {
        throw 'unsupported operation';
    };

};

module.exports.proxy.classes.AtomicCounterProxy = function(initial) {
  
    module.exports.proxy.classes.DataStructureProxy.call(this);
  
    this.struct = module.exports.scule.getAtomicCounter(initial);

    this.increment = function(value) {
        this.struct.increment(value);
    };

    this.decrement = function(value) {
        this.struct.decrement(value);
    };

    this.clear = function() {
        this.struct.clear();
    };

    this.count = function() {
        return this.struct.getCount();
    };

};

module.exports.proxy.classes.HashTableProxy = function(capacity) {
    
    module.exports.proxy.classes.DataStructureProxy.call(this);
    
    this.struct = module.exports.scule.getHashTable(capacity);
    
    this.get = function(key) {
        return this.struct.get(key);
    };

    this.set = function(key, value) {
        return this.struct.put(key, value);
    };

    this.unset = function(key) {
        this.struct.remove(key);
    };

    this.contains = function(key) {
        return this.struct.contains(key);
    };

    this.clear = function() {
        this.struct.clear();
    };

    this.count = function() {
        return this.struct.getLength();
    };

};

module.exports.proxy.classes.HashMapProxy = function(capacity) {
    
    module.exports.proxy.classes.DataStructureProxy.call(this);
    
    this.struct = module.exports.scule.getHashMap(capacity);
    
    this.get = function(key) {
        return this.struct.get(key);
    };

    this.set = function(key, value) {
        return this.struct.put(key, value);
    };

    this.unset = function(key) {
        this.struct.remove(key);
    };

    this.contains = function(key) {
        return this.struct.contains(key);
    };

    this.clear = function() {
        this.struct.clear();
    };

    this.count = function() {
        return this.struct.getLength();
    };

};

module.exports.proxy.classes.LRUCacheProxy = function(capacity) {
    
    module.exports.proxy.classes.DataStructureProxy.call(this);
    
    this.struct = module.exports.scule.getLRUCache(capacity);
    
    this.get = function(key) {
        return this.struct.get(key);
    };

    this.set = function(key, value) {
        return this.struct.put(key, value);
    };

    this.unset = function(key) {
        this.struct.remove(key);
    };

    this.contains = function(key) {
        return this.struct.contains(key);
    };

    this.clear = function() {
        this.struct.clear();
    };

    this.count = function() {
        return this.struct.getLength();
    };

};

module.exports.proxy.classes.BitSetProxy = function(capacity) {

    module.exports.proxy.classes.DataStructureProxy.call(this);
    
    this.struct = module.exports.scule.getBitSet(capacity);

    this.get = function(key) {
        return this.struct.get(key);
    };

    this.set = function(key, value) {
        return this.struct.set(key);
    };

    this.unset = function(key) {
        this.struct.unset(key);
    };

    this.contains = function(key) {
        return this.struct.get(key);
    };

    this.clear = function() {
        this.struct.zeroFill();
    };

    this.count = function() {
        return this.struct.getLength();
    };

};

module.exports.proxy.classes.BloomFilterProxy = function(capacity) {

    module.exports.proxy.classes.DataStructureProxy.call(this);
    
    this.struct = module.exports.scule.getBloomFilter(capacity);

    this.get = function(key) {
        return this.struct.query(key);
    };

    this.set = function(key, value) {
        return this.struct.add(key);
    };

    this.contains = function(key) {
        return this.struct.query(key);
    };

    this.clear = function() {
        this.struct.zeroFill();
    };

    this.count = function() {
        return this.struct.getLength();
    };

};

module.exports.proxy.classes.BinarySearchTreeProxy = function() {
    
    module.exports.proxy.classes.DataStructureProxy.call(this);
    
    this.struct = module.exports.scule.getBinarySearchTree();
    
    this.get = function(key) {
        var node = this.struct.search(key);
        if (node) {
            return node.getData();
        }
        return null;
    };

    this.set = function(key, value) {
        return this.struct.insert(key, value);
    };

    this.unset = function(key) {
        this.struct.remove(key);
    };

    this.contains = function(key) {
        return (this.struct.get(key) !== null);
    };

    this.clear = function() {
        this.struct.clear();
    };

    this.count = function() {
        return this.struct.getLength();
    };    
    
};

module.exports.proxy.classes.QueueProxy = function() {

    module.exports.proxy.classes.DataStructureProxy.call(this);
    
    this.struct = module.exports.scule.getQueue();

    this.push = function(value) {
        this.struct.enqueue(value);
    };

    this.pop = function() {
        return this.struct.dequeue();
    };

    this.peek = function() {
        return this.struct.peek();
    };

    this.clear = function() {
        this.struct.clear();
    };

    this.count = function() {
        return this.struct.getLength();
    };

};

module.exports.proxy.classes.FIFOStackProxy = function() {

    module.exports.proxy.classes.DataStructureProxy.call(this);
    
    this.struct = module.exports.scule.getFIFOStack();

    this.push = function(value) {
        this.struct.push(value);
    };

    this.pop = function() {
        return this.struct.pop();
    };

    this.peek = function() {
        return this.struct.peek();
    };

    this.clear = function() {
        this.struct.clear();
    };

    this.count = function() {
        return this.struct.getLength();
    };

};

module.exports.proxy.classes.LIFOStackProxy = function() {

    module.exports.proxy.classes.DataStructureProxy.call(this);
    
    this.struct = module.exports.scule.getLIFOStack();

    this.push = function(value) {
        this.struct.push(value);
    };

    this.pop = function() {
        return this.struct.pop();
    };

    this.peek = function() {
        return this.struct.peek();
    };

    this.clear = function() {
        this.struct.clear();
    };

    this.count = function() {
        return this.struct.getLength();
    };

};

module.exports.proxy.classes.LinkedListProxy = function() {

    module.exports.proxy.classes.DataStructureProxy.call(this);
    
    this.struct = module.exports.scule.getLinkedList();

    this.contains = function(key) {
        return this.struct.contains(key);
    };

    this.push = function(value) {
        this.struct.add(value);
    };

    this.pop = function() {
        return this.struct.trim();
    };

    this.peek = function() {
        var head = this.struct.getHead();
        if (head === null) {
            return null;
        }
        return head.getElement();
    };

    this.clear = function() {
        this.struct.clear();
    };

    this.count = function() {
        return this.struct.getLength();
    };

};

module.exports.proxy.classes.DoublyLinkedListProxy = function() {

    module.exports.proxy.classes.DataStructureProxy.call(this);
    
    this.struct = module.exports.scule.getDoublyLinkedList();

    this.contains = function(key) {
        return this.struct.contains(key);
    };

    this.push = function(value) {
        this.struct.add(value);
    };

    this.pop = function() {
        return this.struct.trim();
    };

    this.peek = function() {
        var head = this.struct.getHead();
        if (head === null) {
            return null;
        }
        return head.getElement();
    };

    this.clear = function() {
        this.struct.clear();
    };

    this.count = function() {
        return this.struct.getLength();
    };

};

module.exports.factoryProxy = function(className, options) {
    var name = 'get' + className + 'Proxy';
    if (!module.exports.hasOwnProperty(name)) {
        throw 'data structure class ' + className + ' does not exist';
    }
    return module.exports[name].apply(null, options);
};

/**
 * Returns an instance of the {LinkedListProxy} class
 * @returns {LinkedListProxy}
 */
module.exports.getLinkedListProxy = function () {
    return new module.exports.proxy.classes.LinkedListProxy();
};

/**
 * Returns an instance of the {DoublyLinkedListProxy} class
 * @returns {DoublyLinkedListProxy}
 */
module.exports.getDoublyLinkedListProxy = function () {
    return new module.exports.proxy.classes.DoublyLinkedListProxy();
};

/**
 * Returns an instance of the {HashTableProxy} class
 * @returns {HashTableProxy}
 */
module.exports.getHashTableProxy = function () {
    return new module.exports.proxy.classes.HashTableProxy();
};

/**
 * Returns an instance of the {HashMapProxy} class
 * @param {Number} size the table size
 * @returns {HashMapProxy}
 */
module.exports.getHashMapProxy = function (size) {
    return new module.exports.proxy.classes.HashMapProxy(size);
};

/**
 * Returns an instance of the {LIFOStackProxy} class
 * @returns {LIFOStackProxy}
 */
module.exports.getLIFOStackProxy = function () {
    return new module.exports.proxy.classes.LIFOStackProxy();
};

/**
 * Returns an instance of the {FIFOStackProxy} class
 * @returns {FIFOStackProxy}
 */
module.exports.getFIFOStackProxy = function () {
    return new module.exports.proxy.classes.FIFOStackProxy();
};

/**
 * Returns an instance of the {QueueProxy} class
 * @returns {QueueProxy}
 */
module.exports.getQueueProxy = function () {
    return new module.exports.proxy.classes.QueueProxy();
};

/**
 * Returns an instance of the {LRUCacheProxy} class
 * @param {Number} threshold
 * @returns {LRUCacheProxy}
 */
module.exports.getLRUCacheProxy = function (threshold) {
    return new module.exports.proxy.classes.LRUCacheProxy(threshold);
};

/**
 * Returns an instance of the {BinarySearchTreeProxy} class
 * @returns {BinarySearchTreeProxy}
 */
module.exports.getBinarySearchTreeProxy = function () {
    return new module.exports.proxy.classes.BinarySearchTreeProxy();
};

/**
 * Returns an instance of the {AtomicCounterProxy} class
 * @param {Integer} initial
 * @returns {AtomicCounterProxy}
 */
module.exports.getAtomicCounterProxy = function(initial) {
    return new module.exports.proxy.classes.AtomicCounterProxy(initial);
};

/**
 * Returns an instance of the {BitSetProxy} class
 * @param {Integer} capacity
 * @returns {BitSetProxy}
 */
module.exports.getBitSetProxy = function(capacity) {
    return new module.exports.proxy.classes.BitSetProxy(capacity);
};

/**
 * Returns an instance of the {BloomFilterProxy} class
 * @param {Integer} capacity
 * @returns {BloomFilterProxy}
 */
module.exports.getBloomFilterProxy = function(capacity) {
    return new module.exports.proxy.classes.BloomFilterProxy(capacity);
};

module.exports.setScule = function(scule) {
    module.exports.scule = scule;
};