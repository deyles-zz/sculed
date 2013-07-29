## What is sculed?

*sculed* (SculeJS daemon) is a light-weight server built on top of [SculeJS](https://github.com/dan-deyles/sculejs "SculeJS"). It allows
developers to persist data structures in memory and interact with them remotely via TCP, using a [NSSocket](https://github.com/nodejitsu/nssocket "NSSocket")
based protocol. 

The package also includes client libraries that streamline interaction with the server, and make building
applications around *sculed* super simple (and fun).

Data structures currently supported by *sculed* are:

* [Hash Table](http://en.wikipedia.org/wiki/Hash_Table "Hash Table")
* [Binary Search Tree](http://en.wikipedia.org/wiki/Binary_Search_Tree "Binary Search Tree")
* [Bloom Filter](http://en.wikipedia.org/wiki/Bloom_Filter "Bloom Filter")
* [LRU Cache](http://en.wikipedia.org/wiki/LRU_cache#Least_Recently_Used "LRU Cache")
* [LIFO Stack](http://bit.ly/v0kKey "LIFO Stack")
* [Queue](http://bit.ly/v0kKey "Queue")
* Counter
* [Bit Set](http://en.wikipedia.org/wiki/Bit_array "Bit Set")

## Why would I use this thing?

Why wouldn't you?!

*sculed* can help with pretty much any task that requires persisting structured data between Node processes - 
either running on the same machine, or a whole cluster of machines. Any time I need a simple, volatile data store 
and don't want to go through the hassle of setting up RabbitMQ, MongoDB or MySQL I just spin up a *sculed* 
instance and get to work.

Some example applications for *sculed*:

* Setting up a light-weight queue server to facilitate distributed processing tasks (e.g. web scraping)
* Persisting key/value pairs between Node processes
* Keeping counts of things in memory across different Node processes (e.g. page views, error counts)
* Caching log entries in memory before spooling them out to aggregation services

In terms of performance, *sculed* does pretty well. Running over loopback I've seen rates of up around 2500 requests p/s
for a single connected client (based on self reported statistics from the server). Obviously latency will be higher when
traffic between the client and the server is running over an actual network, I'd also expect performance to degrade as
concurrency increases.

## Examples!

Spooling up a *sculed* instance is pretty simple. Just check out the code and run the following:

```
git clone git@github.com:dan-eyles/sculed.git
cd sculed
sudo npm install -g
```

or 

```
sudo npm install -g sculed
```

Then to run the server:

```
sculed -p 72853 --verbose
```

Setting up a client looks like the following:

```javascript
var client  = require('lib/client.js');
var structs = {
    counters: {}
};
client.connect('127.0.0.1', 72853, function() {
    structs.jobs = client.getQueue('jobs', null, function(err, data) { /* do something here */ });
});

```

Once you've established a connection to the *sculed* instance, you can start working with your data structures. 
For example, you might have a process running on one machine adding URLs to a queue:

```javascript
scraper().grab().urls().from('http://some.domain.com', function(err, urls) {
    urls.forEach(function(url) {
        if (!structs.counters.hasOwnProperty(url.domain()) {
            structs.counters[url.domain()] = client.getCounter(url.domain(), [1], function(err, data) { /* do something here */ });
        }
        structs.jobs.enqueue(url);
    });
});
```

And on a bunch of other machines you might run processes grabbing urls from the queue and doing something with them:

```javascript
setInterval(function() {
    structs.jobs.dequeue(function(err, url) {
        if (err) {
            /* put some error handling code here */
        }
        if (url === null) {
            return;
        }
        scraper().scrape(url, function(err, data) {
            /* do something with your scraped data here */
        });
        structs.counters[url.domain()].increment(1);
    });
}, 1000);
```

This example is deceptively simple - you could use *sculed* to dynamically establish and destroy queues as you
need them, without any need for complicated configuration files.

## So, what's next?

Over the next couple of months I'm planning on adding the following features to *sculed*:

* An awesome NPM installable package
* The ability to spawn *sculed* instances from the command line (optionally specifying a port)
* Support for SculeJS collections - along with the powerful query language used to manipulate collections in memory
* Support for Map/Reduce
* Simple on-disk persistence for data structures and collections
* Support for consistent hashing inside client code
* Support for simple, asynchronous replication of data between *sculed* instances
* More comprehensive documentation and examples
* Full documentation for the protocol

## License yadda yadda yadda

Copyright (c) 2013, Dan Eyles (dan [at] irlgaming [dot] com)
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:
   * Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
   * Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
   * Neither the name of IRL Gaming nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.
 
THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL IRL Gaming BE LIABLE FOR ANY
DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.