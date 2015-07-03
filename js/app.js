(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (process,global){
/*!
 * async
 * https://github.com/caolan/async
 *
 * Copyright 2010-2014 Caolan McMahon
 * Released under the MIT license
 */
(function () {

    var async = {};
    function noop() {}

    // global on the server, window in the browser
    var previous_async;

    // Establish the root object, `window` (`self`) in the browser, `global`
    // on the server, or `this` in some virtual machines. We use `self`
    // instead of `window` for `WebWorker` support.
    var root = typeof self === 'object' && self.self === self && self ||
            typeof global === 'object' && global.global === global && global ||
            this;

    if (root != null) {
        previous_async = root.async;
    }

    async.noConflict = function () {
        root.async = previous_async;
        return async;
    };

    function only_once(fn) {
        var called = false;
        return function() {
            if (called) throw new Error("Callback was already called.");
            called = true;
            fn.apply(this, arguments);
        };
    }

    function _once(fn) {
        var called = false;
        return function() {
            if (called) return;
            called = true;
            fn.apply(this, arguments);
        };
    }

    //// cross-browser compatiblity functions ////

    var _toString = Object.prototype.toString;

    var _isArray = Array.isArray || function (obj) {
        return _toString.call(obj) === '[object Array]';
    };

    function _isArrayLike(arr) {
        return _isArray(arr) || (
            // has a positive integer length property
            typeof arr.length === "number" &&
            arr.length >= 0 &&
            arr.length % 1 === 0
        );
    }

    function _each(coll, iterator) {
        return _isArrayLike(coll) ?
            _arrayEach(coll, iterator) :
            _forEachOf(coll, iterator);
    }

    function _arrayEach(arr, iterator) {
        var index = -1,
            length = arr.length;

        while (++index < length) {
            iterator(arr[index], index, arr);
        }
    }

    function _map(arr, iterator) {
        var index = -1,
            length = arr.length,
            result = Array(length);

        while (++index < length) {
            result[index] = iterator(arr[index], index, arr);
        }
        return result;
    }

    function _range(count) {
        return _map(Array(count), function (v, i) { return i; });
    }

    function _reduce(arr, iterator, memo) {
        _arrayEach(arr, function (x, i, a) {
            memo = iterator(memo, x, i, a);
        });
        return memo;
    }

    function _forEachOf(object, iterator) {
        _arrayEach(_keys(object), function (key) {
            iterator(object[key], key);
        });
    }

    var _keys = Object.keys || function (obj) {
        var keys = [];
        for (var k in obj) {
            if (obj.hasOwnProperty(k)) {
                keys.push(k);
            }
        }
        return keys;
    };

    function _keyIterator(coll) {
        var i = -1;
        var len;
        var keys;
        if (_isArrayLike(coll)) {
            len = coll.length;
            return function next() {
                i++;
                return i < len ? i : null;
            };
        } else {
            keys = _keys(coll);
            len = keys.length;
            return function next() {
                i++;
                return i < len ? keys[i] : null;
            };
        }
    }

    function _baseSlice(arr, start) {
        start = start || 0;
        var index = -1;
        var length = arr.length;

        if (start) {
            length -= start;
            length = length < 0 ? 0 : length;
        }
        var result = Array(length);

        while (++index < length) {
            result[index] = arr[index + start];
        }
        return result;
    }

    function _withoutIndex(iterator) {
        return function (value, index, callback) {
            return iterator(value, callback);
        };
    }

    //// exported async module functions ////

    //// nextTick implementation with browser-compatible fallback ////

    // capture the global reference to guard against fakeTimer mocks
    var _setImmediate;
    if (typeof setImmediate === 'function') {
        _setImmediate = setImmediate;
    }

    if (typeof process === 'undefined' || !(process.nextTick)) {
        if (_setImmediate) {
            async.nextTick = function (fn) {
                // not a direct alias for IE10 compatibility
                _setImmediate(fn);
            };
            async.setImmediate = async.nextTick;
        }
        else {
            async.nextTick = function (fn) {
                setTimeout(fn, 0);
            };
            async.setImmediate = async.nextTick;
        }
    }
    else {
        async.nextTick = process.nextTick;
        if (_setImmediate) {
            async.setImmediate = function (fn) {
              // not a direct alias for IE10 compatibility
                _setImmediate(fn);
            };
        }
        else {
            async.setImmediate = async.nextTick;
        }
    }

    async.forEach =
    async.each = function (arr, iterator, callback) {
        return async.eachOf(arr, _withoutIndex(iterator), callback);
    };

    async.forEachSeries =
    async.eachSeries = function (arr, iterator, callback) {
        return async.eachOfSeries(arr, _withoutIndex(iterator), callback);
    };


    async.forEachLimit =
    async.eachLimit = function (arr, limit, iterator, callback) {
        return _eachOfLimit(limit)(arr, _withoutIndex(iterator), callback);
    };

    async.forEachOf =
    async.eachOf = function (object, iterator, callback) {
        callback = _once(callback || noop);
        object = object || [];
        var size = _isArrayLike(object) ? object.length : _keys(object).length;
        var completed = 0;
        if (!size) {
            return callback(null);
        }
        _each(object, function (value, key) {
            iterator(object[key], key, only_once(done));
        });
        function done(err) {
            if (err) {
                callback(err);
            }
            else {
                completed += 1;
                if (completed >= size) {
                    callback(null);
                }
            }
        }
    };

    async.forEachOfSeries =
    async.eachOfSeries = function (obj, iterator, callback) {
        callback = _once(callback || noop);
        obj = obj || [];
        var nextKey = _keyIterator(obj);
        var key = nextKey();
        function iterate() {
            var sync = true;
            if (key === null) {
                return callback(null);
            }
            iterator(obj[key], key, only_once(function (err) {
                if (err) {
                    callback(err);
                }
                else {
                    key = nextKey();
                    if (key === null) {
                        return callback(null);
                    } else {
                        if (sync) {
                            async.nextTick(iterate);
                        } else {
                            iterate();
                        }
                    }
                }
            }));
            sync = false;
        }
        iterate();
    };



    async.forEachOfLimit =
    async.eachOfLimit = function (obj, limit, iterator, callback) {
        _eachOfLimit(limit)(obj, iterator, callback);
    };

    function _eachOfLimit(limit) {

        return function (obj, iterator, callback) {
            callback = _once(callback || noop);
            obj = obj || [];
            var nextKey = _keyIterator(obj);
            if (limit <= 0) {
                return callback(null);
            }
            var done = false;
            var running = 0;
            var errored = false;

            (function replenish () {
                if (done && running <= 0) {
                    return callback(null);
                }

                while (running < limit && !errored) {
                    var key = nextKey();
                    if (key === null) {
                        done = true;
                        if (running <= 0) {
                            callback(null);
                        }
                        return;
                    }
                    running += 1;
                    iterator(obj[key], key, only_once(function (err) {
                        running -= 1;
                        if (err) {
                            callback(err);
                            errored = true;
                        }
                        else {
                            replenish();
                        }
                    }));
                }
            })();
        };
    }


    function doParallel(fn) {
        return function (obj, iterator, callback) {
            return fn(async.eachOf, obj, iterator, callback);
        };
    }
    function doParallelLimit(limit, fn) {
        return function (obj, iterator, callback) {
            return fn(_eachOfLimit(limit), obj, iterator, callback);
        };
    }
    function doSeries(fn) {
        return function (obj, iterator, callback) {
            return fn(async.eachOfSeries, obj, iterator, callback);
        };
    }

    function _asyncMap(eachfn, arr, iterator, callback) {
        callback = _once(callback || noop);
        var results = [];
        eachfn(arr, function (value, index, callback) {
            iterator(value, function (err, v) {
                results[index] = v;
                callback(err);
            });
        }, function (err) {
            callback(err, results);
        });
    }

    async.map = doParallel(_asyncMap);
    async.mapSeries = doSeries(_asyncMap);
    async.mapLimit = function (arr, limit, iterator, callback) {
        return _mapLimit(limit)(arr, iterator, callback);
    };

    function _mapLimit(limit) {
        return doParallelLimit(limit, _asyncMap);
    }

    // reduce only has a series version, as doing reduce in parallel won't
    // work in many situations.
    async.inject =
    async.foldl =
    async.reduce = function (arr, memo, iterator, callback) {
        async.eachOfSeries(arr, function (x, i, callback) {
            iterator(memo, x, function (err, v) {
                memo = v;
                callback(err);
            });
        }, function (err) {
            callback(err || null, memo);
        });
    };

    async.foldr =
    async.reduceRight = function (arr, memo, iterator, callback) {
        var reversed = _map(arr, function (x) {
            return x;
        }).reverse();
        async.reduce(reversed, memo, iterator, callback);
    };

    function _filter(eachfn, arr, iterator, callback) {
        var results = [];
        arr = _map(arr, function (x, i) {
            return {index: i, value: x};
        });
        eachfn(arr, function (x, index, callback) {
            iterator(x.value, function (v) {
                if (v) {
                    results.push(x);
                }
                callback();
            });
        }, function () {
            callback(_map(results.sort(function (a, b) {
                return a.index - b.index;
            }), function (x) {
                return x.value;
            }));
        });
    }

    async.select =
    async.filter = doParallel(_filter);

    async.selectSeries =
    async.filterSeries = doSeries(_filter);

    function _reject(eachfn, arr, iterator, callback) {
        _filter(eachfn, arr, function(value, cb) {
            iterator(value, function(v) {
                cb(!v);
            });
        }, callback);
    }
    async.reject = doParallel(_reject);
    async.rejectSeries = doSeries(_reject);

    function _detect(eachfn, arr, iterator, main_callback) {
        eachfn(arr, function (x, index, callback) {
            iterator(x, function (result) {
                if (result) {
                    main_callback(x);
                    main_callback = noop;
                }
                else {
                    callback();
                }
            });
        }, function () {
            main_callback();
        });
    }
    async.detect = doParallel(_detect);
    async.detectSeries = doSeries(_detect);

    async.any =
    async.some = function (arr, iterator, main_callback) {
        async.eachOf(arr, function (x, _, callback) {
            iterator(x, function (v) {
                if (v) {
                    main_callback(true);
                    main_callback = noop;
                }
                callback();
            });
        }, function () {
            main_callback(false);
        });
    };

    async.all =
    async.every = function (arr, iterator, main_callback) {
        async.eachOf(arr, function (x, _, callback) {
            iterator(x, function (v) {
                if (!v) {
                    main_callback(false);
                    main_callback = noop;
                }
                callback();
            });
        }, function () {
            main_callback(true);
        });
    };

    async.sortBy = function (arr, iterator, callback) {
        async.map(arr, function (x, callback) {
            iterator(x, function (err, criteria) {
                if (err) {
                    callback(err);
                }
                else {
                    callback(null, {value: x, criteria: criteria});
                }
            });
        }, function (err, results) {
            if (err) {
                return callback(err);
            }
            else {
                callback(null, _map(results.sort(comparator), function (x) {
                    return x.value;
                }));
            }

        });

        function comparator(left, right) {
            var a = left.criteria, b = right.criteria;
            return a < b ? -1 : a > b ? 1 : 0;
        }
    };

    async.auto = function (tasks, callback) {
        callback = _once(callback || noop);
        var keys = _keys(tasks);
        var remainingTasks = keys.length;
        if (!remainingTasks) {
            return callback(null);
        }

        var results = {};

        var listeners = [];
        function addListener(fn) {
            listeners.unshift(fn);
        }
        function removeListener(fn) {
            for (var i = 0; i < listeners.length; i += 1) {
                if (listeners[i] === fn) {
                    listeners.splice(i, 1);
                    return;
                }
            }
        }
        function taskComplete() {
            remainingTasks--;
            _arrayEach(listeners.slice(0), function (fn) {
                fn();
            });
        }

        addListener(function () {
            if (!remainingTasks) {
                callback(null, results);
            }
        });

        _arrayEach(keys, function (k) {
            var task = _isArray(tasks[k]) ? tasks[k]: [tasks[k]];
            function taskCallback(err) {
                var args = _baseSlice(arguments, 1);
                if (args.length <= 1) {
                    args = args[0];
                }
                if (err) {
                    var safeResults = {};
                    _arrayEach(_keys(results), function(rkey) {
                        safeResults[rkey] = results[rkey];
                    });
                    safeResults[k] = args;
                    callback(err, safeResults);
                }
                else {
                    results[k] = args;
                    async.setImmediate(taskComplete);
                }
            }
            var requires = task.slice(0, Math.abs(task.length - 1)) || [];
            // prevent dead-locks
            var len = requires.length;
            var dep;
            while (len--) {
                if (!(dep = tasks[requires[len]])) {
                    throw new Error('Has inexistant dependency');
                }
                if (_isArray(dep) && !!~dep.indexOf(k)) {
                    throw new Error('Has cyclic dependencies');
                }
            }
            function ready() {
                return _reduce(requires, function (a, x) {
                    return (a && results.hasOwnProperty(x));
                }, true) && !results.hasOwnProperty(k);
            }
            if (ready()) {
                task[task.length - 1](taskCallback, results);
            }
            else {
                addListener(listener);
            }
            function listener() {
                if (ready()) {
                    removeListener(listener);
                    task[task.length - 1](taskCallback, results);
                }
            }
        });
    };



    async.retry = function(/*[times,] task [, callback]*/) {
        var DEFAULT_TIMES = 5;
        var DEFAULT_INTERVAL = 0;

        var attempts = [];

        var opts = {
          times: DEFAULT_TIMES,
          interval: DEFAULT_INTERVAL
        };

        function parseTimes(acc, t){
          if(typeof t === 'number'){
            acc.times = parseInt(t, 10) || DEFAULT_TIMES;
          } else if(typeof t === 'object'){
            acc.times = parseInt(t.times, 10) || DEFAULT_TIMES;
            acc.interval = parseInt(t.interval, 10) || DEFAULT_INTERVAL;
          } else {
            throw new Error('Unsupported argument type for \'times\': ' + typeof(t));
          }
        }

        switch(arguments.length){
            case 1: {
              opts.task = arguments[0];
              break;
            }
            case 2 : {
              if(typeof arguments[0] === 'number' || typeof arguments[0] === 'object'){
                parseTimes(opts, arguments[0]);
                opts.task = arguments[1];
              } else {
                opts.task = arguments[0];
                opts.callback = arguments[1];
              }
              break;
            }
            case 3: {
              parseTimes(opts, arguments[0]);
              opts.task = arguments[1];
              opts.callback = arguments[2];
              break;
            }
            default: {
              throw new Error('Invalid arguments - must be either (task), (task, callback), (times, task) or (times, task, callback)');
            }
          }

        function wrappedTask(wrappedCallback, wrappedResults) {
            function retryAttempt(task, finalAttempt) {
                return function(seriesCallback) {
                    task(function(err, result){
                        seriesCallback(!err || finalAttempt, {err: err, result: result});
                    }, wrappedResults);
                };
            }

            function retryInterval(interval){
              return function(seriesCallback){
                setTimeout(function(){
                  seriesCallback(null);
                }, interval);
              };
            }

            while (opts.times) {

                var finalAttempt = !(opts.times-=1);
                attempts.push(retryAttempt(opts.task, finalAttempt));
                if(!finalAttempt && opts.interval > 0){
                  attempts.push(retryInterval(opts.interval));
                }
            }

            async.series(attempts, function(done, data){
                data = data[data.length - 1];
                (wrappedCallback || opts.callback)(data.err, data.result);
            });
        }

        // If a callback is passed, run this as a controll flow
        return opts.callback ? wrappedTask() : wrappedTask;
    };

    async.waterfall = function (tasks, callback) {
        callback = _once(callback || noop);
        if (!_isArray(tasks)) {
            var err = new Error('First argument to waterfall must be an array of functions');
            return callback(err);
        }
        if (!tasks.length) {
            return callback();
        }
        function wrapIterator(iterator) {
            return function (err) {
                if (err) {
                    callback.apply(null, arguments);
                }
                else {
                    var args = _baseSlice(arguments, 1);
                    var next = iterator.next();
                    if (next) {
                        args.push(wrapIterator(next));
                    }
                    else {
                        args.push(callback);
                    }
                    ensureAsync(iterator).apply(null, args);
                }
            };
        }
        wrapIterator(async.iterator(tasks))();
    };

    function _parallel(eachfn, tasks, callback) {
        callback = callback || noop;
        var results = _isArrayLike(tasks) ? [] : {};

        eachfn(tasks, function (task, key, callback) {
            task(function (err) {
                var args = _baseSlice(arguments, 1);
                if (args.length <= 1) {
                    args = args[0];
                }
                results[key] = args;
                callback(err);
            });
        }, function (err) {
            callback(err, results);
        });
    }

    async.parallel = function (tasks, callback) {
        _parallel(async.eachOf, tasks, callback);
    };

    async.parallelLimit = function(tasks, limit, callback) {
        _parallel(_eachOfLimit(limit), tasks, callback);
    };

    async.series = function (tasks, callback) {
        callback = callback || noop;
        var results = _isArrayLike(tasks) ? [] : {};

        async.eachOfSeries(tasks, function (task, key, callback) {
            task(function (err) {
                var args = _baseSlice(arguments, 1);
                if (args.length <= 1) {
                    args = args[0];
                }
                results[key] = args;
                callback(err);
            });
        }, function (err) {
            callback(err, results);
        });
    };

    async.iterator = function (tasks) {
        function makeCallback(index) {
            function fn() {
                if (tasks.length) {
                    tasks[index].apply(null, arguments);
                }
                return fn.next();
            }
            fn.next = function () {
                return (index < tasks.length - 1) ? makeCallback(index + 1): null;
            };
            return fn;
        }
        return makeCallback(0);
    };

    async.apply = function (fn) {
        var args = _baseSlice(arguments, 1);
        return function () {
            return fn.apply(
                null, args.concat(_baseSlice(arguments))
            );
        };
    };

    function _concat(eachfn, arr, fn, callback) {
        var result = [];
        eachfn(arr, function (x, index, cb) {
            fn(x, function (err, y) {
                result = result.concat(y || []);
                cb(err);
            });
        }, function (err) {
            callback(err, result);
        });
    }
    async.concat = doParallel(_concat);
    async.concatSeries = doSeries(_concat);

    async.whilst = function (test, iterator, callback) {
        callback = callback || noop;
        if (test()) {
            iterator(function (err) {
                if (err) {
                    return callback(err);
                }
                async.whilst(test, iterator, callback);
            });
        }
        else {
            callback(null);
        }
    };

    async.doWhilst = function (iterator, test, callback) {
        callback = callback || noop;
        iterator(function (err) {
            if (err) {
                return callback(err);
            }
            var args = _baseSlice(arguments, 1);
            if (test.apply(null, args)) {
                async.doWhilst(iterator, test, callback);
            }
            else {
                callback(null);
            }
        });
    };

    async.until = function (test, iterator, callback) {
        callback = callback || noop;
        if (!test()) {
            iterator(function (err) {
                if (err) {
                    return callback(err);
                }
                async.until(test, iterator, callback);
            });
        }
        else {
            callback(null);
        }
    };

    async.doUntil = function (iterator, test, callback) {
        callback = callback || noop;
        iterator(function (err) {
            if (err) {
                return callback(err);
            }
            var args = _baseSlice(arguments, 1);
            if (!test.apply(null, args)) {
                async.doUntil(iterator, test, callback);
            }
            else {
                callback(null);
            }
        });
    };

    async.during = function (test, iterator, callback) {
        callback = callback || noop;
        test(function(err, truth) {
            if (err) {
                return callback(err);
            }
            if (truth) {
                iterator(function (err) {
                    if (err) {
                        return callback(err);
                    }
                    async.during(test, iterator, callback);
                });
            }
            else {
                callback(null);
            }
        });
    };

    async.doDuring = function (iterator, test, callback) {
        callback = callback || noop;
        iterator(function (err) {
            if (err) {
                return callback(err);
            }
            var args = _baseSlice(arguments, 1);
            args.push(function (err, truth) {
                if (err) {
                   return callback(err);
                }
                if (truth) {
                    async.doDuring(iterator, test, callback);
                }
                else {
                    callback(null);
                }
            });
            test.apply(null, args);
        });
    };

    function _queue(worker, concurrency, payload) {
        if (concurrency == null) {
            concurrency = 1;
        }
        else if(concurrency === 0) {
            throw new Error('Concurrency must not be zero');
        }
        function _insert(q, data, pos, callback) {
            if (callback != null && typeof callback !== "function") {
                throw new Error("task callback must be a function");
            }
            q.started = true;
            if (!_isArray(data)) {
                data = [data];
            }
            if(data.length === 0 && q.idle()) {
                // call drain immediately if there are no tasks
                return async.setImmediate(function() {
                   q.drain();
                });
            }
            _arrayEach(data, function(task) {
                var item = {
                    data: task,
                    callback: callback || noop
                };

                if (pos) {
                    q.tasks.unshift(item);
                } else {
                    q.tasks.push(item);
                }

                if (q.tasks.length === q.concurrency) {
                    q.saturated();
                }
            });
            async.setImmediate(q.process);
        }
        function _next(q, tasks) {
            return function(){
                workers -= 1;
                var args = arguments;
                _arrayEach(tasks, function (task) {
                    task.callback.apply(task, args);
                });
                if (q.tasks.length + workers === 0) {
                    q.drain();
                }
                q.process();
            };
        }

        var workers = 0;
        var q = {
            tasks: [],
            concurrency: concurrency,
            payload: payload,
            saturated: noop,
            empty: noop,
            drain: noop,
            started: false,
            paused: false,
            push: function (data, callback) {
                _insert(q, data, false, callback);
            },
            kill: function () {
                q.drain = noop;
                q.tasks = [];
            },
            unshift: function (data, callback) {
                _insert(q, data, true, callback);
            },
            process: function () {
                if (!q.paused && workers < q.concurrency && q.tasks.length) {
                    while(workers < q.concurrency && q.tasks.length){
                        var tasks = q.payload ?
                            q.tasks.splice(0, q.payload) :
                            q.tasks.splice(0, q.tasks.length);

                        var data = _map(tasks, function (task) {
                            return task.data;
                        });

                        if (q.tasks.length === 0) {
                            q.empty();
                        }
                        workers += 1;
                        var cb = only_once(_next(q, tasks));
                        worker(data, cb);
                    }
                }
            },
            length: function () {
                return q.tasks.length;
            },
            running: function () {
                return workers;
            },
            idle: function() {
                return q.tasks.length + workers === 0;
            },
            pause: function () {
                q.paused = true;
            },
            resume: function () {
                if (q.paused === false) { return; }
                q.paused = false;
                var resumeCount = Math.min(q.concurrency, q.tasks.length);
                // Need to call q.process once per concurrent
                // worker to preserve full concurrency after pause
                for (var w = 1; w <= resumeCount; w++) {
                    async.setImmediate(q.process);
                }
            }
        };
        return q;
    }

    async.queue = function (worker, concurrency) {
        var q = _queue(function (items, cb) {
            worker(items[0], cb);
        }, concurrency, 1);

        return q;
    };

    async.priorityQueue = function (worker, concurrency) {

        function _compareTasks(a, b){
            return a.priority - b.priority;
        }

        function _binarySearch(sequence, item, compare) {
          var beg = -1,
              end = sequence.length - 1;
          while (beg < end) {
              var mid = beg + ((end - beg + 1) >>> 1);
              if (compare(item, sequence[mid]) >= 0) {
                  beg = mid;
              } else {
                  end = mid - 1;
              }
          }
          return beg;
        }

        function _insert(q, data, priority, callback) {
            if (callback != null && typeof callback !== "function") {
                throw new Error("task callback must be a function");
            }
            q.started = true;
            if (!_isArray(data)) {
                data = [data];
            }
            if(data.length === 0) {
                // call drain immediately if there are no tasks
                return async.setImmediate(function() {
                    q.drain();
                });
            }
            _arrayEach(data, function(task) {
                var item = {
                    data: task,
                    priority: priority,
                    callback: typeof callback === 'function' ? callback : noop
                };

                q.tasks.splice(_binarySearch(q.tasks, item, _compareTasks) + 1, 0, item);

                if (q.tasks.length === q.concurrency) {
                    q.saturated();
                }
                async.setImmediate(q.process);
            });
        }

        // Start with a normal queue
        var q = async.queue(worker, concurrency);

        // Override push to accept second parameter representing priority
        q.push = function (data, priority, callback) {
            _insert(q, data, priority, callback);
        };

        // Remove unshift function
        delete q.unshift;

        return q;
    };

    async.cargo = function (worker, payload) {
        return _queue(worker, 1, payload);
    };

    function _console_fn(name) {
        return function (fn) {
            var args = _baseSlice(arguments, 1);
            fn.apply(null, args.concat([function (err) {
                var args = _baseSlice(arguments, 1);
                if (typeof console !== 'undefined') {
                    if (err) {
                        if (console.error) {
                            console.error(err);
                        }
                    }
                    else if (console[name]) {
                        _arrayEach(args, function (x) {
                            console[name](x);
                        });
                    }
                }
            }]));
        };
    }
    async.log = _console_fn('log');
    async.dir = _console_fn('dir');
    /*async.info = _console_fn('info');
    async.warn = _console_fn('warn');
    async.error = _console_fn('error');*/

    async.memoize = function (fn, hasher) {
        var memo = {};
        var queues = {};
        hasher = hasher || function (x) {
            return x;
        };
        function memoized() {
            var args = _baseSlice(arguments);
            var callback = args.pop();
            var key = hasher.apply(null, args);
            if (key in memo) {
                async.nextTick(function () {
                    callback.apply(null, memo[key]);
                });
            }
            else if (key in queues) {
                queues[key].push(callback);
            }
            else {
                queues[key] = [callback];
                fn.apply(null, args.concat([function () {
                    memo[key] = _baseSlice(arguments);
                    var q = queues[key];
                    delete queues[key];
                    for (var i = 0, l = q.length; i < l; i++) {
                      q[i].apply(null, arguments);
                    }
                }]));
            }
        }
        memoized.memo = memo;
        memoized.unmemoized = fn;
        return memoized;
    };

    async.unmemoize = function (fn) {
        return function () {
            return (fn.unmemoized || fn).apply(null, arguments);
        };
    };

    function _times(mapper) {
        return function (count, iterator, callback) {
            mapper(_range(count), iterator, callback);
        };
    }

    async.times = _times(async.map);
    async.timesSeries = _times(async.mapSeries);
    async.timesLimit = function (count, limit, iterator, callback) {
        return async.mapLimit(_range(count), limit, iterator, callback);
    };

    async.seq = function (/* functions... */) {
        var fns = arguments;
        return function () {
            var that = this;
            var args = _baseSlice(arguments);

            var callback = args.slice(-1)[0];
            if (typeof callback == 'function') {
                args.pop();
            } else {
                callback = noop;
            }

            async.reduce(fns, args, function (newargs, fn, cb) {
                fn.apply(that, newargs.concat([function () {
                    var err = arguments[0];
                    var nextargs = _baseSlice(arguments, 1);
                    cb(err, nextargs);
                }]));
            },
            function (err, results) {
                callback.apply(that, [err].concat(results));
            });
        };
    };

    async.compose = function (/* functions... */) {
        return async.seq.apply(null, Array.prototype.reverse.call(arguments));
    };


    function _applyEach(eachfn, fns /*args...*/) {
        function go() {
            var that = this;
            var args = _baseSlice(arguments);
            var callback = args.pop();
            return eachfn(fns, function (fn, _, cb) {
                fn.apply(that, args.concat([cb]));
            },
            callback);
        }
        if (arguments.length > 2) {
            var args = _baseSlice(arguments, 2);
            return go.apply(this, args);
        }
        else {
            return go;
        }
    }

    async.applyEach = function (/*fns, args...*/) {
        var args = _baseSlice(arguments);
        return _applyEach.apply(null, [async.eachOf].concat(args));
    };
    async.applyEachSeries = function (/*fns, args...*/) {
        var args = _baseSlice(arguments);
        return _applyEach.apply(null, [async.eachOfSeries].concat(args));
    };


    async.forever = function (fn, callback) {
        var done = only_once(callback || noop);
        var task = ensureAsync(fn);
        function next(err) {
            if (err) {
                return done(err);
            }
            task(next);
        }
        next();
    };

    function ensureAsync(fn) {
        return function (/*...args, callback*/) {
            var args = _baseSlice(arguments);
            var callback = args.pop();
            args.push(function () {
                var innerArgs = arguments;
                if (sync) {
                    async.setImmediate(function () {
                        callback.apply(null, innerArgs);
                    });
                } else {
                    callback.apply(null, innerArgs);
                }
            });
            var sync = true;
            fn.apply(this, args);
            sync = false;
        };
    }

    async.ensureAsync = ensureAsync;

    async.constant = function constant(/*values...*/) {
        var args = [null].concat(_baseSlice(arguments));
        return function (callback) {
            return callback.apply(this, args);
        };
    };

    async.wrapSync =
    async.asyncify = function asyncify(func) {
        return function (/*args..., callback*/) {
            var args = _baseSlice(arguments);
            var callback = args.pop();
            var result;
            try {
                result = func.apply(this, args);
            } catch (e) {
                return callback(e);
            }
            callback(null, result);
        };
    };

    // Node.js
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = async;
    }
    // AMD / RequireJS
    else if (typeof define !== 'undefined' && define.amd) {
        define([], function () {
            return async;
        });
    }
    // included directly via <script> tag
    else {
        root.async = async;
    }

}());

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"_process":25}],2:[function(require,module,exports){
/*!
  Copyright (c) 2015 Jed Watson.
  Licensed under the MIT License (MIT), see
  http://jedwatson.github.io/classnames
*/

(function () {
	'use strict';

	function classNames () {

		var classes = '';

		for (var i = 0; i < arguments.length; i++) {
			var arg = arguments[i];
			if (!arg) continue;

			var argType = typeof arg;

			if ('string' === argType || 'number' === argType) {
				classes += ' ' + arg;

			} else if (Array.isArray(arg)) {
				classes += ' ' + classNames.apply(null, arg);

			} else if ('object' === argType) {
				for (var key in arg) {
					if (arg.hasOwnProperty(key) && arg[key]) {
						classes += ' ' + key;
					}
				}
			}
		}

		return classes.substr(1);
	}

	if (typeof module !== 'undefined' && module.exports) {
		module.exports = classNames;
	} else if (typeof define === 'function' && typeof define.amd === 'object' && define.amd){
		// AMD. Register as an anonymous module.
		define(function () {
			return classNames;
		});
	} else {
		window.classNames = classNames;
	}

}());

},{}],3:[function(require,module,exports){
function makeshiftTitle(title, message) {
  return title ? (title + '\n\n' + message) : message
}

// See http://docs.phonegap.com/en/edge/cordova_notification_notification.md.html for documentation
module.exports = {
  alert: function alert(message, callback, title) {
    if (window.navigator.notification && window.navigator.notification.alert) {
      return window.navigator.notification.alert.apply(null, arguments)
    }

    var text = makeshiftTitle(title, message)

    setTimeout(function() {
      window.alert(text)

      callback()
    }, 0)
  },
  confirm: function confirm(message, callback, title) {
    if (window.navigator.notification && window.navigator.notification.confirm) {
      return window.navigator.notification.confirm.apply(null, arguments)
    }

    var text = makeshiftTitle(title, message)

    setTimeout(function() {
      var confirmed = window.confirm(text)
      var buttonIndex = confirmed ? 1 : 2

      callback(buttonIndex)
    }, 0)
  },

  prompt: function prompt(message, callback, title, defaultText) {
    if (window.navigator.notification && window.navigator.notification.prompt) {
      return window.navigator.notification.prompt.apply(null, arguments)
    }

    var question = makeshiftTitle(title, message)

    setTimeout(function() {
      var text = window.prompt(question, defaultText)
      var buttonIndex = (text === null) ? 0 : 1

      callback({
        buttonIndex: buttonIndex,
        input1: text
      })
    }, 0)
  }
}

},{}],4:[function(require,module,exports){
var Promise = require('promise');
var request = require('request');

module.exports = function (options, callback) {
  return new Promise(function (resolve, reject) {
    request(options, function (err, response, body) {
      var status = (response) ? response.statusCode : 0;
      callback = callback || function () {};
      
      if (err) {
        callback(err);
        reject(err);
        return 
      }
      
      try{
        response.body = JSON.parse(body);
      }
      catch (e) {}
      
      if (status >= 400 && status < 600) {
        callback(null, response);
        reject(response);
        return
      }
      
      callback(null, response);
      resolve(response);
    });
  });
};
},{"promise":6,"request":5}],5:[function(require,module,exports){
var request = require('xhr');

// Wrapper to make the features more similiar between
// request and xhr

module.exports = function (options, callback) {
  callback = callback || function () {};
  
  // Set up for Request module
  if (options.data && !window) options.form = options.data;
  
  // Set up for xhr module
  if (options.form && window) {
    options.body = (typeof options.form === 'object')
      ? JSON.stringify(options.form)
      : options.form;
  }
  
  if (options.data) {
    options.body = (typeof options.data === 'object')
      ? JSON.stringify(options.data)
      : options.data;
  }
  
  if (options.url && window) options.uri = options.url;
  if (window) options.cors = options.withCredentials;
  
  return request(options, callback);
};
},{"xhr":12}],6:[function(require,module,exports){
'use strict';

module.exports = require('./lib/core.js')
require('./lib/done.js')
require('./lib/es6-extensions.js')
require('./lib/node-extensions.js')
},{"./lib/core.js":7,"./lib/done.js":8,"./lib/es6-extensions.js":9,"./lib/node-extensions.js":10}],7:[function(require,module,exports){
'use strict';

var asap = require('asap')

module.exports = Promise;
function Promise(fn) {
  if (typeof this !== 'object') throw new TypeError('Promises must be constructed via new')
  if (typeof fn !== 'function') throw new TypeError('not a function')
  var state = null
  var value = null
  var deferreds = []
  var self = this

  this.then = function(onFulfilled, onRejected) {
    return new self.constructor(function(resolve, reject) {
      handle(new Handler(onFulfilled, onRejected, resolve, reject))
    })
  }

  function handle(deferred) {
    if (state === null) {
      deferreds.push(deferred)
      return
    }
    asap(function() {
      var cb = state ? deferred.onFulfilled : deferred.onRejected
      if (cb === null) {
        (state ? deferred.resolve : deferred.reject)(value)
        return
      }
      var ret
      try {
        ret = cb(value)
      }
      catch (e) {
        deferred.reject(e)
        return
      }
      deferred.resolve(ret)
    })
  }

  function resolve(newValue) {
    try { //Promise Resolution Procedure: https://github.com/promises-aplus/promises-spec#the-promise-resolution-procedure
      if (newValue === self) throw new TypeError('A promise cannot be resolved with itself.')
      if (newValue && (typeof newValue === 'object' || typeof newValue === 'function')) {
        var then = newValue.then
        if (typeof then === 'function') {
          doResolve(then.bind(newValue), resolve, reject)
          return
        }
      }
      state = true
      value = newValue
      finale()
    } catch (e) { reject(e) }
  }

  function reject(newValue) {
    state = false
    value = newValue
    finale()
  }

  function finale() {
    for (var i = 0, len = deferreds.length; i < len; i++)
      handle(deferreds[i])
    deferreds = null
  }

  doResolve(fn, resolve, reject)
}


function Handler(onFulfilled, onRejected, resolve, reject){
  this.onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : null
  this.onRejected = typeof onRejected === 'function' ? onRejected : null
  this.resolve = resolve
  this.reject = reject
}

/**
 * Take a potentially misbehaving resolver function and make sure
 * onFulfilled and onRejected are only called once.
 *
 * Makes no guarantees about asynchrony.
 */
function doResolve(fn, onFulfilled, onRejected) {
  var done = false;
  try {
    fn(function (value) {
      if (done) return
      done = true
      onFulfilled(value)
    }, function (reason) {
      if (done) return
      done = true
      onRejected(reason)
    })
  } catch (ex) {
    if (done) return
    done = true
    onRejected(ex)
  }
}

},{"asap":11}],8:[function(require,module,exports){
'use strict';

var Promise = require('./core.js')
var asap = require('asap')

module.exports = Promise
Promise.prototype.done = function (onFulfilled, onRejected) {
  var self = arguments.length ? this.then.apply(this, arguments) : this
  self.then(null, function (err) {
    asap(function () {
      throw err
    })
  })
}
},{"./core.js":7,"asap":11}],9:[function(require,module,exports){
'use strict';

//This file contains the ES6 extensions to the core Promises/A+ API

var Promise = require('./core.js')
var asap = require('asap')

module.exports = Promise

/* Static Functions */

function ValuePromise(value) {
  this.then = function (onFulfilled) {
    if (typeof onFulfilled !== 'function') return this
    return new Promise(function (resolve, reject) {
      asap(function () {
        try {
          resolve(onFulfilled(value))
        } catch (ex) {
          reject(ex);
        }
      })
    })
  }
}
ValuePromise.prototype = Promise.prototype

var TRUE = new ValuePromise(true)
var FALSE = new ValuePromise(false)
var NULL = new ValuePromise(null)
var UNDEFINED = new ValuePromise(undefined)
var ZERO = new ValuePromise(0)
var EMPTYSTRING = new ValuePromise('')

Promise.resolve = function (value) {
  if (value instanceof Promise) return value

  if (value === null) return NULL
  if (value === undefined) return UNDEFINED
  if (value === true) return TRUE
  if (value === false) return FALSE
  if (value === 0) return ZERO
  if (value === '') return EMPTYSTRING

  if (typeof value === 'object' || typeof value === 'function') {
    try {
      var then = value.then
      if (typeof then === 'function') {
        return new Promise(then.bind(value))
      }
    } catch (ex) {
      return new Promise(function (resolve, reject) {
        reject(ex)
      })
    }
  }

  return new ValuePromise(value)
}

Promise.all = function (arr) {
  var args = Array.prototype.slice.call(arr)

  return new Promise(function (resolve, reject) {
    if (args.length === 0) return resolve([])
    var remaining = args.length
    function res(i, val) {
      try {
        if (val && (typeof val === 'object' || typeof val === 'function')) {
          var then = val.then
          if (typeof then === 'function') {
            then.call(val, function (val) { res(i, val) }, reject)
            return
          }
        }
        args[i] = val
        if (--remaining === 0) {
          resolve(args);
        }
      } catch (ex) {
        reject(ex)
      }
    }
    for (var i = 0; i < args.length; i++) {
      res(i, args[i])
    }
  })
}

Promise.reject = function (value) {
  return new Promise(function (resolve, reject) { 
    reject(value);
  });
}

Promise.race = function (values) {
  return new Promise(function (resolve, reject) { 
    values.forEach(function(value){
      Promise.resolve(value).then(resolve, reject);
    })
  });
}

/* Prototype Methods */

Promise.prototype['catch'] = function (onRejected) {
  return this.then(null, onRejected);
}

},{"./core.js":7,"asap":11}],10:[function(require,module,exports){
'use strict';

//This file contains then/promise specific extensions that are only useful for node.js interop

var Promise = require('./core.js')
var asap = require('asap')

module.exports = Promise

/* Static Functions */

Promise.denodeify = function (fn, argumentCount) {
  argumentCount = argumentCount || Infinity
  return function () {
    var self = this
    var args = Array.prototype.slice.call(arguments)
    return new Promise(function (resolve, reject) {
      while (args.length && args.length > argumentCount) {
        args.pop()
      }
      args.push(function (err, res) {
        if (err) reject(err)
        else resolve(res)
      })
      var res = fn.apply(self, args)
      if (res && (typeof res === 'object' || typeof res === 'function') && typeof res.then === 'function') {
        resolve(res)
      }
    })
  }
}
Promise.nodeify = function (fn) {
  return function () {
    var args = Array.prototype.slice.call(arguments)
    var callback = typeof args[args.length - 1] === 'function' ? args.pop() : null
    var ctx = this
    try {
      return fn.apply(this, arguments).nodeify(callback, ctx)
    } catch (ex) {
      if (callback === null || typeof callback == 'undefined') {
        return new Promise(function (resolve, reject) { reject(ex) })
      } else {
        asap(function () {
          callback.call(ctx, ex)
        })
      }
    }
  }
}

Promise.prototype.nodeify = function (callback, ctx) {
  if (typeof callback != 'function') return this

  this.then(function (value) {
    asap(function () {
      callback.call(ctx, null, value)
    })
  }, function (err) {
    asap(function () {
      callback.call(ctx, err)
    })
  })
}

},{"./core.js":7,"asap":11}],11:[function(require,module,exports){
(function (process){

// Use the fastest possible means to execute a task in a future turn
// of the event loop.

// linked list of tasks (single, with head node)
var head = {task: void 0, next: null};
var tail = head;
var flushing = false;
var requestFlush = void 0;
var isNodeJS = false;

function flush() {
    /* jshint loopfunc: true */

    while (head.next) {
        head = head.next;
        var task = head.task;
        head.task = void 0;
        var domain = head.domain;

        if (domain) {
            head.domain = void 0;
            domain.enter();
        }

        try {
            task();

        } catch (e) {
            if (isNodeJS) {
                // In node, uncaught exceptions are considered fatal errors.
                // Re-throw them synchronously to interrupt flushing!

                // Ensure continuation if the uncaught exception is suppressed
                // listening "uncaughtException" events (as domains does).
                // Continue in next event to avoid tick recursion.
                if (domain) {
                    domain.exit();
                }
                setTimeout(flush, 0);
                if (domain) {
                    domain.enter();
                }

                throw e;

            } else {
                // In browsers, uncaught exceptions are not fatal.
                // Re-throw them asynchronously to avoid slow-downs.
                setTimeout(function() {
                   throw e;
                }, 0);
            }
        }

        if (domain) {
            domain.exit();
        }
    }

    flushing = false;
}

if (typeof process !== "undefined" && process.nextTick) {
    // Node.js before 0.9. Note that some fake-Node environments, like the
    // Mocha test runner, introduce a `process` global without a `nextTick`.
    isNodeJS = true;

    requestFlush = function () {
        process.nextTick(flush);
    };

} else if (typeof setImmediate === "function") {
    // In IE10, Node.js 0.9+, or https://github.com/NobleJS/setImmediate
    if (typeof window !== "undefined") {
        requestFlush = setImmediate.bind(window, flush);
    } else {
        requestFlush = function () {
            setImmediate(flush);
        };
    }

} else if (typeof MessageChannel !== "undefined") {
    // modern browsers
    // http://www.nonblocking.io/2011/06/windownexttick.html
    var channel = new MessageChannel();
    channel.port1.onmessage = flush;
    requestFlush = function () {
        channel.port2.postMessage(0);
    };

} else {
    // old browsers
    requestFlush = function () {
        setTimeout(flush, 0);
    };
}

function asap(task) {
    tail = tail.next = {
        task: task,
        domain: isNodeJS && process.domain,
        next: null
    };

    if (!flushing) {
        flushing = true;
        requestFlush();
    }
};

module.exports = asap;


}).call(this,require('_process'))

},{"_process":25}],12:[function(require,module,exports){
var window = require("global/window")
var once = require("once")
var parseHeaders = require('parse-headers')

var messages = {
    "0": "Internal XMLHttpRequest Error",
    "4": "4xx Client Error",
    "5": "5xx Server Error"
}

var XHR = window.XMLHttpRequest || noop
var XDR = "withCredentials" in (new XHR()) ? XHR : window.XDomainRequest

module.exports = createXHR

function createXHR(options, callback) {
    if (typeof options === "string") {
        options = { uri: options }
    }

    options = options || {}
    callback = once(callback)

    var xhr = options.xhr || null

    if (!xhr) {
        if (options.cors || options.useXDR) {
            xhr = new XDR()
        }else{
            xhr = new XHR()
        }
    }

    var uri = xhr.url = options.uri || options.url
    var method = xhr.method = options.method || "GET"
    var body = options.body || options.data
    var headers = xhr.headers = options.headers || {}
    var sync = !!options.sync
    var isJson = false
    var key
    var load = options.response ? loadResponse : loadXhr

    if ("json" in options) {
        isJson = true
        headers["Accept"] = "application/json"
        if (method !== "GET" && method !== "HEAD") {
            headers["Content-Type"] = "application/json"
            body = JSON.stringify(options.json)
        }
    }

    xhr.onreadystatechange = readystatechange
    xhr.onload = load
    xhr.onerror = error
    // IE9 must have onprogress be set to a unique function.
    xhr.onprogress = function () {
        // IE must die
    }
    // hate IE
    xhr.ontimeout = noop
    xhr.open(method, uri, !sync)
                                    //backward compatibility
    if (options.withCredentials || (options.cors && options.withCredentials !== false)) {
        xhr.withCredentials = true
    }

    // Cannot set timeout with sync request
    if (!sync) {
        xhr.timeout = "timeout" in options ? options.timeout : 5000
    }

    if (xhr.setRequestHeader) {
        for(key in headers){
            if(headers.hasOwnProperty(key)){
                xhr.setRequestHeader(key, headers[key])
            }
        }
    } else if (options.headers) {
        throw new Error("Headers cannot be set on an XDomainRequest object")
    }

    if ("responseType" in options) {
        xhr.responseType = options.responseType
    }
    
    if ("beforeSend" in options && 
        typeof options.beforeSend === "function"
    ) {
        options.beforeSend(xhr)
    }

    xhr.send(body)

    return xhr

    function readystatechange() {
        if (xhr.readyState === 4) {
            load()
        }
    }

    function getBody() {
        // Chrome with requestType=blob throws errors arround when even testing access to responseText
        var body = null

        if (xhr.response) {
            body = xhr.response
        } else if (xhr.responseType === 'text' || !xhr.responseType) {
            body = xhr.responseText || xhr.responseXML
        }

        if (isJson) {
            try {
                body = JSON.parse(body)
            } catch (e) {}
        }

        return body
    }

    function getStatusCode() {
        return xhr.status === 1223 ? 204 : xhr.status
    }

    // if we're getting a none-ok statusCode, build & return an error
    function errorFromStatusCode(status, body) {
        var error = null
        if (status === 0 || (status >= 400 && status < 600)) {
            var message = (typeof body === "string" ? body : false) ||
                messages[String(status).charAt(0)]
            error = new Error(message)
            error.statusCode = status
        }

        return error
    }

    // will load the data & process the response in a special response object
    function loadResponse() {
        var status = getStatusCode()
        var body = getBody()
        var error = errorFromStatusCode(status, body)
        var response = {
            body: body,
            statusCode: status,
            statusText: xhr.statusText,
            raw: xhr
        }
        if(xhr.getAllResponseHeaders){ //remember xhr can in fact be XDR for CORS in IE
            response.headers = parseHeaders(xhr.getAllResponseHeaders())
        } else {
            response.headers = {}
        }

        callback(error, response, response.body)
    }

    // will load the data and add some response properties to the source xhr
    // and then respond with that
    function loadXhr() {
        var status = getStatusCode()
        var error = errorFromStatusCode(status)

        xhr.status = xhr.statusCode = status
        xhr.body = getBody()
        xhr.headers = parseHeaders(xhr.getAllResponseHeaders())

        callback(error, xhr, xhr.body)
    }

    function error(evt) {
        callback(evt, xhr)
    }
}


function noop() {}

},{"global/window":13,"once":14,"parse-headers":18}],13:[function(require,module,exports){
(function (global){
if (typeof window !== "undefined") {
    module.exports = window;
} else if (typeof global !== "undefined") {
    module.exports = global;
} else if (typeof self !== "undefined"){
    module.exports = self;
} else {
    module.exports = {};
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],14:[function(require,module,exports){
module.exports = once

once.proto = once(function () {
  Object.defineProperty(Function.prototype, 'once', {
    value: function () {
      return once(this)
    },
    configurable: true
  })
})

function once (fn) {
  var called = false
  return function () {
    if (called) return
    called = true
    return fn.apply(this, arguments)
  }
}

},{}],15:[function(require,module,exports){
var isFunction = require('is-function')

module.exports = forEach

var toString = Object.prototype.toString
var hasOwnProperty = Object.prototype.hasOwnProperty

function forEach(list, iterator, context) {
    if (!isFunction(iterator)) {
        throw new TypeError('iterator must be a function')
    }

    if (arguments.length < 3) {
        context = this
    }
    
    if (toString.call(list) === '[object Array]')
        forEachArray(list, iterator, context)
    else if (typeof list === 'string')
        forEachString(list, iterator, context)
    else
        forEachObject(list, iterator, context)
}

function forEachArray(array, iterator, context) {
    for (var i = 0, len = array.length; i < len; i++) {
        if (hasOwnProperty.call(array, i)) {
            iterator.call(context, array[i], i, array)
        }
    }
}

function forEachString(string, iterator, context) {
    for (var i = 0, len = string.length; i < len; i++) {
        // no such thing as a sparse string.
        iterator.call(context, string.charAt(i), i, string)
    }
}

function forEachObject(object, iterator, context) {
    for (var k in object) {
        if (hasOwnProperty.call(object, k)) {
            iterator.call(context, object[k], k, object)
        }
    }
}

},{"is-function":16}],16:[function(require,module,exports){
module.exports = isFunction

var toString = Object.prototype.toString

function isFunction (fn) {
  var string = toString.call(fn)
  return string === '[object Function]' ||
    (typeof fn === 'function' && string !== '[object RegExp]') ||
    (typeof window !== 'undefined' &&
     // IE8 and below
     (fn === window.setTimeout ||
      fn === window.alert ||
      fn === window.confirm ||
      fn === window.prompt))
};

},{}],17:[function(require,module,exports){

exports = module.exports = trim;

function trim(str){
  return str.replace(/^\s*|\s*$/g, '');
}

exports.left = function(str){
  return str.replace(/^\s*/, '');
};

exports.right = function(str){
  return str.replace(/\s*$/, '');
};

},{}],18:[function(require,module,exports){
var trim = require('trim')
  , forEach = require('for-each')
  , isArray = function(arg) {
      return Object.prototype.toString.call(arg) === '[object Array]';
    }

module.exports = function (headers) {
  if (!headers)
    return {}

  var result = {}

  forEach(
      trim(headers).split('\n')
    , function (row) {
        var index = row.indexOf(':')
          , key = trim(row.slice(0, index)).toLowerCase()
          , value = trim(row.slice(index + 1))

        if (typeof(result[key]) === 'undefined') {
          result[key] = value
        } else if (isArray(result[key])) {
          result[key].push(value)
        } else {
          result[key] = [ result[key], value ]
        }
      }
  )

  return result
}
},{"for-each":15,"trim":17}],19:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var blacklist = require('blacklist');
var classnames = require('classnames');
var React = require('react');

function hasChildrenWithVerticalFill(children) {
	var result = false;

	React.Children.forEach(children, function (c) {
		if (result) return; // early-exit
		if (!c) return;
		if (!c.type) return;

		result = !!c.type.shouldFillVerticalSpace;
	});

	return result;
}

var Container = React.createClass({
	displayName: 'Container',

	propTypes: {
		align: React.PropTypes.oneOf(['end', 'center', 'start']),
		direction: React.PropTypes.oneOf(['column', 'row']),
		justify: React.PropTypes.oneOfType([React.PropTypes.bool, React.PropTypes.oneOf(['end', 'center', 'start'])]),
		grow: React.PropTypes.bool,
		fill: React.PropTypes.bool
	},
	componentDidMount: function componentDidMount() {
		if (this.props.scrollable && this.props.scrollable.mount) {
			this.props.scrollable.mount(this);
		}
	},
	componentWillUnmount: function componentWillUnmount() {
		if (this.props.scrollable && this.props.scrollable.unmount) {
			this.props.scrollable.unmount(this);
		}
	},
	render: function render() {
		var direction = this.props.direction;
		if (!direction) {
			if (hasChildrenWithVerticalFill(this.props.children)) {
				direction = 'column';
			}
		}

		var fill = this.props.fill;
		if (direction === 'column' || this.props.scrollable) {
			fill = true;
		}

		var align = this.props.align;
		if (direction === 'column' && align === 'top') align = 'start';
		if (direction === 'column' && align === 'bottom') align = 'end';
		if (direction === 'row' && align === 'left') align = 'start';
		if (direction === 'row' && align === 'right') align = 'end';

		var className = classnames(this.props.className, {
			'Container--fill': fill,
			'Container--direction-column': direction === 'column',
			'Container--direction-row': direction === 'row',
			'Container--align-center': align === 'center',
			'Container--align-start': align === 'start',
			'Container--align-end': align === 'end',
			'Container--justify-center': this.props.justify === 'center',
			'Container--justify-start': this.props.justify === 'start',
			'Container--justify-end': this.props.justify === 'end',
			'Container--justified': this.props.justify === true,
			'Container--scrollable': this.props.scrollable
		});

		var props = blacklist(this.props, 'className', 'direction', 'fill', 'justify', 'scrollable');

		return React.createElement(
			'div',
			_extends({ className: className }, props),
			this.props.children
		);
	}
});

function initScrollable() {
	var pos;
	var scrollable = {
		reset: function reset() {
			pos = { left: 0, top: 0 };
		},
		mount: function mount(element) {
			var node = React.findDOMNode(element);
			node.scrollLeft = pos.left;
			node.scrollTop = pos.top;
		},
		unmount: function unmount(element) {
			var node = React.findDOMNode(element);
			pos.left = node.scrollLeft;
			pos.top = node.scrollTop;
		}
	};
	scrollable.reset();
	return scrollable;
}

Container.initScrollable = initScrollable;

exports['default'] = Container;
module.exports = exports['default'];
},{"blacklist":20,"classnames":2,"react":undefined}],20:[function(require,module,exports){
module.exports = function blacklist (src) {
  var copy = {}, filter = arguments[1]

  if (typeof filter === 'string') {
    filter = {}
    for (var i = 1; i < arguments.length; i++) {
      filter[arguments[i]] = true
    }
  }

  for (var key in src) {
    // blacklist?
    if (filter[key]) continue

    copy[key] = src[key]
  }

  return copy
}

},{}],21:[function(require,module,exports){
"use strict";

module.exports = function () {
  var listeners = [];

  return {
    componentWillUnmount: function componentWillUnmount() {
      listeners.forEach(function (listener) {
        var emitter = listener.emitter;
        var eventName = listener.eventName;
        var callback = listener.callback;

        var removeListener = emitter.removeListener || emitter.removeEventListener;
        removeListener.call(emitter, eventName, callback);
      });
    },

    watch: function watch(emitter, eventName, callback) {
      listeners.push({
        emitter: emitter,
        eventName: eventName,
        callback: callback
      });

      var addListener = emitter.addListener || emitter.addEventListener;
      addListener.call(emitter, eventName, callback);
    },

    unwatch: function unwatch(emitter, eventName, callback) {
      listeners = listeners.filter(function (listener) {
        return listener.emitter === emitter && listener.eventName === eventName && listener.callback === callback;
      });

      var removeListener = emitter.removeListener || emitter.removeEventListener;
      removeListener.call(emitter, eventName, callback);
    }
  };
};
},{}],22:[function(require,module,exports){
'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var React = require('react');

// Enable React Touch Events
React.initializeTouchEvents(true);

function getTouchProps(touch) {
	if (!touch) return {};
	return {
		pageX: touch.pageX,
		pageY: touch.pageY,
		clientX: touch.clientX,
		clientY: touch.clientY
	};
}

function isDataOrAriaProp(key) {
	return key.indexOf('data-') === 0 || key.indexOf('aria-') === 0;
}

function getPinchProps(touches) {
	return {
		touches: Array.prototype.map.call(touches, function copyTouch(touch) {
			return { identifier: touch.identifier, pageX: touch.pageX, pageY: touch.pageY };
		}),
		center: { x: (touches[0].pageX + touches[1].pageX) / 2, y: (touches[0].pageY + touches[1].pageY) / 2 },
		angle: Math.atan() * (touches[1].pageY - touches[0].pageY) / (touches[1].pageX - touches[0].pageX) * 180 / Math.PI,
		distance: Math.sqrt(Math.pow(Math.abs(touches[1].pageX - touches[0].pageX), 2) + Math.pow(Math.abs(touches[1].pageY - touches[0].pageY), 2))
	};
}

/**
 * Tappable Mixin
 * ==============
 */

var Mixin = {
	propTypes: {
		moveThreshold: React.PropTypes.number, // pixels to move before cancelling tap
		activeDelay: React.PropTypes.number, // ms to wait before adding the `-active` class
		pressDelay: React.PropTypes.number, // ms to wait before detecting a press
		pressMoveThreshold: React.PropTypes.number, // pixels to move before cancelling press
		preventDefault: React.PropTypes.bool, // whether to preventDefault on all events
		stopPropagation: React.PropTypes.bool, // whether to stopPropagation on all events

		onTap: React.PropTypes.func, // fires when a tap is detected
		onPress: React.PropTypes.func, // fires when a press is detected
		onTouchStart: React.PropTypes.func, // pass-through touch event
		onTouchMove: React.PropTypes.func, // pass-through touch event
		onTouchEnd: React.PropTypes.func, // pass-through touch event
		onMouseDown: React.PropTypes.func, // pass-through mouse event
		onMouseUp: React.PropTypes.func, // pass-through mouse event
		onMouseMove: React.PropTypes.func, // pass-through mouse event
		onMouseOut: React.PropTypes.func, // pass-through mouse event

		onPinchStart: React.PropTypes.func, // fires when a pinch gesture is started
		onPinchMove: React.PropTypes.func, // fires on every touch-move when a pinch action is active
		onPinchEnd: React.PropTypes.func // fires when a pinch action ends
	},

	getDefaultProps: function getDefaultProps() {
		return {
			activeDelay: 0,
			moveThreshold: 100,
			pressDelay: 1000,
			pressMoveThreshold: 5
		};
	},

	getInitialState: function getInitialState() {
		return {
			isActive: false,
			touchActive: false,
			pinchActive: false
		};
	},

	componentWillUnmount: function componentWillUnmount() {
		this.cleanupScrollDetection();
		this.cancelPressDetection();
		this.clearActiveTimeout();
	},

	processEvent: function processEvent(event) {
		if (this.props.preventDefault) event.preventDefault();
		if (this.props.stopPropagation) event.stopPropagation();
	},

	onTouchStart: function onTouchStart(event) {
		if (this.props.onTouchStart && this.props.onTouchStart(event) === false) return;
		this.processEvent(event);
		window._blockMouseEvents = true;
		if (event.touches.length === 1) {
			this._initialTouch = this._lastTouch = getTouchProps(event.touches[0]);
			this.initScrollDetection();
			this.initPressDetection(event, this.endTouch);
			this._activeTimeout = setTimeout(this.makeActive, this.props.activeDelay);
		} else if ((this.props.onPinchStart || this.props.onPinchMove || this.props.onPinchEnd) && event.touches.length === 2) {
			this.onPinchStart(event);
		}
	},

	makeActive: function makeActive() {
		if (!this.isMounted()) return;
		this.clearActiveTimeout();
		this.setState({
			isActive: true
		});
	},

	clearActiveTimeout: function clearActiveTimeout() {
		clearTimeout(this._activeTimeout);
		this._activeTimeout = false;
	},

	onPinchStart: function onPinchStart(event) {
		// in case the two touches didn't start exactly at the same time
		if (this._initialTouch) {
			this.endTouch();
		}
		var touches = event.touches;
		this._initialPinch = getPinchProps(touches);
		this._initialPinch = _extends(this._initialPinch, {
			displacement: { x: 0, y: 0 },
			displacementVelocity: { x: 0, y: 0 },
			rotation: 0,
			rotationVelocity: 0,
			zoom: 1,
			zoomVelocity: 0,
			time: Date.now()
		});
		this._lastPinch = this._initialPinch;
		this.props.onPinchStart && this.props.onPinchStart(this._initialPinch, event);
	},

	onPinchMove: function onPinchMove(event) {
		if (this._initialTouch) {
			this.endTouch();
		}
		var touches = event.touches;
		if (touches.length !== 2) {
			return this.onPinchEnd(event) // bail out before disaster
			;
		}

		var currentPinch = touches[0].identifier === this._initialPinch.touches[0].identifier && touches[1].identifier === this._initialPinch.touches[1].identifier ? getPinchProps(touches) // the touches are in the correct order
		: touches[1].identifier === this._initialPinch.touches[0].identifier && touches[0].identifier === this._initialPinch.touches[1].identifier ? getPinchProps(touches.reverse()) // the touches have somehow changed order
		: getPinchProps(touches); // something is wrong, but we still have two touch-points, so we try not to fail

		currentPinch.displacement = {
			x: currentPinch.center.x - this._initialPinch.center.x,
			y: currentPinch.center.y - this._initialPinch.center.y
		};

		currentPinch.time = Date.now();
		var timeSinceLastPinch = currentPinch.time - this._lastPinch.time;

		currentPinch.displacementVelocity = {
			x: (currentPinch.displacement.x - this._lastPinch.displacement.x) / timeSinceLastPinch,
			y: (currentPinch.displacement.y - this._lastPinch.displacement.y) / timeSinceLastPinch
		};

		currentPinch.rotation = currentPinch.angle - this._initialPinch.angle;
		currentPinch.rotationVelocity = currentPinch.rotation - this._lastPinch.rotation / timeSinceLastPinch;

		currentPinch.zoom = currentPinch.distance / this._initialPinch.distance;
		currentPinch.zoomVelocity = (currentPinch.zoom - this._lastPinch.zoom) / timeSinceLastPinch;

		this.props.onPinchMove && this.props.onPinchMove(currentPinch, event);

		this._lastPinch = currentPinch;
	},

	onPinchEnd: function onPinchEnd(event) {
		// TODO use helper to order touches by identifier and use actual values on touchEnd.
		var currentPinch = _extends({}, this._lastPinch);
		currentPinch.time = Date.now();

		if (currentPinch.time - this._lastPinch.time > 16) {
			currentPinch.displacementVelocity = 0;
			currentPinch.rotationVelocity = 0;
			currentPinch.zoomVelocity = 0;
		}

		this.props.onPinchEnd && this.props.onPinchEnd(currentPinch, event);

		this._initialPinch = this._lastPinch = null;

		// If one finger is still on screen, it should start a new touch event for swiping etc
		// But it should never fire an onTap or onPress event.
		// Since there is no support swipes yet, this should be disregarded for now
		// if (event.touches.length === 1) {
		// 	this.onTouchStart(event);
		// }
	},

	initScrollDetection: function initScrollDetection() {
		this._scrollPos = { top: 0, left: 0 };
		this._scrollParents = [];
		this._scrollParentPos = [];
		var node = this.getDOMNode();
		while (node) {
			if (node.scrollHeight > node.offsetHeight || node.scrollWidth > node.offsetWidth) {
				this._scrollParents.push(node);
				this._scrollParentPos.push(node.scrollTop + node.scrollLeft);
				this._scrollPos.top += node.scrollTop;
				this._scrollPos.left += node.scrollLeft;
			}
			node = node.parentNode;
		}
	},

	calculateMovement: function calculateMovement(touch) {
		return {
			x: Math.abs(touch.clientX - this._initialTouch.clientX),
			y: Math.abs(touch.clientY - this._initialTouch.clientY)
		};
	},

	detectScroll: function detectScroll() {
		var currentScrollPos = { top: 0, left: 0 };
		for (var i = 0; i < this._scrollParents.length; i++) {
			currentScrollPos.top += this._scrollParents[i].scrollTop;
			currentScrollPos.left += this._scrollParents[i].scrollLeft;
		}
		return !(currentScrollPos.top === this._scrollPos.top && currentScrollPos.left === this._scrollPos.left);
	},

	cleanupScrollDetection: function cleanupScrollDetection() {
		this._scrollParents = undefined;
		this._scrollPos = undefined;
	},

	initPressDetection: function initPressDetection(event, callback) {
		if (!this.props.onPress) return;
		this._pressTimeout = setTimeout((function () {
			this.props.onPress(event);
			callback();
		}).bind(this), this.props.pressDelay);
	},

	cancelPressDetection: function cancelPressDetection() {
		clearTimeout(this._pressTimeout);
	},

	onTouchMove: function onTouchMove(event) {
		if (this._initialTouch) {
			this.processEvent(event);

			if (this.detectScroll()) return this.endTouch(event);

			this.props.onTouchMove && this.props.onTouchMove(event);
			this._lastTouch = getTouchProps(event.touches[0]);
			var movement = this.calculateMovement(this._lastTouch);
			if (movement.x > this.props.pressMoveThreshold || movement.y > this.props.pressMoveThreshold) {
				this.cancelPressDetection();
			}
			if (movement.x > this.props.moveThreshold || movement.y > this.props.moveThreshold) {
				if (this.state.isActive) {
					this.setState({
						isActive: false
					});
				} else if (this._activeTimeout) {
					this.clearActiveTimeout();
				}
			} else {
				if (!this.state.isActive && !this._activeTimeout) {
					this.setState({
						isActive: true
					});
				}
			}
		} else if (this._initialPinch && event.touches.length === 2) {
			this.onPinchMove(event);
			event.preventDefault();
		}
	},

	onTouchEnd: function onTouchEnd(event) {
		var _this = this;

		if (this._initialTouch) {
			this.processEvent(event);
			var afterEndTouch;
			var movement = this.calculateMovement(this._lastTouch);
			if (movement.x <= this.props.moveThreshold && movement.y <= this.props.moveThreshold && this.props.onTap) {
				event.preventDefault();
				afterEndTouch = function () {
					var finalParentScrollPos = _this._scrollParents.map(function (node) {
						return node.scrollTop + node.scrollLeft;
					});
					var stoppedMomentumScroll = _this._scrollParentPos.some(function (end, i) {
						return end !== finalParentScrollPos[i];
					});
					if (!stoppedMomentumScroll) {
						_this.props.onTap(event);
					}
				};
			}
			this.endTouch(event, afterEndTouch);
		} else if (this._initialPinch && event.touches.length + event.changedTouches.length === 2) {
			this.onPinchEnd(event);
			event.preventDefault();
		}
	},

	endTouch: function endTouch(event, callback) {
		this.cancelPressDetection();
		this.clearActiveTimeout();
		if (event && this.props.onTouchEnd) {
			this.props.onTouchEnd(event);
		}
		this._initialTouch = null;
		this._lastTouch = null;
		if (this.state.isActive) {
			this.setState({
				isActive: false
			}, callback);
		} else if (callback) {
			callback();
		}
	},

	onMouseDown: function onMouseDown(event) {
		if (window._blockMouseEvents) {
			window._blockMouseEvents = false;
			return;
		}
		if (this.props.onMouseDown && this.props.onMouseDown(event) === false) return;
		this.processEvent(event);
		this.initPressDetection(event, this.endMouseEvent);
		this._mouseDown = true;
		this.setState({
			isActive: true
		});
	},

	onMouseMove: function onMouseMove(event) {
		if (window._blockMouseEvents || !this._mouseDown) return;
		this.processEvent(event);
		this.props.onMouseMove && this.props.onMouseMove(event);
	},

	onMouseUp: function onMouseUp(event) {
		if (window._blockMouseEvents || !this._mouseDown) return;
		this.processEvent(event);
		this.props.onMouseUp && this.props.onMouseUp(event);
		this.props.onTap && this.props.onTap(event);
		this.endMouseEvent();
	},

	onMouseOut: function onMouseOut(event) {
		if (window._blockMouseEvents || !this._mouseDown) return;
		this.processEvent(event);
		this.props.onMouseOut && this.props.onMouseOut(event);
		this.endMouseEvent();
	},

	endMouseEvent: function endMouseEvent() {
		this.cancelPressDetection();
		this._mouseDown = false;
		this.setState({
			isActive: false
		});
	},

	touchStyles: function touchStyles() {
		return {
			WebkitTapHighlightColor: 'rgba(0,0,0,0)',
			WebkitTouchCallout: 'none',
			WebkitUserSelect: 'none',
			KhtmlUserSelect: 'none',
			MozUserSelect: 'none',
			msUserSelect: 'none',
			userSelect: 'none',
			cursor: 'pointer'
		};
	},

	handlers: function handlers() {
		return {
			onTouchStart: this.onTouchStart,
			onTouchMove: this.onTouchMove,
			onTouchEnd: this.onTouchEnd,
			onMouseDown: this.onMouseDown,
			onMouseUp: this.onMouseUp,
			onMouseMove: this.onMouseMove,
			onMouseOut: this.onMouseOut
		};
	}
};

/**
 * Tappable Component
 * ==================
 */

var Component = React.createClass({

	displayName: 'Tappable',

	mixins: [Mixin],

	propTypes: {
		component: React.PropTypes.any, // component to create
		className: React.PropTypes.string, // optional className
		classBase: React.PropTypes.string, // base for generated classNames
		style: React.PropTypes.object, // additional style properties for the component
		disabled: React.PropTypes.bool // only applies to buttons
	},

	getDefaultProps: function getDefaultProps() {
		return {
			component: 'span',
			classBase: 'Tappable'
		};
	},

	render: function render() {
		var props = this.props;
		var className = props.classBase + (this.state.isActive ? '-active' : '-inactive');

		if (props.className) {
			className += ' ' + props.className;
		}

		var style = {};
		_extends(style, this.touchStyles(), props.style);

		var newComponentProps = _extends({}, props, {
			style: style,
			className: className,
			disabled: props.disabled,
			handlers: this.handlers
		}, this.handlers());

		delete newComponentProps.onTap;
		delete newComponentProps.onPress;
		delete newComponentProps.onPinchStart;
		delete newComponentProps.onPinchMove;
		delete newComponentProps.onPinchEnd;
		delete newComponentProps.moveThreshold;
		delete newComponentProps.pressDelay;
		delete newComponentProps.pressMoveThreshold;
		delete newComponentProps.preventDefault;
		delete newComponentProps.stopPropagation;
		delete newComponentProps.component;

		return React.createElement(props.component, newComponentProps, props.children);
	}
});

Component.Mixin = Mixin;
module.exports = Component;
},{"react":undefined}],23:[function(require,module,exports){
module.exports = function Timers () {
  var intervals = []
  var timeouts = []

  return {
    clearIntervals: function () {
      intervals.forEach(clearInterval)
    },

    clearTimeouts: function () {
      timeouts.forEach(clearTimeout)
    },

    clearTimers: function () {
      this.clearInterval()
      this.clearTimeouts()
    },

    componentWillMount: function () {
      intervals = []
      timeouts = []
    },

    componentWillUnmount: function () {
      this.clearIntervals()
      this.clearTimeouts()
    },

    countDown: function (callback, timeout, interval) {
      var self = this
      var sleep = Math.min(timeout, interval)

      this.setTimeout(function () {
        var remaining = timeout - sleep

        callback(remaining)
        if (remaining <= 0) return

        self.countDown(callback, remaining, interval)
      }, sleep)
    },

    setInterval: function (callback, interval) {
      var self = this

      intervals.push(setInterval(function () {
        if (!self.isMounted()) return

        callback.call(self)
      }, interval))
    },

    setTimeout: function (callback, timeout) {
      var self = this

      timeouts.push(setTimeout(function () {
        if (!self.isMounted()) return

        callback.call(self)
      }, timeout))
    }
  }
}

},{}],24:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      }
      throw TypeError('Uncaught, unspecified "error" event.');
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        len = arguments.length;
        args = new Array(len - 1);
        for (i = 1; i < len; i++)
          args[i - 1] = arguments[i];
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    len = arguments.length;
    args = new Array(len - 1);
    for (i = 1; i < len; i++)
      args[i - 1] = arguments[i];

    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    var m;
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.listenerCount = function(emitter, type) {
  var ret;
  if (!emitter._events || !emitter._events[type])
    ret = 0;
  else if (isFunction(emitter._events[type]))
    ret = 1;
  else
    ret = emitter._events[type].length;
  return ret;
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}],25:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = setTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            currentQueue[queueIndex].run();
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    clearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        setTimeout(drainQueue, 0);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],26:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});
var React = require('react');
var Container = require('react-container');

var ErrorView = React.createClass({
	displayName: 'ErrorView',

	propTypes: {
		children: React.PropTypes.node
	},

	render: function render() {
		return React.createElement(
			Container,
			{ fill: true, className: 'View ErrorView' },
			this.props.children
		);
	}
});

exports['default'] = ErrorView;
module.exports = exports['default'];
},{"react":undefined,"react-container":19}],27:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var blacklist = require('blacklist');
var React = require('react');
var Tappable = require('react-tappable');
var Transitions = require('../mixins/Transitions');

var Link = React.createClass({
	displayName: 'Link',

	mixins: [Transitions],
	propTypes: {
		children: React.PropTypes.any,
		options: React.PropTypes.object,
		transition: React.PropTypes.string,
		to: React.PropTypes.string,
		viewProps: React.PropTypes.any
	},

	doTransition: function doTransition() {
		var options = _extends({ viewProps: this.props.viewProps, transition: this.props.transition }, this.props.options);
		console.info('Link to "' + this.props.to + '" using transition "' + this.props.transition + '"' + ' with props ', this.props.viewProps);
		this.transitionTo(this.props.to, options);
	},

	render: function render() {
		var tappableProps = blacklist(this.props, 'children', 'options', 'transition', 'viewProps');

		return React.createElement(
			Tappable,
			_extends({ onTap: this.doTransition }, tappableProps),
			this.props.children
		);
	}
});

exports['default'] = Link;
module.exports = exports['default'];
},{"../mixins/Transitions":32,"blacklist":64,"react":undefined,"react-tappable":22}],28:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});
var React = require('react');

var View = React.createClass({
	displayName: 'View',

	propTypes: {
		component: React.PropTypes.func.isRequired,
		name: React.PropTypes.string.isRequired
	},
	render: function render() {
		throw new Error('TouchstoneJS <View> should not be rendered directly.');
	}
});

exports['default'] = View;
module.exports = exports['default'];
},{"react":undefined}],29:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var blacklist = require('blacklist');
var classNames = require('classnames');
var ErrorView = require('./ErrorView');
var React = require('react/addons');
var Transition = React.addons.CSSTransitionGroup;

function createViewsFromChildren(children) {
	var views = {};
	React.Children.forEach(children, function (view) {
		views[view.props.name] = view;
	});
	return views;
}

var ViewContainer = React.createClass({
	displayName: 'ViewContainer',

	statics: {
		shouldFillVerticalSpace: true
	},
	propTypes: {
		children: React.PropTypes.node
	},
	render: function render() {
		var props = blacklist(this.props, 'children');
		return React.createElement(
			'div',
			props,
			this.props.children
		);
	}
});

var ViewManager = React.createClass({
	displayName: 'ViewManager',

	statics: {
		shouldFillVerticalSpace: true
	},
	contextTypes: {
		app: React.PropTypes.object.isRequired
	},
	propTypes: {
		name: React.PropTypes.string,
		children: React.PropTypes.node,
		className: React.PropTypes.string,
		defaultView: React.PropTypes.string,
		onViewChange: React.PropTypes.func
	},
	getDefaultProps: function getDefaultProps() {
		return {
			name: '__default'
		};
	},
	getInitialState: function getInitialState() {
		return {
			views: createViewsFromChildren(this.props.children),
			currentView: this.props.defaultView,
			options: {}
		};
	},
	componentDidMount: function componentDidMount() {
		this.context.app.viewManagers[this.props.name] = this;
	},
	componentWillUnmount: function componentWillUnmount() {
		delete this.context.app.viewManagers[this.props.name];
	},
	componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
		this.setState({
			views: createViewsFromChildren(this.props.children)
		});
		if (nextProps.name !== this.props.name) {
			this.context.app.viewManagers[nextProps.name] = this;
			delete this.context.app.viewManagers[this.props.name];
		}
		if (nextProps.currentView && nextProps.currentView !== this.state.currentView) {
			this.transitionTo(nextProps.currentView, { viewProps: nextProps.viewProps });
		}
	},
	transitionTo: function transitionTo(viewKey, options) {
		var _this = this;

		if (typeof options === 'string') {
			options = { transition: options };
		}
		if (!options) options = {};
		this.activeTransitionOptions = options;
		this.context.app.viewManagerInTransition = this;
		this.props.onViewChange && this.props.onViewChange(viewKey);
		this.setState({
			currentView: viewKey,
			options: options
		}, function () {
			delete _this.activeTransitionOptions;
			delete _this.context.app.viewManagerInTransition;
		});
	},
	renderViewContainer: function renderViewContainer() {
		var viewKey = this.state.currentView;
		if (!viewKey) {
			return React.createElement(
				ErrorView,
				null,
				React.createElement(
					'span',
					{ className: 'ErrorView__heading' },
					'ViewManager: ',
					this.props.name
				),
				React.createElement(
					'span',
					{ className: 'ErrorView__text' },
					'Error: There is no current View.'
				)
			);
		}
		var view = this.state.views[viewKey];
		if (!view || !view.props.component) {
			return React.createElement(
				ErrorView,
				null,
				React.createElement(
					'span',
					{ className: 'ErrorView__heading' },
					'ViewManager: "',
					this.props.name,
					'"'
				),
				React.createElement(
					'span',
					{ className: 'ErrorView__text' },
					'The View "',
					viewKey,
					'" is invalid.'
				)
			);
		}
		var options = this.state.options || {};
		var viewClassName = classNames('View View--' + viewKey, view.props.className);
		var ViewComponent = view.props.component;
		var viewProps = blacklist(view.props, 'component', 'className');
		_extends(viewProps, options.viewProps);
		var viewElement = React.createElement(ViewComponent, viewProps);

		if (this.__lastRenderedView !== viewKey) {
			// console.log('initialising view ' + viewKey + ' with options', options);
			if (viewElement.type.navigationBar && viewElement.type.getNavigation) {
				var app = this.context.app;
				var transition = options.transition;
				if (app.viewManagerInTransition) {
					transition = app.viewManagerInTransition.activeTransitionOptions.transition;
				}
				setTimeout(function () {
					app.navigationBars[viewElement.type.navigationBar].updateWithTransition(viewElement.type.getNavigation(viewProps, app), transition);
				}, 0);
			}
			this.__lastRenderedView = viewKey;
		}

		return React.createElement(
			ViewContainer,
			{ className: viewClassName, key: viewKey },
			viewElement
		);
	},
	render: function render() {
		var className = classNames('ViewManager', this.props.className);
		var viewContainer = this.renderViewContainer(this.state.currentView, { viewProps: this.state.currentViewProps });

		var transitionName = 'view-transition-instant';
		if (this.state.options.transition) {
			// console.log('applying view transition: ' + this.state.options.transition + ' to view ' + this.state.currentView);
			transitionName = 'view-transition-' + this.state.options.transition;
		}
		return React.createElement(
			Transition,
			{ transitionName: transitionName, transitionEnter: true, transitionLeave: true, className: className, component: 'div' },
			viewContainer
		);
	}
});

exports['default'] = ViewManager;
module.exports = exports['default'];
},{"./ErrorView":26,"blacklist":64,"classnames":2,"react/addons":undefined}],30:[function(require,module,exports){
'use strict';

var animation = require('tween.js');
var React = require('react');

function update() {
	animation.update();
	if (animation.getAll().length) {
		window.requestAnimationFrame(update);
	}
}

function scrollToTop(el, options) {
	options = options || {};
	var from = el.scrollTop;
	var duration = Math.min(Math.max(200, from / 2), 350);
	if (from > 200) duration = 300;
	el.style.webkitOverflowScrolling = 'auto';
	el.style.overflow = 'hidden';
	var tween = new animation.Tween({ pos: from }).to({ pos: 0 }, duration).easing(animation.Easing.Quadratic.Out).onUpdate(function () {
		el.scrollTop = this.pos;
		if (options.onUpdate) {
			options.onUpdate();
		}
	}).onComplete(function () {
		el.style.webkitOverflowScrolling = 'touch';
		el.style.overflow = 'scroll';
		if (options.onComplete) options.onComplete();
	}).start();
	update();
	return tween;
}

exports.scrollToTop = scrollToTop;

var Mixins = exports.Mixins = {};

Mixins.ScrollContainerToTop = {
	componentDidMount: function componentDidMount() {
		window.addEventListener('statusTap', this.scrollContainerToTop);
	},
	componentWillUnmount: function componentWillUnmount() {
		window.removeEventListener('statusTap', this.scrollContainerToTop);
		if (this._scrollContainerAnimation) {
			this._scrollContainerAnimation.stop();
		}
	},
	scrollContainerToTop: function scrollContainerToTop() {
		var _this = this;

		if (!this.isMounted() || !this.refs.scrollContainer) return;
		this._scrollContainerAnimation = scrollToTop(React.findDOMNode(this.refs.scrollContainer), {
			onComplete: function onComplete() {
				delete _this._scrollContainerAnimation;
			}
		});
	}
};
},{"react":undefined,"tween.js":65}],31:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});
exports.createApp = createApp;
var React = require('react');

var animation = require('./core/animation');
exports.animation = animation;
var Link = require('./core/Link');
exports.Link = Link;
var View = require('./core/View');
exports.View = View;
var ViewManager = require('./core/ViewManager');

exports.ViewManager = ViewManager;
var Container = require('react-container');
exports.Container = Container;
var Mixins = require('./mixins');
exports.Mixins = Mixins;
var UI = require('./ui');

exports.UI = UI;

function createApp() {
	var app = {
		navigationBars: {},
		viewManagers: {},
		views: {},
		transitionTo: function transitionTo(view, opts) {
			var vm = '__default';
			view = view.split(':');
			if (view.length > 1) {
				vm = view.shift();
			}
			view = view[0];
			app.viewManagers[vm].transitionTo(view, opts);
		}
	};
	return {
		childContextTypes: {
			app: React.PropTypes.object
		},
		getChildContext: function getChildContext() {
			return {
				app: app
			};
		}
	};
}
},{"./core/Link":27,"./core/View":28,"./core/ViewManager":29,"./core/animation":30,"./mixins":33,"./ui":63,"react":undefined,"react-container":19}],32:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});
var React = require('react');

var Transitions = {
	contextTypes: {
		app: React.PropTypes.object
	},
	transitionTo: function transitionTo(view, opts) {
		this.context.app.transitionTo(view, opts);
	}
};

exports['default'] = Transitions;
module.exports = exports['default'];
},{"react":undefined}],33:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
var Transitions = require('./Transitions');
exports.Transitions = Transitions;
},{"./Transitions":32}],34:[function(require,module,exports){
'use strict';

var React = require('react/addons');
var classnames = require('classnames');
var Transition = React.addons.CSSTransitionGroup;

module.exports = React.createClass({
	displayName: 'Alertbar',
	propTypes: {
		children: React.PropTypes.node.isRequired,
		className: React.PropTypes.string,
		pulse: React.PropTypes.bool,
		type: React.PropTypes.oneOf(['default', 'primary', 'success', 'warning', 'danger']),
		visible: React.PropTypes.bool
	},

	getDefaultProps: function getDefaultProps() {
		return {
			type: 'default'
		};
	},

	render: function render() {
		var className = classnames('Alertbar', 'Alertbar--' + this.props.type, {
			'Alertbar--pulse': this.props.pulse
		}, this.props.className);

		var inner = this.props.pulse ? React.createElement(
			'div',
			{ className: 'Alertbar__inner' },
			this.props.children
		) : this.props.children;
		var content = this.props.visible ? React.createElement(
			'div',
			{ className: className },
			inner
		) : null;

		return React.createElement(
			Transition,
			{ transitionName: 'Alertbar', className: 'Alertbar__testything', component: 'div' },
			content
		);
	}
});
},{"classnames":2,"react/addons":undefined}],35:[function(require,module,exports){
'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var React = require('react/addons');
var Tappable = require('react-tappable');

var blacklist = require('blacklist');
var classnames = require('classnames');

module.exports = React.createClass({
	displayName: 'Button',
	propTypes: {
		children: React.PropTypes.node.isRequired,
		className: React.PropTypes.string,
		type: React.PropTypes.oneOf(['default', 'info', 'primary', 'success', 'warning', 'danger'])
	},

	getDefaultProps: function getDefaultProps() {
		return {
			type: 'default'
		};
	},

	render: function render() {
		var className = classnames('Button', 'Button--' + this.props.type, this.props.className);
		var props = blacklist(this.props, 'type');

		return React.createElement(Tappable, _extends({}, props, { className: className, component: 'button' }));
	}
});
},{"blacklist":64,"classnames":2,"react-tappable":22,"react/addons":undefined}],36:[function(require,module,exports){
'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var blacklist = require('blacklist');
var classnames = require('classnames');
var React = require('react/addons');

module.exports = React.createClass({
	displayName: 'ButtonGroup',
	propTypes: {
		children: React.PropTypes.node.isRequired,
		className: React.PropTypes.string
	},
	render: function render() {
		var className = classnames('ButtonGroup', this.props.className);
		var props = blacklist(this.props, 'className');

		return React.createElement('div', _extends({ className: className }, props));
	}
});
},{"blacklist":64,"classnames":2,"react/addons":undefined}],37:[function(require,module,exports){
'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var blacklist = require('blacklist');
var classnames = require('classnames');
var React = require('react/addons');

module.exports = React.createClass({
	displayName: 'FieldControl',
	propTypes: {
		children: React.PropTypes.node.isRequired,
		className: React.PropTypes.string
	},
	render: function render() {
		var className = classnames('FieldControl', this.props.className);
		var props = blacklist(this.props, 'className');

		return React.createElement('div', _extends({ className: className }, props));
	}
});
},{"blacklist":64,"classnames":2,"react/addons":undefined}],38:[function(require,module,exports){
'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var blacklist = require('blacklist');
var classnames = require('classnames');
var React = require('react/addons');

module.exports = React.createClass({
	displayName: 'FieldLabel',
	propTypes: {
		children: React.PropTypes.node.isRequired,
		className: React.PropTypes.string
	},
	render: function render() {
		var className = classnames('FieldLabel', this.props.className);
		var props = blacklist(this.props, 'className');

		return React.createElement('div', _extends({ className: className }, props));
	}
});
},{"blacklist":64,"classnames":2,"react/addons":undefined}],39:[function(require,module,exports){
'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var blacklist = require('blacklist');
var classnames = require('classnames');
var React = require('react/addons');

module.exports = React.createClass({
	displayName: 'Group',
	propTypes: {
		children: React.PropTypes.node.isRequired,
		className: React.PropTypes.string
	},
	render: function render() {
		var className = classnames('Group', this.props.className);
		var props = blacklist(this.props, 'className');

		return React.createElement('div', _extends({ className: className }, props));
	}
});
},{"blacklist":64,"classnames":2,"react/addons":undefined}],40:[function(require,module,exports){
'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var blacklist = require('blacklist');
var classnames = require('classnames');
var React = require('react/addons');

module.exports = React.createClass({
	displayName: 'GroupBody',
	propTypes: {
		children: React.PropTypes.node.isRequired,
		className: React.PropTypes.string
	},
	render: function render() {
		var className = classnames('GroupBody', this.props.className);
		var props = blacklist(this.props, 'className');

		return React.createElement('div', _extends({ className: className }, props));
	}
});
},{"blacklist":64,"classnames":2,"react/addons":undefined}],41:[function(require,module,exports){
'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var blacklist = require('blacklist');
var classnames = require('classnames');
var React = require('react/addons');

module.exports = React.createClass({
	displayName: 'GroupFooter',
	propTypes: {
		children: React.PropTypes.node.isRequired,
		className: React.PropTypes.string
	},
	render: function render() {
		var className = classnames('GroupFooter', this.props.className);
		var props = blacklist(this.props, 'className');

		return React.createElement('div', _extends({ className: className }, props));
	}
});
},{"blacklist":64,"classnames":2,"react/addons":undefined}],42:[function(require,module,exports){
'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var blacklist = require('blacklist');
var classnames = require('classnames');
var React = require('react/addons');

module.exports = React.createClass({
	displayName: 'GroupHeader',
	propTypes: {
		children: React.PropTypes.node.isRequired,
		className: React.PropTypes.string
	},
	render: function render() {
		var className = classnames('GroupHeader', this.props.className);
		var props = blacklist(this.props, 'className');

		return React.createElement('div', _extends({ className: className }, props));
	}
});
},{"blacklist":64,"classnames":2,"react/addons":undefined}],43:[function(require,module,exports){
'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var Item = require('./Item');
var ItemContent = require('./ItemContent');
var ItemInner = require('./ItemInner');
var React = require('react/addons');

var blacklist = require('blacklist');

module.exports = React.createClass({
	displayName: 'Input',

	propTypes: {
		className: React.PropTypes.string,
		children: React.PropTypes.node,
		disabled: React.PropTypes.bool
	},

	render: function render() {
		var inputProps = blacklist(this.props, 'children', 'className');

		return React.createElement(
			Item,
			{ className: this.props.className, selectable: this.props.disabled, component: 'label' },
			React.createElement(
				ItemInner,
				null,
				React.createElement(
					ItemContent,
					{ component: 'label' },
					React.createElement('input', _extends({ className: 'field', type: 'text' }, inputProps))
				),
				this.props.children
			)
		);
	}
});
},{"./Item":44,"./ItemContent":45,"./ItemInner":46,"blacklist":64,"react/addons":undefined}],44:[function(require,module,exports){
'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var React = require('react/addons');
var classnames = require('classnames');

module.exports = React.createClass({
	displayName: 'Item',

	propTypes: {
		children: React.PropTypes.node.isRequired,
		className: React.PropTypes.string,
		showDisclosureArrow: React.PropTypes.bool
	},

	render: function render() {
		var className = classnames('Item', {
			'Item--has-disclosure-arrow': this.props.showDisclosureArrow
		}, this.props.className);

		return React.createElement('div', _extends({}, this.props, { className: className }));
	}
});
},{"classnames":2,"react/addons":undefined}],45:[function(require,module,exports){
'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var blacklist = require('blacklist');
var classnames = require('classnames');
var React = require('react/addons');

module.exports = React.createClass({
	displayName: 'ItemContent',
	propTypes: {
		children: React.PropTypes.node.isRequired,
		className: React.PropTypes.string
	},
	render: function render() {
		var className = classnames('Item__content', this.props.className);
		var props = blacklist(this.props, 'className');

		return React.createElement('div', _extends({ className: className }, props));
	}
});
},{"blacklist":64,"classnames":2,"react/addons":undefined}],46:[function(require,module,exports){
'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var React = require('react/addons');

var classnames = require('classnames');

module.exports = React.createClass({
	displayName: 'ItemInner',

	propTypes: {
		children: React.PropTypes.node.isRequired,
		className: React.PropTypes.string
	},

	render: function render() {
		var className = classnames('Item__inner', this.props.className);

		return React.createElement('div', _extends({ className: className }, this.props));
	}
});
},{"classnames":2,"react/addons":undefined}],47:[function(require,module,exports){
'use strict';

var React = require('react/addons');
var classnames = require('classnames');

module.exports = React.createClass({
	displayName: 'ItemMedia',
	propTypes: {
		avatar: React.PropTypes.string,
		avatarInitials: React.PropTypes.string,
		className: React.PropTypes.string,
		icon: React.PropTypes.string,
		thumbnail: React.PropTypes.string
	},

	render: function render() {
		var className = classnames({
			'Item__media': true,
			'Item__media--icon': this.props.icon,
			'Item__media--avatar': this.props.avatar || this.props.avatarInitials,
			'Item__media--thumbnail': this.props.thumbnail
		}, this.props.className);

		// media types
		var icon = this.props.icon ? React.createElement('div', { className: 'Item__media__icon ' + this.props.icon }) : null;
		var avatar = this.props.avatar || this.props.avatarInitials ? React.createElement(
			'div',
			{ className: 'Item__media__avatar' },
			this.props.avatar ? React.createElement('img', { src: this.props.avatar }) : this.props.avatarInitials
		) : null;
		var thumbnail = this.props.thumbnail ? React.createElement(
			'div',
			{ className: 'Item__media__thumbnail' },
			React.createElement('img', { src: this.props.thumbnail })
		) : null;

		return React.createElement(
			'div',
			{ className: className },
			icon,
			avatar,
			thumbnail
		);
	}
});
},{"classnames":2,"react/addons":undefined}],48:[function(require,module,exports){
'use strict';

var classnames = require('classnames');
var React = require('react/addons');

module.exports = React.createClass({
	displayName: 'ItemNote',
	propTypes: {
		className: React.PropTypes.string,
		icon: React.PropTypes.string,
		label: React.PropTypes.string,
		type: React.PropTypes.string
	},
	getDefaultProps: function getDefaultProps() {
		return {
			type: 'default'
		};
	},
	render: function render() {
		var className = classnames('Item__note', 'Item__note--' + this.props.type, this.props.className);

		// elements
		var label = this.props.label ? React.createElement(
			'div',
			{ className: 'Item__note__label' },
			this.props.label
		) : null;
		var icon = this.props.icon ? React.createElement('div', { className: 'Item__note__icon ' + this.props.icon }) : null;

		return React.createElement(
			'div',
			{ className: className },
			label,
			icon
		);
	}
});
},{"classnames":2,"react/addons":undefined}],49:[function(require,module,exports){
'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var blacklist = require('blacklist');
var classnames = require('classnames');
var React = require('react/addons');

module.exports = React.createClass({
	displayName: 'ItemSubTitle',
	propTypes: {
		children: React.PropTypes.node.isRequired,
		className: React.PropTypes.string
	},
	render: function render() {
		var className = classnames('Item__subtitle', this.props.className);
		var props = blacklist(this.props, 'className');

		return React.createElement('div', _extends({ className: className }, props));
	}
});
},{"blacklist":64,"classnames":2,"react/addons":undefined}],50:[function(require,module,exports){
'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var blacklist = require('blacklist');
var classnames = require('classnames');
var React = require('react/addons');

module.exports = React.createClass({
	displayName: 'ItemTitle',
	propTypes: {
		children: React.PropTypes.node.isRequired,
		className: React.PropTypes.string
	},
	render: function render() {
		var className = classnames('Item__title', this.props.className);
		var props = blacklist(this.props, 'className');

		return React.createElement('div', _extends({ className: className }, props));
	}
});
},{"blacklist":64,"classnames":2,"react/addons":undefined}],51:[function(require,module,exports){
'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var FieldControl = require('./FieldControl');
var FieldLabel = require('./FieldLabel');
var Item = require('./Item');
var ItemInner = require('./ItemInner');
var React = require('react/addons');

var blacklist = require('blacklist');

module.exports = React.createClass({
	displayName: 'LabelInput',

	propTypes: {
		alignTop: React.PropTypes.bool,
		children: React.PropTypes.node,
		className: React.PropTypes.string,
		disabled: React.PropTypes.bool,
		label: React.PropTypes.string,
		readOnly: React.PropTypes.bool,
		value: React.PropTypes.string
	},

	getDefaultProps: function getDefaultProps() {
		return {
			readOnly: false
		};
	},

	render: function render() {
		var inputProps = blacklist(this.props, 'alignTop', 'children', 'first', 'readOnly');
		var renderInput = this.props.readOnly ? React.createElement(
			'div',
			{ className: 'field u-selectable' },
			this.props.value
		) : React.createElement('input', _extends({ className: 'field', type: 'text' }, inputProps));

		return React.createElement(
			Item,
			{ alignTop: this.props.alignTop, selectable: this.props.disabled, className: this.props.className, component: 'label' },
			React.createElement(
				ItemInner,
				null,
				React.createElement(
					FieldLabel,
					null,
					this.props.label
				),
				React.createElement(
					FieldControl,
					null,
					renderInput,
					this.props.children
				)
			)
		);
	}
});
},{"./FieldControl":37,"./FieldLabel":38,"./Item":44,"./ItemInner":46,"blacklist":64,"react/addons":undefined}],52:[function(require,module,exports){
'use strict';

var FieldControl = require('./FieldControl');
var FieldLabel = require('./FieldLabel');
var Item = require('./Item');
var ItemInner = require('./ItemInner');
var React = require('react/addons');

module.exports = React.createClass({
	displayName: 'LabelSelect',
	propTypes: {
		alignTop: React.PropTypes.bool,
		className: React.PropTypes.string,
		disabled: React.PropTypes.bool,
		first: React.PropTypes.bool,
		label: React.PropTypes.string,
		options: React.PropTypes.array,
		value: React.PropTypes.string
	},

	getDefaultProps: function getDefaultProps() {
		return {
			className: ''
		};
	},

	getInitialState: function getInitialState() {
		return {
			value: this.props.value
		};
	},

	updateInputValue: function updateInputValue(event) {
		this.setState({
			value: event.target.value
		});
	},

	render: function render() {
		// Map Options
		var options = this.props.options.map(function (op) {
			return React.createElement(
				'option',
				{ key: 'option-' + op.value, value: op.value },
				op.label
			);
		});

		return React.createElement(
			Item,
			{ alignTop: this.props.alignTop, selectable: this.props.disabled, className: this.props.className, component: 'label' },
			React.createElement(
				ItemInner,
				null,
				React.createElement(
					FieldLabel,
					null,
					this.props.label
				),
				React.createElement(
					FieldControl,
					null,
					React.createElement(
						'select',
						{ value: this.state.value, onChange: this.updateInputValue, className: 'select-field' },
						options
					),
					React.createElement(
						'div',
						{ className: 'select-field-indicator' },
						React.createElement('div', { className: 'select-field-indicator-arrow' })
					)
				)
			)
		);
	}
});
},{"./FieldControl":37,"./FieldLabel":38,"./Item":44,"./ItemInner":46,"react/addons":undefined}],53:[function(require,module,exports){
'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var blacklist = require('blacklist');
var classnames = require('classnames');
var React = require('react/addons');

module.exports = React.createClass({
	displayName: 'LabelTextarea',

	propTypes: {
		children: React.PropTypes.node,
		className: React.PropTypes.string,
		disabled: React.PropTypes.bool,
		first: React.PropTypes.bool,
		label: React.PropTypes.string,
		readOnly: React.PropTypes.bool,
		value: React.PropTypes.string
	},

	getDefaultProps: function getDefaultProps() {
		return {
			rows: 3
		};
	},

	render: function render() {
		var className = classnames(this.props.className, 'list-item', 'field-item', 'align-top', {
			'is-first': this.props.first,
			'u-selectable': this.props.disabled
		});

		var props = blacklist(this.props, 'children', 'className', 'disabled', 'first', 'label', 'readOnly');

		var renderInput = this.props.readOnly ? React.createElement(
			'div',
			{ className: 'field u-selectable' },
			this.props.value
		) : React.createElement('textarea', _extends({}, props, { className: 'field' }));

		return React.createElement(
			'div',
			{ className: className },
			React.createElement(
				'label',
				{ className: 'item-inner' },
				React.createElement(
					'div',
					{ className: 'field-label' },
					this.props.label
				),
				React.createElement(
					'div',
					{ className: 'field-control' },
					renderInput,
					this.props.children
				)
			)
		);
	}
});
},{"blacklist":64,"classnames":2,"react/addons":undefined}],54:[function(require,module,exports){
'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var React = require('react');

var blacklist = require('blacklist');
var classNames = require('classnames');

module.exports = React.createClass({
	displayName: 'ListHeader',

	propTypes: {
		className: React.PropTypes.string,
		sticky: React.PropTypes.bool
	},

	render: function render() {
		var className = classNames('list-header', {
			'sticky': this.props.sticky
		}, this.props.className);

		var props = blacklist(this.props, 'sticky');

		return React.createElement('div', _extends({ className: className }, props));
	}
});
},{"blacklist":64,"classnames":2,"react":undefined}],55:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var classNames = require('classnames');
var React = require('react/addons');
var Tappable = require('react-tappable');
var Transition = React.addons.CSSTransitionGroup;

var DIRECTIONS = {
	'reveal-from-right': -1,
	'show-from-left': -1,
	'show-from-right': 1,
	'reveal-from-left': 1
};

var defaultControllerState = {
	direction: 0,
	fade: false,
	leftArrow: false,
	leftButtonDisabled: false,
	leftIcon: '',
	leftLabel: '',
	leftAction: null,
	rightArrow: false,
	rightButtonDisabled: false,
	rightIcon: '',
	rightLabel: '',
	rightAction: null,
	title: ''
};

function newState(from) {
	var ns = _extends({}, defaultControllerState);
	if (from) _extends(ns, from);
	delete ns.name; // may leak from props
	return ns;
}

var NavigationBar = React.createClass({
	displayName: 'NavigationBar',

	contextTypes: {
		app: React.PropTypes.object
	},

	propTypes: {
		name: React.PropTypes.string
	},

	getInitialState: function getInitialState() {
		return newState(this.props);
	},

	componentDidMount: function componentDidMount() {
		if (this.props.name) {
			this.context.app.navigationBars[this.props.name] = this;
		}
	},

	componentWillUnmount: function componentWillUnmount() {
		if (this.props.name) {
			delete this.context.app.navigationBars[this.props.name];
		}
	},

	componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
		this.setState(newState(nextProps));
		if (nextProps.name !== this.props.name) {
			if (nextProps.name) {
				this.context.app.navigationBars[nextProps.name] = this;
			}
			if (this.props.name) {
				delete this.context.app.navigationBars[this.props.name];
			}
		}
	},

	update: function update(state) {
		// FIXME: what is happening here
		state = newState(state);
		this.setState(newState(state));
	},

	updateWithTransition: function updateWithTransition(state, transition) {
		state = newState(state);
		state.direction = DIRECTIONS[transition] || 0;

		if (transition === 'fade' || transition === 'fade-contract' || transition === 'fade-expand') {
			state.fade = true;
		}

		this.setState(state);
	},

	renderLeftButton: function renderLeftButton() {
		var className = classNames('NavigationBarLeftButton', {
			'has-arrow': this.state.leftArrow
		});

		return React.createElement(
			Tappable,
			{ onTap: this.state.leftAction, className: className, disabled: this.state.leftButtonDisabled, component: 'button' },
			this.renderLeftArrow(),
			this.renderLeftLabel()
		);
	},

	renderLeftArrow: function renderLeftArrow() {
		var transitionName = 'NavigationBarTransition-Instant';
		if (this.state.fade || this.state.direction) {
			transitionName = 'NavigationBarTransition-Fade';
		}

		var arrow = this.state.leftArrow ? React.createElement('span', { className: 'NavigationBarLeftArrow' }) : null;

		return React.createElement(
			Transition,
			{ transitionName: transitionName },
			arrow
		);
	},

	renderLeftLabel: function renderLeftLabel() {
		var transitionName = 'NavigationBarTransition-Instant';
		if (this.state.fade) {
			transitionName = 'NavigationBarTransition-Fade';
		} else if (this.state.direction > 0) {
			transitionName = 'NavigationBarTransition-Forwards';
		} else if (this.state.direction < 0) {
			transitionName = 'NavigationBarTransition-Backwards';
		}

		return React.createElement(
			Transition,
			{ transitionName: transitionName },
			React.createElement(
				'span',
				{ key: Date.now(), className: 'NavigationBarLeftLabel' },
				this.state.leftLabel
			)
		);
	},

	renderTitle: function renderTitle() {
		var title = this.state.title ? React.createElement(
			'span',
			{ key: Date.now(), className: 'NavigationBarTitle' },
			this.state.title
		) : null;
		var transitionName = 'NavigationBarTransition-Instant';
		if (this.state.fade) {
			transitionName = 'NavigationBarTransition-Fade';
		} else if (this.state.direction > 0) {
			transitionName = 'NavigationBarTransition-Forwards';
		} else if (this.state.direction < 0) {
			transitionName = 'NavigationBarTransition-Backwards';
		}

		return React.createElement(
			Transition,
			{ transitionName: transitionName },
			title
		);
	},

	renderRightButton: function renderRightButton() {
		var transitionName = 'NavigationBarTransition-Instant';
		if (this.state.fade || this.state.direction) {
			transitionName = 'NavigationBarTransition-Fade';
		}
		var button = this.state.rightIcon || this.state.rightLabel ? React.createElement(
			Tappable,
			{ key: Date.now(), onTap: this.state.rightAction, className: 'NavigationBarRightButton', disabled: this.state.rightButtonDisabled, component: 'button' },
			this.renderRightLabel(),
			this.renderRightIcon()
		) : null;
		return React.createElement(
			Transition,
			{ transitionName: transitionName },
			button
		);
	},

	renderRightIcon: function renderRightIcon() {
		if (!this.state.rightIcon) return null;

		var className = classNames('NavigationBarRightIcon', this.state.rightIcon);

		return React.createElement('span', { className: className });
	},

	renderRightLabel: function renderRightLabel() {
		return this.state.rightLabel ? React.createElement(
			'span',
			{ key: Date.now(), className: 'NavigationBarRightLabel' },
			this.state.rightLabel
		) : null;
	},

	render: function render() {
		return React.createElement(
			'div',
			{ className: 'NavigationBar' },
			this.renderLeftButton(),
			this.renderTitle(),
			this.renderRightButton()
		);
	}
});

exports['default'] = NavigationBar;
module.exports = exports['default'];
},{"classnames":2,"react-tappable":22,"react/addons":undefined}],56:[function(require,module,exports){
'use strict';

var React = require('react/addons');
var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;

var classnames = require('classnames');

module.exports = React.createClass({
	displayName: 'Popup',

	propTypes: {
		children: React.PropTypes.node,
		className: React.PropTypes.string,
		visible: React.PropTypes.bool
	},

	getDefaultProps: function getDefaultProps() {
		return {
			transition: 'none'
		};
	},

	renderBackdrop: function renderBackdrop() {
		if (!this.props.visible) return null;
		return React.createElement('div', { className: 'Popup-backdrop' });
	},

	renderDialog: function renderDialog() {
		if (!this.props.visible) return null;

		// Set classnames
		var dialogClassName = classnames('Popup-dialog', this.props.className);

		return React.createElement(
			'div',
			{ className: dialogClassName },
			this.props.children
		);
	},

	render: function render() {
		return React.createElement(
			'div',
			{ className: 'Popup' },
			React.createElement(
				ReactCSSTransitionGroup,
				{ transitionName: 'Popup-dialog', component: 'div' },
				this.renderDialog()
			),
			React.createElement(
				ReactCSSTransitionGroup,
				{ transitionName: 'Popup-background', component: 'div' },
				this.renderBackdrop()
			)
		);
	}
});
},{"classnames":2,"react/addons":undefined}],57:[function(require,module,exports){
'use strict';

var React = require('react/addons');
var classNames = require('classnames');

module.exports = React.createClass({
	displayName: 'PopupIcon',
	propTypes: {
		name: React.PropTypes.string,
		type: React.PropTypes.oneOf(['default', 'muted', 'primary', 'success', 'warning', 'danger']),
		spinning: React.PropTypes.bool
	},

	render: function render() {
		var className = classNames('PopupIcon', {
			'is-spinning': this.props.spinning
		}, this.props.name, this.props.type);

		return React.createElement('div', { className: className });
	}
});
},{"classnames":2,"react/addons":undefined}],58:[function(require,module,exports){
'use strict';

var classnames = require('classnames');
var Item = require('./Item');
var ItemInner = require('./ItemInner');
var ItemNote = require('./ItemNote');
var ItemTitle = require('./ItemTitle');
var React = require('react');
var Tappable = require('react-tappable');

module.exports = React.createClass({
	displayName: 'RadioList',

	propTypes: {
		options: React.PropTypes.array,
		value: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.number]),
		icon: React.PropTypes.string,
		onChange: React.PropTypes.func
	},

	onChange: function onChange(value) {
		this.props.onChange(value);
	},

	render: function render() {
		var self = this;
		var options = this.props.options.map(function (op, i) {
			var iconClassname = classnames('item-icon primary', op.icon);
			var checkMark = op.value === self.props.value ? React.createElement(ItemNote, { type: 'primary', icon: 'ion-checkmark' }) : null;
			var icon = op.icon ? React.createElement(
				'div',
				{ className: 'item-media' },
				React.createElement('span', { className: iconClassname })
			) : null;

			function onChange() {
				self.onChange(op.value);
			}

			return React.createElement(
				Tappable,
				{ key: 'option-' + i, onTap: onChange },
				React.createElement(
					Item,
					{ key: 'option-' + i, onTap: onChange },
					icon,
					React.createElement(
						ItemInner,
						null,
						React.createElement(
							ItemTitle,
							null,
							op.label
						),
						checkMark
					)
				)
			);
		});

		return React.createElement(
			'div',
			null,
			options
		);
	}
});
},{"./Item":44,"./ItemInner":46,"./ItemNote":48,"./ItemTitle":50,"classnames":2,"react":undefined,"react-tappable":22}],59:[function(require,module,exports){
'use strict';

var React = require('react');
var classnames = require('classnames');
var Tappable = require('react-tappable');

module.exports = React.createClass({
	displayName: 'SegmentedControl',

	propTypes: {
		className: React.PropTypes.string,
		equalWidthSegments: React.PropTypes.bool,
		hasGutter: React.PropTypes.bool,
		onChange: React.PropTypes.func.isRequired,
		options: React.PropTypes.array.isRequired,
		type: React.PropTypes.string,
		value: React.PropTypes.string
	},

	getDefaultProps: function getDefaultProps() {
		return {
			type: 'primary'
		};
	},

	onChange: function onChange(value) {
		this.props.onChange(value);
	},

	render: function render() {
		var componentClassName = classnames('SegmentedControl', 'SegmentedControl--' + this.props.type, {
			'SegmentedControl--has-gutter': this.props.hasGutter,
			'SegmentedControl--equal-widths': this.props.equalWidthSegments
		}, this.props.className);
		var self = this;

		var options = this.props.options.map(function (op) {
			function onChange() {
				self.onChange(op.value);
			}

			var itemClassName = classnames('SegmentedControl__item', {
				'is-selected': op.value === self.props.value
			});

			return React.createElement(
				Tappable,
				{ key: 'option-' + op.value, onTap: onChange, className: itemClassName },
				op.label
			);
		});

		return React.createElement(
			'div',
			{ className: componentClassName },
			options
		);
	}
});
},{"classnames":2,"react":undefined,"react-tappable":22}],60:[function(require,module,exports){
'use strict';

var classnames = require('classnames');
var React = require('react');
var Tappable = require('react-tappable');

module.exports = React.createClass({
	displayName: 'Switch',

	propTypes: {
		disabled: React.PropTypes.bool,
		on: React.PropTypes.bool,
		onTap: React.PropTypes.func,
		type: React.PropTypes.string
	},

	getDefaultProps: function getDefaultProps() {
		return {
			type: 'default'
		};
	},

	render: function render() {
		var className = classnames('Switch', 'Switch--' + this.props.type, {
			'is-disabled': this.props.disabled,
			'is-on': this.props.on
		});

		return React.createElement(
			Tappable,
			{ onTap: this.props.onTap, className: className, component: 'label' },
			React.createElement(
				'div',
				{ className: 'Switch__track' },
				React.createElement('div', { className: 'Switch__handle' })
			)
		);
	}
});
},{"classnames":2,"react":undefined,"react-tappable":22}],61:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var React = require('react');
var Tappable = require('react-tappable');

var blacklist = require('blacklist');
var classnames = require('classnames');

var Navigator = React.createClass({
	displayName: 'Navigator',

	propTypes: {
		className: React.PropTypes.string
	},

	render: function render() {
		var className = classnames('Tabs-Navigator', this.props.className);
		var otherProps = blacklist(this.props, 'className');

		return React.createElement('div', _extends({ className: className }, otherProps));
	}
});

exports.Navigator = Navigator;
var Tab = React.createClass({
	displayName: 'Tab',

	propTypes: {
		selected: React.PropTypes.bool
	},

	render: function render() {
		var className = classnames('Tabs-Tab', { 'is-selected': this.props.selected });
		var otherProps = blacklist(this.props, 'selected');

		return React.createElement(Tappable, _extends({ className: className }, otherProps));
	}
});

exports.Tab = Tab;
var Label = React.createClass({
	displayName: 'Label',

	render: function render() {
		return React.createElement('div', _extends({ className: 'Tabs-Label' }, this.props));
	}
});
exports.Label = Label;
},{"blacklist":64,"classnames":2,"react":undefined,"react-tappable":22}],62:[function(require,module,exports){
'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var React = require('react/addons');

var Item = require('./Item');
var ItemContent = require('./ItemContent');
var ItemInner = require('./ItemInner');

var blacklist = require('blacklist');

module.exports = React.createClass({
	displayName: 'Input',
	propTypes: {
		className: React.PropTypes.string,
		children: React.PropTypes.node,
		disabled: React.PropTypes.bool
	},

	render: function render() {
		var inputProps = blacklist(this.props, 'children', 'className');

		return React.createElement(
			Item,
			{ selectable: this.props.disabled, className: this.props.className, component: 'label' },
			React.createElement(
				ItemInner,
				null,
				React.createElement(
					ItemContent,
					{ component: 'label' },
					React.createElement('textarea', _extends({ className: 'field', rows: 3 }, inputProps))
				),
				this.props.children
			)
		);
	}
});
},{"./Item":44,"./ItemContent":45,"./ItemInner":46,"blacklist":64,"react/addons":undefined}],63:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
var Alertbar = require('./Alertbar');
exports.Alertbar = Alertbar;
var Button = require('./Button');
exports.Button = Button;
var ButtonGroup = require('./ButtonGroup');
exports.ButtonGroup = ButtonGroup;
var FieldControl = require('./FieldControl');
exports.FieldControl = FieldControl;
var FieldLabel = require('./FieldLabel');
exports.FieldLabel = FieldLabel;
var Group = require('./Group');
exports.Group = Group;
var GroupBody = require('./GroupBody');
exports.GroupBody = GroupBody;
var GroupFooter = require('./GroupFooter');
exports.GroupFooter = GroupFooter;
var GroupHeader = require('./GroupHeader');
exports.GroupHeader = GroupHeader;
var Item = require('./Item');
exports.Item = Item;
var ItemContent = require('./ItemContent');
exports.ItemContent = ItemContent;
var ItemInner = require('./ItemInner');
exports.ItemInner = ItemInner;
var ItemMedia = require('./ItemMedia');
exports.ItemMedia = ItemMedia;
var ItemNote = require('./ItemNote');
exports.ItemNote = ItemNote;
var ItemSubTitle = require('./ItemSubTitle');
exports.ItemSubTitle = ItemSubTitle;
var ItemTitle = require('./ItemTitle');
exports.ItemTitle = ItemTitle;
var LabelInput = require('./LabelInput');
exports.LabelInput = LabelInput;
var LabelSelect = require('./LabelSelect');
exports.LabelSelect = LabelSelect;
var LabelTextarea = require('./LabelTextarea');
exports.LabelTextarea = LabelTextarea;
var ListHeader = require('./ListHeader');
exports.ListHeader = ListHeader;
var NavigationBar = require('./NavigationBar');
exports.NavigationBar = NavigationBar;
var Popup = require('./Popup');
exports.Popup = Popup;
var PopupIcon = require('./PopupIcon');
exports.PopupIcon = PopupIcon;
var RadioList = require('./RadioList');
exports.RadioList = RadioList;
var SegmentedControl = require('./SegmentedControl');
exports.SegmentedControl = SegmentedControl;
var Switch = require('./Switch');
exports.Switch = Switch;
var Tabs = require('./Tabs');
exports.Tabs = Tabs;
var Textarea = require('./Textarea');

exports.Textarea = Textarea;
// depends on above
var Input = require('./Input');
exports.Input = Input;
},{"./Alertbar":34,"./Button":35,"./ButtonGroup":36,"./FieldControl":37,"./FieldLabel":38,"./Group":39,"./GroupBody":40,"./GroupFooter":41,"./GroupHeader":42,"./Input":43,"./Item":44,"./ItemContent":45,"./ItemInner":46,"./ItemMedia":47,"./ItemNote":48,"./ItemSubTitle":49,"./ItemTitle":50,"./LabelInput":51,"./LabelSelect":52,"./LabelTextarea":53,"./ListHeader":54,"./NavigationBar":55,"./Popup":56,"./PopupIcon":57,"./RadioList":58,"./SegmentedControl":59,"./Switch":60,"./Tabs":61,"./Textarea":62}],64:[function(require,module,exports){
arguments[4][20][0].apply(exports,arguments)
},{"dup":20}],65:[function(require,module,exports){
/**
 * Tween.js - Licensed under the MIT license
 * https://github.com/sole/tween.js
 * ----------------------------------------------
 *
 * See https://github.com/sole/tween.js/graphs/contributors for the full list of contributors.
 * Thank you all, you're awesome!
 */

// Date.now shim for (ahem) Internet Explo(d|r)er
if ( Date.now === undefined ) {

	Date.now = function () {

		return new Date().valueOf();

	};

}

var TWEEN = TWEEN || ( function () {

	var _tweens = [];

	return {

		REVISION: '14',

		getAll: function () {

			return _tweens;

		},

		removeAll: function () {

			_tweens = [];

		},

		add: function ( tween ) {

			_tweens.push( tween );

		},

		remove: function ( tween ) {

			var i = _tweens.indexOf( tween );

			if ( i !== -1 ) {

				_tweens.splice( i, 1 );

			}

		},

		update: function ( time ) {

			if ( _tweens.length === 0 ) return false;

			var i = 0;

			time = time !== undefined ? time : ( typeof window !== 'undefined' && window.performance !== undefined && window.performance.now !== undefined ? window.performance.now() : Date.now() );

			while ( i < _tweens.length ) {

				if ( _tweens[ i ].update( time ) ) {

					i++;

				} else {

					_tweens.splice( i, 1 );

				}

			}

			return true;

		}
	};

} )();

TWEEN.Tween = function ( object ) {

	var _object = object;
	var _valuesStart = {};
	var _valuesEnd = {};
	var _valuesStartRepeat = {};
	var _duration = 1000;
	var _repeat = 0;
	var _yoyo = false;
	var _isPlaying = false;
	var _reversed = false;
	var _delayTime = 0;
	var _startTime = null;
	var _easingFunction = TWEEN.Easing.Linear.None;
	var _interpolationFunction = TWEEN.Interpolation.Linear;
	var _chainedTweens = [];
	var _onStartCallback = null;
	var _onStartCallbackFired = false;
	var _onUpdateCallback = null;
	var _onCompleteCallback = null;
	var _onStopCallback = null;

	// Set all starting values present on the target object
	for ( var field in object ) {

		_valuesStart[ field ] = parseFloat(object[field], 10);

	}

	this.to = function ( properties, duration ) {

		if ( duration !== undefined ) {

			_duration = duration;

		}

		_valuesEnd = properties;

		return this;

	};

	this.start = function ( time ) {

		TWEEN.add( this );

		_isPlaying = true;

		_onStartCallbackFired = false;

		_startTime = time !== undefined ? time : ( typeof window !== 'undefined' && window.performance !== undefined && window.performance.now !== undefined ? window.performance.now() : Date.now() );
		_startTime += _delayTime;

		for ( var property in _valuesEnd ) {

			// check if an Array was provided as property value
			if ( _valuesEnd[ property ] instanceof Array ) {

				if ( _valuesEnd[ property ].length === 0 ) {

					continue;

				}

				// create a local copy of the Array with the start value at the front
				_valuesEnd[ property ] = [ _object[ property ] ].concat( _valuesEnd[ property ] );

			}

			_valuesStart[ property ] = _object[ property ];

			if( ( _valuesStart[ property ] instanceof Array ) === false ) {
				_valuesStart[ property ] *= 1.0; // Ensures we're using numbers, not strings
			}

			_valuesStartRepeat[ property ] = _valuesStart[ property ] || 0;

		}

		return this;

	};

	this.stop = function () {

		if ( !_isPlaying ) {
			return this;
		}

		TWEEN.remove( this );
		_isPlaying = false;

		if ( _onStopCallback !== null ) {

			_onStopCallback.call( _object );

		}

		this.stopChainedTweens();
		return this;

	};

	this.stopChainedTweens = function () {

		for ( var i = 0, numChainedTweens = _chainedTweens.length; i < numChainedTweens; i++ ) {

			_chainedTweens[ i ].stop();

		}

	};

	this.delay = function ( amount ) {

		_delayTime = amount;
		return this;

	};

	this.repeat = function ( times ) {

		_repeat = times;
		return this;

	};

	this.yoyo = function( yoyo ) {

		_yoyo = yoyo;
		return this;

	};


	this.easing = function ( easing ) {

		_easingFunction = easing;
		return this;

	};

	this.interpolation = function ( interpolation ) {

		_interpolationFunction = interpolation;
		return this;

	};

	this.chain = function () {

		_chainedTweens = arguments;
		return this;

	};

	this.onStart = function ( callback ) {

		_onStartCallback = callback;
		return this;

	};

	this.onUpdate = function ( callback ) {

		_onUpdateCallback = callback;
		return this;

	};

	this.onComplete = function ( callback ) {

		_onCompleteCallback = callback;
		return this;

	};

	this.onStop = function ( callback ) {

		_onStopCallback = callback;
		return this;

	};

	this.update = function ( time ) {

		var property;

		if ( time < _startTime ) {

			return true;

		}

		if ( _onStartCallbackFired === false ) {

			if ( _onStartCallback !== null ) {

				_onStartCallback.call( _object );

			}

			_onStartCallbackFired = true;

		}

		var elapsed = ( time - _startTime ) / _duration;
		elapsed = elapsed > 1 ? 1 : elapsed;

		var value = _easingFunction( elapsed );

		for ( property in _valuesEnd ) {

			var start = _valuesStart[ property ] || 0;
			var end = _valuesEnd[ property ];

			if ( end instanceof Array ) {

				_object[ property ] = _interpolationFunction( end, value );

			} else {

				// Parses relative end values with start as base (e.g.: +10, -3)
				if ( typeof(end) === "string" ) {
					end = start + parseFloat(end, 10);
				}

				// protect against non numeric properties.
				if ( typeof(end) === "number" ) {
					_object[ property ] = start + ( end - start ) * value;
				}

			}

		}

		if ( _onUpdateCallback !== null ) {

			_onUpdateCallback.call( _object, value );

		}

		if ( elapsed == 1 ) {

			if ( _repeat > 0 ) {

				if( isFinite( _repeat ) ) {
					_repeat--;
				}

				// reassign starting values, restart by making startTime = now
				for( property in _valuesStartRepeat ) {

					if ( typeof( _valuesEnd[ property ] ) === "string" ) {
						_valuesStartRepeat[ property ] = _valuesStartRepeat[ property ] + parseFloat(_valuesEnd[ property ], 10);
					}

					if (_yoyo) {
						var tmp = _valuesStartRepeat[ property ];
						_valuesStartRepeat[ property ] = _valuesEnd[ property ];
						_valuesEnd[ property ] = tmp;
					}

					_valuesStart[ property ] = _valuesStartRepeat[ property ];

				}

				if (_yoyo) {
					_reversed = !_reversed;
				}

				_startTime = time + _delayTime;

				return true;

			} else {

				if ( _onCompleteCallback !== null ) {

					_onCompleteCallback.call( _object );

				}

				for ( var i = 0, numChainedTweens = _chainedTweens.length; i < numChainedTweens; i++ ) {

					_chainedTweens[ i ].start( time );

				}

				return false;

			}

		}

		return true;

	};

};


TWEEN.Easing = {

	Linear: {

		None: function ( k ) {

			return k;

		}

	},

	Quadratic: {

		In: function ( k ) {

			return k * k;

		},

		Out: function ( k ) {

			return k * ( 2 - k );

		},

		InOut: function ( k ) {

			if ( ( k *= 2 ) < 1 ) return 0.5 * k * k;
			return - 0.5 * ( --k * ( k - 2 ) - 1 );

		}

	},

	Cubic: {

		In: function ( k ) {

			return k * k * k;

		},

		Out: function ( k ) {

			return --k * k * k + 1;

		},

		InOut: function ( k ) {

			if ( ( k *= 2 ) < 1 ) return 0.5 * k * k * k;
			return 0.5 * ( ( k -= 2 ) * k * k + 2 );

		}

	},

	Quartic: {

		In: function ( k ) {

			return k * k * k * k;

		},

		Out: function ( k ) {

			return 1 - ( --k * k * k * k );

		},

		InOut: function ( k ) {

			if ( ( k *= 2 ) < 1) return 0.5 * k * k * k * k;
			return - 0.5 * ( ( k -= 2 ) * k * k * k - 2 );

		}

	},

	Quintic: {

		In: function ( k ) {

			return k * k * k * k * k;

		},

		Out: function ( k ) {

			return --k * k * k * k * k + 1;

		},

		InOut: function ( k ) {

			if ( ( k *= 2 ) < 1 ) return 0.5 * k * k * k * k * k;
			return 0.5 * ( ( k -= 2 ) * k * k * k * k + 2 );

		}

	},

	Sinusoidal: {

		In: function ( k ) {

			return 1 - Math.cos( k * Math.PI / 2 );

		},

		Out: function ( k ) {

			return Math.sin( k * Math.PI / 2 );

		},

		InOut: function ( k ) {

			return 0.5 * ( 1 - Math.cos( Math.PI * k ) );

		}

	},

	Exponential: {

		In: function ( k ) {

			return k === 0 ? 0 : Math.pow( 1024, k - 1 );

		},

		Out: function ( k ) {

			return k === 1 ? 1 : 1 - Math.pow( 2, - 10 * k );

		},

		InOut: function ( k ) {

			if ( k === 0 ) return 0;
			if ( k === 1 ) return 1;
			if ( ( k *= 2 ) < 1 ) return 0.5 * Math.pow( 1024, k - 1 );
			return 0.5 * ( - Math.pow( 2, - 10 * ( k - 1 ) ) + 2 );

		}

	},

	Circular: {

		In: function ( k ) {

			return 1 - Math.sqrt( 1 - k * k );

		},

		Out: function ( k ) {

			return Math.sqrt( 1 - ( --k * k ) );

		},

		InOut: function ( k ) {

			if ( ( k *= 2 ) < 1) return - 0.5 * ( Math.sqrt( 1 - k * k) - 1);
			return 0.5 * ( Math.sqrt( 1 - ( k -= 2) * k) + 1);

		}

	},

	Elastic: {

		In: function ( k ) {

			var s, a = 0.1, p = 0.4;
			if ( k === 0 ) return 0;
			if ( k === 1 ) return 1;
			if ( !a || a < 1 ) { a = 1; s = p / 4; }
			else s = p * Math.asin( 1 / a ) / ( 2 * Math.PI );
			return - ( a * Math.pow( 2, 10 * ( k -= 1 ) ) * Math.sin( ( k - s ) * ( 2 * Math.PI ) / p ) );

		},

		Out: function ( k ) {

			var s, a = 0.1, p = 0.4;
			if ( k === 0 ) return 0;
			if ( k === 1 ) return 1;
			if ( !a || a < 1 ) { a = 1; s = p / 4; }
			else s = p * Math.asin( 1 / a ) / ( 2 * Math.PI );
			return ( a * Math.pow( 2, - 10 * k) * Math.sin( ( k - s ) * ( 2 * Math.PI ) / p ) + 1 );

		},

		InOut: function ( k ) {

			var s, a = 0.1, p = 0.4;
			if ( k === 0 ) return 0;
			if ( k === 1 ) return 1;
			if ( !a || a < 1 ) { a = 1; s = p / 4; }
			else s = p * Math.asin( 1 / a ) / ( 2 * Math.PI );
			if ( ( k *= 2 ) < 1 ) return - 0.5 * ( a * Math.pow( 2, 10 * ( k -= 1 ) ) * Math.sin( ( k - s ) * ( 2 * Math.PI ) / p ) );
			return a * Math.pow( 2, -10 * ( k -= 1 ) ) * Math.sin( ( k - s ) * ( 2 * Math.PI ) / p ) * 0.5 + 1;

		}

	},

	Back: {

		In: function ( k ) {

			var s = 1.70158;
			return k * k * ( ( s + 1 ) * k - s );

		},

		Out: function ( k ) {

			var s = 1.70158;
			return --k * k * ( ( s + 1 ) * k + s ) + 1;

		},

		InOut: function ( k ) {

			var s = 1.70158 * 1.525;
			if ( ( k *= 2 ) < 1 ) return 0.5 * ( k * k * ( ( s + 1 ) * k - s ) );
			return 0.5 * ( ( k -= 2 ) * k * ( ( s + 1 ) * k + s ) + 2 );

		}

	},

	Bounce: {

		In: function ( k ) {

			return 1 - TWEEN.Easing.Bounce.Out( 1 - k );

		},

		Out: function ( k ) {

			if ( k < ( 1 / 2.75 ) ) {

				return 7.5625 * k * k;

			} else if ( k < ( 2 / 2.75 ) ) {

				return 7.5625 * ( k -= ( 1.5 / 2.75 ) ) * k + 0.75;

			} else if ( k < ( 2.5 / 2.75 ) ) {

				return 7.5625 * ( k -= ( 2.25 / 2.75 ) ) * k + 0.9375;

			} else {

				return 7.5625 * ( k -= ( 2.625 / 2.75 ) ) * k + 0.984375;

			}

		},

		InOut: function ( k ) {

			if ( k < 0.5 ) return TWEEN.Easing.Bounce.In( k * 2 ) * 0.5;
			return TWEEN.Easing.Bounce.Out( k * 2 - 1 ) * 0.5 + 0.5;

		}

	}

};

TWEEN.Interpolation = {

	Linear: function ( v, k ) {

		var m = v.length - 1, f = m * k, i = Math.floor( f ), fn = TWEEN.Interpolation.Utils.Linear;

		if ( k < 0 ) return fn( v[ 0 ], v[ 1 ], f );
		if ( k > 1 ) return fn( v[ m ], v[ m - 1 ], m - f );

		return fn( v[ i ], v[ i + 1 > m ? m : i + 1 ], f - i );

	},

	Bezier: function ( v, k ) {

		var b = 0, n = v.length - 1, pw = Math.pow, bn = TWEEN.Interpolation.Utils.Bernstein, i;

		for ( i = 0; i <= n; i++ ) {
			b += pw( 1 - k, n - i ) * pw( k, i ) * v[ i ] * bn( n, i );
		}

		return b;

	},

	CatmullRom: function ( v, k ) {

		var m = v.length - 1, f = m * k, i = Math.floor( f ), fn = TWEEN.Interpolation.Utils.CatmullRom;

		if ( v[ 0 ] === v[ m ] ) {

			if ( k < 0 ) i = Math.floor( f = m * ( 1 + k ) );

			return fn( v[ ( i - 1 + m ) % m ], v[ i ], v[ ( i + 1 ) % m ], v[ ( i + 2 ) % m ], f - i );

		} else {

			if ( k < 0 ) return v[ 0 ] - ( fn( v[ 0 ], v[ 0 ], v[ 1 ], v[ 1 ], -f ) - v[ 0 ] );
			if ( k > 1 ) return v[ m ] - ( fn( v[ m ], v[ m ], v[ m - 1 ], v[ m - 1 ], f - m ) - v[ m ] );

			return fn( v[ i ? i - 1 : 0 ], v[ i ], v[ m < i + 1 ? m : i + 1 ], v[ m < i + 2 ? m : i + 2 ], f - i );

		}

	},

	Utils: {

		Linear: function ( p0, p1, t ) {

			return ( p1 - p0 ) * t + p0;

		},

		Bernstein: function ( n , i ) {

			var fc = TWEEN.Interpolation.Utils.Factorial;
			return fc( n ) / fc( i ) / fc( n - i );

		},

		Factorial: ( function () {

			var a = [ 1 ];

			return function ( n ) {

				var s = 1, i;
				if ( a[ n ] ) return a[ n ];
				for ( i = n; i > 1; i-- ) s *= i;
				return a[ n ] = s;

			};

		} )(),

		CatmullRom: function ( p0, p1, p2, p3, t ) {

			var v0 = ( p2 - p0 ) * 0.5, v1 = ( p3 - p1 ) * 0.5, t2 = t * t, t3 = t * t2;
			return ( 2 * p1 - 2 * p2 + v0 + v1 ) * t3 + ( - 3 * p1 + 3 * p2 - 2 * v0 - v1 ) * t2 + v0 * t + p1;

		}

	}

};

module.exports=TWEEN;
},{}],66:[function(require,module,exports){
'use strict';

var React = require('react/addons');

var _require = require('touchstonejs');

var Container = _require.Container;
var createApp = _require.createApp;
var UI = _require.UI;
var View = _require.View;
var ViewManager = _require.ViewManager;

// App Config
// ------------------------------

var PeopleStore = require('./stores/people');
var peopleStore = new PeopleStore();

var App = React.createClass({
	displayName: 'App',

	mixins: [createApp()],

	childContextTypes: {
		peopleStore: React.PropTypes.object
	},

	getChildContext: function getChildContext() {
		return {
			peopleStore: peopleStore
		};
	},

	render: function render() {
		var appWrapperClassName = 'app-wrapper device--' + (window.device || {}).platform;

		return React.createElement(
			'div',
			{ className: appWrapperClassName },
			React.createElement(
				'div',
				{ className: 'device-silhouette' },
				React.createElement(
					ViewManager,
					{ name: 'app', defaultView: 'main' },
					React.createElement(View, { name: 'main', component: MainViewController }),
					React.createElement(View, { name: 'transitions-target-over', component: require('./views/transitions-target-over') })
				)
			)
		);
	}
});

// Main Controller
// ------------------------------

var MainViewController = React.createClass({
	displayName: 'MainViewController',

	render: function render() {
		return React.createElement(
			Container,
			null,
			React.createElement(UI.NavigationBar, { name: 'main' }),
			React.createElement(
				ViewManager,
				{ name: 'main', defaultView: 'tabs' },
				React.createElement(View, { name: 'tabs', component: TabViewController })
			)
		);
	}
});

// Tab Controller
// ------------------------------

var lastSelectedTab = 'lists';
var TabViewController = React.createClass({
	displayName: 'TabViewController',

	getInitialState: function getInitialState() {
		return {
			selectedTab: lastSelectedTab
		};
	},

	onViewChange: function onViewChange(nextView) {
		lastSelectedTab = nextView;

		this.setState({
			selectedTab: nextView
		});
	},

	selectTab: function selectTab(value) {
		var viewProps;

		this.refs.vm.transitionTo(value, {
			transition: 'instant',
			viewProps: viewProps
		});

		this.setState({
			selectedTab: value
		});
	},

	render: function render() {
		var selectedTab = this.state.selectedTab;
		var selectedTabSpan = selectedTab;

		if (selectedTab === 'lists' || selectedTab === 'list-simple' || selectedTab === 'list-complex' || selectedTab === 'list-details') {
			selectedTabSpan = 'lists';
		}

		if (selectedTab === 'transitions' || selectedTab === 'transitions-target') {
			selectedTabSpan = 'transitions';
		}

		return React.createElement(
			Container,
			null,
			React.createElement(
				ViewManager,
				{ ref: 'vm', name: 'tabs', defaultView: selectedTab, onViewChange: this.onViewChange },
				React.createElement(View, { name: 'lists', component: require('./views/lists') }),
				React.createElement(View, { name: 'list-simple', component: require('./views/list-simple') }),
				React.createElement(View, { name: 'list-complex', component: require('./views/list-complex') }),
				React.createElement(View, { name: 'list-details', component: require('./views/list-details') }),
				React.createElement(View, { name: 'form', component: require('./views/form') }),
				React.createElement(View, { name: 'controls', component: require('./views/controls') }),
				React.createElement(View, { name: 'transitions', component: require('./views/transitions') }),
				React.createElement(View, { name: 'transitions-target', component: require('./views/transitions-target') })
			),
			React.createElement(
				UI.Tabs.Navigator,
				null,
				React.createElement(
					UI.Tabs.Tab,
					{ onTap: this.selectTab.bind(this, 'lists'), selected: selectedTabSpan === 'lists' },
					React.createElement('span', { className: 'Tabs-Icon Tabs-Icon--lists' }),
					React.createElement(
						UI.Tabs.Label,
						null,
						'Lists'
					)
				),
				React.createElement(
					UI.Tabs.Tab,
					{ onTap: this.selectTab.bind(this, 'form'), selected: selectedTabSpan === 'form' },
					React.createElement('span', { className: 'Tabs-Icon Tabs-Icon--forms' }),
					React.createElement(
						UI.Tabs.Label,
						null,
						'Forms'
					)
				),
				React.createElement(
					UI.Tabs.Tab,
					{ onTap: this.selectTab.bind(this, 'controls'), selected: selectedTabSpan === 'controls' },
					React.createElement('span', { className: 'Tabs-Icon Tabs-Icon--controls' }),
					React.createElement(
						UI.Tabs.Label,
						null,
						'Controls'
					)
				),
				React.createElement(
					UI.Tabs.Tab,
					{ onTap: this.selectTab.bind(this, 'transitions'), selected: selectedTabSpan === 'transitions' },
					React.createElement('span', { className: 'Tabs-Icon Tabs-Icon--transitions' }),
					React.createElement(
						UI.Tabs.Label,
						null,
						'Transitions'
					)
				)
			)
		);
	}
});

function startApp() {
	if (window.StatusBar) {
		window.StatusBar.styleDefault();
	}

	React.render(React.createElement(App, null), document.getElementById('app'));
}

if (!window.cordova) {
	startApp();
} else {
	document.addEventListener('deviceready', startApp, false);
}

},{"./stores/people":67,"./views/controls":68,"./views/form":69,"./views/list-complex":70,"./views/list-details":71,"./views/list-simple":72,"./views/lists":73,"./views/transitions":76,"./views/transitions-target":75,"./views/transitions-target-over":74,"react/addons":undefined,"touchstonejs":31}],67:[function(require,module,exports){
'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var EventEmitter = require('events').EventEmitter;

var async = require('async');
var httpify = require('httpify');

function PeopleStore() {
	EventEmitter.call(this);

	// initialize internal cache
	var storage = this.cache = {
		people: []
	};
	var self = this;

	// Dispatchers
	this.starQueue = async.queue(function (data, callback) {
		var id = data.id;
		var starred = data.starred;

		// update internal data
		self.cache.people.filter(function (person) {
			return person.id === id;
		}).forEach(function (person) {
			return person.isStarred = starred;
		});

		// emit events
		self.emit('people-updated', storage.people);

		callback();
	}, 1);

	this.refreshQueue = async.queue(function (_, callback) {
		// update
		httpify({
			method: 'GET',
			url: 'http://api.randomuser.me/?nat=au&results=10'
		}, function (err, res) {
			if (err) return callback(err);

			storage.people = res.body.results.map(function (p) {
				return p.user;
			});
			storage.people.forEach(function (person, i) {
				person.name.first = person.name.first[0].toUpperCase() + person.name.first.slice(1);
				person.name.last = person.name.last[0].toUpperCase() + person.name.last.slice(1);

				// we need this too
				person.id = i;
				person.name.initials = person.name.first[0] + person.name.last[0];
				person.name.full = person.name.first + ' ' + person.name.last;
				person.category = Math.random() > 0.5 ? 'A' : 'B';
				person.github = person.name.first.toLowerCase() + person.name.last.toLowerCase();
				person.picture = person.picture.medium;
				person.twitter = '@' + person.name.first.toLowerCase() + Math.random().toString(32).slice(2, 5);
			});

			// emit events
			self.emit('people-updated', storage.people);
			self.emit('refresh');

			callback(null, storage.people);
		});
	}, 1);

	// refresh immediately
	this.refresh();
}

_extends(PeopleStore.prototype, EventEmitter.prototype);

// Intents
PeopleStore.prototype.refresh = function (callback) {
	this.refreshQueue.push(null, callback);
};

PeopleStore.prototype.star = function (_ref, starred, callback) {
	var id = _ref.id;

	this.starQueue.push({ id: id, starred: starred }, callback);
};

// Getters
PeopleStore.prototype.getPeople = function () {
	return this.cache.people;
};

module.exports = PeopleStore;

},{"async":1,"events":24,"httpify":4}],68:[function(require,module,exports){
'use strict';

var Container = require('react-container');
var React = require('react');
var Tappable = require('react-tappable');
var Timers = require('react-timers');

var _require = require('touchstonejs');

var Link = _require.Link;
var UI = _require.UI;

module.exports = React.createClass({
	displayName: 'exports',

	mixins: [Timers()],
	statics: {
		navigationBar: 'main',
		getNavigation: function getNavigation() {
			return {
				title: 'Controls'
			};
		}
	},
	getInitialState: function getInitialState() {
		return {
			alertbar: {
				visible: false,
				type: '',
				text: ''
			},
			popup: {
				visible: false
			}
		};
	},
	showLoadingPopup: function showLoadingPopup() {
		this.setState({
			popup: {
				visible: true,
				loading: true,
				header: 'Loading',
				iconName: 'ion-load-c',
				iconType: 'default'
			}
		});

		var self = this;

		this.setTimeout(function () {
			self.setState({
				popup: {
					visible: true,
					loading: false,
					header: 'Done!',
					iconName: 'ion-ios-checkmark',
					iconType: 'success'
				}
			});
		}, 2000);

		this.setTimeout(function () {
			self.setState({
				popup: {
					visible: false
				}
			});
		}, 3000);
	},
	showAlertbar: function showAlertbar(type, text) {
		var self = this;

		this.setState({
			alertbar: {
				visible: true,
				type: type,
				text: text
			}
		});

		this.setTimeout(function () {
			self.setState({
				alertbar: {
					visible: false
				}
			});
		}, 2000);
	},
	handleModeChange: function handleModeChange(newMode) {
		var selectedItem = newMode;

		if (this.state.selectedMode === newMode) {
			selectedItem = null;
		}

		this.setState({
			selectedMode: selectedItem
		});
	},
	render: function render() {
		var alertbar = this.state.alertbar;

		return React.createElement(
			Container,
			{ scrollable: true },
			React.createElement(
				UI.Alertbar,
				{ type: alertbar.type, visible: alertbar.visible },
				alertbar.text
			),
			React.createElement(
				UI.GroupHeader,
				null,
				'Segmented Control'
			),
			React.createElement(UI.SegmentedControl, { value: this.state.selectedMode, onChange: this.handleModeChange, hasGutter: true, options: [{ label: 'One', value: 'one' }, { label: 'Two', value: 'two' }, { label: 'Three', value: 'three' }, { label: 'Four', value: 'four' }] }),
			React.createElement(
				UI.GroupHeader,
				null,
				'Alert Bar'
			),
			React.createElement(
				UI.ButtonGroup,
				null,
				React.createElement(
					UI.Button,
					{ type: 'primary', onTap: this.showAlertbar.bind(this, 'danger', 'No Internet Connection'), disabled: this.state.alertbar.visible },
					'Danger'
				),
				React.createElement(
					UI.Button,
					{ type: 'primary', onTap: this.showAlertbar.bind(this, 'warning', 'Connecting...'), disabled: this.state.alertbar.visible },
					'Warning'
				),
				React.createElement(
					UI.Button,
					{ type: 'primary', onTap: this.showAlertbar.bind(this, 'success', 'Connected'), disabled: this.state.alertbar.visible },
					'Success'
				)
			),
			React.createElement(
				UI.GroupHeader,
				null,
				'Popup'
			),
			React.createElement(
				UI.Button,
				{ type: 'primary', onTap: this.showLoadingPopup, disabled: this.state.popup.visible },
				'Show Popup'
			),
			React.createElement(
				UI.GroupHeader,
				null,
				'Application State'
			),
			React.createElement(
				UI.Group,
				null,
				React.createElement(
					Link,
					{ linkTo: 'tabs:non-existent', transition: 'show-from-right' },
					React.createElement(
						UI.Item,
						{ showDisclosureArrow: true },
						React.createElement(
							UI.ItemInner,
							null,
							'Invalid View'
						)
					)
				)
			),
			React.createElement(
				UI.Popup,
				{ visible: this.state.popup.visible },
				React.createElement(UI.PopupIcon, { name: this.state.popup.iconName, type: this.state.popup.iconType, spinning: this.state.popup.loading }),
				React.createElement(
					'div',
					null,
					React.createElement(
						'strong',
						null,
						this.state.popup.header
					)
				)
			)
		);
	}
});

},{"react":undefined,"react-container":19,"react-tappable":22,"react-timers":23,"touchstonejs":31}],69:[function(require,module,exports){
'use strict';

var Container = require('react-container');
var dialogs = require('cordova-dialogs');
var React = require('react');
var Tappable = require('react-tappable');

var _require = require('touchstonejs');

var UI = _require.UI;

var scrollable = Container.initScrollable();

module.exports = React.createClass({
	displayName: 'exports',

	statics: {
		navigationBar: 'main',
		getNavigation: function getNavigation() {
			return {
				title: 'Forms'
			};
		}
	},
	getInitialState: function getInitialState() {
		return {
			flavour: 'chocolate',
			switchValue: true
		};
	},
	handleFlavourChange: function handleFlavourChange(newFlavour) {
		this.setState({
			flavour: newFlavour
		});
	},
	handleSwitch: function handleSwitch(key, event) {
		var newState = {};
		newState[key] = !this.state[key];

		this.setState(newState);
	},
	alert: function alert(message) {
		dialogs.alert(message, function () {}, null);
	},
	render: function render() {

		return React.createElement(
			Container,
			{ scrollable: scrollable },
			React.createElement(
				UI.GroupHeader,
				null,
				'Checkbox'
			),
			React.createElement(
				UI.Group,
				null,
				React.createElement(
					UI.Item,
					null,
					React.createElement(
						UI.ItemInner,
						null,
						React.createElement(
							UI.FieldLabel,
							null,
							'Switch'
						),
						React.createElement(UI.Switch, { onTap: this.handleSwitch.bind(this, 'switchValue'), on: this.state.switchValue })
					)
				),
				React.createElement(
					UI.Item,
					null,
					React.createElement(
						UI.ItemInner,
						null,
						React.createElement(
							UI.FieldLabel,
							null,
							'Disabled'
						),
						React.createElement(UI.Switch, { disabled: true })
					)
				)
			),
			React.createElement(
				UI.GroupHeader,
				null,
				'Radio'
			),
			React.createElement(
				UI.Group,
				null,
				React.createElement(UI.RadioList, { value: this.state.flavour, onChange: this.handleFlavourChange, options: [{ label: 'Vanilla', value: 'vanilla' }, { label: 'Chocolate', value: 'chocolate' }, { label: 'Caramel', value: 'caramel' }, { label: 'Strawberry', value: 'strawberry' }] })
			),
			React.createElement(
				UI.GroupHeader,
				null,
				'Inputs'
			),
			React.createElement(
				UI.Group,
				null,
				React.createElement(UI.Input, { placeholder: 'Default' }),
				React.createElement(UI.Input, { defaultValue: 'With Value', placeholder: 'Placeholder' }),
				React.createElement(UI.Textarea, { defaultValue: 'Longtext is good for bios etc.', placeholder: 'Longtext' })
			),
			React.createElement(
				UI.GroupHeader,
				null,
				'Labelled Inputs'
			),
			React.createElement(
				UI.Group,
				null,
				React.createElement(UI.LabelInput, { type: 'email', label: 'Email', placeholder: 'your.name@example.com' }),
				React.createElement(UI.LabelInput, { type: 'url', label: 'URL', placeholder: 'http://www.yourwebsite.com' }),
				React.createElement(UI.LabelInput, { noedit: true, label: 'No Edit', defaultValue: 'Un-editable, scrollable, selectable content' }),
				React.createElement(UI.LabelSelect, { label: 'Flavour', value: this.state.flavour, onChange: this.handleFlavourChange, options: [{ label: 'Vanilla', value: 'vanilla' }, { label: 'Chocolate', value: 'chocolate' }, { label: 'Caramel', value: 'caramel' }, { label: 'Strawberry', value: 'strawberry' }, { label: 'Banana', value: 'banana' }, { label: 'Lemon', value: 'lemon' }, { label: 'Pastaccio', value: 'pastaccio' }] })
			),
			React.createElement(
				UI.Button,
				{ type: 'primary', onTap: this.alert.bind(this, 'You clicked the Primary Button') },
				'Primary Button'
			),
			React.createElement(
				UI.Button,
				{ onTap: this.alert.bind(this, 'You clicked the Default Button') },
				'Default Button'
			),
			React.createElement(
				UI.Button,
				{ type: 'danger', onTap: this.alert.bind(this, 'You clicked the Danger Button') },
				'Danger Button'
			),
			React.createElement(
				UI.Button,
				{ type: 'danger', onTap: this.alert.bind(this, 'You clicked the Danger Button'), disabled: true },
				'Disabled Button'
			)
		);
	}
});

},{"cordova-dialogs":3,"react":undefined,"react-container":19,"react-tappable":22,"touchstonejs":31}],70:[function(require,module,exports){
'use strict';

var Container = require('react-container');
var React = require('react');
var Tappable = require('react-tappable');
var Sentry = require('react-sentry');

var _require = require('touchstonejs');

var Link = _require.Link;
var UI = _require.UI;

var scrollable = Container.initScrollable();

var ComplexLinkItem = React.createClass({
	displayName: 'ComplexLinkItem',

	contextTypes: { peopleStore: React.PropTypes.object.isRequired },

	toggleStar: function toggleStar() {
		var person = this.props.person;

		this.context.peopleStore.star(person, !person.isStarred);
	},

	render: function render() {
		var person = this.props.person;

		return React.createElement(
			Link,
			{ to: 'tabs:list-details', transition: 'show-from-right', viewProps: { person: person, prevView: 'list-complex' } },
			React.createElement(
				UI.Item,
				null,
				React.createElement(UI.ItemMedia, { avatar: person.picture, avatarInitials: person.initials }),
				React.createElement(
					UI.ItemInner,
					null,
					React.createElement(
						UI.ItemContent,
						null,
						React.createElement(
							UI.ItemTitle,
							null,
							person.name.full
						),
						React.createElement(
							UI.ItemSubTitle,
							null,
							person.bio
						)
					),
					React.createElement(
						Tappable,
						{ onTap: this.toggleStar, stopPropagation: true },
						React.createElement(UI.ItemNote, { icon: person.isStarred ? 'ion-ios-star' : 'ion-ios-star-outline', type: person.isStarred ? 'warning' : 'default', className: 'ion-lg' })
					)
				)
			)
		);
	}
});

// FIXME: this bit is global and hacky, expect it to change
var EventEmitter = require('events').EventEmitter;
var emitter = new EventEmitter();

function getNavigation(props, app, filterStarred) {
	return {
		leftLabel: 'Lists',
		leftArrow: true,
		leftAction: function leftAction() {
			app.transitionTo('tabs:lists', { transition: 'reveal-from-right' });
		},
		rightLabel: filterStarred ? 'All' : 'Starred',
		rightAction: emitter.emit.bind(emitter, 'navigationBarRightAction'),
		title: 'Complex'
	};
}

module.exports = React.createClass({
	displayName: 'exports',

	contextTypes: {
		app: React.PropTypes.object,
		peopleStore: React.PropTypes.object.isRequired
	},
	mixins: [Sentry()],

	statics: {
		navigationBar: 'main',
		getNavigation: getNavigation
	},

	getInitialState: function getInitialState() {
		return {
			filterStarred: false,
			people: this.context.peopleStore.getPeople()
		};
	},

	componentDidMount: function componentDidMount() {
		var self = this;

		this.watch(this.context.peopleStore, 'people-updated', function (people) {
			self.setState({ people: people });
		});

		this.watch(emitter, 'navigationBarRightAction', this.toggleStarred);
	},

	toggleStarred: function toggleStarred() {
		var filterStarred = !this.state.filterStarred;
		this.setState({ filterStarred: filterStarred });
		this.context.app.navigationBars.main.update(getNavigation({}, this.context.app, filterStarred));
	},

	handleModeChange: function handleModeChange(newMode) {
		var selectedMode = newMode;

		if (this.state.selectedMode === newMode) {
			selectedMode = null;
		}

		this.setState({ selectedMode: selectedMode });
	},

	render: function render() {
		var _state = this.state;
		var people = _state.people;
		var filterStarred = _state.filterStarred;
		var selectedMode = _state.selectedMode;

		if (filterStarred) {
			people = people.filter(function (person) {
				return person.isStarred;
			});
		}

		if (selectedMode === 'A' || selectedMode === 'B') {
			people = people.filter(function (person) {
				return person.category === selectedMode;
			});
		}

		function sortByName(a, b) {
			return a.name.full.localeCompare(b.name.full);
		}

		var sortedPeople = people.sort(sortByName);
		var results;

		if (sortedPeople.length) {
			var aPeople = sortedPeople.filter(function (person) {
				return person.category === 'A';
			}).map(function (person, i) {
				return React.createElement(ComplexLinkItem, { key: 'persona' + i, person: person });
			});

			var bPeople = sortedPeople.filter(function (person) {
				return person.category === 'B';
			}).map(function (person, i) {
				return React.createElement(ComplexLinkItem, { key: 'personb' + i, person: person });
			});

			results = React.createElement(
				UI.Group,
				null,
				aPeople.length > 0 ? React.createElement(
					UI.ListHeader,
					{ sticky: true },
					'Category A'
				) : '',
				aPeople,
				bPeople.length > 0 ? React.createElement(
					UI.ListHeader,
					{ sticky: true },
					'Category B'
				) : '',
				bPeople
			);
		} else {
			results = React.createElement(
				Container,
				{ direction: 'column', align: 'center', justify: 'center', className: 'no-results' },
				React.createElement('div', { className: 'no-results__icon ion-ios-star' }),
				React.createElement(
					'div',
					{ className: 'no-results__text' },
					'Go star some people!'
				)
			);
		}

		return React.createElement(
			Container,
			{ scrollable: scrollable },
			React.createElement(UI.SegmentedControl, { value: this.state.selectedMode, onChange: this.handleModeChange, hasGutter: true, equalWidthSegments: true, options: [{ label: 'A', value: 'A' }, { label: 'B', value: 'B' }] }),
			results
		);
	}
});

},{"events":24,"react":undefined,"react-container":19,"react-sentry":21,"react-tappable":22,"touchstonejs":31}],71:[function(require,module,exports){
'use strict';

var Container = require('react-container');
var React = require('react');

module.exports = React.createClass({
	displayName: 'exports',

	statics: {
		navigationBar: 'main',
		getNavigation: function getNavigation(props, app) {
			var leftLabel = props.prevView === 'list-simple' ? 'Simple' : 'Complex';
			return {
				leftArrow: true,
				leftLabel: leftLabel,
				leftAction: function leftAction() {
					app.transitionTo('tabs:' + props.prevView, { transition: 'reveal-from-right' });
				},
				title: 'Person'
			};
		}
	},
	getDefaultProps: function getDefaultProps() {
		return {
			prevView: 'home'
		};
	},
	render: function render() {
		var person = this.props.person;

		return React.createElement(
			Container,
			{ direction: 'column' },
			React.createElement(
				Container,
				{ fill: true, scrollable: true, ref: 'scrollContainer', className: 'PersonDetails' },
				React.createElement('img', { src: person.picture, className: 'PersonDetails__avatar' }),
				React.createElement(
					'div',
					{ className: 'PersonDetails__heading' },
					person.name.full
				),
				React.createElement(
					'div',
					{ className: 'PersonDetails__text text-block' },
					person.bio
				),
				(person.twitter || person.github) && React.createElement(
					'div',
					{ className: 'PersonDetails__profiles' },
					person.twitter && React.createElement(
						'div',
						{ className: 'PersonDetails__profile' },
						React.createElement('span', { className: 'PersonDetails__profile__icon ion-social-twitter' }),
						person.twitter
					),
					person.github && React.createElement(
						'div',
						{ className: 'PersonDetails__profile' },
						React.createElement('span', { className: 'PersonDetails__profile__icon ion-social-github' }),
						person.github
					)
				)
			)
		);
	}
});

},{"react":undefined,"react-container":19}],72:[function(require,module,exports){
'use strict';

var Container = require('react-container');
var React = require('react');
var Tappable = require('react-tappable');
var Sentry = require('react-sentry');

var _require = require('touchstonejs');

var Link = _require.Link;
var UI = _require.UI;

var Search = React.createClass({
	displayName: 'Search',
	propTypes: {
		searchString: React.PropTypes.string,
		onChange: React.PropTypes.func.isRequired
	},

	getDefaultProps: function getDefaultProps() {
		return {
			searchString: ''
		};
	},

	handleChange: function handleChange(event) {
		this.props.onChange(event.target.value);
	},

	reset: function reset() {
		this.props.onChange('');
	},

	render: function render() {
		var clearIcon;

		if (this.props.searchString.length > 0) {
			clearIcon = React.createElement(Tappable, { className: 'SearchField__icon SearchField__icon--clear', onTap: this.reset });
		}

		return React.createElement(
			'div',
			{ className: 'SearchField' },
			React.createElement('span', { className: 'SearchField__icon SearchField__icon--search' }),
			React.createElement('input', { ref: 'input', value: this.props.searchString, onChange: this.handleChange, className: 'SearchField__input', placeholder: 'Search...' }),
			clearIcon
		);
	}
});

var SimpleLinkItem = React.createClass({
	displayName: 'SimpleLinkItem',

	propTypes: {
		person: React.PropTypes.object.isRequired
	},

	render: function render() {
		return React.createElement(
			Link,
			{ to: 'tabs:list-details', transition: 'show-from-right', viewProps: { person: this.props.person, prevView: 'list-simple' } },
			React.createElement(
				UI.Item,
				{ showDisclosureArrow: true },
				React.createElement(
					UI.ItemInner,
					null,
					React.createElement(
						UI.ItemTitle,
						null,
						this.props.person.name.full
					)
				)
			)
		);
	}
});

module.exports = React.createClass({
	displayName: 'exports',

	mixins: [Sentry()],
	contextTypes: { peopleStore: React.PropTypes.object.isRequired },

	statics: {
		navigationBar: 'main',
		getNavigation: function getNavigation(props, app) {
			return {
				leftArrow: true,
				leftLabel: 'Lists',
				leftAction: function leftAction() {
					app.transitionTo('tabs:lists', { transition: 'reveal-from-right' });
				},
				title: 'Simple'
			};
		}
	},

	componentDidMount: function componentDidMount() {
		var self = this;

		this.watch(this.context.peopleStore, 'people-updated', function (people) {
			self.setState({ people: people });
		});
	},

	getInitialState: function getInitialState() {
		return {
			searchString: '',
			people: this.context.peopleStore.getPeople()
		};
	},

	updateSearch: function updateSearch(str) {
		this.setState({ searchString: str });
	},

	render: function render() {
		var searchString = this.state.searchString;

		var searchRegex = new RegExp(searchString);

		function searchFilter(person) {
			return searchRegex.test(person.name.full);
		}
		function sortByName(a, b) {
			return a.name.full.localeCompare(b.name.full);
		}

		var people = this.state.people;

		var filteredPeople = people.filter(searchFilter).sort(sortByName);

		var results;

		if (searchString && !filteredPeople.length) {
			results = React.createElement(
				Container,
				{ direction: 'column', align: 'center', justify: 'center', className: 'no-results' },
				React.createElement('div', { className: 'no-results__icon ion-ios-search-strong' }),
				React.createElement(
					'div',
					{ className: 'no-results__text' },
					'No results for "' + searchString + '"'
				)
			);
		} else {
			var aPeople = filteredPeople.filter(function (person) {
				return person.category === 'A';
			}).map(function (person, i) {
				return React.createElement(SimpleLinkItem, { key: 'persona' + i, person: person });
			});

			var bPeople = filteredPeople.filter(function (person) {
				return person.category === 'B';
			}).map(function (person, i) {
				return React.createElement(SimpleLinkItem, { key: 'personb' + i, person: person });
			});

			results = React.createElement(
				UI.Group,
				null,
				aPeople.length > 0 ? React.createElement(
					UI.ListHeader,
					{ sticky: true },
					'Category A'
				) : '',
				aPeople,
				bPeople.length > 0 ? React.createElement(
					UI.ListHeader,
					{ sticky: true },
					'Category B'
				) : '',
				bPeople
			);
		}

		return React.createElement(
			Container,
			{ scrollable: true },
			React.createElement(Search, { searchString: this.state.searchString, onChange: this.updateSearch }),
			results
		);
	}
});

},{"react":undefined,"react-container":19,"react-sentry":21,"react-tappable":22,"touchstonejs":31}],73:[function(require,module,exports){
'use strict';

var Container = require('react-container');
var React = require('react');

var _require = require('touchstonejs');

var Link = _require.Link;
var UI = _require.UI;

module.exports = React.createClass({
	displayName: 'exports',

	statics: {
		navigationBar: 'main',
		getNavigation: function getNavigation() {
			return {
				title: 'Lists'
			};
		}
	},

	render: function render() {
		return React.createElement(
			Container,
			{ scrollable: true },
			React.createElement(
				UI.GroupHeader,
				null,
				'Lists'
			),
			React.createElement(
				UI.Group,
				null,
				React.createElement(
					Link,
					{ to: 'tabs:list-simple', transition: 'show-from-right' },
					React.createElement(
						UI.Item,
						{ showDisclosureArrow: true },
						React.createElement(
							UI.ItemInner,
							null,
							'Simple List'
						)
					)
				),
				React.createElement(
					Link,
					{ to: 'tabs:list-complex', transition: 'show-from-right' },
					React.createElement(
						UI.Item,
						{ showDisclosureArrow: true },
						React.createElement(
							UI.ItemInner,
							null,
							'Complex List'
						)
					)
				)
			),
			React.createElement(
				UI.GroupHeader,
				null,
				'GroupHeader'
			),
			React.createElement(
				UI.Group,
				null,
				React.createElement(
					UI.GroupBody,
					null,
					'Use groups to contain content or lists. Where appropriate a Group should be accompanied by a GroupHeading and optionally a GroupFooter.'
				),
				React.createElement(
					UI.GroupBody,
					null,
					'You can use GroupBody for content inside groups. Subsequent GroupBody components will be separated.'
				)
			),
			React.createElement(
				UI.GroupFooter,
				null,
				'GroupFooter: useful for a detailed explaination to express the intentions of the Group. Try to be concise - remember that users are likely to read the text in your UI many times.'
			)
		);
	}
});

},{"react":undefined,"react-container":19,"touchstonejs":31}],74:[function(require,module,exports){
'use strict';

var Container = require('react-container');
var React = require('react');
var Timers = require('react-timers');

var _require = require('touchstonejs');

var Mixins = _require.Mixins;
var UI = _require.UI;

module.exports = React.createClass({
	displayName: 'exports',

	mixins: [Mixins.Transitions, Timers()],
	componentDidMount: function componentDidMount() {
		var self = this;
		this.setTimeout(function () {
			self.transitionTo('app:main', { transition: 'fade' });
		}, 1000);
	},
	render: function render() {
		return React.createElement(
			Container,
			{ direction: 'column' },
			React.createElement(UI.NavigationBar, { name: 'over', title: this.props.navbarTitle }),
			React.createElement(
				Container,
				{ direction: 'column', align: 'center', justify: 'center', className: 'no-results' },
				React.createElement('div', { className: 'no-results__icon ion-ios-photos' }),
				React.createElement(
					'div',
					{ className: 'no-results__text' },
					'Hold on a sec...'
				)
			)
		);
	}
});

},{"react":undefined,"react-container":19,"react-timers":23,"touchstonejs":31}],75:[function(require,module,exports){
'use strict';

var Container = require('react-container');
var React = require('react');
var Timers = require('react-timers');

var _require = require('touchstonejs');

var Mixins = _require.Mixins;

module.exports = React.createClass({
	displayName: 'exports',

	mixins: [Mixins.Transitions, Timers()],
	statics: {
		navigationBar: 'main',
		getNavigation: function getNavigation(props) {
			return {
				title: props.navbarTitle
			};
		}
	},
	componentDidMount: function componentDidMount() {
		var self = this;

		this.setTimeout(function () {
			self.transitionTo('tabs:transitions', { transition: 'fade' });
		}, 1000);
	},
	render: function render() {
		return React.createElement(
			Container,
			{ direction: 'column', align: 'center', justify: 'center', className: 'no-results' },
			React.createElement('div', { className: 'no-results__icon ion-ios-photos' }),
			React.createElement(
				'div',
				{ className: 'no-results__text' },
				'Hold on a sec...'
			)
		);
	}
});

},{"react":undefined,"react-container":19,"react-timers":23,"touchstonejs":31}],76:[function(require,module,exports){
'use strict';

var Container = require('react-container');
var React = require('react');

var _require = require('touchstonejs');

var Link = _require.Link;
var UI = _require.UI;

var scrollable = Container.initScrollable();

module.exports = React.createClass({
	displayName: 'exports',

	statics: {
		navigationBar: 'main',
		getNavigation: function getNavigation() {
			return {
				title: 'Transitions'
			};
		}
	},
	render: function render() {
		return React.createElement(
			Container,
			{ scrollable: scrollable },
			React.createElement(
				UI.GroupHeader,
				null,
				'Default'
			),
			React.createElement(
				UI.Group,
				null,
				React.createElement(
					Link,
					{ to: 'tabs:transitions-target', viewProps: { navbarTitle: 'Instant' } },
					React.createElement(
						UI.Item,
						{ showDisclosureArrow: true },
						React.createElement(
							UI.ItemInner,
							null,
							'Instant'
						)
					)
				)
			),
			React.createElement(
				UI.GroupHeader,
				null,
				'Fade'
			),
			React.createElement(
				UI.Group,
				null,
				React.createElement(
					Link,
					{ to: 'tabs:transitions-target', transition: 'fade', viewProps: { navbarTitle: 'Fade' } },
					React.createElement(
						UI.Item,
						{ showDisclosureArrow: true },
						React.createElement(
							UI.ItemInner,
							null,
							'Fade'
						)
					)
				),
				React.createElement(
					Link,
					{ to: 'tabs:transitions-target', transition: 'fade-expand', viewProps: { navbarTitle: 'Fade Expand' } },
					React.createElement(
						UI.Item,
						{ showDisclosureArrow: true },
						React.createElement(
							UI.ItemInner,
							null,
							React.createElement(
								'span',
								null,
								'Fade Expand ',
								React.createElement(
									'span',
									{ className: 'text-muted' },
									'(non-standard)'
								)
							)
						)
					)
				),
				React.createElement(
					Link,
					{ to: 'tabs:transitions-target', transition: 'fade-contract', viewProps: { navbarTitle: 'Fade Contract' } },
					React.createElement(
						UI.Item,
						{ showDisclosureArrow: true },
						React.createElement(
							UI.ItemInner,
							null,
							React.createElement(
								'span',
								null,
								'Fade Contract ',
								React.createElement(
									'span',
									{ className: 'text-muted' },
									'(non-standard)'
								)
							)
						)
					)
				)
			),
			React.createElement(
				UI.GroupHeader,
				null,
				'Show'
			),
			React.createElement(
				UI.Group,
				null,
				React.createElement(
					Link,
					{ to: 'tabs:transitions-target', transition: 'show-from-left', viewProps: { navbarTitle: 'Show from Left' } },
					React.createElement(
						UI.Item,
						{ showDisclosureArrow: true },
						React.createElement(
							UI.ItemInner,
							null,
							React.createElement(
								'span',
								null,
								'Show from Left ',
								React.createElement(
									'span',
									{ className: 'text-muted' },
									'(non-standard)'
								)
							)
						)
					)
				),
				React.createElement(
					Link,
					{ to: 'tabs:transitions-target', transition: 'show-from-right', viewProps: { navbarTitle: 'Show from Right' } },
					React.createElement(
						UI.Item,
						{ showDisclosureArrow: true },
						React.createElement(
							UI.ItemInner,
							null,
							'Show from Right'
						)
					)
				),
				React.createElement(
					Link,
					{ to: 'app:transitions-target-over', transition: 'show-from-top', viewProps: { navbarTitle: 'Show from Top' } },
					React.createElement(
						UI.Item,
						{ showDisclosureArrow: true },
						React.createElement(
							UI.ItemInner,
							null,
							React.createElement(
								'span',
								null,
								'Show from Top ',
								React.createElement(
									'span',
									{ className: 'text-muted' },
									'(non-standard)'
								)
							)
						)
					)
				),
				React.createElement(
					Link,
					{ to: 'app:transitions-target-over', transition: 'show-from-bottom', viewProps: { navbarTitle: 'Show from Bottom' } },
					React.createElement(
						UI.Item,
						{ showDisclosureArrow: true },
						React.createElement(
							UI.ItemInner,
							null,
							'Show from Bottom'
						)
					)
				)
			),
			React.createElement(
				UI.GroupHeader,
				null,
				'Reveal'
			),
			React.createElement(
				UI.Group,
				null,
				React.createElement(
					Link,
					{ to: 'tabs:transitions-target', transition: 'reveal-from-left', viewProps: { navbarTitle: 'Reveal from Left' } },
					React.createElement(
						UI.Item,
						{ showDisclosureArrow: true },
						React.createElement(
							UI.ItemInner,
							null,
							React.createElement(
								'span',
								null,
								'Reveal from Left ',
								React.createElement(
									'span',
									{ className: 'text-muted' },
									'(non-standard)'
								)
							)
						)
					)
				),
				React.createElement(
					Link,
					{ to: 'tabs:transitions-target', transition: 'reveal-from-right', viewProps: { navbarTitle: 'Reveal from Right' } },
					React.createElement(
						UI.Item,
						{ showDisclosureArrow: true },
						React.createElement(
							UI.ItemInner,
							null,
							'Reveal from Right'
						)
					)
				),
				React.createElement(
					Link,
					{ to: 'app:transitions-target-over', transition: 'reveal-from-top', viewProps: { navbarTitle: 'Reveal from Top' } },
					React.createElement(
						UI.Item,
						{ showDisclosureArrow: true },
						React.createElement(
							UI.ItemInner,
							null,
							React.createElement(
								'span',
								null,
								'Reveal from Top ',
								React.createElement(
									'span',
									{ className: 'text-muted' },
									'(non-standard)'
								)
							)
						)
					)
				),
				React.createElement(
					Link,
					{ to: 'app:transitions-target-over', transition: 'reveal-from-bottom', viewProps: { navbarTitle: 'Reveal from Bottom' } },
					React.createElement(
						UI.Item,
						{ showDisclosureArrow: true },
						React.createElement(
							UI.ItemInner,
							null,
							'Reveal from Bottom'
						)
					)
				)
			)
		);
	}
});

},{"react":undefined,"react-container":19,"touchstonejs":31}]},{},[66])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy90b3VjaHN0b25lanMtdGFza3Mvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsIm5vZGVfbW9kdWxlcy9hc3luYy9saWIvYXN5bmMuanMiLCJub2RlX21vZHVsZXMvY2xhc3NuYW1lcy9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9jb3Jkb3ZhLWRpYWxvZ3MvaW5kZXguanMiLCJub2RlX21vZHVsZXMvaHR0cGlmeS9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9odHRwaWZ5L2xpYi9icm93c2VyLmpzIiwibm9kZV9tb2R1bGVzL2h0dHBpZnkvbm9kZV9tb2R1bGVzL3Byb21pc2UvaW5kZXguanMiLCJub2RlX21vZHVsZXMvaHR0cGlmeS9ub2RlX21vZHVsZXMvcHJvbWlzZS9saWIvY29yZS5qcyIsIm5vZGVfbW9kdWxlcy9odHRwaWZ5L25vZGVfbW9kdWxlcy9wcm9taXNlL2xpYi9kb25lLmpzIiwibm9kZV9tb2R1bGVzL2h0dHBpZnkvbm9kZV9tb2R1bGVzL3Byb21pc2UvbGliL2VzNi1leHRlbnNpb25zLmpzIiwibm9kZV9tb2R1bGVzL2h0dHBpZnkvbm9kZV9tb2R1bGVzL3Byb21pc2UvbGliL25vZGUtZXh0ZW5zaW9ucy5qcyIsIm5vZGVfbW9kdWxlcy9odHRwaWZ5L25vZGVfbW9kdWxlcy9wcm9taXNlL25vZGVfbW9kdWxlcy9hc2FwL2FzYXAuanMiLCJub2RlX21vZHVsZXMvaHR0cGlmeS9ub2RlX21vZHVsZXMveGhyL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2h0dHBpZnkvbm9kZV9tb2R1bGVzL3hoci9ub2RlX21vZHVsZXMvZ2xvYmFsL3dpbmRvdy5qcyIsIm5vZGVfbW9kdWxlcy9odHRwaWZ5L25vZGVfbW9kdWxlcy94aHIvbm9kZV9tb2R1bGVzL29uY2Uvb25jZS5qcyIsIm5vZGVfbW9kdWxlcy9odHRwaWZ5L25vZGVfbW9kdWxlcy94aHIvbm9kZV9tb2R1bGVzL3BhcnNlLWhlYWRlcnMvbm9kZV9tb2R1bGVzL2Zvci1lYWNoL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2h0dHBpZnkvbm9kZV9tb2R1bGVzL3hoci9ub2RlX21vZHVsZXMvcGFyc2UtaGVhZGVycy9ub2RlX21vZHVsZXMvZm9yLWVhY2gvbm9kZV9tb2R1bGVzL2lzLWZ1bmN0aW9uL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2h0dHBpZnkvbm9kZV9tb2R1bGVzL3hoci9ub2RlX21vZHVsZXMvcGFyc2UtaGVhZGVycy9ub2RlX21vZHVsZXMvdHJpbS9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9odHRwaWZ5L25vZGVfbW9kdWxlcy94aHIvbm9kZV9tb2R1bGVzL3BhcnNlLWhlYWRlcnMvcGFyc2UtaGVhZGVycy5qcyIsIm5vZGVfbW9kdWxlcy9yZWFjdC1jb250YWluZXIvbGliL0NvbnRhaW5lci5qcyIsIm5vZGVfbW9kdWxlcy9yZWFjdC1jb250YWluZXIvbm9kZV9tb2R1bGVzL2JsYWNrbGlzdC9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9yZWFjdC1zZW50cnkvbGliL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3JlYWN0LXRhcHBhYmxlL2xpYi9UYXBwYWJsZS5qcyIsIm5vZGVfbW9kdWxlcy9yZWFjdC10aW1lcnMvaW5kZXguanMiLCJub2RlX21vZHVsZXMvdG91Y2hzdG9uZWpzLXRhc2tzL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9ldmVudHMvZXZlbnRzLmpzIiwibm9kZV9tb2R1bGVzL3RvdWNoc3RvbmVqcy10YXNrcy9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvcHJvY2Vzcy9icm93c2VyLmpzIiwibm9kZV9tb2R1bGVzL3RvdWNoc3RvbmVqcy9saWIvY29yZS9FcnJvclZpZXcuanMiLCJub2RlX21vZHVsZXMvdG91Y2hzdG9uZWpzL2xpYi9jb3JlL0xpbmsuanMiLCJub2RlX21vZHVsZXMvdG91Y2hzdG9uZWpzL2xpYi9jb3JlL1ZpZXcuanMiLCJub2RlX21vZHVsZXMvdG91Y2hzdG9uZWpzL2xpYi9jb3JlL1ZpZXdNYW5hZ2VyLmpzIiwibm9kZV9tb2R1bGVzL3RvdWNoc3RvbmVqcy9saWIvY29yZS9hbmltYXRpb24uanMiLCJub2RlX21vZHVsZXMvdG91Y2hzdG9uZWpzL2xpYi9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy90b3VjaHN0b25lanMvbGliL21peGlucy9UcmFuc2l0aW9ucy5qcyIsIm5vZGVfbW9kdWxlcy90b3VjaHN0b25lanMvbGliL21peGlucy9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy90b3VjaHN0b25lanMvbGliL3VpL0FsZXJ0YmFyLmpzIiwibm9kZV9tb2R1bGVzL3RvdWNoc3RvbmVqcy9saWIvdWkvQnV0dG9uLmpzIiwibm9kZV9tb2R1bGVzL3RvdWNoc3RvbmVqcy9saWIvdWkvQnV0dG9uR3JvdXAuanMiLCJub2RlX21vZHVsZXMvdG91Y2hzdG9uZWpzL2xpYi91aS9GaWVsZENvbnRyb2wuanMiLCJub2RlX21vZHVsZXMvdG91Y2hzdG9uZWpzL2xpYi91aS9GaWVsZExhYmVsLmpzIiwibm9kZV9tb2R1bGVzL3RvdWNoc3RvbmVqcy9saWIvdWkvR3JvdXAuanMiLCJub2RlX21vZHVsZXMvdG91Y2hzdG9uZWpzL2xpYi91aS9Hcm91cEJvZHkuanMiLCJub2RlX21vZHVsZXMvdG91Y2hzdG9uZWpzL2xpYi91aS9Hcm91cEZvb3Rlci5qcyIsIm5vZGVfbW9kdWxlcy90b3VjaHN0b25lanMvbGliL3VpL0dyb3VwSGVhZGVyLmpzIiwibm9kZV9tb2R1bGVzL3RvdWNoc3RvbmVqcy9saWIvdWkvSW5wdXQuanMiLCJub2RlX21vZHVsZXMvdG91Y2hzdG9uZWpzL2xpYi91aS9JdGVtLmpzIiwibm9kZV9tb2R1bGVzL3RvdWNoc3RvbmVqcy9saWIvdWkvSXRlbUNvbnRlbnQuanMiLCJub2RlX21vZHVsZXMvdG91Y2hzdG9uZWpzL2xpYi91aS9JdGVtSW5uZXIuanMiLCJub2RlX21vZHVsZXMvdG91Y2hzdG9uZWpzL2xpYi91aS9JdGVtTWVkaWEuanMiLCJub2RlX21vZHVsZXMvdG91Y2hzdG9uZWpzL2xpYi91aS9JdGVtTm90ZS5qcyIsIm5vZGVfbW9kdWxlcy90b3VjaHN0b25lanMvbGliL3VpL0l0ZW1TdWJUaXRsZS5qcyIsIm5vZGVfbW9kdWxlcy90b3VjaHN0b25lanMvbGliL3VpL0l0ZW1UaXRsZS5qcyIsIm5vZGVfbW9kdWxlcy90b3VjaHN0b25lanMvbGliL3VpL0xhYmVsSW5wdXQuanMiLCJub2RlX21vZHVsZXMvdG91Y2hzdG9uZWpzL2xpYi91aS9MYWJlbFNlbGVjdC5qcyIsIm5vZGVfbW9kdWxlcy90b3VjaHN0b25lanMvbGliL3VpL0xhYmVsVGV4dGFyZWEuanMiLCJub2RlX21vZHVsZXMvdG91Y2hzdG9uZWpzL2xpYi91aS9MaXN0SGVhZGVyLmpzIiwibm9kZV9tb2R1bGVzL3RvdWNoc3RvbmVqcy9saWIvdWkvTmF2aWdhdGlvbkJhci5qcyIsIm5vZGVfbW9kdWxlcy90b3VjaHN0b25lanMvbGliL3VpL1BvcHVwLmpzIiwibm9kZV9tb2R1bGVzL3RvdWNoc3RvbmVqcy9saWIvdWkvUG9wdXBJY29uLmpzIiwibm9kZV9tb2R1bGVzL3RvdWNoc3RvbmVqcy9saWIvdWkvUmFkaW9MaXN0LmpzIiwibm9kZV9tb2R1bGVzL3RvdWNoc3RvbmVqcy9saWIvdWkvU2VnbWVudGVkQ29udHJvbC5qcyIsIm5vZGVfbW9kdWxlcy90b3VjaHN0b25lanMvbGliL3VpL1N3aXRjaC5qcyIsIm5vZGVfbW9kdWxlcy90b3VjaHN0b25lanMvbGliL3VpL1RhYnMuanMiLCJub2RlX21vZHVsZXMvdG91Y2hzdG9uZWpzL2xpYi91aS9UZXh0YXJlYS5qcyIsIm5vZGVfbW9kdWxlcy90b3VjaHN0b25lanMvbGliL3VpL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3RvdWNoc3RvbmVqcy9ub2RlX21vZHVsZXMvdHdlZW4uanMvaW5kZXguanMiLCIvaG9tZS9kYW5pZWwvd29ya3NwYWNlL3RvdWNoc3RvbmVqcy1zdGFydGVyL3NyYy9qcy9hcHAuanMiLCIvaG9tZS9kYW5pZWwvd29ya3NwYWNlL3RvdWNoc3RvbmVqcy1zdGFydGVyL3NyYy9qcy9zdG9yZXMvcGVvcGxlLmpzIiwiL2hvbWUvZGFuaWVsL3dvcmtzcGFjZS90b3VjaHN0b25lanMtc3RhcnRlci9zcmMvanMvdmlld3MvY29udHJvbHMuanMiLCIvaG9tZS9kYW5pZWwvd29ya3NwYWNlL3RvdWNoc3RvbmVqcy1zdGFydGVyL3NyYy9qcy92aWV3cy9mb3JtLmpzIiwiL2hvbWUvZGFuaWVsL3dvcmtzcGFjZS90b3VjaHN0b25lanMtc3RhcnRlci9zcmMvanMvdmlld3MvbGlzdC1jb21wbGV4LmpzIiwiL2hvbWUvZGFuaWVsL3dvcmtzcGFjZS90b3VjaHN0b25lanMtc3RhcnRlci9zcmMvanMvdmlld3MvbGlzdC1kZXRhaWxzLmpzIiwiL2hvbWUvZGFuaWVsL3dvcmtzcGFjZS90b3VjaHN0b25lanMtc3RhcnRlci9zcmMvanMvdmlld3MvbGlzdC1zaW1wbGUuanMiLCIvaG9tZS9kYW5pZWwvd29ya3NwYWNlL3RvdWNoc3RvbmVqcy1zdGFydGVyL3NyYy9qcy92aWV3cy9saXN0cy5qcyIsIi9ob21lL2RhbmllbC93b3Jrc3BhY2UvdG91Y2hzdG9uZWpzLXN0YXJ0ZXIvc3JjL2pzL3ZpZXdzL3RyYW5zaXRpb25zLXRhcmdldC1vdmVyLmpzIiwiL2hvbWUvZGFuaWVsL3dvcmtzcGFjZS90b3VjaHN0b25lanMtc3RhcnRlci9zcmMvanMvdmlld3MvdHJhbnNpdGlvbnMtdGFyZ2V0LmpzIiwiL2hvbWUvZGFuaWVsL3dvcmtzcGFjZS90b3VjaHN0b25lanMtc3RhcnRlci9zcmMvanMvdmlld3MvdHJhbnNpdGlvbnMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUNoeENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUMvREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDakhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNqTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUNUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeGNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9EQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdTQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4TkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDaEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDcHZCQSxJQUFJLEtBQUssR0FBRyxPQUFPLENBQUMsY0FBYyxDQUFDLENBQUM7O2VBT2hD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cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKiFcbiAqIGFzeW5jXG4gKiBodHRwczovL2dpdGh1Yi5jb20vY2FvbGFuL2FzeW5jXG4gKlxuICogQ29weXJpZ2h0IDIwMTAtMjAxNCBDYW9sYW4gTWNNYWhvblxuICogUmVsZWFzZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlXG4gKi9cbihmdW5jdGlvbiAoKSB7XG5cbiAgICB2YXIgYXN5bmMgPSB7fTtcbiAgICBmdW5jdGlvbiBub29wKCkge31cblxuICAgIC8vIGdsb2JhbCBvbiB0aGUgc2VydmVyLCB3aW5kb3cgaW4gdGhlIGJyb3dzZXJcbiAgICB2YXIgcHJldmlvdXNfYXN5bmM7XG5cbiAgICAvLyBFc3RhYmxpc2ggdGhlIHJvb3Qgb2JqZWN0LCBgd2luZG93YCAoYHNlbGZgKSBpbiB0aGUgYnJvd3NlciwgYGdsb2JhbGBcbiAgICAvLyBvbiB0aGUgc2VydmVyLCBvciBgdGhpc2AgaW4gc29tZSB2aXJ0dWFsIG1hY2hpbmVzLiBXZSB1c2UgYHNlbGZgXG4gICAgLy8gaW5zdGVhZCBvZiBgd2luZG93YCBmb3IgYFdlYldvcmtlcmAgc3VwcG9ydC5cbiAgICB2YXIgcm9vdCA9IHR5cGVvZiBzZWxmID09PSAnb2JqZWN0JyAmJiBzZWxmLnNlbGYgPT09IHNlbGYgJiYgc2VsZiB8fFxuICAgICAgICAgICAgdHlwZW9mIGdsb2JhbCA9PT0gJ29iamVjdCcgJiYgZ2xvYmFsLmdsb2JhbCA9PT0gZ2xvYmFsICYmIGdsb2JhbCB8fFxuICAgICAgICAgICAgdGhpcztcblxuICAgIGlmIChyb290ICE9IG51bGwpIHtcbiAgICAgICAgcHJldmlvdXNfYXN5bmMgPSByb290LmFzeW5jO1xuICAgIH1cblxuICAgIGFzeW5jLm5vQ29uZmxpY3QgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJvb3QuYXN5bmMgPSBwcmV2aW91c19hc3luYztcbiAgICAgICAgcmV0dXJuIGFzeW5jO1xuICAgIH07XG5cbiAgICBmdW5jdGlvbiBvbmx5X29uY2UoZm4pIHtcbiAgICAgICAgdmFyIGNhbGxlZCA9IGZhbHNlO1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpZiAoY2FsbGVkKSB0aHJvdyBuZXcgRXJyb3IoXCJDYWxsYmFjayB3YXMgYWxyZWFkeSBjYWxsZWQuXCIpO1xuICAgICAgICAgICAgY2FsbGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX29uY2UoZm4pIHtcbiAgICAgICAgdmFyIGNhbGxlZCA9IGZhbHNlO1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpZiAoY2FsbGVkKSByZXR1cm47XG4gICAgICAgICAgICBjYWxsZWQgPSB0cnVlO1xuICAgICAgICAgICAgZm4uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICAvLy8vIGNyb3NzLWJyb3dzZXIgY29tcGF0aWJsaXR5IGZ1bmN0aW9ucyAvLy8vXG5cbiAgICB2YXIgX3RvU3RyaW5nID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZztcblxuICAgIHZhciBfaXNBcnJheSA9IEFycmF5LmlzQXJyYXkgfHwgZnVuY3Rpb24gKG9iaikge1xuICAgICAgICByZXR1cm4gX3RvU3RyaW5nLmNhbGwob2JqKSA9PT0gJ1tvYmplY3QgQXJyYXldJztcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gX2lzQXJyYXlMaWtlKGFycikge1xuICAgICAgICByZXR1cm4gX2lzQXJyYXkoYXJyKSB8fCAoXG4gICAgICAgICAgICAvLyBoYXMgYSBwb3NpdGl2ZSBpbnRlZ2VyIGxlbmd0aCBwcm9wZXJ0eVxuICAgICAgICAgICAgdHlwZW9mIGFyci5sZW5ndGggPT09IFwibnVtYmVyXCIgJiZcbiAgICAgICAgICAgIGFyci5sZW5ndGggPj0gMCAmJlxuICAgICAgICAgICAgYXJyLmxlbmd0aCAlIDEgPT09IDBcbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfZWFjaChjb2xsLCBpdGVyYXRvcikge1xuICAgICAgICByZXR1cm4gX2lzQXJyYXlMaWtlKGNvbGwpID9cbiAgICAgICAgICAgIF9hcnJheUVhY2goY29sbCwgaXRlcmF0b3IpIDpcbiAgICAgICAgICAgIF9mb3JFYWNoT2YoY29sbCwgaXRlcmF0b3IpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIF9hcnJheUVhY2goYXJyLCBpdGVyYXRvcikge1xuICAgICAgICB2YXIgaW5kZXggPSAtMSxcbiAgICAgICAgICAgIGxlbmd0aCA9IGFyci5sZW5ndGg7XG5cbiAgICAgICAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcbiAgICAgICAgICAgIGl0ZXJhdG9yKGFycltpbmRleF0sIGluZGV4LCBhcnIpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX21hcChhcnIsIGl0ZXJhdG9yKSB7XG4gICAgICAgIHZhciBpbmRleCA9IC0xLFxuICAgICAgICAgICAgbGVuZ3RoID0gYXJyLmxlbmd0aCxcbiAgICAgICAgICAgIHJlc3VsdCA9IEFycmF5KGxlbmd0aCk7XG5cbiAgICAgICAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcbiAgICAgICAgICAgIHJlc3VsdFtpbmRleF0gPSBpdGVyYXRvcihhcnJbaW5kZXhdLCBpbmRleCwgYXJyKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIF9yYW5nZShjb3VudCkge1xuICAgICAgICByZXR1cm4gX21hcChBcnJheShjb3VudCksIGZ1bmN0aW9uICh2LCBpKSB7IHJldHVybiBpOyB9KTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfcmVkdWNlKGFyciwgaXRlcmF0b3IsIG1lbW8pIHtcbiAgICAgICAgX2FycmF5RWFjaChhcnIsIGZ1bmN0aW9uICh4LCBpLCBhKSB7XG4gICAgICAgICAgICBtZW1vID0gaXRlcmF0b3IobWVtbywgeCwgaSwgYSk7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gbWVtbztcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfZm9yRWFjaE9mKG9iamVjdCwgaXRlcmF0b3IpIHtcbiAgICAgICAgX2FycmF5RWFjaChfa2V5cyhvYmplY3QpLCBmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgICAgICBpdGVyYXRvcihvYmplY3Rba2V5XSwga2V5KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgdmFyIF9rZXlzID0gT2JqZWN0LmtleXMgfHwgZnVuY3Rpb24gKG9iaikge1xuICAgICAgICB2YXIga2V5cyA9IFtdO1xuICAgICAgICBmb3IgKHZhciBrIGluIG9iaikge1xuICAgICAgICAgICAgaWYgKG9iai5oYXNPd25Qcm9wZXJ0eShrKSkge1xuICAgICAgICAgICAgICAgIGtleXMucHVzaChrKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4ga2V5cztcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gX2tleUl0ZXJhdG9yKGNvbGwpIHtcbiAgICAgICAgdmFyIGkgPSAtMTtcbiAgICAgICAgdmFyIGxlbjtcbiAgICAgICAgdmFyIGtleXM7XG4gICAgICAgIGlmIChfaXNBcnJheUxpa2UoY29sbCkpIHtcbiAgICAgICAgICAgIGxlbiA9IGNvbGwubGVuZ3RoO1xuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIG5leHQoKSB7XG4gICAgICAgICAgICAgICAgaSsrO1xuICAgICAgICAgICAgICAgIHJldHVybiBpIDwgbGVuID8gaSA6IG51bGw7XG4gICAgICAgICAgICB9O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAga2V5cyA9IF9rZXlzKGNvbGwpO1xuICAgICAgICAgICAgbGVuID0ga2V5cy5sZW5ndGg7XG4gICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24gbmV4dCgpIHtcbiAgICAgICAgICAgICAgICBpKys7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGkgPCBsZW4gPyBrZXlzW2ldIDogbnVsbDtcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfYmFzZVNsaWNlKGFyciwgc3RhcnQpIHtcbiAgICAgICAgc3RhcnQgPSBzdGFydCB8fCAwO1xuICAgICAgICB2YXIgaW5kZXggPSAtMTtcbiAgICAgICAgdmFyIGxlbmd0aCA9IGFyci5sZW5ndGg7XG5cbiAgICAgICAgaWYgKHN0YXJ0KSB7XG4gICAgICAgICAgICBsZW5ndGggLT0gc3RhcnQ7XG4gICAgICAgICAgICBsZW5ndGggPSBsZW5ndGggPCAwID8gMCA6IGxlbmd0aDtcbiAgICAgICAgfVxuICAgICAgICB2YXIgcmVzdWx0ID0gQXJyYXkobGVuZ3RoKTtcblxuICAgICAgICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuICAgICAgICAgICAgcmVzdWx0W2luZGV4XSA9IGFycltpbmRleCArIHN0YXJ0XTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIF93aXRob3V0SW5kZXgoaXRlcmF0b3IpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICh2YWx1ZSwgaW5kZXgsIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICByZXR1cm4gaXRlcmF0b3IodmFsdWUsIGNhbGxiYWNrKTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICAvLy8vIGV4cG9ydGVkIGFzeW5jIG1vZHVsZSBmdW5jdGlvbnMgLy8vL1xuXG4gICAgLy8vLyBuZXh0VGljayBpbXBsZW1lbnRhdGlvbiB3aXRoIGJyb3dzZXItY29tcGF0aWJsZSBmYWxsYmFjayAvLy8vXG5cbiAgICAvLyBjYXB0dXJlIHRoZSBnbG9iYWwgcmVmZXJlbmNlIHRvIGd1YXJkIGFnYWluc3QgZmFrZVRpbWVyIG1vY2tzXG4gICAgdmFyIF9zZXRJbW1lZGlhdGU7XG4gICAgaWYgKHR5cGVvZiBzZXRJbW1lZGlhdGUgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgX3NldEltbWVkaWF0ZSA9IHNldEltbWVkaWF0ZTtcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIHByb2Nlc3MgPT09ICd1bmRlZmluZWQnIHx8ICEocHJvY2Vzcy5uZXh0VGljaykpIHtcbiAgICAgICAgaWYgKF9zZXRJbW1lZGlhdGUpIHtcbiAgICAgICAgICAgIGFzeW5jLm5leHRUaWNrID0gZnVuY3Rpb24gKGZuKSB7XG4gICAgICAgICAgICAgICAgLy8gbm90IGEgZGlyZWN0IGFsaWFzIGZvciBJRTEwIGNvbXBhdGliaWxpdHlcbiAgICAgICAgICAgICAgICBfc2V0SW1tZWRpYXRlKGZuKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBhc3luYy5zZXRJbW1lZGlhdGUgPSBhc3luYy5uZXh0VGljaztcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGFzeW5jLm5leHRUaWNrID0gZnVuY3Rpb24gKGZuKSB7XG4gICAgICAgICAgICAgICAgc2V0VGltZW91dChmbiwgMCk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgYXN5bmMuc2V0SW1tZWRpYXRlID0gYXN5bmMubmV4dFRpY2s7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGFzeW5jLm5leHRUaWNrID0gcHJvY2Vzcy5uZXh0VGljaztcbiAgICAgICAgaWYgKF9zZXRJbW1lZGlhdGUpIHtcbiAgICAgICAgICAgIGFzeW5jLnNldEltbWVkaWF0ZSA9IGZ1bmN0aW9uIChmbikge1xuICAgICAgICAgICAgICAvLyBub3QgYSBkaXJlY3QgYWxpYXMgZm9yIElFMTAgY29tcGF0aWJpbGl0eVxuICAgICAgICAgICAgICAgIF9zZXRJbW1lZGlhdGUoZm4pO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGFzeW5jLnNldEltbWVkaWF0ZSA9IGFzeW5jLm5leHRUaWNrO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgYXN5bmMuZm9yRWFjaCA9XG4gICAgYXN5bmMuZWFjaCA9IGZ1bmN0aW9uIChhcnIsIGl0ZXJhdG9yLCBjYWxsYmFjaykge1xuICAgICAgICByZXR1cm4gYXN5bmMuZWFjaE9mKGFyciwgX3dpdGhvdXRJbmRleChpdGVyYXRvciksIGNhbGxiYWNrKTtcbiAgICB9O1xuXG4gICAgYXN5bmMuZm9yRWFjaFNlcmllcyA9XG4gICAgYXN5bmMuZWFjaFNlcmllcyA9IGZ1bmN0aW9uIChhcnIsIGl0ZXJhdG9yLCBjYWxsYmFjaykge1xuICAgICAgICByZXR1cm4gYXN5bmMuZWFjaE9mU2VyaWVzKGFyciwgX3dpdGhvdXRJbmRleChpdGVyYXRvciksIGNhbGxiYWNrKTtcbiAgICB9O1xuXG5cbiAgICBhc3luYy5mb3JFYWNoTGltaXQgPVxuICAgIGFzeW5jLmVhY2hMaW1pdCA9IGZ1bmN0aW9uIChhcnIsIGxpbWl0LCBpdGVyYXRvciwgY2FsbGJhY2spIHtcbiAgICAgICAgcmV0dXJuIF9lYWNoT2ZMaW1pdChsaW1pdCkoYXJyLCBfd2l0aG91dEluZGV4KGl0ZXJhdG9yKSwgY2FsbGJhY2spO1xuICAgIH07XG5cbiAgICBhc3luYy5mb3JFYWNoT2YgPVxuICAgIGFzeW5jLmVhY2hPZiA9IGZ1bmN0aW9uIChvYmplY3QsIGl0ZXJhdG9yLCBjYWxsYmFjaykge1xuICAgICAgICBjYWxsYmFjayA9IF9vbmNlKGNhbGxiYWNrIHx8IG5vb3ApO1xuICAgICAgICBvYmplY3QgPSBvYmplY3QgfHwgW107XG4gICAgICAgIHZhciBzaXplID0gX2lzQXJyYXlMaWtlKG9iamVjdCkgPyBvYmplY3QubGVuZ3RoIDogX2tleXMob2JqZWN0KS5sZW5ndGg7XG4gICAgICAgIHZhciBjb21wbGV0ZWQgPSAwO1xuICAgICAgICBpZiAoIXNpemUpIHtcbiAgICAgICAgICAgIHJldHVybiBjYWxsYmFjayhudWxsKTtcbiAgICAgICAgfVxuICAgICAgICBfZWFjaChvYmplY3QsIGZ1bmN0aW9uICh2YWx1ZSwga2V5KSB7XG4gICAgICAgICAgICBpdGVyYXRvcihvYmplY3Rba2V5XSwga2V5LCBvbmx5X29uY2UoZG9uZSkpO1xuICAgICAgICB9KTtcbiAgICAgICAgZnVuY3Rpb24gZG9uZShlcnIpIHtcbiAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICBjYWxsYmFjayhlcnIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgY29tcGxldGVkICs9IDE7XG4gICAgICAgICAgICAgICAgaWYgKGNvbXBsZXRlZCA+PSBzaXplKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKG51bGwpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBhc3luYy5mb3JFYWNoT2ZTZXJpZXMgPVxuICAgIGFzeW5jLmVhY2hPZlNlcmllcyA9IGZ1bmN0aW9uIChvYmosIGl0ZXJhdG9yLCBjYWxsYmFjaykge1xuICAgICAgICBjYWxsYmFjayA9IF9vbmNlKGNhbGxiYWNrIHx8IG5vb3ApO1xuICAgICAgICBvYmogPSBvYmogfHwgW107XG4gICAgICAgIHZhciBuZXh0S2V5ID0gX2tleUl0ZXJhdG9yKG9iaik7XG4gICAgICAgIHZhciBrZXkgPSBuZXh0S2V5KCk7XG4gICAgICAgIGZ1bmN0aW9uIGl0ZXJhdGUoKSB7XG4gICAgICAgICAgICB2YXIgc3luYyA9IHRydWU7XG4gICAgICAgICAgICBpZiAoa2V5ID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKG51bGwpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaXRlcmF0b3Iob2JqW2tleV0sIGtleSwgb25seV9vbmNlKGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKGVycik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBrZXkgPSBuZXh0S2V5KCk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChrZXkgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBjYWxsYmFjayhudWxsKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzeW5jKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXN5bmMubmV4dFRpY2soaXRlcmF0ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZXJhdGUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgIHN5bmMgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpdGVyYXRlKCk7XG4gICAgfTtcblxuXG5cbiAgICBhc3luYy5mb3JFYWNoT2ZMaW1pdCA9XG4gICAgYXN5bmMuZWFjaE9mTGltaXQgPSBmdW5jdGlvbiAob2JqLCBsaW1pdCwgaXRlcmF0b3IsIGNhbGxiYWNrKSB7XG4gICAgICAgIF9lYWNoT2ZMaW1pdChsaW1pdCkob2JqLCBpdGVyYXRvciwgY2FsbGJhY2spO1xuICAgIH07XG5cbiAgICBmdW5jdGlvbiBfZWFjaE9mTGltaXQobGltaXQpIHtcblxuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKG9iaiwgaXRlcmF0b3IsIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICBjYWxsYmFjayA9IF9vbmNlKGNhbGxiYWNrIHx8IG5vb3ApO1xuICAgICAgICAgICAgb2JqID0gb2JqIHx8IFtdO1xuICAgICAgICAgICAgdmFyIG5leHRLZXkgPSBfa2V5SXRlcmF0b3Iob2JqKTtcbiAgICAgICAgICAgIGlmIChsaW1pdCA8PSAwKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKG51bGwpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIGRvbmUgPSBmYWxzZTtcbiAgICAgICAgICAgIHZhciBydW5uaW5nID0gMDtcbiAgICAgICAgICAgIHZhciBlcnJvcmVkID0gZmFsc2U7XG5cbiAgICAgICAgICAgIChmdW5jdGlvbiByZXBsZW5pc2ggKCkge1xuICAgICAgICAgICAgICAgIGlmIChkb25lICYmIHJ1bm5pbmcgPD0gMCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gY2FsbGJhY2sobnVsbCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgd2hpbGUgKHJ1bm5pbmcgPCBsaW1pdCAmJiAhZXJyb3JlZCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIga2V5ID0gbmV4dEtleSgpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoa2V5ID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkb25lID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChydW5uaW5nIDw9IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhudWxsKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBydW5uaW5nICs9IDE7XG4gICAgICAgICAgICAgICAgICAgIGl0ZXJhdG9yKG9ialtrZXldLCBrZXksIG9ubHlfb25jZShmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBydW5uaW5nIC09IDE7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soZXJyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvcmVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlcGxlbmlzaCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSkoKTtcbiAgICAgICAgfTtcbiAgICB9XG5cblxuICAgIGZ1bmN0aW9uIGRvUGFyYWxsZWwoZm4pIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChvYmosIGl0ZXJhdG9yLCBjYWxsYmFjaykge1xuICAgICAgICAgICAgcmV0dXJuIGZuKGFzeW5jLmVhY2hPZiwgb2JqLCBpdGVyYXRvciwgY2FsbGJhY2spO1xuICAgICAgICB9O1xuICAgIH1cbiAgICBmdW5jdGlvbiBkb1BhcmFsbGVsTGltaXQobGltaXQsIGZuKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAob2JqLCBpdGVyYXRvciwgY2FsbGJhY2spIHtcbiAgICAgICAgICAgIHJldHVybiBmbihfZWFjaE9mTGltaXQobGltaXQpLCBvYmosIGl0ZXJhdG9yLCBjYWxsYmFjayk7XG4gICAgICAgIH07XG4gICAgfVxuICAgIGZ1bmN0aW9uIGRvU2VyaWVzKGZuKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAob2JqLCBpdGVyYXRvciwgY2FsbGJhY2spIHtcbiAgICAgICAgICAgIHJldHVybiBmbihhc3luYy5lYWNoT2ZTZXJpZXMsIG9iaiwgaXRlcmF0b3IsIGNhbGxiYWNrKTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfYXN5bmNNYXAoZWFjaGZuLCBhcnIsIGl0ZXJhdG9yLCBjYWxsYmFjaykge1xuICAgICAgICBjYWxsYmFjayA9IF9vbmNlKGNhbGxiYWNrIHx8IG5vb3ApO1xuICAgICAgICB2YXIgcmVzdWx0cyA9IFtdO1xuICAgICAgICBlYWNoZm4oYXJyLCBmdW5jdGlvbiAodmFsdWUsIGluZGV4LCBjYWxsYmFjaykge1xuICAgICAgICAgICAgaXRlcmF0b3IodmFsdWUsIGZ1bmN0aW9uIChlcnIsIHYpIHtcbiAgICAgICAgICAgICAgICByZXN1bHRzW2luZGV4XSA9IHY7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2soZXJyKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LCBmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgICAgICBjYWxsYmFjayhlcnIsIHJlc3VsdHMpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBhc3luYy5tYXAgPSBkb1BhcmFsbGVsKF9hc3luY01hcCk7XG4gICAgYXN5bmMubWFwU2VyaWVzID0gZG9TZXJpZXMoX2FzeW5jTWFwKTtcbiAgICBhc3luYy5tYXBMaW1pdCA9IGZ1bmN0aW9uIChhcnIsIGxpbWl0LCBpdGVyYXRvciwgY2FsbGJhY2spIHtcbiAgICAgICAgcmV0dXJuIF9tYXBMaW1pdChsaW1pdCkoYXJyLCBpdGVyYXRvciwgY2FsbGJhY2spO1xuICAgIH07XG5cbiAgICBmdW5jdGlvbiBfbWFwTGltaXQobGltaXQpIHtcbiAgICAgICAgcmV0dXJuIGRvUGFyYWxsZWxMaW1pdChsaW1pdCwgX2FzeW5jTWFwKTtcbiAgICB9XG5cbiAgICAvLyByZWR1Y2Ugb25seSBoYXMgYSBzZXJpZXMgdmVyc2lvbiwgYXMgZG9pbmcgcmVkdWNlIGluIHBhcmFsbGVsIHdvbid0XG4gICAgLy8gd29yayBpbiBtYW55IHNpdHVhdGlvbnMuXG4gICAgYXN5bmMuaW5qZWN0ID1cbiAgICBhc3luYy5mb2xkbCA9XG4gICAgYXN5bmMucmVkdWNlID0gZnVuY3Rpb24gKGFyciwgbWVtbywgaXRlcmF0b3IsIGNhbGxiYWNrKSB7XG4gICAgICAgIGFzeW5jLmVhY2hPZlNlcmllcyhhcnIsIGZ1bmN0aW9uICh4LCBpLCBjYWxsYmFjaykge1xuICAgICAgICAgICAgaXRlcmF0b3IobWVtbywgeCwgZnVuY3Rpb24gKGVyciwgdikge1xuICAgICAgICAgICAgICAgIG1lbW8gPSB2O1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrKGVycik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSwgZnVuY3Rpb24gKGVycikge1xuICAgICAgICAgICAgY2FsbGJhY2soZXJyIHx8IG51bGwsIG1lbW8pO1xuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgYXN5bmMuZm9sZHIgPVxuICAgIGFzeW5jLnJlZHVjZVJpZ2h0ID0gZnVuY3Rpb24gKGFyciwgbWVtbywgaXRlcmF0b3IsIGNhbGxiYWNrKSB7XG4gICAgICAgIHZhciByZXZlcnNlZCA9IF9tYXAoYXJyLCBmdW5jdGlvbiAoeCkge1xuICAgICAgICAgICAgcmV0dXJuIHg7XG4gICAgICAgIH0pLnJldmVyc2UoKTtcbiAgICAgICAgYXN5bmMucmVkdWNlKHJldmVyc2VkLCBtZW1vLCBpdGVyYXRvciwgY2FsbGJhY2spO1xuICAgIH07XG5cbiAgICBmdW5jdGlvbiBfZmlsdGVyKGVhY2hmbiwgYXJyLCBpdGVyYXRvciwgY2FsbGJhY2spIHtcbiAgICAgICAgdmFyIHJlc3VsdHMgPSBbXTtcbiAgICAgICAgYXJyID0gX21hcChhcnIsIGZ1bmN0aW9uICh4LCBpKSB7XG4gICAgICAgICAgICByZXR1cm4ge2luZGV4OiBpLCB2YWx1ZTogeH07XG4gICAgICAgIH0pO1xuICAgICAgICBlYWNoZm4oYXJyLCBmdW5jdGlvbiAoeCwgaW5kZXgsIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICBpdGVyYXRvcih4LnZhbHVlLCBmdW5jdGlvbiAodikge1xuICAgICAgICAgICAgICAgIGlmICh2KSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdHMucHVzaCh4KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBjYWxsYmFjayhfbWFwKHJlc3VsdHMuc29ydChmdW5jdGlvbiAoYSwgYikge1xuICAgICAgICAgICAgICAgIHJldHVybiBhLmluZGV4IC0gYi5pbmRleDtcbiAgICAgICAgICAgIH0pLCBmdW5jdGlvbiAoeCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB4LnZhbHVlO1xuICAgICAgICAgICAgfSkpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBhc3luYy5zZWxlY3QgPVxuICAgIGFzeW5jLmZpbHRlciA9IGRvUGFyYWxsZWwoX2ZpbHRlcik7XG5cbiAgICBhc3luYy5zZWxlY3RTZXJpZXMgPVxuICAgIGFzeW5jLmZpbHRlclNlcmllcyA9IGRvU2VyaWVzKF9maWx0ZXIpO1xuXG4gICAgZnVuY3Rpb24gX3JlamVjdChlYWNoZm4sIGFyciwgaXRlcmF0b3IsIGNhbGxiYWNrKSB7XG4gICAgICAgIF9maWx0ZXIoZWFjaGZuLCBhcnIsIGZ1bmN0aW9uKHZhbHVlLCBjYikge1xuICAgICAgICAgICAgaXRlcmF0b3IodmFsdWUsIGZ1bmN0aW9uKHYpIHtcbiAgICAgICAgICAgICAgICBjYighdik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSwgY2FsbGJhY2spO1xuICAgIH1cbiAgICBhc3luYy5yZWplY3QgPSBkb1BhcmFsbGVsKF9yZWplY3QpO1xuICAgIGFzeW5jLnJlamVjdFNlcmllcyA9IGRvU2VyaWVzKF9yZWplY3QpO1xuXG4gICAgZnVuY3Rpb24gX2RldGVjdChlYWNoZm4sIGFyciwgaXRlcmF0b3IsIG1haW5fY2FsbGJhY2spIHtcbiAgICAgICAgZWFjaGZuKGFyciwgZnVuY3Rpb24gKHgsIGluZGV4LCBjYWxsYmFjaykge1xuICAgICAgICAgICAgaXRlcmF0b3IoeCwgZnVuY3Rpb24gKHJlc3VsdCkge1xuICAgICAgICAgICAgICAgIGlmIChyZXN1bHQpIHtcbiAgICAgICAgICAgICAgICAgICAgbWFpbl9jYWxsYmFjayh4KTtcbiAgICAgICAgICAgICAgICAgICAgbWFpbl9jYWxsYmFjayA9IG5vb3A7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBtYWluX2NhbGxiYWNrKCk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBhc3luYy5kZXRlY3QgPSBkb1BhcmFsbGVsKF9kZXRlY3QpO1xuICAgIGFzeW5jLmRldGVjdFNlcmllcyA9IGRvU2VyaWVzKF9kZXRlY3QpO1xuXG4gICAgYXN5bmMuYW55ID1cbiAgICBhc3luYy5zb21lID0gZnVuY3Rpb24gKGFyciwgaXRlcmF0b3IsIG1haW5fY2FsbGJhY2spIHtcbiAgICAgICAgYXN5bmMuZWFjaE9mKGFyciwgZnVuY3Rpb24gKHgsIF8sIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICBpdGVyYXRvcih4LCBmdW5jdGlvbiAodikge1xuICAgICAgICAgICAgICAgIGlmICh2KSB7XG4gICAgICAgICAgICAgICAgICAgIG1haW5fY2FsbGJhY2sodHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgIG1haW5fY2FsbGJhY2sgPSBub29wO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIG1haW5fY2FsbGJhY2soZmFsc2UpO1xuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgYXN5bmMuYWxsID1cbiAgICBhc3luYy5ldmVyeSA9IGZ1bmN0aW9uIChhcnIsIGl0ZXJhdG9yLCBtYWluX2NhbGxiYWNrKSB7XG4gICAgICAgIGFzeW5jLmVhY2hPZihhcnIsIGZ1bmN0aW9uICh4LCBfLCBjYWxsYmFjaykge1xuICAgICAgICAgICAgaXRlcmF0b3IoeCwgZnVuY3Rpb24gKHYpIHtcbiAgICAgICAgICAgICAgICBpZiAoIXYpIHtcbiAgICAgICAgICAgICAgICAgICAgbWFpbl9jYWxsYmFjayhmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgIG1haW5fY2FsbGJhY2sgPSBub29wO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIG1haW5fY2FsbGJhY2sodHJ1ZSk7XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBhc3luYy5zb3J0QnkgPSBmdW5jdGlvbiAoYXJyLCBpdGVyYXRvciwgY2FsbGJhY2spIHtcbiAgICAgICAgYXN5bmMubWFwKGFyciwgZnVuY3Rpb24gKHgsIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICBpdGVyYXRvcih4LCBmdW5jdGlvbiAoZXJyLCBjcml0ZXJpYSkge1xuICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soZXJyKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKG51bGwsIHt2YWx1ZTogeCwgY3JpdGVyaWE6IGNyaXRlcmlhfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sIGZ1bmN0aW9uIChlcnIsIHJlc3VsdHMpIHtcbiAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gY2FsbGJhY2soZXJyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrKG51bGwsIF9tYXAocmVzdWx0cy5zb3J0KGNvbXBhcmF0b3IpLCBmdW5jdGlvbiAoeCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4geC52YWx1ZTtcbiAgICAgICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfSk7XG5cbiAgICAgICAgZnVuY3Rpb24gY29tcGFyYXRvcihsZWZ0LCByaWdodCkge1xuICAgICAgICAgICAgdmFyIGEgPSBsZWZ0LmNyaXRlcmlhLCBiID0gcmlnaHQuY3JpdGVyaWE7XG4gICAgICAgICAgICByZXR1cm4gYSA8IGIgPyAtMSA6IGEgPiBiID8gMSA6IDA7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgYXN5bmMuYXV0byA9IGZ1bmN0aW9uICh0YXNrcywgY2FsbGJhY2spIHtcbiAgICAgICAgY2FsbGJhY2sgPSBfb25jZShjYWxsYmFjayB8fCBub29wKTtcbiAgICAgICAgdmFyIGtleXMgPSBfa2V5cyh0YXNrcyk7XG4gICAgICAgIHZhciByZW1haW5pbmdUYXNrcyA9IGtleXMubGVuZ3RoO1xuICAgICAgICBpZiAoIXJlbWFpbmluZ1Rhc2tzKSB7XG4gICAgICAgICAgICByZXR1cm4gY2FsbGJhY2sobnVsbCk7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgcmVzdWx0cyA9IHt9O1xuXG4gICAgICAgIHZhciBsaXN0ZW5lcnMgPSBbXTtcbiAgICAgICAgZnVuY3Rpb24gYWRkTGlzdGVuZXIoZm4pIHtcbiAgICAgICAgICAgIGxpc3RlbmVycy51bnNoaWZ0KGZuKTtcbiAgICAgICAgfVxuICAgICAgICBmdW5jdGlvbiByZW1vdmVMaXN0ZW5lcihmbikge1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsaXN0ZW5lcnMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgICAgICAgICBpZiAobGlzdGVuZXJzW2ldID09PSBmbikge1xuICAgICAgICAgICAgICAgICAgICBsaXN0ZW5lcnMuc3BsaWNlKGksIDEpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGZ1bmN0aW9uIHRhc2tDb21wbGV0ZSgpIHtcbiAgICAgICAgICAgIHJlbWFpbmluZ1Rhc2tzLS07XG4gICAgICAgICAgICBfYXJyYXlFYWNoKGxpc3RlbmVycy5zbGljZSgwKSwgZnVuY3Rpb24gKGZuKSB7XG4gICAgICAgICAgICAgICAgZm4oKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgYWRkTGlzdGVuZXIoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYgKCFyZW1haW5pbmdUYXNrcykge1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrKG51bGwsIHJlc3VsdHMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICBfYXJyYXlFYWNoKGtleXMsIGZ1bmN0aW9uIChrKSB7XG4gICAgICAgICAgICB2YXIgdGFzayA9IF9pc0FycmF5KHRhc2tzW2tdKSA/IHRhc2tzW2tdOiBbdGFza3Nba11dO1xuICAgICAgICAgICAgZnVuY3Rpb24gdGFza0NhbGxiYWNrKGVycikge1xuICAgICAgICAgICAgICAgIHZhciBhcmdzID0gX2Jhc2VTbGljZShhcmd1bWVudHMsIDEpO1xuICAgICAgICAgICAgICAgIGlmIChhcmdzLmxlbmd0aCA8PSAxKSB7XG4gICAgICAgICAgICAgICAgICAgIGFyZ3MgPSBhcmdzWzBdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBzYWZlUmVzdWx0cyA9IHt9O1xuICAgICAgICAgICAgICAgICAgICBfYXJyYXlFYWNoKF9rZXlzKHJlc3VsdHMpLCBmdW5jdGlvbihya2V5KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzYWZlUmVzdWx0c1tya2V5XSA9IHJlc3VsdHNbcmtleV07XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBzYWZlUmVzdWx0c1trXSA9IGFyZ3M7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKGVyciwgc2FmZVJlc3VsdHMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0c1trXSA9IGFyZ3M7XG4gICAgICAgICAgICAgICAgICAgIGFzeW5jLnNldEltbWVkaWF0ZSh0YXNrQ29tcGxldGUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciByZXF1aXJlcyA9IHRhc2suc2xpY2UoMCwgTWF0aC5hYnModGFzay5sZW5ndGggLSAxKSkgfHwgW107XG4gICAgICAgICAgICAvLyBwcmV2ZW50IGRlYWQtbG9ja3NcbiAgICAgICAgICAgIHZhciBsZW4gPSByZXF1aXJlcy5sZW5ndGg7XG4gICAgICAgICAgICB2YXIgZGVwO1xuICAgICAgICAgICAgd2hpbGUgKGxlbi0tKSB7XG4gICAgICAgICAgICAgICAgaWYgKCEoZGVwID0gdGFza3NbcmVxdWlyZXNbbGVuXV0pKSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignSGFzIGluZXhpc3RhbnQgZGVwZW5kZW5jeScpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoX2lzQXJyYXkoZGVwKSAmJiAhIX5kZXAuaW5kZXhPZihrKSkge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0hhcyBjeWNsaWMgZGVwZW5kZW5jaWVzJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZnVuY3Rpb24gcmVhZHkoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9yZWR1Y2UocmVxdWlyZXMsIGZ1bmN0aW9uIChhLCB4KSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAoYSAmJiByZXN1bHRzLmhhc093blByb3BlcnR5KHgpKTtcbiAgICAgICAgICAgICAgICB9LCB0cnVlKSAmJiAhcmVzdWx0cy5oYXNPd25Qcm9wZXJ0eShrKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChyZWFkeSgpKSB7XG4gICAgICAgICAgICAgICAgdGFza1t0YXNrLmxlbmd0aCAtIDFdKHRhc2tDYWxsYmFjaywgcmVzdWx0cyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBhZGRMaXN0ZW5lcihsaXN0ZW5lcik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmdW5jdGlvbiBsaXN0ZW5lcigpIHtcbiAgICAgICAgICAgICAgICBpZiAocmVhZHkoKSkge1xuICAgICAgICAgICAgICAgICAgICByZW1vdmVMaXN0ZW5lcihsaXN0ZW5lcik7XG4gICAgICAgICAgICAgICAgICAgIHRhc2tbdGFzay5sZW5ndGggLSAxXSh0YXNrQ2FsbGJhY2ssIHJlc3VsdHMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfTtcblxuXG5cbiAgICBhc3luYy5yZXRyeSA9IGZ1bmN0aW9uKC8qW3RpbWVzLF0gdGFzayBbLCBjYWxsYmFja10qLykge1xuICAgICAgICB2YXIgREVGQVVMVF9USU1FUyA9IDU7XG4gICAgICAgIHZhciBERUZBVUxUX0lOVEVSVkFMID0gMDtcblxuICAgICAgICB2YXIgYXR0ZW1wdHMgPSBbXTtcblxuICAgICAgICB2YXIgb3B0cyA9IHtcbiAgICAgICAgICB0aW1lczogREVGQVVMVF9USU1FUyxcbiAgICAgICAgICBpbnRlcnZhbDogREVGQVVMVF9JTlRFUlZBTFxuICAgICAgICB9O1xuXG4gICAgICAgIGZ1bmN0aW9uIHBhcnNlVGltZXMoYWNjLCB0KXtcbiAgICAgICAgICBpZih0eXBlb2YgdCA9PT0gJ251bWJlcicpe1xuICAgICAgICAgICAgYWNjLnRpbWVzID0gcGFyc2VJbnQodCwgMTApIHx8IERFRkFVTFRfVElNRVM7XG4gICAgICAgICAgfSBlbHNlIGlmKHR5cGVvZiB0ID09PSAnb2JqZWN0Jyl7XG4gICAgICAgICAgICBhY2MudGltZXMgPSBwYXJzZUludCh0LnRpbWVzLCAxMCkgfHwgREVGQVVMVF9USU1FUztcbiAgICAgICAgICAgIGFjYy5pbnRlcnZhbCA9IHBhcnNlSW50KHQuaW50ZXJ2YWwsIDEwKSB8fCBERUZBVUxUX0lOVEVSVkFMO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1Vuc3VwcG9ydGVkIGFyZ3VtZW50IHR5cGUgZm9yIFxcJ3RpbWVzXFwnOiAnICsgdHlwZW9mKHQpKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBzd2l0Y2goYXJndW1lbnRzLmxlbmd0aCl7XG4gICAgICAgICAgICBjYXNlIDE6IHtcbiAgICAgICAgICAgICAgb3B0cy50YXNrID0gYXJndW1lbnRzWzBdO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhc2UgMiA6IHtcbiAgICAgICAgICAgICAgaWYodHlwZW9mIGFyZ3VtZW50c1swXSA9PT0gJ251bWJlcicgfHwgdHlwZW9mIGFyZ3VtZW50c1swXSA9PT0gJ29iamVjdCcpe1xuICAgICAgICAgICAgICAgIHBhcnNlVGltZXMob3B0cywgYXJndW1lbnRzWzBdKTtcbiAgICAgICAgICAgICAgICBvcHRzLnRhc2sgPSBhcmd1bWVudHNbMV07XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgb3B0cy50YXNrID0gYXJndW1lbnRzWzBdO1xuICAgICAgICAgICAgICAgIG9wdHMuY2FsbGJhY2sgPSBhcmd1bWVudHNbMV07XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXNlIDM6IHtcbiAgICAgICAgICAgICAgcGFyc2VUaW1lcyhvcHRzLCBhcmd1bWVudHNbMF0pO1xuICAgICAgICAgICAgICBvcHRzLnRhc2sgPSBhcmd1bWVudHNbMV07XG4gICAgICAgICAgICAgIG9wdHMuY2FsbGJhY2sgPSBhcmd1bWVudHNbMl07XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZGVmYXVsdDoge1xuICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgYXJndW1lbnRzIC0gbXVzdCBiZSBlaXRoZXIgKHRhc2spLCAodGFzaywgY2FsbGJhY2spLCAodGltZXMsIHRhc2spIG9yICh0aW1lcywgdGFzaywgY2FsbGJhY2spJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIHdyYXBwZWRUYXNrKHdyYXBwZWRDYWxsYmFjaywgd3JhcHBlZFJlc3VsdHMpIHtcbiAgICAgICAgICAgIGZ1bmN0aW9uIHJldHJ5QXR0ZW1wdCh0YXNrLCBmaW5hbEF0dGVtcHQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oc2VyaWVzQ2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgICAgICAgdGFzayhmdW5jdGlvbihlcnIsIHJlc3VsdCl7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZXJpZXNDYWxsYmFjayghZXJyIHx8IGZpbmFsQXR0ZW1wdCwge2VycjogZXJyLCByZXN1bHQ6IHJlc3VsdH0pO1xuICAgICAgICAgICAgICAgICAgICB9LCB3cmFwcGVkUmVzdWx0cyk7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZnVuY3Rpb24gcmV0cnlJbnRlcnZhbChpbnRlcnZhbCl7XG4gICAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbihzZXJpZXNDYWxsYmFjayl7XG4gICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgICAgc2VyaWVzQ2FsbGJhY2sobnVsbCk7XG4gICAgICAgICAgICAgICAgfSwgaW50ZXJ2YWwpO1xuICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB3aGlsZSAob3B0cy50aW1lcykge1xuXG4gICAgICAgICAgICAgICAgdmFyIGZpbmFsQXR0ZW1wdCA9ICEob3B0cy50aW1lcy09MSk7XG4gICAgICAgICAgICAgICAgYXR0ZW1wdHMucHVzaChyZXRyeUF0dGVtcHQob3B0cy50YXNrLCBmaW5hbEF0dGVtcHQpKTtcbiAgICAgICAgICAgICAgICBpZighZmluYWxBdHRlbXB0ICYmIG9wdHMuaW50ZXJ2YWwgPiAwKXtcbiAgICAgICAgICAgICAgICAgIGF0dGVtcHRzLnB1c2gocmV0cnlJbnRlcnZhbChvcHRzLmludGVydmFsKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBhc3luYy5zZXJpZXMoYXR0ZW1wdHMsIGZ1bmN0aW9uKGRvbmUsIGRhdGEpe1xuICAgICAgICAgICAgICAgIGRhdGEgPSBkYXRhW2RhdGEubGVuZ3RoIC0gMV07XG4gICAgICAgICAgICAgICAgKHdyYXBwZWRDYWxsYmFjayB8fCBvcHRzLmNhbGxiYWNrKShkYXRhLmVyciwgZGF0YS5yZXN1bHQpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBJZiBhIGNhbGxiYWNrIGlzIHBhc3NlZCwgcnVuIHRoaXMgYXMgYSBjb250cm9sbCBmbG93XG4gICAgICAgIHJldHVybiBvcHRzLmNhbGxiYWNrID8gd3JhcHBlZFRhc2soKSA6IHdyYXBwZWRUYXNrO1xuICAgIH07XG5cbiAgICBhc3luYy53YXRlcmZhbGwgPSBmdW5jdGlvbiAodGFza3MsIGNhbGxiYWNrKSB7XG4gICAgICAgIGNhbGxiYWNrID0gX29uY2UoY2FsbGJhY2sgfHwgbm9vcCk7XG4gICAgICAgIGlmICghX2lzQXJyYXkodGFza3MpKSB7XG4gICAgICAgICAgICB2YXIgZXJyID0gbmV3IEVycm9yKCdGaXJzdCBhcmd1bWVudCB0byB3YXRlcmZhbGwgbXVzdCBiZSBhbiBhcnJheSBvZiBmdW5jdGlvbnMnKTtcbiAgICAgICAgICAgIHJldHVybiBjYWxsYmFjayhlcnIpO1xuICAgICAgICB9XG4gICAgICAgIGlmICghdGFza3MubGVuZ3RoKSB7XG4gICAgICAgICAgICByZXR1cm4gY2FsbGJhY2soKTtcbiAgICAgICAgfVxuICAgICAgICBmdW5jdGlvbiB3cmFwSXRlcmF0b3IoaXRlcmF0b3IpIHtcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjay5hcHBseShudWxsLCBhcmd1bWVudHMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGFyZ3MgPSBfYmFzZVNsaWNlKGFyZ3VtZW50cywgMSk7XG4gICAgICAgICAgICAgICAgICAgIHZhciBuZXh0ID0gaXRlcmF0b3IubmV4dCgpO1xuICAgICAgICAgICAgICAgICAgICBpZiAobmV4dCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgYXJncy5wdXNoKHdyYXBJdGVyYXRvcihuZXh0KSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhcmdzLnB1c2goY2FsbGJhY2spO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVuc3VyZUFzeW5jKGl0ZXJhdG9yKS5hcHBseShudWxsLCBhcmdzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIHdyYXBJdGVyYXRvcihhc3luYy5pdGVyYXRvcih0YXNrcykpKCk7XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIF9wYXJhbGxlbChlYWNoZm4sIHRhc2tzLCBjYWxsYmFjaykge1xuICAgICAgICBjYWxsYmFjayA9IGNhbGxiYWNrIHx8IG5vb3A7XG4gICAgICAgIHZhciByZXN1bHRzID0gX2lzQXJyYXlMaWtlKHRhc2tzKSA/IFtdIDoge307XG5cbiAgICAgICAgZWFjaGZuKHRhc2tzLCBmdW5jdGlvbiAodGFzaywga2V5LCBjYWxsYmFjaykge1xuICAgICAgICAgICAgdGFzayhmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgdmFyIGFyZ3MgPSBfYmFzZVNsaWNlKGFyZ3VtZW50cywgMSk7XG4gICAgICAgICAgICAgICAgaWYgKGFyZ3MubGVuZ3RoIDw9IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgYXJncyA9IGFyZ3NbMF07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJlc3VsdHNba2V5XSA9IGFyZ3M7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2soZXJyKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LCBmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgICAgICBjYWxsYmFjayhlcnIsIHJlc3VsdHMpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBhc3luYy5wYXJhbGxlbCA9IGZ1bmN0aW9uICh0YXNrcywgY2FsbGJhY2spIHtcbiAgICAgICAgX3BhcmFsbGVsKGFzeW5jLmVhY2hPZiwgdGFza3MsIGNhbGxiYWNrKTtcbiAgICB9O1xuXG4gICAgYXN5bmMucGFyYWxsZWxMaW1pdCA9IGZ1bmN0aW9uKHRhc2tzLCBsaW1pdCwgY2FsbGJhY2spIHtcbiAgICAgICAgX3BhcmFsbGVsKF9lYWNoT2ZMaW1pdChsaW1pdCksIHRhc2tzLCBjYWxsYmFjayk7XG4gICAgfTtcblxuICAgIGFzeW5jLnNlcmllcyA9IGZ1bmN0aW9uICh0YXNrcywgY2FsbGJhY2spIHtcbiAgICAgICAgY2FsbGJhY2sgPSBjYWxsYmFjayB8fCBub29wO1xuICAgICAgICB2YXIgcmVzdWx0cyA9IF9pc0FycmF5TGlrZSh0YXNrcykgPyBbXSA6IHt9O1xuXG4gICAgICAgIGFzeW5jLmVhY2hPZlNlcmllcyh0YXNrcywgZnVuY3Rpb24gKHRhc2ssIGtleSwgY2FsbGJhY2spIHtcbiAgICAgICAgICAgIHRhc2soZnVuY3Rpb24gKGVycikge1xuICAgICAgICAgICAgICAgIHZhciBhcmdzID0gX2Jhc2VTbGljZShhcmd1bWVudHMsIDEpO1xuICAgICAgICAgICAgICAgIGlmIChhcmdzLmxlbmd0aCA8PSAxKSB7XG4gICAgICAgICAgICAgICAgICAgIGFyZ3MgPSBhcmdzWzBdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXN1bHRzW2tleV0gPSBhcmdzO1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrKGVycik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSwgZnVuY3Rpb24gKGVycikge1xuICAgICAgICAgICAgY2FsbGJhY2soZXJyLCByZXN1bHRzKTtcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIGFzeW5jLml0ZXJhdG9yID0gZnVuY3Rpb24gKHRhc2tzKSB7XG4gICAgICAgIGZ1bmN0aW9uIG1ha2VDYWxsYmFjayhpbmRleCkge1xuICAgICAgICAgICAgZnVuY3Rpb24gZm4oKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRhc2tzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICB0YXNrc1tpbmRleF0uYXBwbHkobnVsbCwgYXJndW1lbnRzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZuLm5leHQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZuLm5leHQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIChpbmRleCA8IHRhc2tzLmxlbmd0aCAtIDEpID8gbWFrZUNhbGxiYWNrKGluZGV4ICsgMSk6IG51bGw7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgcmV0dXJuIGZuO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBtYWtlQ2FsbGJhY2soMCk7XG4gICAgfTtcblxuICAgIGFzeW5jLmFwcGx5ID0gZnVuY3Rpb24gKGZuKSB7XG4gICAgICAgIHZhciBhcmdzID0gX2Jhc2VTbGljZShhcmd1bWVudHMsIDEpO1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIGZuLmFwcGx5KFxuICAgICAgICAgICAgICAgIG51bGwsIGFyZ3MuY29uY2F0KF9iYXNlU2xpY2UoYXJndW1lbnRzKSlcbiAgICAgICAgICAgICk7XG4gICAgICAgIH07XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIF9jb25jYXQoZWFjaGZuLCBhcnIsIGZuLCBjYWxsYmFjaykge1xuICAgICAgICB2YXIgcmVzdWx0ID0gW107XG4gICAgICAgIGVhY2hmbihhcnIsIGZ1bmN0aW9uICh4LCBpbmRleCwgY2IpIHtcbiAgICAgICAgICAgIGZuKHgsIGZ1bmN0aW9uIChlcnIsIHkpIHtcbiAgICAgICAgICAgICAgICByZXN1bHQgPSByZXN1bHQuY29uY2F0KHkgfHwgW10pO1xuICAgICAgICAgICAgICAgIGNiKGVycik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSwgZnVuY3Rpb24gKGVycikge1xuICAgICAgICAgICAgY2FsbGJhY2soZXJyLCByZXN1bHQpO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgYXN5bmMuY29uY2F0ID0gZG9QYXJhbGxlbChfY29uY2F0KTtcbiAgICBhc3luYy5jb25jYXRTZXJpZXMgPSBkb1NlcmllcyhfY29uY2F0KTtcblxuICAgIGFzeW5jLndoaWxzdCA9IGZ1bmN0aW9uICh0ZXN0LCBpdGVyYXRvciwgY2FsbGJhY2spIHtcbiAgICAgICAgY2FsbGJhY2sgPSBjYWxsYmFjayB8fCBub29wO1xuICAgICAgICBpZiAodGVzdCgpKSB7XG4gICAgICAgICAgICBpdGVyYXRvcihmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gY2FsbGJhY2soZXJyKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYXN5bmMud2hpbHN0KHRlc3QsIGl0ZXJhdG9yLCBjYWxsYmFjayk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKG51bGwpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIGFzeW5jLmRvV2hpbHN0ID0gZnVuY3Rpb24gKGl0ZXJhdG9yLCB0ZXN0LCBjYWxsYmFjaykge1xuICAgICAgICBjYWxsYmFjayA9IGNhbGxiYWNrIHx8IG5vb3A7XG4gICAgICAgIGl0ZXJhdG9yKGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gY2FsbGJhY2soZXJyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBhcmdzID0gX2Jhc2VTbGljZShhcmd1bWVudHMsIDEpO1xuICAgICAgICAgICAgaWYgKHRlc3QuYXBwbHkobnVsbCwgYXJncykpIHtcbiAgICAgICAgICAgICAgICBhc3luYy5kb1doaWxzdChpdGVyYXRvciwgdGVzdCwgY2FsbGJhY2spO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2sobnVsbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBhc3luYy51bnRpbCA9IGZ1bmN0aW9uICh0ZXN0LCBpdGVyYXRvciwgY2FsbGJhY2spIHtcbiAgICAgICAgY2FsbGJhY2sgPSBjYWxsYmFjayB8fCBub29wO1xuICAgICAgICBpZiAoIXRlc3QoKSkge1xuICAgICAgICAgICAgaXRlcmF0b3IoZnVuY3Rpb24gKGVycikge1xuICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKGVycik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGFzeW5jLnVudGlsKHRlc3QsIGl0ZXJhdG9yLCBjYWxsYmFjayk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKG51bGwpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIGFzeW5jLmRvVW50aWwgPSBmdW5jdGlvbiAoaXRlcmF0b3IsIHRlc3QsIGNhbGxiYWNrKSB7XG4gICAgICAgIGNhbGxiYWNrID0gY2FsbGJhY2sgfHwgbm9vcDtcbiAgICAgICAgaXRlcmF0b3IoZnVuY3Rpb24gKGVycikge1xuICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgIHJldHVybiBjYWxsYmFjayhlcnIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIGFyZ3MgPSBfYmFzZVNsaWNlKGFyZ3VtZW50cywgMSk7XG4gICAgICAgICAgICBpZiAoIXRlc3QuYXBwbHkobnVsbCwgYXJncykpIHtcbiAgICAgICAgICAgICAgICBhc3luYy5kb1VudGlsKGl0ZXJhdG9yLCB0ZXN0LCBjYWxsYmFjayk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBjYWxsYmFjayhudWxsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIGFzeW5jLmR1cmluZyA9IGZ1bmN0aW9uICh0ZXN0LCBpdGVyYXRvciwgY2FsbGJhY2spIHtcbiAgICAgICAgY2FsbGJhY2sgPSBjYWxsYmFjayB8fCBub29wO1xuICAgICAgICB0ZXN0KGZ1bmN0aW9uKGVyciwgdHJ1dGgpIHtcbiAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gY2FsbGJhY2soZXJyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0cnV0aCkge1xuICAgICAgICAgICAgICAgIGl0ZXJhdG9yKGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKGVycik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgYXN5bmMuZHVyaW5nKHRlc3QsIGl0ZXJhdG9yLCBjYWxsYmFjayk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBjYWxsYmFjayhudWxsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIGFzeW5jLmRvRHVyaW5nID0gZnVuY3Rpb24gKGl0ZXJhdG9yLCB0ZXN0LCBjYWxsYmFjaykge1xuICAgICAgICBjYWxsYmFjayA9IGNhbGxiYWNrIHx8IG5vb3A7XG4gICAgICAgIGl0ZXJhdG9yKGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gY2FsbGJhY2soZXJyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBhcmdzID0gX2Jhc2VTbGljZShhcmd1bWVudHMsIDEpO1xuICAgICAgICAgICAgYXJncy5wdXNoKGZ1bmN0aW9uIChlcnIsIHRydXRoKSB7XG4gICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgIHJldHVybiBjYWxsYmFjayhlcnIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAodHJ1dGgpIHtcbiAgICAgICAgICAgICAgICAgICAgYXN5bmMuZG9EdXJpbmcoaXRlcmF0b3IsIHRlc3QsIGNhbGxiYWNrKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKG51bGwpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGVzdC5hcHBseShudWxsLCBhcmdzKTtcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIF9xdWV1ZSh3b3JrZXIsIGNvbmN1cnJlbmN5LCBwYXlsb2FkKSB7XG4gICAgICAgIGlmIChjb25jdXJyZW5jeSA9PSBudWxsKSB7XG4gICAgICAgICAgICBjb25jdXJyZW5jeSA9IDE7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZihjb25jdXJyZW5jeSA9PT0gMCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdDb25jdXJyZW5jeSBtdXN0IG5vdCBiZSB6ZXJvJyk7XG4gICAgICAgIH1cbiAgICAgICAgZnVuY3Rpb24gX2luc2VydChxLCBkYXRhLCBwb3MsIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICBpZiAoY2FsbGJhY2sgIT0gbnVsbCAmJiB0eXBlb2YgY2FsbGJhY2sgIT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcInRhc2sgY2FsbGJhY2sgbXVzdCBiZSBhIGZ1bmN0aW9uXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcS5zdGFydGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIGlmICghX2lzQXJyYXkoZGF0YSkpIHtcbiAgICAgICAgICAgICAgICBkYXRhID0gW2RhdGFdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYoZGF0YS5sZW5ndGggPT09IDAgJiYgcS5pZGxlKCkpIHtcbiAgICAgICAgICAgICAgICAvLyBjYWxsIGRyYWluIGltbWVkaWF0ZWx5IGlmIHRoZXJlIGFyZSBubyB0YXNrc1xuICAgICAgICAgICAgICAgIHJldHVybiBhc3luYy5zZXRJbW1lZGlhdGUoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgcS5kcmFpbigpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgX2FycmF5RWFjaChkYXRhLCBmdW5jdGlvbih0YXNrKSB7XG4gICAgICAgICAgICAgICAgdmFyIGl0ZW0gPSB7XG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IHRhc2ssXG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrOiBjYWxsYmFjayB8fCBub29wXG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgIGlmIChwb3MpIHtcbiAgICAgICAgICAgICAgICAgICAgcS50YXNrcy51bnNoaWZ0KGl0ZW0pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHEudGFza3MucHVzaChpdGVtKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAocS50YXNrcy5sZW5ndGggPT09IHEuY29uY3VycmVuY3kpIHtcbiAgICAgICAgICAgICAgICAgICAgcS5zYXR1cmF0ZWQoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGFzeW5jLnNldEltbWVkaWF0ZShxLnByb2Nlc3MpO1xuICAgICAgICB9XG4gICAgICAgIGZ1bmN0aW9uIF9uZXh0KHEsIHRhc2tzKSB7XG4gICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICB3b3JrZXJzIC09IDE7XG4gICAgICAgICAgICAgICAgdmFyIGFyZ3MgPSBhcmd1bWVudHM7XG4gICAgICAgICAgICAgICAgX2FycmF5RWFjaCh0YXNrcywgZnVuY3Rpb24gKHRhc2spIHtcbiAgICAgICAgICAgICAgICAgICAgdGFzay5jYWxsYmFjay5hcHBseSh0YXNrLCBhcmdzKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBpZiAocS50YXNrcy5sZW5ndGggKyB3b3JrZXJzID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHEuZHJhaW4oKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcS5wcm9jZXNzKCk7XG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHdvcmtlcnMgPSAwO1xuICAgICAgICB2YXIgcSA9IHtcbiAgICAgICAgICAgIHRhc2tzOiBbXSxcbiAgICAgICAgICAgIGNvbmN1cnJlbmN5OiBjb25jdXJyZW5jeSxcbiAgICAgICAgICAgIHBheWxvYWQ6IHBheWxvYWQsXG4gICAgICAgICAgICBzYXR1cmF0ZWQ6IG5vb3AsXG4gICAgICAgICAgICBlbXB0eTogbm9vcCxcbiAgICAgICAgICAgIGRyYWluOiBub29wLFxuICAgICAgICAgICAgc3RhcnRlZDogZmFsc2UsXG4gICAgICAgICAgICBwYXVzZWQ6IGZhbHNlLFxuICAgICAgICAgICAgcHVzaDogZnVuY3Rpb24gKGRhdGEsIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAgICAgX2luc2VydChxLCBkYXRhLCBmYWxzZSwgY2FsbGJhY2spO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGtpbGw6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBxLmRyYWluID0gbm9vcDtcbiAgICAgICAgICAgICAgICBxLnRhc2tzID0gW107XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgdW5zaGlmdDogZnVuY3Rpb24gKGRhdGEsIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAgICAgX2luc2VydChxLCBkYXRhLCB0cnVlLCBjYWxsYmFjayk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgcHJvY2VzczogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGlmICghcS5wYXVzZWQgJiYgd29ya2VycyA8IHEuY29uY3VycmVuY3kgJiYgcS50YXNrcy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgd2hpbGUod29ya2VycyA8IHEuY29uY3VycmVuY3kgJiYgcS50YXNrcy5sZW5ndGgpe1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHRhc2tzID0gcS5wYXlsb2FkID9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBxLnRhc2tzLnNwbGljZSgwLCBxLnBheWxvYWQpIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBxLnRhc2tzLnNwbGljZSgwLCBxLnRhc2tzLmxlbmd0aCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBkYXRhID0gX21hcCh0YXNrcywgZnVuY3Rpb24gKHRhc2spIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGFzay5kYXRhO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChxLnRhc2tzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHEuZW1wdHkoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHdvcmtlcnMgKz0gMTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBjYiA9IG9ubHlfb25jZShfbmV4dChxLCB0YXNrcykpO1xuICAgICAgICAgICAgICAgICAgICAgICAgd29ya2VyKGRhdGEsIGNiKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBsZW5ndGg6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcS50YXNrcy5sZW5ndGg7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgcnVubmluZzogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB3b3JrZXJzO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGlkbGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBxLnRhc2tzLmxlbmd0aCArIHdvcmtlcnMgPT09IDA7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgcGF1c2U6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBxLnBhdXNlZCA9IHRydWU7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgcmVzdW1lOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgaWYgKHEucGF1c2VkID09PSBmYWxzZSkgeyByZXR1cm47IH1cbiAgICAgICAgICAgICAgICBxLnBhdXNlZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIHZhciByZXN1bWVDb3VudCA9IE1hdGgubWluKHEuY29uY3VycmVuY3ksIHEudGFza3MubGVuZ3RoKTtcbiAgICAgICAgICAgICAgICAvLyBOZWVkIHRvIGNhbGwgcS5wcm9jZXNzIG9uY2UgcGVyIGNvbmN1cnJlbnRcbiAgICAgICAgICAgICAgICAvLyB3b3JrZXIgdG8gcHJlc2VydmUgZnVsbCBjb25jdXJyZW5jeSBhZnRlciBwYXVzZVxuICAgICAgICAgICAgICAgIGZvciAodmFyIHcgPSAxOyB3IDw9IHJlc3VtZUNvdW50OyB3KyspIHtcbiAgICAgICAgICAgICAgICAgICAgYXN5bmMuc2V0SW1tZWRpYXRlKHEucHJvY2Vzcyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICByZXR1cm4gcTtcbiAgICB9XG5cbiAgICBhc3luYy5xdWV1ZSA9IGZ1bmN0aW9uICh3b3JrZXIsIGNvbmN1cnJlbmN5KSB7XG4gICAgICAgIHZhciBxID0gX3F1ZXVlKGZ1bmN0aW9uIChpdGVtcywgY2IpIHtcbiAgICAgICAgICAgIHdvcmtlcihpdGVtc1swXSwgY2IpO1xuICAgICAgICB9LCBjb25jdXJyZW5jeSwgMSk7XG5cbiAgICAgICAgcmV0dXJuIHE7XG4gICAgfTtcblxuICAgIGFzeW5jLnByaW9yaXR5UXVldWUgPSBmdW5jdGlvbiAod29ya2VyLCBjb25jdXJyZW5jeSkge1xuXG4gICAgICAgIGZ1bmN0aW9uIF9jb21wYXJlVGFza3MoYSwgYil7XG4gICAgICAgICAgICByZXR1cm4gYS5wcmlvcml0eSAtIGIucHJpb3JpdHk7XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBfYmluYXJ5U2VhcmNoKHNlcXVlbmNlLCBpdGVtLCBjb21wYXJlKSB7XG4gICAgICAgICAgdmFyIGJlZyA9IC0xLFxuICAgICAgICAgICAgICBlbmQgPSBzZXF1ZW5jZS5sZW5ndGggLSAxO1xuICAgICAgICAgIHdoaWxlIChiZWcgPCBlbmQpIHtcbiAgICAgICAgICAgICAgdmFyIG1pZCA9IGJlZyArICgoZW5kIC0gYmVnICsgMSkgPj4+IDEpO1xuICAgICAgICAgICAgICBpZiAoY29tcGFyZShpdGVtLCBzZXF1ZW5jZVttaWRdKSA+PSAwKSB7XG4gICAgICAgICAgICAgICAgICBiZWcgPSBtaWQ7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICBlbmQgPSBtaWQgLSAxO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBiZWc7XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBfaW5zZXJ0KHEsIGRhdGEsIHByaW9yaXR5LCBjYWxsYmFjaykge1xuICAgICAgICAgICAgaWYgKGNhbGxiYWNrICE9IG51bGwgJiYgdHlwZW9mIGNhbGxiYWNrICE9PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJ0YXNrIGNhbGxiYWNrIG11c3QgYmUgYSBmdW5jdGlvblwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHEuc3RhcnRlZCA9IHRydWU7XG4gICAgICAgICAgICBpZiAoIV9pc0FycmF5KGRhdGEpKSB7XG4gICAgICAgICAgICAgICAgZGF0YSA9IFtkYXRhXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmKGRhdGEubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgLy8gY2FsbCBkcmFpbiBpbW1lZGlhdGVseSBpZiB0aGVyZSBhcmUgbm8gdGFza3NcbiAgICAgICAgICAgICAgICByZXR1cm4gYXN5bmMuc2V0SW1tZWRpYXRlKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICBxLmRyYWluKCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBfYXJyYXlFYWNoKGRhdGEsIGZ1bmN0aW9uKHRhc2spIHtcbiAgICAgICAgICAgICAgICB2YXIgaXRlbSA9IHtcbiAgICAgICAgICAgICAgICAgICAgZGF0YTogdGFzayxcbiAgICAgICAgICAgICAgICAgICAgcHJpb3JpdHk6IHByaW9yaXR5LFxuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjazogdHlwZW9mIGNhbGxiYWNrID09PSAnZnVuY3Rpb24nID8gY2FsbGJhY2sgOiBub29wXG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgIHEudGFza3Muc3BsaWNlKF9iaW5hcnlTZWFyY2gocS50YXNrcywgaXRlbSwgX2NvbXBhcmVUYXNrcykgKyAxLCAwLCBpdGVtKTtcblxuICAgICAgICAgICAgICAgIGlmIChxLnRhc2tzLmxlbmd0aCA9PT0gcS5jb25jdXJyZW5jeSkge1xuICAgICAgICAgICAgICAgICAgICBxLnNhdHVyYXRlZCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBhc3luYy5zZXRJbW1lZGlhdGUocS5wcm9jZXNzKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gU3RhcnQgd2l0aCBhIG5vcm1hbCBxdWV1ZVxuICAgICAgICB2YXIgcSA9IGFzeW5jLnF1ZXVlKHdvcmtlciwgY29uY3VycmVuY3kpO1xuXG4gICAgICAgIC8vIE92ZXJyaWRlIHB1c2ggdG8gYWNjZXB0IHNlY29uZCBwYXJhbWV0ZXIgcmVwcmVzZW50aW5nIHByaW9yaXR5XG4gICAgICAgIHEucHVzaCA9IGZ1bmN0aW9uIChkYXRhLCBwcmlvcml0eSwgY2FsbGJhY2spIHtcbiAgICAgICAgICAgIF9pbnNlcnQocSwgZGF0YSwgcHJpb3JpdHksIGNhbGxiYWNrKTtcbiAgICAgICAgfTtcblxuICAgICAgICAvLyBSZW1vdmUgdW5zaGlmdCBmdW5jdGlvblxuICAgICAgICBkZWxldGUgcS51bnNoaWZ0O1xuXG4gICAgICAgIHJldHVybiBxO1xuICAgIH07XG5cbiAgICBhc3luYy5jYXJnbyA9IGZ1bmN0aW9uICh3b3JrZXIsIHBheWxvYWQpIHtcbiAgICAgICAgcmV0dXJuIF9xdWV1ZSh3b3JrZXIsIDEsIHBheWxvYWQpO1xuICAgIH07XG5cbiAgICBmdW5jdGlvbiBfY29uc29sZV9mbihuYW1lKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoZm4pIHtcbiAgICAgICAgICAgIHZhciBhcmdzID0gX2Jhc2VTbGljZShhcmd1bWVudHMsIDEpO1xuICAgICAgICAgICAgZm4uYXBwbHkobnVsbCwgYXJncy5jb25jYXQoW2Z1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgICAgICAgICB2YXIgYXJncyA9IF9iYXNlU2xpY2UoYXJndW1lbnRzLCAxKTtcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGNvbnNvbGUgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjb25zb2xlLmVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihlcnIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKGNvbnNvbGVbbmFtZV0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIF9hcnJheUVhY2goYXJncywgZnVuY3Rpb24gKHgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlW25hbWVdKHgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XSkpO1xuICAgICAgICB9O1xuICAgIH1cbiAgICBhc3luYy5sb2cgPSBfY29uc29sZV9mbignbG9nJyk7XG4gICAgYXN5bmMuZGlyID0gX2NvbnNvbGVfZm4oJ2RpcicpO1xuICAgIC8qYXN5bmMuaW5mbyA9IF9jb25zb2xlX2ZuKCdpbmZvJyk7XG4gICAgYXN5bmMud2FybiA9IF9jb25zb2xlX2ZuKCd3YXJuJyk7XG4gICAgYXN5bmMuZXJyb3IgPSBfY29uc29sZV9mbignZXJyb3InKTsqL1xuXG4gICAgYXN5bmMubWVtb2l6ZSA9IGZ1bmN0aW9uIChmbiwgaGFzaGVyKSB7XG4gICAgICAgIHZhciBtZW1vID0ge307XG4gICAgICAgIHZhciBxdWV1ZXMgPSB7fTtcbiAgICAgICAgaGFzaGVyID0gaGFzaGVyIHx8IGZ1bmN0aW9uICh4KSB7XG4gICAgICAgICAgICByZXR1cm4geDtcbiAgICAgICAgfTtcbiAgICAgICAgZnVuY3Rpb24gbWVtb2l6ZWQoKSB7XG4gICAgICAgICAgICB2YXIgYXJncyA9IF9iYXNlU2xpY2UoYXJndW1lbnRzKTtcbiAgICAgICAgICAgIHZhciBjYWxsYmFjayA9IGFyZ3MucG9wKCk7XG4gICAgICAgICAgICB2YXIga2V5ID0gaGFzaGVyLmFwcGx5KG51bGwsIGFyZ3MpO1xuICAgICAgICAgICAgaWYgKGtleSBpbiBtZW1vKSB7XG4gICAgICAgICAgICAgICAgYXN5bmMubmV4dFRpY2soZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjay5hcHBseShudWxsLCBtZW1vW2tleV0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoa2V5IGluIHF1ZXVlcykge1xuICAgICAgICAgICAgICAgIHF1ZXVlc1trZXldLnB1c2goY2FsbGJhY2spO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgcXVldWVzW2tleV0gPSBbY2FsbGJhY2tdO1xuICAgICAgICAgICAgICAgIGZuLmFwcGx5KG51bGwsIGFyZ3MuY29uY2F0KFtmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIG1lbW9ba2V5XSA9IF9iYXNlU2xpY2UoYXJndW1lbnRzKTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHEgPSBxdWV1ZXNba2V5XTtcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlIHF1ZXVlc1trZXldO1xuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgbCA9IHEubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgcVtpXS5hcHBseShudWxsLCBhcmd1bWVudHMpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfV0pKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBtZW1vaXplZC5tZW1vID0gbWVtbztcbiAgICAgICAgbWVtb2l6ZWQudW5tZW1vaXplZCA9IGZuO1xuICAgICAgICByZXR1cm4gbWVtb2l6ZWQ7XG4gICAgfTtcblxuICAgIGFzeW5jLnVubWVtb2l6ZSA9IGZ1bmN0aW9uIChmbikge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIChmbi51bm1lbW9pemVkIHx8IGZuKS5hcHBseShudWxsLCBhcmd1bWVudHMpO1xuICAgICAgICB9O1xuICAgIH07XG5cbiAgICBmdW5jdGlvbiBfdGltZXMobWFwcGVyKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoY291bnQsIGl0ZXJhdG9yLCBjYWxsYmFjaykge1xuICAgICAgICAgICAgbWFwcGVyKF9yYW5nZShjb3VudCksIGl0ZXJhdG9yLCBjYWxsYmFjayk7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgYXN5bmMudGltZXMgPSBfdGltZXMoYXN5bmMubWFwKTtcbiAgICBhc3luYy50aW1lc1NlcmllcyA9IF90aW1lcyhhc3luYy5tYXBTZXJpZXMpO1xuICAgIGFzeW5jLnRpbWVzTGltaXQgPSBmdW5jdGlvbiAoY291bnQsIGxpbWl0LCBpdGVyYXRvciwgY2FsbGJhY2spIHtcbiAgICAgICAgcmV0dXJuIGFzeW5jLm1hcExpbWl0KF9yYW5nZShjb3VudCksIGxpbWl0LCBpdGVyYXRvciwgY2FsbGJhY2spO1xuICAgIH07XG5cbiAgICBhc3luYy5zZXEgPSBmdW5jdGlvbiAoLyogZnVuY3Rpb25zLi4uICovKSB7XG4gICAgICAgIHZhciBmbnMgPSBhcmd1bWVudHM7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgICAgICAgICB2YXIgYXJncyA9IF9iYXNlU2xpY2UoYXJndW1lbnRzKTtcblxuICAgICAgICAgICAgdmFyIGNhbGxiYWNrID0gYXJncy5zbGljZSgtMSlbMF07XG4gICAgICAgICAgICBpZiAodHlwZW9mIGNhbGxiYWNrID09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgICBhcmdzLnBvcCgpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjYWxsYmFjayA9IG5vb3A7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGFzeW5jLnJlZHVjZShmbnMsIGFyZ3MsIGZ1bmN0aW9uIChuZXdhcmdzLCBmbiwgY2IpIHtcbiAgICAgICAgICAgICAgICBmbi5hcHBseSh0aGF0LCBuZXdhcmdzLmNvbmNhdChbZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgZXJyID0gYXJndW1lbnRzWzBdO1xuICAgICAgICAgICAgICAgICAgICB2YXIgbmV4dGFyZ3MgPSBfYmFzZVNsaWNlKGFyZ3VtZW50cywgMSk7XG4gICAgICAgICAgICAgICAgICAgIGNiKGVyciwgbmV4dGFyZ3MpO1xuICAgICAgICAgICAgICAgIH1dKSk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZnVuY3Rpb24gKGVyciwgcmVzdWx0cykge1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrLmFwcGx5KHRoYXQsIFtlcnJdLmNvbmNhdChyZXN1bHRzKSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcbiAgICB9O1xuXG4gICAgYXN5bmMuY29tcG9zZSA9IGZ1bmN0aW9uICgvKiBmdW5jdGlvbnMuLi4gKi8pIHtcbiAgICAgICAgcmV0dXJuIGFzeW5jLnNlcS5hcHBseShudWxsLCBBcnJheS5wcm90b3R5cGUucmV2ZXJzZS5jYWxsKGFyZ3VtZW50cykpO1xuICAgIH07XG5cblxuICAgIGZ1bmN0aW9uIF9hcHBseUVhY2goZWFjaGZuLCBmbnMgLyphcmdzLi4uKi8pIHtcbiAgICAgICAgZnVuY3Rpb24gZ28oKSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgICAgICAgICB2YXIgYXJncyA9IF9iYXNlU2xpY2UoYXJndW1lbnRzKTtcbiAgICAgICAgICAgIHZhciBjYWxsYmFjayA9IGFyZ3MucG9wKCk7XG4gICAgICAgICAgICByZXR1cm4gZWFjaGZuKGZucywgZnVuY3Rpb24gKGZuLCBfLCBjYikge1xuICAgICAgICAgICAgICAgIGZuLmFwcGx5KHRoYXQsIGFyZ3MuY29uY2F0KFtjYl0pKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBjYWxsYmFjayk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAyKSB7XG4gICAgICAgICAgICB2YXIgYXJncyA9IF9iYXNlU2xpY2UoYXJndW1lbnRzLCAyKTtcbiAgICAgICAgICAgIHJldHVybiBnby5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBnbztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGFzeW5jLmFwcGx5RWFjaCA9IGZ1bmN0aW9uICgvKmZucywgYXJncy4uLiovKSB7XG4gICAgICAgIHZhciBhcmdzID0gX2Jhc2VTbGljZShhcmd1bWVudHMpO1xuICAgICAgICByZXR1cm4gX2FwcGx5RWFjaC5hcHBseShudWxsLCBbYXN5bmMuZWFjaE9mXS5jb25jYXQoYXJncykpO1xuICAgIH07XG4gICAgYXN5bmMuYXBwbHlFYWNoU2VyaWVzID0gZnVuY3Rpb24gKC8qZm5zLCBhcmdzLi4uKi8pIHtcbiAgICAgICAgdmFyIGFyZ3MgPSBfYmFzZVNsaWNlKGFyZ3VtZW50cyk7XG4gICAgICAgIHJldHVybiBfYXBwbHlFYWNoLmFwcGx5KG51bGwsIFthc3luYy5lYWNoT2ZTZXJpZXNdLmNvbmNhdChhcmdzKSk7XG4gICAgfTtcblxuXG4gICAgYXN5bmMuZm9yZXZlciA9IGZ1bmN0aW9uIChmbiwgY2FsbGJhY2spIHtcbiAgICAgICAgdmFyIGRvbmUgPSBvbmx5X29uY2UoY2FsbGJhY2sgfHwgbm9vcCk7XG4gICAgICAgIHZhciB0YXNrID0gZW5zdXJlQXN5bmMoZm4pO1xuICAgICAgICBmdW5jdGlvbiBuZXh0KGVycikge1xuICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgIHJldHVybiBkb25lKGVycik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0YXNrKG5leHQpO1xuICAgICAgICB9XG4gICAgICAgIG5leHQoKTtcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gZW5zdXJlQXN5bmMoZm4pIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICgvKi4uLmFyZ3MsIGNhbGxiYWNrKi8pIHtcbiAgICAgICAgICAgIHZhciBhcmdzID0gX2Jhc2VTbGljZShhcmd1bWVudHMpO1xuICAgICAgICAgICAgdmFyIGNhbGxiYWNrID0gYXJncy5wb3AoKTtcbiAgICAgICAgICAgIGFyZ3MucHVzaChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgdmFyIGlubmVyQXJncyA9IGFyZ3VtZW50cztcbiAgICAgICAgICAgICAgICBpZiAoc3luYykge1xuICAgICAgICAgICAgICAgICAgICBhc3luYy5zZXRJbW1lZGlhdGUoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2suYXBwbHkobnVsbCwgaW5uZXJBcmdzKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2suYXBwbHkobnVsbCwgaW5uZXJBcmdzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHZhciBzeW5jID0gdHJ1ZTtcbiAgICAgICAgICAgIGZuLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgICAgICAgICAgc3luYyA9IGZhbHNlO1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIGFzeW5jLmVuc3VyZUFzeW5jID0gZW5zdXJlQXN5bmM7XG5cbiAgICBhc3luYy5jb25zdGFudCA9IGZ1bmN0aW9uIGNvbnN0YW50KC8qdmFsdWVzLi4uKi8pIHtcbiAgICAgICAgdmFyIGFyZ3MgPSBbbnVsbF0uY29uY2F0KF9iYXNlU2xpY2UoYXJndW1lbnRzKSk7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoY2FsbGJhY2spIHtcbiAgICAgICAgICAgIHJldHVybiBjYWxsYmFjay5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICAgICAgfTtcbiAgICB9O1xuXG4gICAgYXN5bmMud3JhcFN5bmMgPVxuICAgIGFzeW5jLmFzeW5jaWZ5ID0gZnVuY3Rpb24gYXN5bmNpZnkoZnVuYykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKC8qYXJncy4uLiwgY2FsbGJhY2sqLykge1xuICAgICAgICAgICAgdmFyIGFyZ3MgPSBfYmFzZVNsaWNlKGFyZ3VtZW50cyk7XG4gICAgICAgICAgICB2YXIgY2FsbGJhY2sgPSBhcmdzLnBvcCgpO1xuICAgICAgICAgICAgdmFyIHJlc3VsdDtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gZnVuYy5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gY2FsbGJhY2soZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYWxsYmFjayhudWxsLCByZXN1bHQpO1xuICAgICAgICB9O1xuICAgIH07XG5cbiAgICAvLyBOb2RlLmpzXG4gICAgaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnICYmIG1vZHVsZS5leHBvcnRzKSB7XG4gICAgICAgIG1vZHVsZS5leHBvcnRzID0gYXN5bmM7XG4gICAgfVxuICAgIC8vIEFNRCAvIFJlcXVpcmVKU1xuICAgIGVsc2UgaWYgKHR5cGVvZiBkZWZpbmUgIT09ICd1bmRlZmluZWQnICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgZGVmaW5lKFtdLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gYXN5bmM7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvLyBpbmNsdWRlZCBkaXJlY3RseSB2aWEgPHNjcmlwdD4gdGFnXG4gICAgZWxzZSB7XG4gICAgICAgIHJvb3QuYXN5bmMgPSBhc3luYztcbiAgICB9XG5cbn0oKSk7XG4iLCIvKiFcbiAgQ29weXJpZ2h0IChjKSAyMDE1IEplZCBXYXRzb24uXG4gIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgTGljZW5zZSAoTUlUKSwgc2VlXG4gIGh0dHA6Ly9qZWR3YXRzb24uZ2l0aHViLmlvL2NsYXNzbmFtZXNcbiovXG5cbihmdW5jdGlvbiAoKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHRmdW5jdGlvbiBjbGFzc05hbWVzICgpIHtcblxuXHRcdHZhciBjbGFzc2VzID0gJyc7XG5cblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuXHRcdFx0dmFyIGFyZyA9IGFyZ3VtZW50c1tpXTtcblx0XHRcdGlmICghYXJnKSBjb250aW51ZTtcblxuXHRcdFx0dmFyIGFyZ1R5cGUgPSB0eXBlb2YgYXJnO1xuXG5cdFx0XHRpZiAoJ3N0cmluZycgPT09IGFyZ1R5cGUgfHwgJ251bWJlcicgPT09IGFyZ1R5cGUpIHtcblx0XHRcdFx0Y2xhc3NlcyArPSAnICcgKyBhcmc7XG5cblx0XHRcdH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheShhcmcpKSB7XG5cdFx0XHRcdGNsYXNzZXMgKz0gJyAnICsgY2xhc3NOYW1lcy5hcHBseShudWxsLCBhcmcpO1xuXG5cdFx0XHR9IGVsc2UgaWYgKCdvYmplY3QnID09PSBhcmdUeXBlKSB7XG5cdFx0XHRcdGZvciAodmFyIGtleSBpbiBhcmcpIHtcblx0XHRcdFx0XHRpZiAoYXJnLmhhc093blByb3BlcnR5KGtleSkgJiYgYXJnW2tleV0pIHtcblx0XHRcdFx0XHRcdGNsYXNzZXMgKz0gJyAnICsga2V5O1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiBjbGFzc2VzLnN1YnN0cigxKTtcblx0fVxuXG5cdGlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyAmJiBtb2R1bGUuZXhwb3J0cykge1xuXHRcdG1vZHVsZS5leHBvcnRzID0gY2xhc3NOYW1lcztcblx0fSBlbHNlIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIHR5cGVvZiBkZWZpbmUuYW1kID09PSAnb2JqZWN0JyAmJiBkZWZpbmUuYW1kKXtcblx0XHQvLyBBTUQuIFJlZ2lzdGVyIGFzIGFuIGFub255bW91cyBtb2R1bGUuXG5cdFx0ZGVmaW5lKGZ1bmN0aW9uICgpIHtcblx0XHRcdHJldHVybiBjbGFzc05hbWVzO1xuXHRcdH0pO1xuXHR9IGVsc2Uge1xuXHRcdHdpbmRvdy5jbGFzc05hbWVzID0gY2xhc3NOYW1lcztcblx0fVxuXG59KCkpO1xuIiwiZnVuY3Rpb24gbWFrZXNoaWZ0VGl0bGUodGl0bGUsIG1lc3NhZ2UpIHtcbiAgcmV0dXJuIHRpdGxlID8gKHRpdGxlICsgJ1xcblxcbicgKyBtZXNzYWdlKSA6IG1lc3NhZ2Vcbn1cblxuLy8gU2VlIGh0dHA6Ly9kb2NzLnBob25lZ2FwLmNvbS9lbi9lZGdlL2NvcmRvdmFfbm90aWZpY2F0aW9uX25vdGlmaWNhdGlvbi5tZC5odG1sIGZvciBkb2N1bWVudGF0aW9uXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgYWxlcnQ6IGZ1bmN0aW9uIGFsZXJ0KG1lc3NhZ2UsIGNhbGxiYWNrLCB0aXRsZSkge1xuICAgIGlmICh3aW5kb3cubmF2aWdhdG9yLm5vdGlmaWNhdGlvbiAmJiB3aW5kb3cubmF2aWdhdG9yLm5vdGlmaWNhdGlvbi5hbGVydCkge1xuICAgICAgcmV0dXJuIHdpbmRvdy5uYXZpZ2F0b3Iubm90aWZpY2F0aW9uLmFsZXJ0LmFwcGx5KG51bGwsIGFyZ3VtZW50cylcbiAgICB9XG5cbiAgICB2YXIgdGV4dCA9IG1ha2VzaGlmdFRpdGxlKHRpdGxlLCBtZXNzYWdlKVxuXG4gICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgIHdpbmRvdy5hbGVydCh0ZXh0KVxuXG4gICAgICBjYWxsYmFjaygpXG4gICAgfSwgMClcbiAgfSxcbiAgY29uZmlybTogZnVuY3Rpb24gY29uZmlybShtZXNzYWdlLCBjYWxsYmFjaywgdGl0bGUpIHtcbiAgICBpZiAod2luZG93Lm5hdmlnYXRvci5ub3RpZmljYXRpb24gJiYgd2luZG93Lm5hdmlnYXRvci5ub3RpZmljYXRpb24uY29uZmlybSkge1xuICAgICAgcmV0dXJuIHdpbmRvdy5uYXZpZ2F0b3Iubm90aWZpY2F0aW9uLmNvbmZpcm0uYXBwbHkobnVsbCwgYXJndW1lbnRzKVxuICAgIH1cblxuICAgIHZhciB0ZXh0ID0gbWFrZXNoaWZ0VGl0bGUodGl0bGUsIG1lc3NhZ2UpXG5cbiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGNvbmZpcm1lZCA9IHdpbmRvdy5jb25maXJtKHRleHQpXG4gICAgICB2YXIgYnV0dG9uSW5kZXggPSBjb25maXJtZWQgPyAxIDogMlxuXG4gICAgICBjYWxsYmFjayhidXR0b25JbmRleClcbiAgICB9LCAwKVxuICB9LFxuXG4gIHByb21wdDogZnVuY3Rpb24gcHJvbXB0KG1lc3NhZ2UsIGNhbGxiYWNrLCB0aXRsZSwgZGVmYXVsdFRleHQpIHtcbiAgICBpZiAod2luZG93Lm5hdmlnYXRvci5ub3RpZmljYXRpb24gJiYgd2luZG93Lm5hdmlnYXRvci5ub3RpZmljYXRpb24ucHJvbXB0KSB7XG4gICAgICByZXR1cm4gd2luZG93Lm5hdmlnYXRvci5ub3RpZmljYXRpb24ucHJvbXB0LmFwcGx5KG51bGwsIGFyZ3VtZW50cylcbiAgICB9XG5cbiAgICB2YXIgcXVlc3Rpb24gPSBtYWtlc2hpZnRUaXRsZSh0aXRsZSwgbWVzc2FnZSlcblxuICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgdGV4dCA9IHdpbmRvdy5wcm9tcHQocXVlc3Rpb24sIGRlZmF1bHRUZXh0KVxuICAgICAgdmFyIGJ1dHRvbkluZGV4ID0gKHRleHQgPT09IG51bGwpID8gMCA6IDFcblxuICAgICAgY2FsbGJhY2soe1xuICAgICAgICBidXR0b25JbmRleDogYnV0dG9uSW5kZXgsXG4gICAgICAgIGlucHV0MTogdGV4dFxuICAgICAgfSlcbiAgICB9LCAwKVxuICB9XG59XG4iLCJ2YXIgUHJvbWlzZSA9IHJlcXVpcmUoJ3Byb21pc2UnKTtcbnZhciByZXF1ZXN0ID0gcmVxdWlyZSgncmVxdWVzdCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChvcHRpb25zLCBjYWxsYmFjaykge1xuICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgIHJlcXVlc3Qob3B0aW9ucywgZnVuY3Rpb24gKGVyciwgcmVzcG9uc2UsIGJvZHkpIHtcbiAgICAgIHZhciBzdGF0dXMgPSAocmVzcG9uc2UpID8gcmVzcG9uc2Uuc3RhdHVzQ29kZSA6IDA7XG4gICAgICBjYWxsYmFjayA9IGNhbGxiYWNrIHx8IGZ1bmN0aW9uICgpIHt9O1xuICAgICAgXG4gICAgICBpZiAoZXJyKSB7XG4gICAgICAgIGNhbGxiYWNrKGVycik7XG4gICAgICAgIHJlamVjdChlcnIpO1xuICAgICAgICByZXR1cm4gXG4gICAgICB9XG4gICAgICBcbiAgICAgIHRyeXtcbiAgICAgICAgcmVzcG9uc2UuYm9keSA9IEpTT04ucGFyc2UoYm9keSk7XG4gICAgICB9XG4gICAgICBjYXRjaCAoZSkge31cbiAgICAgIFxuICAgICAgaWYgKHN0YXR1cyA+PSA0MDAgJiYgc3RhdHVzIDwgNjAwKSB7XG4gICAgICAgIGNhbGxiYWNrKG51bGwsIHJlc3BvbnNlKTtcbiAgICAgICAgcmVqZWN0KHJlc3BvbnNlKTtcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG4gICAgICBcbiAgICAgIGNhbGxiYWNrKG51bGwsIHJlc3BvbnNlKTtcbiAgICAgIHJlc29sdmUocmVzcG9uc2UpO1xuICAgIH0pO1xuICB9KTtcbn07IiwidmFyIHJlcXVlc3QgPSByZXF1aXJlKCd4aHInKTtcblxuLy8gV3JhcHBlciB0byBtYWtlIHRoZSBmZWF0dXJlcyBtb3JlIHNpbWlsaWFyIGJldHdlZW5cbi8vIHJlcXVlc3QgYW5kIHhoclxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChvcHRpb25zLCBjYWxsYmFjaykge1xuICBjYWxsYmFjayA9IGNhbGxiYWNrIHx8IGZ1bmN0aW9uICgpIHt9O1xuICBcbiAgLy8gU2V0IHVwIGZvciBSZXF1ZXN0IG1vZHVsZVxuICBpZiAob3B0aW9ucy5kYXRhICYmICF3aW5kb3cpIG9wdGlvbnMuZm9ybSA9IG9wdGlvbnMuZGF0YTtcbiAgXG4gIC8vIFNldCB1cCBmb3IgeGhyIG1vZHVsZVxuICBpZiAob3B0aW9ucy5mb3JtICYmIHdpbmRvdykge1xuICAgIG9wdGlvbnMuYm9keSA9ICh0eXBlb2Ygb3B0aW9ucy5mb3JtID09PSAnb2JqZWN0JylcbiAgICAgID8gSlNPTi5zdHJpbmdpZnkob3B0aW9ucy5mb3JtKVxuICAgICAgOiBvcHRpb25zLmZvcm07XG4gIH1cbiAgXG4gIGlmIChvcHRpb25zLmRhdGEpIHtcbiAgICBvcHRpb25zLmJvZHkgPSAodHlwZW9mIG9wdGlvbnMuZGF0YSA9PT0gJ29iamVjdCcpXG4gICAgICA/IEpTT04uc3RyaW5naWZ5KG9wdGlvbnMuZGF0YSlcbiAgICAgIDogb3B0aW9ucy5kYXRhO1xuICB9XG4gIFxuICBpZiAob3B0aW9ucy51cmwgJiYgd2luZG93KSBvcHRpb25zLnVyaSA9IG9wdGlvbnMudXJsO1xuICBpZiAod2luZG93KSBvcHRpb25zLmNvcnMgPSBvcHRpb25zLndpdGhDcmVkZW50aWFscztcbiAgXG4gIHJldHVybiByZXF1ZXN0KG9wdGlvbnMsIGNhbGxiYWNrKTtcbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vbGliL2NvcmUuanMnKVxucmVxdWlyZSgnLi9saWIvZG9uZS5qcycpXG5yZXF1aXJlKCcuL2xpYi9lczYtZXh0ZW5zaW9ucy5qcycpXG5yZXF1aXJlKCcuL2xpYi9ub2RlLWV4dGVuc2lvbnMuanMnKSIsIid1c2Ugc3RyaWN0JztcblxudmFyIGFzYXAgPSByZXF1aXJlKCdhc2FwJylcblxubW9kdWxlLmV4cG9ydHMgPSBQcm9taXNlO1xuZnVuY3Rpb24gUHJvbWlzZShmbikge1xuICBpZiAodHlwZW9mIHRoaXMgIT09ICdvYmplY3QnKSB0aHJvdyBuZXcgVHlwZUVycm9yKCdQcm9taXNlcyBtdXN0IGJlIGNvbnN0cnVjdGVkIHZpYSBuZXcnKVxuICBpZiAodHlwZW9mIGZuICE9PSAnZnVuY3Rpb24nKSB0aHJvdyBuZXcgVHlwZUVycm9yKCdub3QgYSBmdW5jdGlvbicpXG4gIHZhciBzdGF0ZSA9IG51bGxcbiAgdmFyIHZhbHVlID0gbnVsbFxuICB2YXIgZGVmZXJyZWRzID0gW11cbiAgdmFyIHNlbGYgPSB0aGlzXG5cbiAgdGhpcy50aGVuID0gZnVuY3Rpb24ob25GdWxmaWxsZWQsIG9uUmVqZWN0ZWQpIHtcbiAgICByZXR1cm4gbmV3IHNlbGYuY29uc3RydWN0b3IoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICBoYW5kbGUobmV3IEhhbmRsZXIob25GdWxmaWxsZWQsIG9uUmVqZWN0ZWQsIHJlc29sdmUsIHJlamVjdCkpXG4gICAgfSlcbiAgfVxuXG4gIGZ1bmN0aW9uIGhhbmRsZShkZWZlcnJlZCkge1xuICAgIGlmIChzdGF0ZSA9PT0gbnVsbCkge1xuICAgICAgZGVmZXJyZWRzLnB1c2goZGVmZXJyZWQpXG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgYXNhcChmdW5jdGlvbigpIHtcbiAgICAgIHZhciBjYiA9IHN0YXRlID8gZGVmZXJyZWQub25GdWxmaWxsZWQgOiBkZWZlcnJlZC5vblJlamVjdGVkXG4gICAgICBpZiAoY2IgPT09IG51bGwpIHtcbiAgICAgICAgKHN0YXRlID8gZGVmZXJyZWQucmVzb2x2ZSA6IGRlZmVycmVkLnJlamVjdCkodmFsdWUpXG4gICAgICAgIHJldHVyblxuICAgICAgfVxuICAgICAgdmFyIHJldFxuICAgICAgdHJ5IHtcbiAgICAgICAgcmV0ID0gY2IodmFsdWUpXG4gICAgICB9XG4gICAgICBjYXRjaCAoZSkge1xuICAgICAgICBkZWZlcnJlZC5yZWplY3QoZSlcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG4gICAgICBkZWZlcnJlZC5yZXNvbHZlKHJldClcbiAgICB9KVxuICB9XG5cbiAgZnVuY3Rpb24gcmVzb2x2ZShuZXdWYWx1ZSkge1xuICAgIHRyeSB7IC8vUHJvbWlzZSBSZXNvbHV0aW9uIFByb2NlZHVyZTogaHR0cHM6Ly9naXRodWIuY29tL3Byb21pc2VzLWFwbHVzL3Byb21pc2VzLXNwZWMjdGhlLXByb21pc2UtcmVzb2x1dGlvbi1wcm9jZWR1cmVcbiAgICAgIGlmIChuZXdWYWx1ZSA9PT0gc2VsZikgdGhyb3cgbmV3IFR5cGVFcnJvcignQSBwcm9taXNlIGNhbm5vdCBiZSByZXNvbHZlZCB3aXRoIGl0c2VsZi4nKVxuICAgICAgaWYgKG5ld1ZhbHVlICYmICh0eXBlb2YgbmV3VmFsdWUgPT09ICdvYmplY3QnIHx8IHR5cGVvZiBuZXdWYWx1ZSA9PT0gJ2Z1bmN0aW9uJykpIHtcbiAgICAgICAgdmFyIHRoZW4gPSBuZXdWYWx1ZS50aGVuXG4gICAgICAgIGlmICh0eXBlb2YgdGhlbiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgIGRvUmVzb2x2ZSh0aGVuLmJpbmQobmV3VmFsdWUpLCByZXNvbHZlLCByZWplY3QpXG4gICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHN0YXRlID0gdHJ1ZVxuICAgICAgdmFsdWUgPSBuZXdWYWx1ZVxuICAgICAgZmluYWxlKClcbiAgICB9IGNhdGNoIChlKSB7IHJlamVjdChlKSB9XG4gIH1cblxuICBmdW5jdGlvbiByZWplY3QobmV3VmFsdWUpIHtcbiAgICBzdGF0ZSA9IGZhbHNlXG4gICAgdmFsdWUgPSBuZXdWYWx1ZVxuICAgIGZpbmFsZSgpXG4gIH1cblxuICBmdW5jdGlvbiBmaW5hbGUoKSB7XG4gICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IGRlZmVycmVkcy5sZW5ndGg7IGkgPCBsZW47IGkrKylcbiAgICAgIGhhbmRsZShkZWZlcnJlZHNbaV0pXG4gICAgZGVmZXJyZWRzID0gbnVsbFxuICB9XG5cbiAgZG9SZXNvbHZlKGZuLCByZXNvbHZlLCByZWplY3QpXG59XG5cblxuZnVuY3Rpb24gSGFuZGxlcihvbkZ1bGZpbGxlZCwgb25SZWplY3RlZCwgcmVzb2x2ZSwgcmVqZWN0KXtcbiAgdGhpcy5vbkZ1bGZpbGxlZCA9IHR5cGVvZiBvbkZ1bGZpbGxlZCA9PT0gJ2Z1bmN0aW9uJyA/IG9uRnVsZmlsbGVkIDogbnVsbFxuICB0aGlzLm9uUmVqZWN0ZWQgPSB0eXBlb2Ygb25SZWplY3RlZCA9PT0gJ2Z1bmN0aW9uJyA/IG9uUmVqZWN0ZWQgOiBudWxsXG4gIHRoaXMucmVzb2x2ZSA9IHJlc29sdmVcbiAgdGhpcy5yZWplY3QgPSByZWplY3Rcbn1cblxuLyoqXG4gKiBUYWtlIGEgcG90ZW50aWFsbHkgbWlzYmVoYXZpbmcgcmVzb2x2ZXIgZnVuY3Rpb24gYW5kIG1ha2Ugc3VyZVxuICogb25GdWxmaWxsZWQgYW5kIG9uUmVqZWN0ZWQgYXJlIG9ubHkgY2FsbGVkIG9uY2UuXG4gKlxuICogTWFrZXMgbm8gZ3VhcmFudGVlcyBhYm91dCBhc3luY2hyb255LlxuICovXG5mdW5jdGlvbiBkb1Jlc29sdmUoZm4sIG9uRnVsZmlsbGVkLCBvblJlamVjdGVkKSB7XG4gIHZhciBkb25lID0gZmFsc2U7XG4gIHRyeSB7XG4gICAgZm4oZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICBpZiAoZG9uZSkgcmV0dXJuXG4gICAgICBkb25lID0gdHJ1ZVxuICAgICAgb25GdWxmaWxsZWQodmFsdWUpXG4gICAgfSwgZnVuY3Rpb24gKHJlYXNvbikge1xuICAgICAgaWYgKGRvbmUpIHJldHVyblxuICAgICAgZG9uZSA9IHRydWVcbiAgICAgIG9uUmVqZWN0ZWQocmVhc29uKVxuICAgIH0pXG4gIH0gY2F0Y2ggKGV4KSB7XG4gICAgaWYgKGRvbmUpIHJldHVyblxuICAgIGRvbmUgPSB0cnVlXG4gICAgb25SZWplY3RlZChleClcbiAgfVxufVxuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgUHJvbWlzZSA9IHJlcXVpcmUoJy4vY29yZS5qcycpXG52YXIgYXNhcCA9IHJlcXVpcmUoJ2FzYXAnKVxuXG5tb2R1bGUuZXhwb3J0cyA9IFByb21pc2VcblByb21pc2UucHJvdG90eXBlLmRvbmUgPSBmdW5jdGlvbiAob25GdWxmaWxsZWQsIG9uUmVqZWN0ZWQpIHtcbiAgdmFyIHNlbGYgPSBhcmd1bWVudHMubGVuZ3RoID8gdGhpcy50aGVuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cykgOiB0aGlzXG4gIHNlbGYudGhlbihudWxsLCBmdW5jdGlvbiAoZXJyKSB7XG4gICAgYXNhcChmdW5jdGlvbiAoKSB7XG4gICAgICB0aHJvdyBlcnJcbiAgICB9KVxuICB9KVxufSIsIid1c2Ugc3RyaWN0JztcblxuLy9UaGlzIGZpbGUgY29udGFpbnMgdGhlIEVTNiBleHRlbnNpb25zIHRvIHRoZSBjb3JlIFByb21pc2VzL0ErIEFQSVxuXG52YXIgUHJvbWlzZSA9IHJlcXVpcmUoJy4vY29yZS5qcycpXG52YXIgYXNhcCA9IHJlcXVpcmUoJ2FzYXAnKVxuXG5tb2R1bGUuZXhwb3J0cyA9IFByb21pc2VcblxuLyogU3RhdGljIEZ1bmN0aW9ucyAqL1xuXG5mdW5jdGlvbiBWYWx1ZVByb21pc2UodmFsdWUpIHtcbiAgdGhpcy50aGVuID0gZnVuY3Rpb24gKG9uRnVsZmlsbGVkKSB7XG4gICAgaWYgKHR5cGVvZiBvbkZ1bGZpbGxlZCAhPT0gJ2Z1bmN0aW9uJykgcmV0dXJuIHRoaXNcbiAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgYXNhcChmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgcmVzb2x2ZShvbkZ1bGZpbGxlZCh2YWx1ZSkpXG4gICAgICAgIH0gY2F0Y2ggKGV4KSB7XG4gICAgICAgICAgcmVqZWN0KGV4KTtcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICB9KVxuICB9XG59XG5WYWx1ZVByb21pc2UucHJvdG90eXBlID0gUHJvbWlzZS5wcm90b3R5cGVcblxudmFyIFRSVUUgPSBuZXcgVmFsdWVQcm9taXNlKHRydWUpXG52YXIgRkFMU0UgPSBuZXcgVmFsdWVQcm9taXNlKGZhbHNlKVxudmFyIE5VTEwgPSBuZXcgVmFsdWVQcm9taXNlKG51bGwpXG52YXIgVU5ERUZJTkVEID0gbmV3IFZhbHVlUHJvbWlzZSh1bmRlZmluZWQpXG52YXIgWkVSTyA9IG5ldyBWYWx1ZVByb21pc2UoMClcbnZhciBFTVBUWVNUUklORyA9IG5ldyBWYWx1ZVByb21pc2UoJycpXG5cblByb21pc2UucmVzb2x2ZSA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICBpZiAodmFsdWUgaW5zdGFuY2VvZiBQcm9taXNlKSByZXR1cm4gdmFsdWVcblxuICBpZiAodmFsdWUgPT09IG51bGwpIHJldHVybiBOVUxMXG4gIGlmICh2YWx1ZSA9PT0gdW5kZWZpbmVkKSByZXR1cm4gVU5ERUZJTkVEXG4gIGlmICh2YWx1ZSA9PT0gdHJ1ZSkgcmV0dXJuIFRSVUVcbiAgaWYgKHZhbHVlID09PSBmYWxzZSkgcmV0dXJuIEZBTFNFXG4gIGlmICh2YWx1ZSA9PT0gMCkgcmV0dXJuIFpFUk9cbiAgaWYgKHZhbHVlID09PSAnJykgcmV0dXJuIEVNUFRZU1RSSU5HXG5cbiAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgfHwgdHlwZW9mIHZhbHVlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgdHJ5IHtcbiAgICAgIHZhciB0aGVuID0gdmFsdWUudGhlblxuICAgICAgaWYgKHR5cGVvZiB0aGVuID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSh0aGVuLmJpbmQodmFsdWUpKVxuICAgICAgfVxuICAgIH0gY2F0Y2ggKGV4KSB7XG4gICAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICByZWplY3QoZXgpXG4gICAgICB9KVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBuZXcgVmFsdWVQcm9taXNlKHZhbHVlKVxufVxuXG5Qcm9taXNlLmFsbCA9IGZ1bmN0aW9uIChhcnIpIHtcbiAgdmFyIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcnIpXG5cbiAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICBpZiAoYXJncy5sZW5ndGggPT09IDApIHJldHVybiByZXNvbHZlKFtdKVxuICAgIHZhciByZW1haW5pbmcgPSBhcmdzLmxlbmd0aFxuICAgIGZ1bmN0aW9uIHJlcyhpLCB2YWwpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGlmICh2YWwgJiYgKHR5cGVvZiB2YWwgPT09ICdvYmplY3QnIHx8IHR5cGVvZiB2YWwgPT09ICdmdW5jdGlvbicpKSB7XG4gICAgICAgICAgdmFyIHRoZW4gPSB2YWwudGhlblxuICAgICAgICAgIGlmICh0eXBlb2YgdGhlbiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgdGhlbi5jYWxsKHZhbCwgZnVuY3Rpb24gKHZhbCkgeyByZXMoaSwgdmFsKSB9LCByZWplY3QpXG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgYXJnc1tpXSA9IHZhbFxuICAgICAgICBpZiAoLS1yZW1haW5pbmcgPT09IDApIHtcbiAgICAgICAgICByZXNvbHZlKGFyZ3MpO1xuICAgICAgICB9XG4gICAgICB9IGNhdGNoIChleCkge1xuICAgICAgICByZWplY3QoZXgpXG4gICAgICB9XG4gICAgfVxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJncy5sZW5ndGg7IGkrKykge1xuICAgICAgcmVzKGksIGFyZ3NbaV0pXG4gICAgfVxuICB9KVxufVxuXG5Qcm9taXNlLnJlamVjdCA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkgeyBcbiAgICByZWplY3QodmFsdWUpO1xuICB9KTtcbn1cblxuUHJvbWlzZS5yYWNlID0gZnVuY3Rpb24gKHZhbHVlcykge1xuICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkgeyBcbiAgICB2YWx1ZXMuZm9yRWFjaChmdW5jdGlvbih2YWx1ZSl7XG4gICAgICBQcm9taXNlLnJlc29sdmUodmFsdWUpLnRoZW4ocmVzb2x2ZSwgcmVqZWN0KTtcbiAgICB9KVxuICB9KTtcbn1cblxuLyogUHJvdG90eXBlIE1ldGhvZHMgKi9cblxuUHJvbWlzZS5wcm90b3R5cGVbJ2NhdGNoJ10gPSBmdW5jdGlvbiAob25SZWplY3RlZCkge1xuICByZXR1cm4gdGhpcy50aGVuKG51bGwsIG9uUmVqZWN0ZWQpO1xufVxuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vL1RoaXMgZmlsZSBjb250YWlucyB0aGVuL3Byb21pc2Ugc3BlY2lmaWMgZXh0ZW5zaW9ucyB0aGF0IGFyZSBvbmx5IHVzZWZ1bCBmb3Igbm9kZS5qcyBpbnRlcm9wXG5cbnZhciBQcm9taXNlID0gcmVxdWlyZSgnLi9jb3JlLmpzJylcbnZhciBhc2FwID0gcmVxdWlyZSgnYXNhcCcpXG5cbm1vZHVsZS5leHBvcnRzID0gUHJvbWlzZVxuXG4vKiBTdGF0aWMgRnVuY3Rpb25zICovXG5cblByb21pc2UuZGVub2RlaWZ5ID0gZnVuY3Rpb24gKGZuLCBhcmd1bWVudENvdW50KSB7XG4gIGFyZ3VtZW50Q291bnQgPSBhcmd1bWVudENvdW50IHx8IEluZmluaXR5XG4gIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzXG4gICAgdmFyIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMpXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgIHdoaWxlIChhcmdzLmxlbmd0aCAmJiBhcmdzLmxlbmd0aCA+IGFyZ3VtZW50Q291bnQpIHtcbiAgICAgICAgYXJncy5wb3AoKVxuICAgICAgfVxuICAgICAgYXJncy5wdXNoKGZ1bmN0aW9uIChlcnIsIHJlcykge1xuICAgICAgICBpZiAoZXJyKSByZWplY3QoZXJyKVxuICAgICAgICBlbHNlIHJlc29sdmUocmVzKVxuICAgICAgfSlcbiAgICAgIHZhciByZXMgPSBmbi5hcHBseShzZWxmLCBhcmdzKVxuICAgICAgaWYgKHJlcyAmJiAodHlwZW9mIHJlcyA9PT0gJ29iamVjdCcgfHwgdHlwZW9mIHJlcyA9PT0gJ2Z1bmN0aW9uJykgJiYgdHlwZW9mIHJlcy50aGVuID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHJlc29sdmUocmVzKVxuICAgICAgfVxuICAgIH0pXG4gIH1cbn1cblByb21pc2Uubm9kZWlmeSA9IGZ1bmN0aW9uIChmbikge1xuICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgIHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKVxuICAgIHZhciBjYWxsYmFjayA9IHR5cGVvZiBhcmdzW2FyZ3MubGVuZ3RoIC0gMV0gPT09ICdmdW5jdGlvbicgPyBhcmdzLnBvcCgpIDogbnVsbFxuICAgIHZhciBjdHggPSB0aGlzXG4gICAgdHJ5IHtcbiAgICAgIHJldHVybiBmbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpLm5vZGVpZnkoY2FsbGJhY2ssIGN0eClcbiAgICB9IGNhdGNoIChleCkge1xuICAgICAgaWYgKGNhbGxiYWNrID09PSBudWxsIHx8IHR5cGVvZiBjYWxsYmFjayA9PSAndW5kZWZpbmVkJykge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkgeyByZWplY3QoZXgpIH0pXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBhc2FwKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICBjYWxsYmFjay5jYWxsKGN0eCwgZXgpXG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cblByb21pc2UucHJvdG90eXBlLm5vZGVpZnkgPSBmdW5jdGlvbiAoY2FsbGJhY2ssIGN0eCkge1xuICBpZiAodHlwZW9mIGNhbGxiYWNrICE9ICdmdW5jdGlvbicpIHJldHVybiB0aGlzXG5cbiAgdGhpcy50aGVuKGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgIGFzYXAoZnVuY3Rpb24gKCkge1xuICAgICAgY2FsbGJhY2suY2FsbChjdHgsIG51bGwsIHZhbHVlKVxuICAgIH0pXG4gIH0sIGZ1bmN0aW9uIChlcnIpIHtcbiAgICBhc2FwKGZ1bmN0aW9uICgpIHtcbiAgICAgIGNhbGxiYWNrLmNhbGwoY3R4LCBlcnIpXG4gICAgfSlcbiAgfSlcbn1cbiIsIlxuLy8gVXNlIHRoZSBmYXN0ZXN0IHBvc3NpYmxlIG1lYW5zIHRvIGV4ZWN1dGUgYSB0YXNrIGluIGEgZnV0dXJlIHR1cm5cbi8vIG9mIHRoZSBldmVudCBsb29wLlxuXG4vLyBsaW5rZWQgbGlzdCBvZiB0YXNrcyAoc2luZ2xlLCB3aXRoIGhlYWQgbm9kZSlcbnZhciBoZWFkID0ge3Rhc2s6IHZvaWQgMCwgbmV4dDogbnVsbH07XG52YXIgdGFpbCA9IGhlYWQ7XG52YXIgZmx1c2hpbmcgPSBmYWxzZTtcbnZhciByZXF1ZXN0Rmx1c2ggPSB2b2lkIDA7XG52YXIgaXNOb2RlSlMgPSBmYWxzZTtcblxuZnVuY3Rpb24gZmx1c2goKSB7XG4gICAgLyoganNoaW50IGxvb3BmdW5jOiB0cnVlICovXG5cbiAgICB3aGlsZSAoaGVhZC5uZXh0KSB7XG4gICAgICAgIGhlYWQgPSBoZWFkLm5leHQ7XG4gICAgICAgIHZhciB0YXNrID0gaGVhZC50YXNrO1xuICAgICAgICBoZWFkLnRhc2sgPSB2b2lkIDA7XG4gICAgICAgIHZhciBkb21haW4gPSBoZWFkLmRvbWFpbjtcblxuICAgICAgICBpZiAoZG9tYWluKSB7XG4gICAgICAgICAgICBoZWFkLmRvbWFpbiA9IHZvaWQgMDtcbiAgICAgICAgICAgIGRvbWFpbi5lbnRlcigpO1xuICAgICAgICB9XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHRhc2soKTtcblxuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICBpZiAoaXNOb2RlSlMpIHtcbiAgICAgICAgICAgICAgICAvLyBJbiBub2RlLCB1bmNhdWdodCBleGNlcHRpb25zIGFyZSBjb25zaWRlcmVkIGZhdGFsIGVycm9ycy5cbiAgICAgICAgICAgICAgICAvLyBSZS10aHJvdyB0aGVtIHN5bmNocm9ub3VzbHkgdG8gaW50ZXJydXB0IGZsdXNoaW5nIVxuXG4gICAgICAgICAgICAgICAgLy8gRW5zdXJlIGNvbnRpbnVhdGlvbiBpZiB0aGUgdW5jYXVnaHQgZXhjZXB0aW9uIGlzIHN1cHByZXNzZWRcbiAgICAgICAgICAgICAgICAvLyBsaXN0ZW5pbmcgXCJ1bmNhdWdodEV4Y2VwdGlvblwiIGV2ZW50cyAoYXMgZG9tYWlucyBkb2VzKS5cbiAgICAgICAgICAgICAgICAvLyBDb250aW51ZSBpbiBuZXh0IGV2ZW50IHRvIGF2b2lkIHRpY2sgcmVjdXJzaW9uLlxuICAgICAgICAgICAgICAgIGlmIChkb21haW4pIHtcbiAgICAgICAgICAgICAgICAgICAgZG9tYWluLmV4aXQoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgc2V0VGltZW91dChmbHVzaCwgMCk7XG4gICAgICAgICAgICAgICAgaWYgKGRvbWFpbikge1xuICAgICAgICAgICAgICAgICAgICBkb21haW4uZW50ZXIoKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB0aHJvdyBlO1xuXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIEluIGJyb3dzZXJzLCB1bmNhdWdodCBleGNlcHRpb25zIGFyZSBub3QgZmF0YWwuXG4gICAgICAgICAgICAgICAgLy8gUmUtdGhyb3cgdGhlbSBhc3luY2hyb25vdXNseSB0byBhdm9pZCBzbG93LWRvd25zLlxuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgdGhyb3cgZTtcbiAgICAgICAgICAgICAgICB9LCAwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChkb21haW4pIHtcbiAgICAgICAgICAgIGRvbWFpbi5leGl0KCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmbHVzaGluZyA9IGZhbHNlO1xufVxuXG5pZiAodHlwZW9mIHByb2Nlc3MgIT09IFwidW5kZWZpbmVkXCIgJiYgcHJvY2Vzcy5uZXh0VGljaykge1xuICAgIC8vIE5vZGUuanMgYmVmb3JlIDAuOS4gTm90ZSB0aGF0IHNvbWUgZmFrZS1Ob2RlIGVudmlyb25tZW50cywgbGlrZSB0aGVcbiAgICAvLyBNb2NoYSB0ZXN0IHJ1bm5lciwgaW50cm9kdWNlIGEgYHByb2Nlc3NgIGdsb2JhbCB3aXRob3V0IGEgYG5leHRUaWNrYC5cbiAgICBpc05vZGVKUyA9IHRydWU7XG5cbiAgICByZXF1ZXN0Rmx1c2ggPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHByb2Nlc3MubmV4dFRpY2soZmx1c2gpO1xuICAgIH07XG5cbn0gZWxzZSBpZiAodHlwZW9mIHNldEltbWVkaWF0ZSA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgLy8gSW4gSUUxMCwgTm9kZS5qcyAwLjkrLCBvciBodHRwczovL2dpdGh1Yi5jb20vTm9ibGVKUy9zZXRJbW1lZGlhdGVcbiAgICBpZiAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICByZXF1ZXN0Rmx1c2ggPSBzZXRJbW1lZGlhdGUuYmluZCh3aW5kb3csIGZsdXNoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByZXF1ZXN0Rmx1c2ggPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBzZXRJbW1lZGlhdGUoZmx1c2gpO1xuICAgICAgICB9O1xuICAgIH1cblxufSBlbHNlIGlmICh0eXBlb2YgTWVzc2FnZUNoYW5uZWwgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAvLyBtb2Rlcm4gYnJvd3NlcnNcbiAgICAvLyBodHRwOi8vd3d3Lm5vbmJsb2NraW5nLmlvLzIwMTEvMDYvd2luZG93bmV4dHRpY2suaHRtbFxuICAgIHZhciBjaGFubmVsID0gbmV3IE1lc3NhZ2VDaGFubmVsKCk7XG4gICAgY2hhbm5lbC5wb3J0MS5vbm1lc3NhZ2UgPSBmbHVzaDtcbiAgICByZXF1ZXN0Rmx1c2ggPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGNoYW5uZWwucG9ydDIucG9zdE1lc3NhZ2UoMCk7XG4gICAgfTtcblxufSBlbHNlIHtcbiAgICAvLyBvbGQgYnJvd3NlcnNcbiAgICByZXF1ZXN0Rmx1c2ggPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHNldFRpbWVvdXQoZmx1c2gsIDApO1xuICAgIH07XG59XG5cbmZ1bmN0aW9uIGFzYXAodGFzaykge1xuICAgIHRhaWwgPSB0YWlsLm5leHQgPSB7XG4gICAgICAgIHRhc2s6IHRhc2ssXG4gICAgICAgIGRvbWFpbjogaXNOb2RlSlMgJiYgcHJvY2Vzcy5kb21haW4sXG4gICAgICAgIG5leHQ6IG51bGxcbiAgICB9O1xuXG4gICAgaWYgKCFmbHVzaGluZykge1xuICAgICAgICBmbHVzaGluZyA9IHRydWU7XG4gICAgICAgIHJlcXVlc3RGbHVzaCgpO1xuICAgIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gYXNhcDtcblxuIiwidmFyIHdpbmRvdyA9IHJlcXVpcmUoXCJnbG9iYWwvd2luZG93XCIpXG52YXIgb25jZSA9IHJlcXVpcmUoXCJvbmNlXCIpXG52YXIgcGFyc2VIZWFkZXJzID0gcmVxdWlyZSgncGFyc2UtaGVhZGVycycpXG5cbnZhciBtZXNzYWdlcyA9IHtcbiAgICBcIjBcIjogXCJJbnRlcm5hbCBYTUxIdHRwUmVxdWVzdCBFcnJvclwiLFxuICAgIFwiNFwiOiBcIjR4eCBDbGllbnQgRXJyb3JcIixcbiAgICBcIjVcIjogXCI1eHggU2VydmVyIEVycm9yXCJcbn1cblxudmFyIFhIUiA9IHdpbmRvdy5YTUxIdHRwUmVxdWVzdCB8fCBub29wXG52YXIgWERSID0gXCJ3aXRoQ3JlZGVudGlhbHNcIiBpbiAobmV3IFhIUigpKSA/IFhIUiA6IHdpbmRvdy5YRG9tYWluUmVxdWVzdFxuXG5tb2R1bGUuZXhwb3J0cyA9IGNyZWF0ZVhIUlxuXG5mdW5jdGlvbiBjcmVhdGVYSFIob3B0aW9ucywgY2FsbGJhY2spIHtcbiAgICBpZiAodHlwZW9mIG9wdGlvbnMgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgb3B0aW9ucyA9IHsgdXJpOiBvcHRpb25zIH1cbiAgICB9XG5cbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fVxuICAgIGNhbGxiYWNrID0gb25jZShjYWxsYmFjaylcblxuICAgIHZhciB4aHIgPSBvcHRpb25zLnhociB8fCBudWxsXG5cbiAgICBpZiAoIXhocikge1xuICAgICAgICBpZiAob3B0aW9ucy5jb3JzIHx8IG9wdGlvbnMudXNlWERSKSB7XG4gICAgICAgICAgICB4aHIgPSBuZXcgWERSKClcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICB4aHIgPSBuZXcgWEhSKClcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHZhciB1cmkgPSB4aHIudXJsID0gb3B0aW9ucy51cmkgfHwgb3B0aW9ucy51cmxcbiAgICB2YXIgbWV0aG9kID0geGhyLm1ldGhvZCA9IG9wdGlvbnMubWV0aG9kIHx8IFwiR0VUXCJcbiAgICB2YXIgYm9keSA9IG9wdGlvbnMuYm9keSB8fCBvcHRpb25zLmRhdGFcbiAgICB2YXIgaGVhZGVycyA9IHhoci5oZWFkZXJzID0gb3B0aW9ucy5oZWFkZXJzIHx8IHt9XG4gICAgdmFyIHN5bmMgPSAhIW9wdGlvbnMuc3luY1xuICAgIHZhciBpc0pzb24gPSBmYWxzZVxuICAgIHZhciBrZXlcbiAgICB2YXIgbG9hZCA9IG9wdGlvbnMucmVzcG9uc2UgPyBsb2FkUmVzcG9uc2UgOiBsb2FkWGhyXG5cbiAgICBpZiAoXCJqc29uXCIgaW4gb3B0aW9ucykge1xuICAgICAgICBpc0pzb24gPSB0cnVlXG4gICAgICAgIGhlYWRlcnNbXCJBY2NlcHRcIl0gPSBcImFwcGxpY2F0aW9uL2pzb25cIlxuICAgICAgICBpZiAobWV0aG9kICE9PSBcIkdFVFwiICYmIG1ldGhvZCAhPT0gXCJIRUFEXCIpIHtcbiAgICAgICAgICAgIGhlYWRlcnNbXCJDb250ZW50LVR5cGVcIl0gPSBcImFwcGxpY2F0aW9uL2pzb25cIlxuICAgICAgICAgICAgYm9keSA9IEpTT04uc3RyaW5naWZ5KG9wdGlvbnMuanNvbilcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHhoci5vbnJlYWR5c3RhdGVjaGFuZ2UgPSByZWFkeXN0YXRlY2hhbmdlXG4gICAgeGhyLm9ubG9hZCA9IGxvYWRcbiAgICB4aHIub25lcnJvciA9IGVycm9yXG4gICAgLy8gSUU5IG11c3QgaGF2ZSBvbnByb2dyZXNzIGJlIHNldCB0byBhIHVuaXF1ZSBmdW5jdGlvbi5cbiAgICB4aHIub25wcm9ncmVzcyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgLy8gSUUgbXVzdCBkaWVcbiAgICB9XG4gICAgLy8gaGF0ZSBJRVxuICAgIHhoci5vbnRpbWVvdXQgPSBub29wXG4gICAgeGhyLm9wZW4obWV0aG9kLCB1cmksICFzeW5jKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9iYWNrd2FyZCBjb21wYXRpYmlsaXR5XG4gICAgaWYgKG9wdGlvbnMud2l0aENyZWRlbnRpYWxzIHx8IChvcHRpb25zLmNvcnMgJiYgb3B0aW9ucy53aXRoQ3JlZGVudGlhbHMgIT09IGZhbHNlKSkge1xuICAgICAgICB4aHIud2l0aENyZWRlbnRpYWxzID0gdHJ1ZVxuICAgIH1cblxuICAgIC8vIENhbm5vdCBzZXQgdGltZW91dCB3aXRoIHN5bmMgcmVxdWVzdFxuICAgIGlmICghc3luYykge1xuICAgICAgICB4aHIudGltZW91dCA9IFwidGltZW91dFwiIGluIG9wdGlvbnMgPyBvcHRpb25zLnRpbWVvdXQgOiA1MDAwXG4gICAgfVxuXG4gICAgaWYgKHhoci5zZXRSZXF1ZXN0SGVhZGVyKSB7XG4gICAgICAgIGZvcihrZXkgaW4gaGVhZGVycyl7XG4gICAgICAgICAgICBpZihoZWFkZXJzLmhhc093blByb3BlcnR5KGtleSkpe1xuICAgICAgICAgICAgICAgIHhoci5zZXRSZXF1ZXN0SGVhZGVyKGtleSwgaGVhZGVyc1trZXldKVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSBlbHNlIGlmIChvcHRpb25zLmhlYWRlcnMpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiSGVhZGVycyBjYW5ub3QgYmUgc2V0IG9uIGFuIFhEb21haW5SZXF1ZXN0IG9iamVjdFwiKVxuICAgIH1cblxuICAgIGlmIChcInJlc3BvbnNlVHlwZVwiIGluIG9wdGlvbnMpIHtcbiAgICAgICAgeGhyLnJlc3BvbnNlVHlwZSA9IG9wdGlvbnMucmVzcG9uc2VUeXBlXG4gICAgfVxuICAgIFxuICAgIGlmIChcImJlZm9yZVNlbmRcIiBpbiBvcHRpb25zICYmIFxuICAgICAgICB0eXBlb2Ygb3B0aW9ucy5iZWZvcmVTZW5kID09PSBcImZ1bmN0aW9uXCJcbiAgICApIHtcbiAgICAgICAgb3B0aW9ucy5iZWZvcmVTZW5kKHhocilcbiAgICB9XG5cbiAgICB4aHIuc2VuZChib2R5KVxuXG4gICAgcmV0dXJuIHhoclxuXG4gICAgZnVuY3Rpb24gcmVhZHlzdGF0ZWNoYW5nZSgpIHtcbiAgICAgICAgaWYgKHhoci5yZWFkeVN0YXRlID09PSA0KSB7XG4gICAgICAgICAgICBsb2FkKClcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGdldEJvZHkoKSB7XG4gICAgICAgIC8vIENocm9tZSB3aXRoIHJlcXVlc3RUeXBlPWJsb2IgdGhyb3dzIGVycm9ycyBhcnJvdW5kIHdoZW4gZXZlbiB0ZXN0aW5nIGFjY2VzcyB0byByZXNwb25zZVRleHRcbiAgICAgICAgdmFyIGJvZHkgPSBudWxsXG5cbiAgICAgICAgaWYgKHhoci5yZXNwb25zZSkge1xuICAgICAgICAgICAgYm9keSA9IHhoci5yZXNwb25zZVxuICAgICAgICB9IGVsc2UgaWYgKHhoci5yZXNwb25zZVR5cGUgPT09ICd0ZXh0JyB8fCAheGhyLnJlc3BvbnNlVHlwZSkge1xuICAgICAgICAgICAgYm9keSA9IHhoci5yZXNwb25zZVRleHQgfHwgeGhyLnJlc3BvbnNlWE1MXG4gICAgICAgIH1cblxuICAgICAgICBpZiAoaXNKc29uKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGJvZHkgPSBKU09OLnBhcnNlKGJvZHkpXG4gICAgICAgICAgICB9IGNhdGNoIChlKSB7fVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGJvZHlcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXRTdGF0dXNDb2RlKCkge1xuICAgICAgICByZXR1cm4geGhyLnN0YXR1cyA9PT0gMTIyMyA/IDIwNCA6IHhoci5zdGF0dXNcbiAgICB9XG5cbiAgICAvLyBpZiB3ZSdyZSBnZXR0aW5nIGEgbm9uZS1vayBzdGF0dXNDb2RlLCBidWlsZCAmIHJldHVybiBhbiBlcnJvclxuICAgIGZ1bmN0aW9uIGVycm9yRnJvbVN0YXR1c0NvZGUoc3RhdHVzLCBib2R5KSB7XG4gICAgICAgIHZhciBlcnJvciA9IG51bGxcbiAgICAgICAgaWYgKHN0YXR1cyA9PT0gMCB8fCAoc3RhdHVzID49IDQwMCAmJiBzdGF0dXMgPCA2MDApKSB7XG4gICAgICAgICAgICB2YXIgbWVzc2FnZSA9ICh0eXBlb2YgYm9keSA9PT0gXCJzdHJpbmdcIiA/IGJvZHkgOiBmYWxzZSkgfHxcbiAgICAgICAgICAgICAgICBtZXNzYWdlc1tTdHJpbmcoc3RhdHVzKS5jaGFyQXQoMCldXG4gICAgICAgICAgICBlcnJvciA9IG5ldyBFcnJvcihtZXNzYWdlKVxuICAgICAgICAgICAgZXJyb3Iuc3RhdHVzQ29kZSA9IHN0YXR1c1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGVycm9yXG4gICAgfVxuXG4gICAgLy8gd2lsbCBsb2FkIHRoZSBkYXRhICYgcHJvY2VzcyB0aGUgcmVzcG9uc2UgaW4gYSBzcGVjaWFsIHJlc3BvbnNlIG9iamVjdFxuICAgIGZ1bmN0aW9uIGxvYWRSZXNwb25zZSgpIHtcbiAgICAgICAgdmFyIHN0YXR1cyA9IGdldFN0YXR1c0NvZGUoKVxuICAgICAgICB2YXIgYm9keSA9IGdldEJvZHkoKVxuICAgICAgICB2YXIgZXJyb3IgPSBlcnJvckZyb21TdGF0dXNDb2RlKHN0YXR1cywgYm9keSlcbiAgICAgICAgdmFyIHJlc3BvbnNlID0ge1xuICAgICAgICAgICAgYm9keTogYm9keSxcbiAgICAgICAgICAgIHN0YXR1c0NvZGU6IHN0YXR1cyxcbiAgICAgICAgICAgIHN0YXR1c1RleHQ6IHhoci5zdGF0dXNUZXh0LFxuICAgICAgICAgICAgcmF3OiB4aHJcbiAgICAgICAgfVxuICAgICAgICBpZih4aHIuZ2V0QWxsUmVzcG9uc2VIZWFkZXJzKXsgLy9yZW1lbWJlciB4aHIgY2FuIGluIGZhY3QgYmUgWERSIGZvciBDT1JTIGluIElFXG4gICAgICAgICAgICByZXNwb25zZS5oZWFkZXJzID0gcGFyc2VIZWFkZXJzKHhoci5nZXRBbGxSZXNwb25zZUhlYWRlcnMoKSlcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJlc3BvbnNlLmhlYWRlcnMgPSB7fVxuICAgICAgICB9XG5cbiAgICAgICAgY2FsbGJhY2soZXJyb3IsIHJlc3BvbnNlLCByZXNwb25zZS5ib2R5KVxuICAgIH1cblxuICAgIC8vIHdpbGwgbG9hZCB0aGUgZGF0YSBhbmQgYWRkIHNvbWUgcmVzcG9uc2UgcHJvcGVydGllcyB0byB0aGUgc291cmNlIHhoclxuICAgIC8vIGFuZCB0aGVuIHJlc3BvbmQgd2l0aCB0aGF0XG4gICAgZnVuY3Rpb24gbG9hZFhocigpIHtcbiAgICAgICAgdmFyIHN0YXR1cyA9IGdldFN0YXR1c0NvZGUoKVxuICAgICAgICB2YXIgZXJyb3IgPSBlcnJvckZyb21TdGF0dXNDb2RlKHN0YXR1cylcblxuICAgICAgICB4aHIuc3RhdHVzID0geGhyLnN0YXR1c0NvZGUgPSBzdGF0dXNcbiAgICAgICAgeGhyLmJvZHkgPSBnZXRCb2R5KClcbiAgICAgICAgeGhyLmhlYWRlcnMgPSBwYXJzZUhlYWRlcnMoeGhyLmdldEFsbFJlc3BvbnNlSGVhZGVycygpKVxuXG4gICAgICAgIGNhbGxiYWNrKGVycm9yLCB4aHIsIHhoci5ib2R5KVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGVycm9yKGV2dCkge1xuICAgICAgICBjYWxsYmFjayhldnQsIHhocilcbiAgICB9XG59XG5cblxuZnVuY3Rpb24gbm9vcCgpIHt9XG4iLCJpZiAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgIG1vZHVsZS5leHBvcnRzID0gd2luZG93O1xufSBlbHNlIGlmICh0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBnbG9iYWw7XG59IGVsc2UgaWYgKHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiKXtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IHNlbGY7XG59IGVsc2Uge1xuICAgIG1vZHVsZS5leHBvcnRzID0ge307XG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IG9uY2Vcblxub25jZS5wcm90byA9IG9uY2UoZnVuY3Rpb24gKCkge1xuICBPYmplY3QuZGVmaW5lUHJvcGVydHkoRnVuY3Rpb24ucHJvdG90eXBlLCAnb25jZScsIHtcbiAgICB2YWx1ZTogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIG9uY2UodGhpcylcbiAgICB9LFxuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICB9KVxufSlcblxuZnVuY3Rpb24gb25jZSAoZm4pIHtcbiAgdmFyIGNhbGxlZCA9IGZhbHNlXG4gIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKGNhbGxlZCkgcmV0dXJuXG4gICAgY2FsbGVkID0gdHJ1ZVxuICAgIHJldHVybiBmbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpXG4gIH1cbn1cbiIsInZhciBpc0Z1bmN0aW9uID0gcmVxdWlyZSgnaXMtZnVuY3Rpb24nKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZvckVhY2hcblxudmFyIHRvU3RyaW5nID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZ1xudmFyIGhhc093blByb3BlcnR5ID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eVxuXG5mdW5jdGlvbiBmb3JFYWNoKGxpc3QsIGl0ZXJhdG9yLCBjb250ZXh0KSB7XG4gICAgaWYgKCFpc0Z1bmN0aW9uKGl0ZXJhdG9yKSkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdpdGVyYXRvciBtdXN0IGJlIGEgZnVuY3Rpb24nKVxuICAgIH1cblxuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoIDwgMykge1xuICAgICAgICBjb250ZXh0ID0gdGhpc1xuICAgIH1cbiAgICBcbiAgICBpZiAodG9TdHJpbmcuY2FsbChsaXN0KSA9PT0gJ1tvYmplY3QgQXJyYXldJylcbiAgICAgICAgZm9yRWFjaEFycmF5KGxpc3QsIGl0ZXJhdG9yLCBjb250ZXh0KVxuICAgIGVsc2UgaWYgKHR5cGVvZiBsaXN0ID09PSAnc3RyaW5nJylcbiAgICAgICAgZm9yRWFjaFN0cmluZyhsaXN0LCBpdGVyYXRvciwgY29udGV4dClcbiAgICBlbHNlXG4gICAgICAgIGZvckVhY2hPYmplY3QobGlzdCwgaXRlcmF0b3IsIGNvbnRleHQpXG59XG5cbmZ1bmN0aW9uIGZvckVhY2hBcnJheShhcnJheSwgaXRlcmF0b3IsIGNvbnRleHQpIHtcbiAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gYXJyYXkubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgaWYgKGhhc093blByb3BlcnR5LmNhbGwoYXJyYXksIGkpKSB7XG4gICAgICAgICAgICBpdGVyYXRvci5jYWxsKGNvbnRleHQsIGFycmF5W2ldLCBpLCBhcnJheSlcbiAgICAgICAgfVxuICAgIH1cbn1cblxuZnVuY3Rpb24gZm9yRWFjaFN0cmluZyhzdHJpbmcsIGl0ZXJhdG9yLCBjb250ZXh0KSB7XG4gICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IHN0cmluZy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgICAvLyBubyBzdWNoIHRoaW5nIGFzIGEgc3BhcnNlIHN0cmluZy5cbiAgICAgICAgaXRlcmF0b3IuY2FsbChjb250ZXh0LCBzdHJpbmcuY2hhckF0KGkpLCBpLCBzdHJpbmcpXG4gICAgfVxufVxuXG5mdW5jdGlvbiBmb3JFYWNoT2JqZWN0KG9iamVjdCwgaXRlcmF0b3IsIGNvbnRleHQpIHtcbiAgICBmb3IgKHZhciBrIGluIG9iamVjdCkge1xuICAgICAgICBpZiAoaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIGspKSB7XG4gICAgICAgICAgICBpdGVyYXRvci5jYWxsKGNvbnRleHQsIG9iamVjdFtrXSwgaywgb2JqZWN0KVxuICAgICAgICB9XG4gICAgfVxufVxuIiwibW9kdWxlLmV4cG9ydHMgPSBpc0Z1bmN0aW9uXG5cbnZhciB0b1N0cmluZyA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmdcblxuZnVuY3Rpb24gaXNGdW5jdGlvbiAoZm4pIHtcbiAgdmFyIHN0cmluZyA9IHRvU3RyaW5nLmNhbGwoZm4pXG4gIHJldHVybiBzdHJpbmcgPT09ICdbb2JqZWN0IEZ1bmN0aW9uXScgfHxcbiAgICAodHlwZW9mIGZuID09PSAnZnVuY3Rpb24nICYmIHN0cmluZyAhPT0gJ1tvYmplY3QgUmVnRXhwXScpIHx8XG4gICAgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICYmXG4gICAgIC8vIElFOCBhbmQgYmVsb3dcbiAgICAgKGZuID09PSB3aW5kb3cuc2V0VGltZW91dCB8fFxuICAgICAgZm4gPT09IHdpbmRvdy5hbGVydCB8fFxuICAgICAgZm4gPT09IHdpbmRvdy5jb25maXJtIHx8XG4gICAgICBmbiA9PT0gd2luZG93LnByb21wdCkpXG59O1xuIiwiXG5leHBvcnRzID0gbW9kdWxlLmV4cG9ydHMgPSB0cmltO1xuXG5mdW5jdGlvbiB0cmltKHN0cil7XG4gIHJldHVybiBzdHIucmVwbGFjZSgvXlxccyp8XFxzKiQvZywgJycpO1xufVxuXG5leHBvcnRzLmxlZnQgPSBmdW5jdGlvbihzdHIpe1xuICByZXR1cm4gc3RyLnJlcGxhY2UoL15cXHMqLywgJycpO1xufTtcblxuZXhwb3J0cy5yaWdodCA9IGZ1bmN0aW9uKHN0cil7XG4gIHJldHVybiBzdHIucmVwbGFjZSgvXFxzKiQvLCAnJyk7XG59O1xuIiwidmFyIHRyaW0gPSByZXF1aXJlKCd0cmltJylcbiAgLCBmb3JFYWNoID0gcmVxdWlyZSgnZm9yLWVhY2gnKVxuICAsIGlzQXJyYXkgPSBmdW5jdGlvbihhcmcpIHtcbiAgICAgIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoYXJnKSA9PT0gJ1tvYmplY3QgQXJyYXldJztcbiAgICB9XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGhlYWRlcnMpIHtcbiAgaWYgKCFoZWFkZXJzKVxuICAgIHJldHVybiB7fVxuXG4gIHZhciByZXN1bHQgPSB7fVxuXG4gIGZvckVhY2goXG4gICAgICB0cmltKGhlYWRlcnMpLnNwbGl0KCdcXG4nKVxuICAgICwgZnVuY3Rpb24gKHJvdykge1xuICAgICAgICB2YXIgaW5kZXggPSByb3cuaW5kZXhPZignOicpXG4gICAgICAgICAgLCBrZXkgPSB0cmltKHJvdy5zbGljZSgwLCBpbmRleCkpLnRvTG93ZXJDYXNlKClcbiAgICAgICAgICAsIHZhbHVlID0gdHJpbShyb3cuc2xpY2UoaW5kZXggKyAxKSlcblxuICAgICAgICBpZiAodHlwZW9mKHJlc3VsdFtrZXldKSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICByZXN1bHRba2V5XSA9IHZhbHVlXG4gICAgICAgIH0gZWxzZSBpZiAoaXNBcnJheShyZXN1bHRba2V5XSkpIHtcbiAgICAgICAgICByZXN1bHRba2V5XS5wdXNoKHZhbHVlKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJlc3VsdFtrZXldID0gWyByZXN1bHRba2V5XSwgdmFsdWUgXVxuICAgICAgICB9XG4gICAgICB9XG4gIClcblxuICByZXR1cm4gcmVzdWx0XG59IiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7XG5cdHZhbHVlOiB0cnVlXG59KTtcblxudmFyIF9leHRlbmRzID0gT2JqZWN0LmFzc2lnbiB8fCBmdW5jdGlvbiAodGFyZ2V0KSB7IGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7IHZhciBzb3VyY2UgPSBhcmd1bWVudHNbaV07IGZvciAodmFyIGtleSBpbiBzb3VyY2UpIHsgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzb3VyY2UsIGtleSkpIHsgdGFyZ2V0W2tleV0gPSBzb3VyY2Vba2V5XTsgfSB9IH0gcmV0dXJuIHRhcmdldDsgfTtcblxudmFyIGJsYWNrbGlzdCA9IHJlcXVpcmUoJ2JsYWNrbGlzdCcpO1xudmFyIGNsYXNzbmFtZXMgPSByZXF1aXJlKCdjbGFzc25hbWVzJyk7XG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG5mdW5jdGlvbiBoYXNDaGlsZHJlbldpdGhWZXJ0aWNhbEZpbGwoY2hpbGRyZW4pIHtcblx0dmFyIHJlc3VsdCA9IGZhbHNlO1xuXG5cdFJlYWN0LkNoaWxkcmVuLmZvckVhY2goY2hpbGRyZW4sIGZ1bmN0aW9uIChjKSB7XG5cdFx0aWYgKHJlc3VsdCkgcmV0dXJuOyAvLyBlYXJseS1leGl0XG5cdFx0aWYgKCFjKSByZXR1cm47XG5cdFx0aWYgKCFjLnR5cGUpIHJldHVybjtcblxuXHRcdHJlc3VsdCA9ICEhYy50eXBlLnNob3VsZEZpbGxWZXJ0aWNhbFNwYWNlO1xuXHR9KTtcblxuXHRyZXR1cm4gcmVzdWx0O1xufVxuXG52YXIgQ29udGFpbmVyID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXHRkaXNwbGF5TmFtZTogJ0NvbnRhaW5lcicsXG5cblx0cHJvcFR5cGVzOiB7XG5cdFx0YWxpZ246IFJlYWN0LlByb3BUeXBlcy5vbmVPZihbJ2VuZCcsICdjZW50ZXInLCAnc3RhcnQnXSksXG5cdFx0ZGlyZWN0aW9uOiBSZWFjdC5Qcm9wVHlwZXMub25lT2YoWydjb2x1bW4nLCAncm93J10pLFxuXHRcdGp1c3RpZnk6IFJlYWN0LlByb3BUeXBlcy5vbmVPZlR5cGUoW1JlYWN0LlByb3BUeXBlcy5ib29sLCBSZWFjdC5Qcm9wVHlwZXMub25lT2YoWydlbmQnLCAnY2VudGVyJywgJ3N0YXJ0J10pXSksXG5cdFx0Z3JvdzogUmVhY3QuUHJvcFR5cGVzLmJvb2wsXG5cdFx0ZmlsbDogUmVhY3QuUHJvcFR5cGVzLmJvb2xcblx0fSxcblx0Y29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uIGNvbXBvbmVudERpZE1vdW50KCkge1xuXHRcdGlmICh0aGlzLnByb3BzLnNjcm9sbGFibGUgJiYgdGhpcy5wcm9wcy5zY3JvbGxhYmxlLm1vdW50KSB7XG5cdFx0XHR0aGlzLnByb3BzLnNjcm9sbGFibGUubW91bnQodGhpcyk7XG5cdFx0fVxuXHR9LFxuXHRjb21wb25lbnRXaWxsVW5tb3VudDogZnVuY3Rpb24gY29tcG9uZW50V2lsbFVubW91bnQoKSB7XG5cdFx0aWYgKHRoaXMucHJvcHMuc2Nyb2xsYWJsZSAmJiB0aGlzLnByb3BzLnNjcm9sbGFibGUudW5tb3VudCkge1xuXHRcdFx0dGhpcy5wcm9wcy5zY3JvbGxhYmxlLnVubW91bnQodGhpcyk7XG5cdFx0fVxuXHR9LFxuXHRyZW5kZXI6IGZ1bmN0aW9uIHJlbmRlcigpIHtcblx0XHR2YXIgZGlyZWN0aW9uID0gdGhpcy5wcm9wcy5kaXJlY3Rpb247XG5cdFx0aWYgKCFkaXJlY3Rpb24pIHtcblx0XHRcdGlmIChoYXNDaGlsZHJlbldpdGhWZXJ0aWNhbEZpbGwodGhpcy5wcm9wcy5jaGlsZHJlbikpIHtcblx0XHRcdFx0ZGlyZWN0aW9uID0gJ2NvbHVtbic7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0dmFyIGZpbGwgPSB0aGlzLnByb3BzLmZpbGw7XG5cdFx0aWYgKGRpcmVjdGlvbiA9PT0gJ2NvbHVtbicgfHwgdGhpcy5wcm9wcy5zY3JvbGxhYmxlKSB7XG5cdFx0XHRmaWxsID0gdHJ1ZTtcblx0XHR9XG5cblx0XHR2YXIgYWxpZ24gPSB0aGlzLnByb3BzLmFsaWduO1xuXHRcdGlmIChkaXJlY3Rpb24gPT09ICdjb2x1bW4nICYmIGFsaWduID09PSAndG9wJykgYWxpZ24gPSAnc3RhcnQnO1xuXHRcdGlmIChkaXJlY3Rpb24gPT09ICdjb2x1bW4nICYmIGFsaWduID09PSAnYm90dG9tJykgYWxpZ24gPSAnZW5kJztcblx0XHRpZiAoZGlyZWN0aW9uID09PSAncm93JyAmJiBhbGlnbiA9PT0gJ2xlZnQnKSBhbGlnbiA9ICdzdGFydCc7XG5cdFx0aWYgKGRpcmVjdGlvbiA9PT0gJ3JvdycgJiYgYWxpZ24gPT09ICdyaWdodCcpIGFsaWduID0gJ2VuZCc7XG5cblx0XHR2YXIgY2xhc3NOYW1lID0gY2xhc3NuYW1lcyh0aGlzLnByb3BzLmNsYXNzTmFtZSwge1xuXHRcdFx0J0NvbnRhaW5lci0tZmlsbCc6IGZpbGwsXG5cdFx0XHQnQ29udGFpbmVyLS1kaXJlY3Rpb24tY29sdW1uJzogZGlyZWN0aW9uID09PSAnY29sdW1uJyxcblx0XHRcdCdDb250YWluZXItLWRpcmVjdGlvbi1yb3cnOiBkaXJlY3Rpb24gPT09ICdyb3cnLFxuXHRcdFx0J0NvbnRhaW5lci0tYWxpZ24tY2VudGVyJzogYWxpZ24gPT09ICdjZW50ZXInLFxuXHRcdFx0J0NvbnRhaW5lci0tYWxpZ24tc3RhcnQnOiBhbGlnbiA9PT0gJ3N0YXJ0Jyxcblx0XHRcdCdDb250YWluZXItLWFsaWduLWVuZCc6IGFsaWduID09PSAnZW5kJyxcblx0XHRcdCdDb250YWluZXItLWp1c3RpZnktY2VudGVyJzogdGhpcy5wcm9wcy5qdXN0aWZ5ID09PSAnY2VudGVyJyxcblx0XHRcdCdDb250YWluZXItLWp1c3RpZnktc3RhcnQnOiB0aGlzLnByb3BzLmp1c3RpZnkgPT09ICdzdGFydCcsXG5cdFx0XHQnQ29udGFpbmVyLS1qdXN0aWZ5LWVuZCc6IHRoaXMucHJvcHMuanVzdGlmeSA9PT0gJ2VuZCcsXG5cdFx0XHQnQ29udGFpbmVyLS1qdXN0aWZpZWQnOiB0aGlzLnByb3BzLmp1c3RpZnkgPT09IHRydWUsXG5cdFx0XHQnQ29udGFpbmVyLS1zY3JvbGxhYmxlJzogdGhpcy5wcm9wcy5zY3JvbGxhYmxlXG5cdFx0fSk7XG5cblx0XHR2YXIgcHJvcHMgPSBibGFja2xpc3QodGhpcy5wcm9wcywgJ2NsYXNzTmFtZScsICdkaXJlY3Rpb24nLCAnZmlsbCcsICdqdXN0aWZ5JywgJ3Njcm9sbGFibGUnKTtcblxuXHRcdHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KFxuXHRcdFx0J2RpdicsXG5cdFx0XHRfZXh0ZW5kcyh7IGNsYXNzTmFtZTogY2xhc3NOYW1lIH0sIHByb3BzKSxcblx0XHRcdHRoaXMucHJvcHMuY2hpbGRyZW5cblx0XHQpO1xuXHR9XG59KTtcblxuZnVuY3Rpb24gaW5pdFNjcm9sbGFibGUoKSB7XG5cdHZhciBwb3M7XG5cdHZhciBzY3JvbGxhYmxlID0ge1xuXHRcdHJlc2V0OiBmdW5jdGlvbiByZXNldCgpIHtcblx0XHRcdHBvcyA9IHsgbGVmdDogMCwgdG9wOiAwIH07XG5cdFx0fSxcblx0XHRtb3VudDogZnVuY3Rpb24gbW91bnQoZWxlbWVudCkge1xuXHRcdFx0dmFyIG5vZGUgPSBSZWFjdC5maW5kRE9NTm9kZShlbGVtZW50KTtcblx0XHRcdG5vZGUuc2Nyb2xsTGVmdCA9IHBvcy5sZWZ0O1xuXHRcdFx0bm9kZS5zY3JvbGxUb3AgPSBwb3MudG9wO1xuXHRcdH0sXG5cdFx0dW5tb3VudDogZnVuY3Rpb24gdW5tb3VudChlbGVtZW50KSB7XG5cdFx0XHR2YXIgbm9kZSA9IFJlYWN0LmZpbmRET01Ob2RlKGVsZW1lbnQpO1xuXHRcdFx0cG9zLmxlZnQgPSBub2RlLnNjcm9sbExlZnQ7XG5cdFx0XHRwb3MudG9wID0gbm9kZS5zY3JvbGxUb3A7XG5cdFx0fVxuXHR9O1xuXHRzY3JvbGxhYmxlLnJlc2V0KCk7XG5cdHJldHVybiBzY3JvbGxhYmxlO1xufVxuXG5Db250YWluZXIuaW5pdFNjcm9sbGFibGUgPSBpbml0U2Nyb2xsYWJsZTtcblxuZXhwb3J0c1snZGVmYXVsdCddID0gQ29udGFpbmVyO1xubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107IiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBibGFja2xpc3QgKHNyYykge1xuICB2YXIgY29weSA9IHt9LCBmaWx0ZXIgPSBhcmd1bWVudHNbMV1cblxuICBpZiAodHlwZW9mIGZpbHRlciA9PT0gJ3N0cmluZycpIHtcbiAgICBmaWx0ZXIgPSB7fVxuICAgIGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBmaWx0ZXJbYXJndW1lbnRzW2ldXSA9IHRydWVcbiAgICB9XG4gIH1cblxuICBmb3IgKHZhciBrZXkgaW4gc3JjKSB7XG4gICAgLy8gYmxhY2tsaXN0P1xuICAgIGlmIChmaWx0ZXJba2V5XSkgY29udGludWVcblxuICAgIGNvcHlba2V5XSA9IHNyY1trZXldXG4gIH1cblxuICByZXR1cm4gY29weVxufVxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKCkge1xuICB2YXIgbGlzdGVuZXJzID0gW107XG5cbiAgcmV0dXJuIHtcbiAgICBjb21wb25lbnRXaWxsVW5tb3VudDogZnVuY3Rpb24gY29tcG9uZW50V2lsbFVubW91bnQoKSB7XG4gICAgICBsaXN0ZW5lcnMuZm9yRWFjaChmdW5jdGlvbiAobGlzdGVuZXIpIHtcbiAgICAgICAgdmFyIGVtaXR0ZXIgPSBsaXN0ZW5lci5lbWl0dGVyO1xuICAgICAgICB2YXIgZXZlbnROYW1lID0gbGlzdGVuZXIuZXZlbnROYW1lO1xuICAgICAgICB2YXIgY2FsbGJhY2sgPSBsaXN0ZW5lci5jYWxsYmFjaztcblxuICAgICAgICB2YXIgcmVtb3ZlTGlzdGVuZXIgPSBlbWl0dGVyLnJlbW92ZUxpc3RlbmVyIHx8IGVtaXR0ZXIucmVtb3ZlRXZlbnRMaXN0ZW5lcjtcbiAgICAgICAgcmVtb3ZlTGlzdGVuZXIuY2FsbChlbWl0dGVyLCBldmVudE5hbWUsIGNhbGxiYWNrKTtcbiAgICAgIH0pO1xuICAgIH0sXG5cbiAgICB3YXRjaDogZnVuY3Rpb24gd2F0Y2goZW1pdHRlciwgZXZlbnROYW1lLCBjYWxsYmFjaykge1xuICAgICAgbGlzdGVuZXJzLnB1c2goe1xuICAgICAgICBlbWl0dGVyOiBlbWl0dGVyLFxuICAgICAgICBldmVudE5hbWU6IGV2ZW50TmFtZSxcbiAgICAgICAgY2FsbGJhY2s6IGNhbGxiYWNrXG4gICAgICB9KTtcblxuICAgICAgdmFyIGFkZExpc3RlbmVyID0gZW1pdHRlci5hZGRMaXN0ZW5lciB8fCBlbWl0dGVyLmFkZEV2ZW50TGlzdGVuZXI7XG4gICAgICBhZGRMaXN0ZW5lci5jYWxsKGVtaXR0ZXIsIGV2ZW50TmFtZSwgY2FsbGJhY2spO1xuICAgIH0sXG5cbiAgICB1bndhdGNoOiBmdW5jdGlvbiB1bndhdGNoKGVtaXR0ZXIsIGV2ZW50TmFtZSwgY2FsbGJhY2spIHtcbiAgICAgIGxpc3RlbmVycyA9IGxpc3RlbmVycy5maWx0ZXIoZnVuY3Rpb24gKGxpc3RlbmVyKSB7XG4gICAgICAgIHJldHVybiBsaXN0ZW5lci5lbWl0dGVyID09PSBlbWl0dGVyICYmIGxpc3RlbmVyLmV2ZW50TmFtZSA9PT0gZXZlbnROYW1lICYmIGxpc3RlbmVyLmNhbGxiYWNrID09PSBjYWxsYmFjaztcbiAgICAgIH0pO1xuXG4gICAgICB2YXIgcmVtb3ZlTGlzdGVuZXIgPSBlbWl0dGVyLnJlbW92ZUxpc3RlbmVyIHx8IGVtaXR0ZXIucmVtb3ZlRXZlbnRMaXN0ZW5lcjtcbiAgICAgIHJlbW92ZUxpc3RlbmVyLmNhbGwoZW1pdHRlciwgZXZlbnROYW1lLCBjYWxsYmFjayk7XG4gICAgfVxuICB9O1xufTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBfZXh0ZW5kcyA9IE9iamVjdC5hc3NpZ24gfHwgZnVuY3Rpb24gKHRhcmdldCkgeyBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykgeyB2YXIgc291cmNlID0gYXJndW1lbnRzW2ldOyBmb3IgKHZhciBrZXkgaW4gc291cmNlKSB7IGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoc291cmNlLCBrZXkpKSB7IHRhcmdldFtrZXldID0gc291cmNlW2tleV07IH0gfSB9IHJldHVybiB0YXJnZXQ7IH07XG5cbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbi8vIEVuYWJsZSBSZWFjdCBUb3VjaCBFdmVudHNcblJlYWN0LmluaXRpYWxpemVUb3VjaEV2ZW50cyh0cnVlKTtcblxuZnVuY3Rpb24gZ2V0VG91Y2hQcm9wcyh0b3VjaCkge1xuXHRpZiAoIXRvdWNoKSByZXR1cm4ge307XG5cdHJldHVybiB7XG5cdFx0cGFnZVg6IHRvdWNoLnBhZ2VYLFxuXHRcdHBhZ2VZOiB0b3VjaC5wYWdlWSxcblx0XHRjbGllbnRYOiB0b3VjaC5jbGllbnRYLFxuXHRcdGNsaWVudFk6IHRvdWNoLmNsaWVudFlcblx0fTtcbn1cblxuZnVuY3Rpb24gaXNEYXRhT3JBcmlhUHJvcChrZXkpIHtcblx0cmV0dXJuIGtleS5pbmRleE9mKCdkYXRhLScpID09PSAwIHx8IGtleS5pbmRleE9mKCdhcmlhLScpID09PSAwO1xufVxuXG5mdW5jdGlvbiBnZXRQaW5jaFByb3BzKHRvdWNoZXMpIHtcblx0cmV0dXJuIHtcblx0XHR0b3VjaGVzOiBBcnJheS5wcm90b3R5cGUubWFwLmNhbGwodG91Y2hlcywgZnVuY3Rpb24gY29weVRvdWNoKHRvdWNoKSB7XG5cdFx0XHRyZXR1cm4geyBpZGVudGlmaWVyOiB0b3VjaC5pZGVudGlmaWVyLCBwYWdlWDogdG91Y2gucGFnZVgsIHBhZ2VZOiB0b3VjaC5wYWdlWSB9O1xuXHRcdH0pLFxuXHRcdGNlbnRlcjogeyB4OiAodG91Y2hlc1swXS5wYWdlWCArIHRvdWNoZXNbMV0ucGFnZVgpIC8gMiwgeTogKHRvdWNoZXNbMF0ucGFnZVkgKyB0b3VjaGVzWzFdLnBhZ2VZKSAvIDIgfSxcblx0XHRhbmdsZTogTWF0aC5hdGFuKCkgKiAodG91Y2hlc1sxXS5wYWdlWSAtIHRvdWNoZXNbMF0ucGFnZVkpIC8gKHRvdWNoZXNbMV0ucGFnZVggLSB0b3VjaGVzWzBdLnBhZ2VYKSAqIDE4MCAvIE1hdGguUEksXG5cdFx0ZGlzdGFuY2U6IE1hdGguc3FydChNYXRoLnBvdyhNYXRoLmFicyh0b3VjaGVzWzFdLnBhZ2VYIC0gdG91Y2hlc1swXS5wYWdlWCksIDIpICsgTWF0aC5wb3coTWF0aC5hYnModG91Y2hlc1sxXS5wYWdlWSAtIHRvdWNoZXNbMF0ucGFnZVkpLCAyKSlcblx0fTtcbn1cblxuLyoqXG4gKiBUYXBwYWJsZSBNaXhpblxuICogPT09PT09PT09PT09PT1cbiAqL1xuXG52YXIgTWl4aW4gPSB7XG5cdHByb3BUeXBlczoge1xuXHRcdG1vdmVUaHJlc2hvbGQ6IFJlYWN0LlByb3BUeXBlcy5udW1iZXIsIC8vIHBpeGVscyB0byBtb3ZlIGJlZm9yZSBjYW5jZWxsaW5nIHRhcFxuXHRcdGFjdGl2ZURlbGF5OiBSZWFjdC5Qcm9wVHlwZXMubnVtYmVyLCAvLyBtcyB0byB3YWl0IGJlZm9yZSBhZGRpbmcgdGhlIGAtYWN0aXZlYCBjbGFzc1xuXHRcdHByZXNzRGVsYXk6IFJlYWN0LlByb3BUeXBlcy5udW1iZXIsIC8vIG1zIHRvIHdhaXQgYmVmb3JlIGRldGVjdGluZyBhIHByZXNzXG5cdFx0cHJlc3NNb3ZlVGhyZXNob2xkOiBSZWFjdC5Qcm9wVHlwZXMubnVtYmVyLCAvLyBwaXhlbHMgdG8gbW92ZSBiZWZvcmUgY2FuY2VsbGluZyBwcmVzc1xuXHRcdHByZXZlbnREZWZhdWx0OiBSZWFjdC5Qcm9wVHlwZXMuYm9vbCwgLy8gd2hldGhlciB0byBwcmV2ZW50RGVmYXVsdCBvbiBhbGwgZXZlbnRzXG5cdFx0c3RvcFByb3BhZ2F0aW9uOiBSZWFjdC5Qcm9wVHlwZXMuYm9vbCwgLy8gd2hldGhlciB0byBzdG9wUHJvcGFnYXRpb24gb24gYWxsIGV2ZW50c1xuXG5cdFx0b25UYXA6IFJlYWN0LlByb3BUeXBlcy5mdW5jLCAvLyBmaXJlcyB3aGVuIGEgdGFwIGlzIGRldGVjdGVkXG5cdFx0b25QcmVzczogUmVhY3QuUHJvcFR5cGVzLmZ1bmMsIC8vIGZpcmVzIHdoZW4gYSBwcmVzcyBpcyBkZXRlY3RlZFxuXHRcdG9uVG91Y2hTdGFydDogUmVhY3QuUHJvcFR5cGVzLmZ1bmMsIC8vIHBhc3MtdGhyb3VnaCB0b3VjaCBldmVudFxuXHRcdG9uVG91Y2hNb3ZlOiBSZWFjdC5Qcm9wVHlwZXMuZnVuYywgLy8gcGFzcy10aHJvdWdoIHRvdWNoIGV2ZW50XG5cdFx0b25Ub3VjaEVuZDogUmVhY3QuUHJvcFR5cGVzLmZ1bmMsIC8vIHBhc3MtdGhyb3VnaCB0b3VjaCBldmVudFxuXHRcdG9uTW91c2VEb3duOiBSZWFjdC5Qcm9wVHlwZXMuZnVuYywgLy8gcGFzcy10aHJvdWdoIG1vdXNlIGV2ZW50XG5cdFx0b25Nb3VzZVVwOiBSZWFjdC5Qcm9wVHlwZXMuZnVuYywgLy8gcGFzcy10aHJvdWdoIG1vdXNlIGV2ZW50XG5cdFx0b25Nb3VzZU1vdmU6IFJlYWN0LlByb3BUeXBlcy5mdW5jLCAvLyBwYXNzLXRocm91Z2ggbW91c2UgZXZlbnRcblx0XHRvbk1vdXNlT3V0OiBSZWFjdC5Qcm9wVHlwZXMuZnVuYywgLy8gcGFzcy10aHJvdWdoIG1vdXNlIGV2ZW50XG5cblx0XHRvblBpbmNoU3RhcnQ6IFJlYWN0LlByb3BUeXBlcy5mdW5jLCAvLyBmaXJlcyB3aGVuIGEgcGluY2ggZ2VzdHVyZSBpcyBzdGFydGVkXG5cdFx0b25QaW5jaE1vdmU6IFJlYWN0LlByb3BUeXBlcy5mdW5jLCAvLyBmaXJlcyBvbiBldmVyeSB0b3VjaC1tb3ZlIHdoZW4gYSBwaW5jaCBhY3Rpb24gaXMgYWN0aXZlXG5cdFx0b25QaW5jaEVuZDogUmVhY3QuUHJvcFR5cGVzLmZ1bmMgLy8gZmlyZXMgd2hlbiBhIHBpbmNoIGFjdGlvbiBlbmRzXG5cdH0sXG5cblx0Z2V0RGVmYXVsdFByb3BzOiBmdW5jdGlvbiBnZXREZWZhdWx0UHJvcHMoKSB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdGFjdGl2ZURlbGF5OiAwLFxuXHRcdFx0bW92ZVRocmVzaG9sZDogMTAwLFxuXHRcdFx0cHJlc3NEZWxheTogMTAwMCxcblx0XHRcdHByZXNzTW92ZVRocmVzaG9sZDogNVxuXHRcdH07XG5cdH0sXG5cblx0Z2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbiBnZXRJbml0aWFsU3RhdGUoKSB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdGlzQWN0aXZlOiBmYWxzZSxcblx0XHRcdHRvdWNoQWN0aXZlOiBmYWxzZSxcblx0XHRcdHBpbmNoQWN0aXZlOiBmYWxzZVxuXHRcdH07XG5cdH0sXG5cblx0Y29tcG9uZW50V2lsbFVubW91bnQ6IGZ1bmN0aW9uIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuXHRcdHRoaXMuY2xlYW51cFNjcm9sbERldGVjdGlvbigpO1xuXHRcdHRoaXMuY2FuY2VsUHJlc3NEZXRlY3Rpb24oKTtcblx0XHR0aGlzLmNsZWFyQWN0aXZlVGltZW91dCgpO1xuXHR9LFxuXG5cdHByb2Nlc3NFdmVudDogZnVuY3Rpb24gcHJvY2Vzc0V2ZW50KGV2ZW50KSB7XG5cdFx0aWYgKHRoaXMucHJvcHMucHJldmVudERlZmF1bHQpIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cdFx0aWYgKHRoaXMucHJvcHMuc3RvcFByb3BhZ2F0aW9uKSBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcblx0fSxcblxuXHRvblRvdWNoU3RhcnQ6IGZ1bmN0aW9uIG9uVG91Y2hTdGFydChldmVudCkge1xuXHRcdGlmICh0aGlzLnByb3BzLm9uVG91Y2hTdGFydCAmJiB0aGlzLnByb3BzLm9uVG91Y2hTdGFydChldmVudCkgPT09IGZhbHNlKSByZXR1cm47XG5cdFx0dGhpcy5wcm9jZXNzRXZlbnQoZXZlbnQpO1xuXHRcdHdpbmRvdy5fYmxvY2tNb3VzZUV2ZW50cyA9IHRydWU7XG5cdFx0aWYgKGV2ZW50LnRvdWNoZXMubGVuZ3RoID09PSAxKSB7XG5cdFx0XHR0aGlzLl9pbml0aWFsVG91Y2ggPSB0aGlzLl9sYXN0VG91Y2ggPSBnZXRUb3VjaFByb3BzKGV2ZW50LnRvdWNoZXNbMF0pO1xuXHRcdFx0dGhpcy5pbml0U2Nyb2xsRGV0ZWN0aW9uKCk7XG5cdFx0XHR0aGlzLmluaXRQcmVzc0RldGVjdGlvbihldmVudCwgdGhpcy5lbmRUb3VjaCk7XG5cdFx0XHR0aGlzLl9hY3RpdmVUaW1lb3V0ID0gc2V0VGltZW91dCh0aGlzLm1ha2VBY3RpdmUsIHRoaXMucHJvcHMuYWN0aXZlRGVsYXkpO1xuXHRcdH0gZWxzZSBpZiAoKHRoaXMucHJvcHMub25QaW5jaFN0YXJ0IHx8IHRoaXMucHJvcHMub25QaW5jaE1vdmUgfHwgdGhpcy5wcm9wcy5vblBpbmNoRW5kKSAmJiBldmVudC50b3VjaGVzLmxlbmd0aCA9PT0gMikge1xuXHRcdFx0dGhpcy5vblBpbmNoU3RhcnQoZXZlbnQpO1xuXHRcdH1cblx0fSxcblxuXHRtYWtlQWN0aXZlOiBmdW5jdGlvbiBtYWtlQWN0aXZlKCkge1xuXHRcdGlmICghdGhpcy5pc01vdW50ZWQoKSkgcmV0dXJuO1xuXHRcdHRoaXMuY2xlYXJBY3RpdmVUaW1lb3V0KCk7XG5cdFx0dGhpcy5zZXRTdGF0ZSh7XG5cdFx0XHRpc0FjdGl2ZTogdHJ1ZVxuXHRcdH0pO1xuXHR9LFxuXG5cdGNsZWFyQWN0aXZlVGltZW91dDogZnVuY3Rpb24gY2xlYXJBY3RpdmVUaW1lb3V0KCkge1xuXHRcdGNsZWFyVGltZW91dCh0aGlzLl9hY3RpdmVUaW1lb3V0KTtcblx0XHR0aGlzLl9hY3RpdmVUaW1lb3V0ID0gZmFsc2U7XG5cdH0sXG5cblx0b25QaW5jaFN0YXJ0OiBmdW5jdGlvbiBvblBpbmNoU3RhcnQoZXZlbnQpIHtcblx0XHQvLyBpbiBjYXNlIHRoZSB0d28gdG91Y2hlcyBkaWRuJ3Qgc3RhcnQgZXhhY3RseSBhdCB0aGUgc2FtZSB0aW1lXG5cdFx0aWYgKHRoaXMuX2luaXRpYWxUb3VjaCkge1xuXHRcdFx0dGhpcy5lbmRUb3VjaCgpO1xuXHRcdH1cblx0XHR2YXIgdG91Y2hlcyA9IGV2ZW50LnRvdWNoZXM7XG5cdFx0dGhpcy5faW5pdGlhbFBpbmNoID0gZ2V0UGluY2hQcm9wcyh0b3VjaGVzKTtcblx0XHR0aGlzLl9pbml0aWFsUGluY2ggPSBfZXh0ZW5kcyh0aGlzLl9pbml0aWFsUGluY2gsIHtcblx0XHRcdGRpc3BsYWNlbWVudDogeyB4OiAwLCB5OiAwIH0sXG5cdFx0XHRkaXNwbGFjZW1lbnRWZWxvY2l0eTogeyB4OiAwLCB5OiAwIH0sXG5cdFx0XHRyb3RhdGlvbjogMCxcblx0XHRcdHJvdGF0aW9uVmVsb2NpdHk6IDAsXG5cdFx0XHR6b29tOiAxLFxuXHRcdFx0em9vbVZlbG9jaXR5OiAwLFxuXHRcdFx0dGltZTogRGF0ZS5ub3coKVxuXHRcdH0pO1xuXHRcdHRoaXMuX2xhc3RQaW5jaCA9IHRoaXMuX2luaXRpYWxQaW5jaDtcblx0XHR0aGlzLnByb3BzLm9uUGluY2hTdGFydCAmJiB0aGlzLnByb3BzLm9uUGluY2hTdGFydCh0aGlzLl9pbml0aWFsUGluY2gsIGV2ZW50KTtcblx0fSxcblxuXHRvblBpbmNoTW92ZTogZnVuY3Rpb24gb25QaW5jaE1vdmUoZXZlbnQpIHtcblx0XHRpZiAodGhpcy5faW5pdGlhbFRvdWNoKSB7XG5cdFx0XHR0aGlzLmVuZFRvdWNoKCk7XG5cdFx0fVxuXHRcdHZhciB0b3VjaGVzID0gZXZlbnQudG91Y2hlcztcblx0XHRpZiAodG91Y2hlcy5sZW5ndGggIT09IDIpIHtcblx0XHRcdHJldHVybiB0aGlzLm9uUGluY2hFbmQoZXZlbnQpIC8vIGJhaWwgb3V0IGJlZm9yZSBkaXNhc3RlclxuXHRcdFx0O1xuXHRcdH1cblxuXHRcdHZhciBjdXJyZW50UGluY2ggPSB0b3VjaGVzWzBdLmlkZW50aWZpZXIgPT09IHRoaXMuX2luaXRpYWxQaW5jaC50b3VjaGVzWzBdLmlkZW50aWZpZXIgJiYgdG91Y2hlc1sxXS5pZGVudGlmaWVyID09PSB0aGlzLl9pbml0aWFsUGluY2gudG91Y2hlc1sxXS5pZGVudGlmaWVyID8gZ2V0UGluY2hQcm9wcyh0b3VjaGVzKSAvLyB0aGUgdG91Y2hlcyBhcmUgaW4gdGhlIGNvcnJlY3Qgb3JkZXJcblx0XHQ6IHRvdWNoZXNbMV0uaWRlbnRpZmllciA9PT0gdGhpcy5faW5pdGlhbFBpbmNoLnRvdWNoZXNbMF0uaWRlbnRpZmllciAmJiB0b3VjaGVzWzBdLmlkZW50aWZpZXIgPT09IHRoaXMuX2luaXRpYWxQaW5jaC50b3VjaGVzWzFdLmlkZW50aWZpZXIgPyBnZXRQaW5jaFByb3BzKHRvdWNoZXMucmV2ZXJzZSgpKSAvLyB0aGUgdG91Y2hlcyBoYXZlIHNvbWVob3cgY2hhbmdlZCBvcmRlclxuXHRcdDogZ2V0UGluY2hQcm9wcyh0b3VjaGVzKTsgLy8gc29tZXRoaW5nIGlzIHdyb25nLCBidXQgd2Ugc3RpbGwgaGF2ZSB0d28gdG91Y2gtcG9pbnRzLCBzbyB3ZSB0cnkgbm90IHRvIGZhaWxcblxuXHRcdGN1cnJlbnRQaW5jaC5kaXNwbGFjZW1lbnQgPSB7XG5cdFx0XHR4OiBjdXJyZW50UGluY2guY2VudGVyLnggLSB0aGlzLl9pbml0aWFsUGluY2guY2VudGVyLngsXG5cdFx0XHR5OiBjdXJyZW50UGluY2guY2VudGVyLnkgLSB0aGlzLl9pbml0aWFsUGluY2guY2VudGVyLnlcblx0XHR9O1xuXG5cdFx0Y3VycmVudFBpbmNoLnRpbWUgPSBEYXRlLm5vdygpO1xuXHRcdHZhciB0aW1lU2luY2VMYXN0UGluY2ggPSBjdXJyZW50UGluY2gudGltZSAtIHRoaXMuX2xhc3RQaW5jaC50aW1lO1xuXG5cdFx0Y3VycmVudFBpbmNoLmRpc3BsYWNlbWVudFZlbG9jaXR5ID0ge1xuXHRcdFx0eDogKGN1cnJlbnRQaW5jaC5kaXNwbGFjZW1lbnQueCAtIHRoaXMuX2xhc3RQaW5jaC5kaXNwbGFjZW1lbnQueCkgLyB0aW1lU2luY2VMYXN0UGluY2gsXG5cdFx0XHR5OiAoY3VycmVudFBpbmNoLmRpc3BsYWNlbWVudC55IC0gdGhpcy5fbGFzdFBpbmNoLmRpc3BsYWNlbWVudC55KSAvIHRpbWVTaW5jZUxhc3RQaW5jaFxuXHRcdH07XG5cblx0XHRjdXJyZW50UGluY2gucm90YXRpb24gPSBjdXJyZW50UGluY2guYW5nbGUgLSB0aGlzLl9pbml0aWFsUGluY2guYW5nbGU7XG5cdFx0Y3VycmVudFBpbmNoLnJvdGF0aW9uVmVsb2NpdHkgPSBjdXJyZW50UGluY2gucm90YXRpb24gLSB0aGlzLl9sYXN0UGluY2gucm90YXRpb24gLyB0aW1lU2luY2VMYXN0UGluY2g7XG5cblx0XHRjdXJyZW50UGluY2guem9vbSA9IGN1cnJlbnRQaW5jaC5kaXN0YW5jZSAvIHRoaXMuX2luaXRpYWxQaW5jaC5kaXN0YW5jZTtcblx0XHRjdXJyZW50UGluY2guem9vbVZlbG9jaXR5ID0gKGN1cnJlbnRQaW5jaC56b29tIC0gdGhpcy5fbGFzdFBpbmNoLnpvb20pIC8gdGltZVNpbmNlTGFzdFBpbmNoO1xuXG5cdFx0dGhpcy5wcm9wcy5vblBpbmNoTW92ZSAmJiB0aGlzLnByb3BzLm9uUGluY2hNb3ZlKGN1cnJlbnRQaW5jaCwgZXZlbnQpO1xuXG5cdFx0dGhpcy5fbGFzdFBpbmNoID0gY3VycmVudFBpbmNoO1xuXHR9LFxuXG5cdG9uUGluY2hFbmQ6IGZ1bmN0aW9uIG9uUGluY2hFbmQoZXZlbnQpIHtcblx0XHQvLyBUT0RPIHVzZSBoZWxwZXIgdG8gb3JkZXIgdG91Y2hlcyBieSBpZGVudGlmaWVyIGFuZCB1c2UgYWN0dWFsIHZhbHVlcyBvbiB0b3VjaEVuZC5cblx0XHR2YXIgY3VycmVudFBpbmNoID0gX2V4dGVuZHMoe30sIHRoaXMuX2xhc3RQaW5jaCk7XG5cdFx0Y3VycmVudFBpbmNoLnRpbWUgPSBEYXRlLm5vdygpO1xuXG5cdFx0aWYgKGN1cnJlbnRQaW5jaC50aW1lIC0gdGhpcy5fbGFzdFBpbmNoLnRpbWUgPiAxNikge1xuXHRcdFx0Y3VycmVudFBpbmNoLmRpc3BsYWNlbWVudFZlbG9jaXR5ID0gMDtcblx0XHRcdGN1cnJlbnRQaW5jaC5yb3RhdGlvblZlbG9jaXR5ID0gMDtcblx0XHRcdGN1cnJlbnRQaW5jaC56b29tVmVsb2NpdHkgPSAwO1xuXHRcdH1cblxuXHRcdHRoaXMucHJvcHMub25QaW5jaEVuZCAmJiB0aGlzLnByb3BzLm9uUGluY2hFbmQoY3VycmVudFBpbmNoLCBldmVudCk7XG5cblx0XHR0aGlzLl9pbml0aWFsUGluY2ggPSB0aGlzLl9sYXN0UGluY2ggPSBudWxsO1xuXG5cdFx0Ly8gSWYgb25lIGZpbmdlciBpcyBzdGlsbCBvbiBzY3JlZW4sIGl0IHNob3VsZCBzdGFydCBhIG5ldyB0b3VjaCBldmVudCBmb3Igc3dpcGluZyBldGNcblx0XHQvLyBCdXQgaXQgc2hvdWxkIG5ldmVyIGZpcmUgYW4gb25UYXAgb3Igb25QcmVzcyBldmVudC5cblx0XHQvLyBTaW5jZSB0aGVyZSBpcyBubyBzdXBwb3J0IHN3aXBlcyB5ZXQsIHRoaXMgc2hvdWxkIGJlIGRpc3JlZ2FyZGVkIGZvciBub3dcblx0XHQvLyBpZiAoZXZlbnQudG91Y2hlcy5sZW5ndGggPT09IDEpIHtcblx0XHQvLyBcdHRoaXMub25Ub3VjaFN0YXJ0KGV2ZW50KTtcblx0XHQvLyB9XG5cdH0sXG5cblx0aW5pdFNjcm9sbERldGVjdGlvbjogZnVuY3Rpb24gaW5pdFNjcm9sbERldGVjdGlvbigpIHtcblx0XHR0aGlzLl9zY3JvbGxQb3MgPSB7IHRvcDogMCwgbGVmdDogMCB9O1xuXHRcdHRoaXMuX3Njcm9sbFBhcmVudHMgPSBbXTtcblx0XHR0aGlzLl9zY3JvbGxQYXJlbnRQb3MgPSBbXTtcblx0XHR2YXIgbm9kZSA9IHRoaXMuZ2V0RE9NTm9kZSgpO1xuXHRcdHdoaWxlIChub2RlKSB7XG5cdFx0XHRpZiAobm9kZS5zY3JvbGxIZWlnaHQgPiBub2RlLm9mZnNldEhlaWdodCB8fCBub2RlLnNjcm9sbFdpZHRoID4gbm9kZS5vZmZzZXRXaWR0aCkge1xuXHRcdFx0XHR0aGlzLl9zY3JvbGxQYXJlbnRzLnB1c2gobm9kZSk7XG5cdFx0XHRcdHRoaXMuX3Njcm9sbFBhcmVudFBvcy5wdXNoKG5vZGUuc2Nyb2xsVG9wICsgbm9kZS5zY3JvbGxMZWZ0KTtcblx0XHRcdFx0dGhpcy5fc2Nyb2xsUG9zLnRvcCArPSBub2RlLnNjcm9sbFRvcDtcblx0XHRcdFx0dGhpcy5fc2Nyb2xsUG9zLmxlZnQgKz0gbm9kZS5zY3JvbGxMZWZ0O1xuXHRcdFx0fVxuXHRcdFx0bm9kZSA9IG5vZGUucGFyZW50Tm9kZTtcblx0XHR9XG5cdH0sXG5cblx0Y2FsY3VsYXRlTW92ZW1lbnQ6IGZ1bmN0aW9uIGNhbGN1bGF0ZU1vdmVtZW50KHRvdWNoKSB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdHg6IE1hdGguYWJzKHRvdWNoLmNsaWVudFggLSB0aGlzLl9pbml0aWFsVG91Y2guY2xpZW50WCksXG5cdFx0XHR5OiBNYXRoLmFicyh0b3VjaC5jbGllbnRZIC0gdGhpcy5faW5pdGlhbFRvdWNoLmNsaWVudFkpXG5cdFx0fTtcblx0fSxcblxuXHRkZXRlY3RTY3JvbGw6IGZ1bmN0aW9uIGRldGVjdFNjcm9sbCgpIHtcblx0XHR2YXIgY3VycmVudFNjcm9sbFBvcyA9IHsgdG9wOiAwLCBsZWZ0OiAwIH07XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLl9zY3JvbGxQYXJlbnRzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRjdXJyZW50U2Nyb2xsUG9zLnRvcCArPSB0aGlzLl9zY3JvbGxQYXJlbnRzW2ldLnNjcm9sbFRvcDtcblx0XHRcdGN1cnJlbnRTY3JvbGxQb3MubGVmdCArPSB0aGlzLl9zY3JvbGxQYXJlbnRzW2ldLnNjcm9sbExlZnQ7XG5cdFx0fVxuXHRcdHJldHVybiAhKGN1cnJlbnRTY3JvbGxQb3MudG9wID09PSB0aGlzLl9zY3JvbGxQb3MudG9wICYmIGN1cnJlbnRTY3JvbGxQb3MubGVmdCA9PT0gdGhpcy5fc2Nyb2xsUG9zLmxlZnQpO1xuXHR9LFxuXG5cdGNsZWFudXBTY3JvbGxEZXRlY3Rpb246IGZ1bmN0aW9uIGNsZWFudXBTY3JvbGxEZXRlY3Rpb24oKSB7XG5cdFx0dGhpcy5fc2Nyb2xsUGFyZW50cyA9IHVuZGVmaW5lZDtcblx0XHR0aGlzLl9zY3JvbGxQb3MgPSB1bmRlZmluZWQ7XG5cdH0sXG5cblx0aW5pdFByZXNzRGV0ZWN0aW9uOiBmdW5jdGlvbiBpbml0UHJlc3NEZXRlY3Rpb24oZXZlbnQsIGNhbGxiYWNrKSB7XG5cdFx0aWYgKCF0aGlzLnByb3BzLm9uUHJlc3MpIHJldHVybjtcblx0XHR0aGlzLl9wcmVzc1RpbWVvdXQgPSBzZXRUaW1lb3V0KChmdW5jdGlvbiAoKSB7XG5cdFx0XHR0aGlzLnByb3BzLm9uUHJlc3MoZXZlbnQpO1xuXHRcdFx0Y2FsbGJhY2soKTtcblx0XHR9KS5iaW5kKHRoaXMpLCB0aGlzLnByb3BzLnByZXNzRGVsYXkpO1xuXHR9LFxuXG5cdGNhbmNlbFByZXNzRGV0ZWN0aW9uOiBmdW5jdGlvbiBjYW5jZWxQcmVzc0RldGVjdGlvbigpIHtcblx0XHRjbGVhclRpbWVvdXQodGhpcy5fcHJlc3NUaW1lb3V0KTtcblx0fSxcblxuXHRvblRvdWNoTW92ZTogZnVuY3Rpb24gb25Ub3VjaE1vdmUoZXZlbnQpIHtcblx0XHRpZiAodGhpcy5faW5pdGlhbFRvdWNoKSB7XG5cdFx0XHR0aGlzLnByb2Nlc3NFdmVudChldmVudCk7XG5cblx0XHRcdGlmICh0aGlzLmRldGVjdFNjcm9sbCgpKSByZXR1cm4gdGhpcy5lbmRUb3VjaChldmVudCk7XG5cblx0XHRcdHRoaXMucHJvcHMub25Ub3VjaE1vdmUgJiYgdGhpcy5wcm9wcy5vblRvdWNoTW92ZShldmVudCk7XG5cdFx0XHR0aGlzLl9sYXN0VG91Y2ggPSBnZXRUb3VjaFByb3BzKGV2ZW50LnRvdWNoZXNbMF0pO1xuXHRcdFx0dmFyIG1vdmVtZW50ID0gdGhpcy5jYWxjdWxhdGVNb3ZlbWVudCh0aGlzLl9sYXN0VG91Y2gpO1xuXHRcdFx0aWYgKG1vdmVtZW50LnggPiB0aGlzLnByb3BzLnByZXNzTW92ZVRocmVzaG9sZCB8fCBtb3ZlbWVudC55ID4gdGhpcy5wcm9wcy5wcmVzc01vdmVUaHJlc2hvbGQpIHtcblx0XHRcdFx0dGhpcy5jYW5jZWxQcmVzc0RldGVjdGlvbigpO1xuXHRcdFx0fVxuXHRcdFx0aWYgKG1vdmVtZW50LnggPiB0aGlzLnByb3BzLm1vdmVUaHJlc2hvbGQgfHwgbW92ZW1lbnQueSA+IHRoaXMucHJvcHMubW92ZVRocmVzaG9sZCkge1xuXHRcdFx0XHRpZiAodGhpcy5zdGF0ZS5pc0FjdGl2ZSkge1xuXHRcdFx0XHRcdHRoaXMuc2V0U3RhdGUoe1xuXHRcdFx0XHRcdFx0aXNBY3RpdmU6IGZhbHNlXG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH0gZWxzZSBpZiAodGhpcy5fYWN0aXZlVGltZW91dCkge1xuXHRcdFx0XHRcdHRoaXMuY2xlYXJBY3RpdmVUaW1lb3V0KCk7XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGlmICghdGhpcy5zdGF0ZS5pc0FjdGl2ZSAmJiAhdGhpcy5fYWN0aXZlVGltZW91dCkge1xuXHRcdFx0XHRcdHRoaXMuc2V0U3RhdGUoe1xuXHRcdFx0XHRcdFx0aXNBY3RpdmU6IHRydWVcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0gZWxzZSBpZiAodGhpcy5faW5pdGlhbFBpbmNoICYmIGV2ZW50LnRvdWNoZXMubGVuZ3RoID09PSAyKSB7XG5cdFx0XHR0aGlzLm9uUGluY2hNb3ZlKGV2ZW50KTtcblx0XHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cdFx0fVxuXHR9LFxuXG5cdG9uVG91Y2hFbmQ6IGZ1bmN0aW9uIG9uVG91Y2hFbmQoZXZlbnQpIHtcblx0XHR2YXIgX3RoaXMgPSB0aGlzO1xuXG5cdFx0aWYgKHRoaXMuX2luaXRpYWxUb3VjaCkge1xuXHRcdFx0dGhpcy5wcm9jZXNzRXZlbnQoZXZlbnQpO1xuXHRcdFx0dmFyIGFmdGVyRW5kVG91Y2g7XG5cdFx0XHR2YXIgbW92ZW1lbnQgPSB0aGlzLmNhbGN1bGF0ZU1vdmVtZW50KHRoaXMuX2xhc3RUb3VjaCk7XG5cdFx0XHRpZiAobW92ZW1lbnQueCA8PSB0aGlzLnByb3BzLm1vdmVUaHJlc2hvbGQgJiYgbW92ZW1lbnQueSA8PSB0aGlzLnByb3BzLm1vdmVUaHJlc2hvbGQgJiYgdGhpcy5wcm9wcy5vblRhcCkge1xuXHRcdFx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0XHRhZnRlckVuZFRvdWNoID0gZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdHZhciBmaW5hbFBhcmVudFNjcm9sbFBvcyA9IF90aGlzLl9zY3JvbGxQYXJlbnRzLm1hcChmdW5jdGlvbiAobm9kZSkge1xuXHRcdFx0XHRcdFx0cmV0dXJuIG5vZGUuc2Nyb2xsVG9wICsgbm9kZS5zY3JvbGxMZWZ0O1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdHZhciBzdG9wcGVkTW9tZW50dW1TY3JvbGwgPSBfdGhpcy5fc2Nyb2xsUGFyZW50UG9zLnNvbWUoZnVuY3Rpb24gKGVuZCwgaSkge1xuXHRcdFx0XHRcdFx0cmV0dXJuIGVuZCAhPT0gZmluYWxQYXJlbnRTY3JvbGxQb3NbaV07XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0aWYgKCFzdG9wcGVkTW9tZW50dW1TY3JvbGwpIHtcblx0XHRcdFx0XHRcdF90aGlzLnByb3BzLm9uVGFwKGV2ZW50KTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH07XG5cdFx0XHR9XG5cdFx0XHR0aGlzLmVuZFRvdWNoKGV2ZW50LCBhZnRlckVuZFRvdWNoKTtcblx0XHR9IGVsc2UgaWYgKHRoaXMuX2luaXRpYWxQaW5jaCAmJiBldmVudC50b3VjaGVzLmxlbmd0aCArIGV2ZW50LmNoYW5nZWRUb3VjaGVzLmxlbmd0aCA9PT0gMikge1xuXHRcdFx0dGhpcy5vblBpbmNoRW5kKGV2ZW50KTtcblx0XHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cdFx0fVxuXHR9LFxuXG5cdGVuZFRvdWNoOiBmdW5jdGlvbiBlbmRUb3VjaChldmVudCwgY2FsbGJhY2spIHtcblx0XHR0aGlzLmNhbmNlbFByZXNzRGV0ZWN0aW9uKCk7XG5cdFx0dGhpcy5jbGVhckFjdGl2ZVRpbWVvdXQoKTtcblx0XHRpZiAoZXZlbnQgJiYgdGhpcy5wcm9wcy5vblRvdWNoRW5kKSB7XG5cdFx0XHR0aGlzLnByb3BzLm9uVG91Y2hFbmQoZXZlbnQpO1xuXHRcdH1cblx0XHR0aGlzLl9pbml0aWFsVG91Y2ggPSBudWxsO1xuXHRcdHRoaXMuX2xhc3RUb3VjaCA9IG51bGw7XG5cdFx0aWYgKHRoaXMuc3RhdGUuaXNBY3RpdmUpIHtcblx0XHRcdHRoaXMuc2V0U3RhdGUoe1xuXHRcdFx0XHRpc0FjdGl2ZTogZmFsc2Vcblx0XHRcdH0sIGNhbGxiYWNrKTtcblx0XHR9IGVsc2UgaWYgKGNhbGxiYWNrKSB7XG5cdFx0XHRjYWxsYmFjaygpO1xuXHRcdH1cblx0fSxcblxuXHRvbk1vdXNlRG93bjogZnVuY3Rpb24gb25Nb3VzZURvd24oZXZlbnQpIHtcblx0XHRpZiAod2luZG93Ll9ibG9ja01vdXNlRXZlbnRzKSB7XG5cdFx0XHR3aW5kb3cuX2Jsb2NrTW91c2VFdmVudHMgPSBmYWxzZTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0aWYgKHRoaXMucHJvcHMub25Nb3VzZURvd24gJiYgdGhpcy5wcm9wcy5vbk1vdXNlRG93bihldmVudCkgPT09IGZhbHNlKSByZXR1cm47XG5cdFx0dGhpcy5wcm9jZXNzRXZlbnQoZXZlbnQpO1xuXHRcdHRoaXMuaW5pdFByZXNzRGV0ZWN0aW9uKGV2ZW50LCB0aGlzLmVuZE1vdXNlRXZlbnQpO1xuXHRcdHRoaXMuX21vdXNlRG93biA9IHRydWU7XG5cdFx0dGhpcy5zZXRTdGF0ZSh7XG5cdFx0XHRpc0FjdGl2ZTogdHJ1ZVxuXHRcdH0pO1xuXHR9LFxuXG5cdG9uTW91c2VNb3ZlOiBmdW5jdGlvbiBvbk1vdXNlTW92ZShldmVudCkge1xuXHRcdGlmICh3aW5kb3cuX2Jsb2NrTW91c2VFdmVudHMgfHwgIXRoaXMuX21vdXNlRG93bikgcmV0dXJuO1xuXHRcdHRoaXMucHJvY2Vzc0V2ZW50KGV2ZW50KTtcblx0XHR0aGlzLnByb3BzLm9uTW91c2VNb3ZlICYmIHRoaXMucHJvcHMub25Nb3VzZU1vdmUoZXZlbnQpO1xuXHR9LFxuXG5cdG9uTW91c2VVcDogZnVuY3Rpb24gb25Nb3VzZVVwKGV2ZW50KSB7XG5cdFx0aWYgKHdpbmRvdy5fYmxvY2tNb3VzZUV2ZW50cyB8fCAhdGhpcy5fbW91c2VEb3duKSByZXR1cm47XG5cdFx0dGhpcy5wcm9jZXNzRXZlbnQoZXZlbnQpO1xuXHRcdHRoaXMucHJvcHMub25Nb3VzZVVwICYmIHRoaXMucHJvcHMub25Nb3VzZVVwKGV2ZW50KTtcblx0XHR0aGlzLnByb3BzLm9uVGFwICYmIHRoaXMucHJvcHMub25UYXAoZXZlbnQpO1xuXHRcdHRoaXMuZW5kTW91c2VFdmVudCgpO1xuXHR9LFxuXG5cdG9uTW91c2VPdXQ6IGZ1bmN0aW9uIG9uTW91c2VPdXQoZXZlbnQpIHtcblx0XHRpZiAod2luZG93Ll9ibG9ja01vdXNlRXZlbnRzIHx8ICF0aGlzLl9tb3VzZURvd24pIHJldHVybjtcblx0XHR0aGlzLnByb2Nlc3NFdmVudChldmVudCk7XG5cdFx0dGhpcy5wcm9wcy5vbk1vdXNlT3V0ICYmIHRoaXMucHJvcHMub25Nb3VzZU91dChldmVudCk7XG5cdFx0dGhpcy5lbmRNb3VzZUV2ZW50KCk7XG5cdH0sXG5cblx0ZW5kTW91c2VFdmVudDogZnVuY3Rpb24gZW5kTW91c2VFdmVudCgpIHtcblx0XHR0aGlzLmNhbmNlbFByZXNzRGV0ZWN0aW9uKCk7XG5cdFx0dGhpcy5fbW91c2VEb3duID0gZmFsc2U7XG5cdFx0dGhpcy5zZXRTdGF0ZSh7XG5cdFx0XHRpc0FjdGl2ZTogZmFsc2Vcblx0XHR9KTtcblx0fSxcblxuXHR0b3VjaFN0eWxlczogZnVuY3Rpb24gdG91Y2hTdHlsZXMoKSB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdFdlYmtpdFRhcEhpZ2hsaWdodENvbG9yOiAncmdiYSgwLDAsMCwwKScsXG5cdFx0XHRXZWJraXRUb3VjaENhbGxvdXQ6ICdub25lJyxcblx0XHRcdFdlYmtpdFVzZXJTZWxlY3Q6ICdub25lJyxcblx0XHRcdEtodG1sVXNlclNlbGVjdDogJ25vbmUnLFxuXHRcdFx0TW96VXNlclNlbGVjdDogJ25vbmUnLFxuXHRcdFx0bXNVc2VyU2VsZWN0OiAnbm9uZScsXG5cdFx0XHR1c2VyU2VsZWN0OiAnbm9uZScsXG5cdFx0XHRjdXJzb3I6ICdwb2ludGVyJ1xuXHRcdH07XG5cdH0sXG5cblx0aGFuZGxlcnM6IGZ1bmN0aW9uIGhhbmRsZXJzKCkge1xuXHRcdHJldHVybiB7XG5cdFx0XHRvblRvdWNoU3RhcnQ6IHRoaXMub25Ub3VjaFN0YXJ0LFxuXHRcdFx0b25Ub3VjaE1vdmU6IHRoaXMub25Ub3VjaE1vdmUsXG5cdFx0XHRvblRvdWNoRW5kOiB0aGlzLm9uVG91Y2hFbmQsXG5cdFx0XHRvbk1vdXNlRG93bjogdGhpcy5vbk1vdXNlRG93bixcblx0XHRcdG9uTW91c2VVcDogdGhpcy5vbk1vdXNlVXAsXG5cdFx0XHRvbk1vdXNlTW92ZTogdGhpcy5vbk1vdXNlTW92ZSxcblx0XHRcdG9uTW91c2VPdXQ6IHRoaXMub25Nb3VzZU91dFxuXHRcdH07XG5cdH1cbn07XG5cbi8qKlxuICogVGFwcGFibGUgQ29tcG9uZW50XG4gKiA9PT09PT09PT09PT09PT09PT1cbiAqL1xuXG52YXIgQ29tcG9uZW50ID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG5cdGRpc3BsYXlOYW1lOiAnVGFwcGFibGUnLFxuXG5cdG1peGluczogW01peGluXSxcblxuXHRwcm9wVHlwZXM6IHtcblx0XHRjb21wb25lbnQ6IFJlYWN0LlByb3BUeXBlcy5hbnksIC8vIGNvbXBvbmVudCB0byBjcmVhdGVcblx0XHRjbGFzc05hbWU6IFJlYWN0LlByb3BUeXBlcy5zdHJpbmcsIC8vIG9wdGlvbmFsIGNsYXNzTmFtZVxuXHRcdGNsYXNzQmFzZTogUmVhY3QuUHJvcFR5cGVzLnN0cmluZywgLy8gYmFzZSBmb3IgZ2VuZXJhdGVkIGNsYXNzTmFtZXNcblx0XHRzdHlsZTogUmVhY3QuUHJvcFR5cGVzLm9iamVjdCwgLy8gYWRkaXRpb25hbCBzdHlsZSBwcm9wZXJ0aWVzIGZvciB0aGUgY29tcG9uZW50XG5cdFx0ZGlzYWJsZWQ6IFJlYWN0LlByb3BUeXBlcy5ib29sIC8vIG9ubHkgYXBwbGllcyB0byBidXR0b25zXG5cdH0sXG5cblx0Z2V0RGVmYXVsdFByb3BzOiBmdW5jdGlvbiBnZXREZWZhdWx0UHJvcHMoKSB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdGNvbXBvbmVudDogJ3NwYW4nLFxuXHRcdFx0Y2xhc3NCYXNlOiAnVGFwcGFibGUnXG5cdFx0fTtcblx0fSxcblxuXHRyZW5kZXI6IGZ1bmN0aW9uIHJlbmRlcigpIHtcblx0XHR2YXIgcHJvcHMgPSB0aGlzLnByb3BzO1xuXHRcdHZhciBjbGFzc05hbWUgPSBwcm9wcy5jbGFzc0Jhc2UgKyAodGhpcy5zdGF0ZS5pc0FjdGl2ZSA/ICctYWN0aXZlJyA6ICctaW5hY3RpdmUnKTtcblxuXHRcdGlmIChwcm9wcy5jbGFzc05hbWUpIHtcblx0XHRcdGNsYXNzTmFtZSArPSAnICcgKyBwcm9wcy5jbGFzc05hbWU7XG5cdFx0fVxuXG5cdFx0dmFyIHN0eWxlID0ge307XG5cdFx0X2V4dGVuZHMoc3R5bGUsIHRoaXMudG91Y2hTdHlsZXMoKSwgcHJvcHMuc3R5bGUpO1xuXG5cdFx0dmFyIG5ld0NvbXBvbmVudFByb3BzID0gX2V4dGVuZHMoe30sIHByb3BzLCB7XG5cdFx0XHRzdHlsZTogc3R5bGUsXG5cdFx0XHRjbGFzc05hbWU6IGNsYXNzTmFtZSxcblx0XHRcdGRpc2FibGVkOiBwcm9wcy5kaXNhYmxlZCxcblx0XHRcdGhhbmRsZXJzOiB0aGlzLmhhbmRsZXJzXG5cdFx0fSwgdGhpcy5oYW5kbGVycygpKTtcblxuXHRcdGRlbGV0ZSBuZXdDb21wb25lbnRQcm9wcy5vblRhcDtcblx0XHRkZWxldGUgbmV3Q29tcG9uZW50UHJvcHMub25QcmVzcztcblx0XHRkZWxldGUgbmV3Q29tcG9uZW50UHJvcHMub25QaW5jaFN0YXJ0O1xuXHRcdGRlbGV0ZSBuZXdDb21wb25lbnRQcm9wcy5vblBpbmNoTW92ZTtcblx0XHRkZWxldGUgbmV3Q29tcG9uZW50UHJvcHMub25QaW5jaEVuZDtcblx0XHRkZWxldGUgbmV3Q29tcG9uZW50UHJvcHMubW92ZVRocmVzaG9sZDtcblx0XHRkZWxldGUgbmV3Q29tcG9uZW50UHJvcHMucHJlc3NEZWxheTtcblx0XHRkZWxldGUgbmV3Q29tcG9uZW50UHJvcHMucHJlc3NNb3ZlVGhyZXNob2xkO1xuXHRcdGRlbGV0ZSBuZXdDb21wb25lbnRQcm9wcy5wcmV2ZW50RGVmYXVsdDtcblx0XHRkZWxldGUgbmV3Q29tcG9uZW50UHJvcHMuc3RvcFByb3BhZ2F0aW9uO1xuXHRcdGRlbGV0ZSBuZXdDb21wb25lbnRQcm9wcy5jb21wb25lbnQ7XG5cblx0XHRyZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChwcm9wcy5jb21wb25lbnQsIG5ld0NvbXBvbmVudFByb3BzLCBwcm9wcy5jaGlsZHJlbik7XG5cdH1cbn0pO1xuXG5Db21wb25lbnQuTWl4aW4gPSBNaXhpbjtcbm1vZHVsZS5leHBvcnRzID0gQ29tcG9uZW50OyIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gVGltZXJzICgpIHtcbiAgdmFyIGludGVydmFscyA9IFtdXG4gIHZhciB0aW1lb3V0cyA9IFtdXG5cbiAgcmV0dXJuIHtcbiAgICBjbGVhckludGVydmFsczogZnVuY3Rpb24gKCkge1xuICAgICAgaW50ZXJ2YWxzLmZvckVhY2goY2xlYXJJbnRlcnZhbClcbiAgICB9LFxuXG4gICAgY2xlYXJUaW1lb3V0czogZnVuY3Rpb24gKCkge1xuICAgICAgdGltZW91dHMuZm9yRWFjaChjbGVhclRpbWVvdXQpXG4gICAgfSxcblxuICAgIGNsZWFyVGltZXJzOiBmdW5jdGlvbiAoKSB7XG4gICAgICB0aGlzLmNsZWFySW50ZXJ2YWwoKVxuICAgICAgdGhpcy5jbGVhclRpbWVvdXRzKClcbiAgICB9LFxuXG4gICAgY29tcG9uZW50V2lsbE1vdW50OiBmdW5jdGlvbiAoKSB7XG4gICAgICBpbnRlcnZhbHMgPSBbXVxuICAgICAgdGltZW91dHMgPSBbXVxuICAgIH0sXG5cbiAgICBjb21wb25lbnRXaWxsVW5tb3VudDogZnVuY3Rpb24gKCkge1xuICAgICAgdGhpcy5jbGVhckludGVydmFscygpXG4gICAgICB0aGlzLmNsZWFyVGltZW91dHMoKVxuICAgIH0sXG5cbiAgICBjb3VudERvd246IGZ1bmN0aW9uIChjYWxsYmFjaywgdGltZW91dCwgaW50ZXJ2YWwpIHtcbiAgICAgIHZhciBzZWxmID0gdGhpc1xuICAgICAgdmFyIHNsZWVwID0gTWF0aC5taW4odGltZW91dCwgaW50ZXJ2YWwpXG5cbiAgICAgIHRoaXMuc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciByZW1haW5pbmcgPSB0aW1lb3V0IC0gc2xlZXBcblxuICAgICAgICBjYWxsYmFjayhyZW1haW5pbmcpXG4gICAgICAgIGlmIChyZW1haW5pbmcgPD0gMCkgcmV0dXJuXG5cbiAgICAgICAgc2VsZi5jb3VudERvd24oY2FsbGJhY2ssIHJlbWFpbmluZywgaW50ZXJ2YWwpXG4gICAgICB9LCBzbGVlcClcbiAgICB9LFxuXG4gICAgc2V0SW50ZXJ2YWw6IGZ1bmN0aW9uIChjYWxsYmFjaywgaW50ZXJ2YWwpIHtcbiAgICAgIHZhciBzZWxmID0gdGhpc1xuXG4gICAgICBpbnRlcnZhbHMucHVzaChzZXRJbnRlcnZhbChmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICghc2VsZi5pc01vdW50ZWQoKSkgcmV0dXJuXG5cbiAgICAgICAgY2FsbGJhY2suY2FsbChzZWxmKVxuICAgICAgfSwgaW50ZXJ2YWwpKVxuICAgIH0sXG5cbiAgICBzZXRUaW1lb3V0OiBmdW5jdGlvbiAoY2FsbGJhY2ssIHRpbWVvdXQpIHtcbiAgICAgIHZhciBzZWxmID0gdGhpc1xuXG4gICAgICB0aW1lb3V0cy5wdXNoKHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAoIXNlbGYuaXNNb3VudGVkKCkpIHJldHVyblxuXG4gICAgICAgIGNhbGxiYWNrLmNhbGwoc2VsZilcbiAgICAgIH0sIHRpbWVvdXQpKVxuICAgIH1cbiAgfVxufVxuIiwiLy8gQ29weXJpZ2h0IEpveWVudCwgSW5jLiBhbmQgb3RoZXIgTm9kZSBjb250cmlidXRvcnMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGFcbi8vIGNvcHkgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGVcbi8vIFwiU29mdHdhcmVcIiksIHRvIGRlYWwgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZ1xuLy8gd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHMgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLFxuLy8gZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGwgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdFxuLy8gcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpcyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlXG4vLyBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZFxuLy8gaW4gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTU1xuLy8gT1IgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRlxuLy8gTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTlxuLy8gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sXG4vLyBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1Jcbi8vIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEVcbi8vIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXG5cbmZ1bmN0aW9uIEV2ZW50RW1pdHRlcigpIHtcbiAgdGhpcy5fZXZlbnRzID0gdGhpcy5fZXZlbnRzIHx8IHt9O1xuICB0aGlzLl9tYXhMaXN0ZW5lcnMgPSB0aGlzLl9tYXhMaXN0ZW5lcnMgfHwgdW5kZWZpbmVkO1xufVxubW9kdWxlLmV4cG9ydHMgPSBFdmVudEVtaXR0ZXI7XG5cbi8vIEJhY2t3YXJkcy1jb21wYXQgd2l0aCBub2RlIDAuMTAueFxuRXZlbnRFbWl0dGVyLkV2ZW50RW1pdHRlciA9IEV2ZW50RW1pdHRlcjtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5fZXZlbnRzID0gdW5kZWZpbmVkO1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5fbWF4TGlzdGVuZXJzID0gdW5kZWZpbmVkO1xuXG4vLyBCeSBkZWZhdWx0IEV2ZW50RW1pdHRlcnMgd2lsbCBwcmludCBhIHdhcm5pbmcgaWYgbW9yZSB0aGFuIDEwIGxpc3RlbmVycyBhcmVcbi8vIGFkZGVkIHRvIGl0LiBUaGlzIGlzIGEgdXNlZnVsIGRlZmF1bHQgd2hpY2ggaGVscHMgZmluZGluZyBtZW1vcnkgbGVha3MuXG5FdmVudEVtaXR0ZXIuZGVmYXVsdE1heExpc3RlbmVycyA9IDEwO1xuXG4vLyBPYnZpb3VzbHkgbm90IGFsbCBFbWl0dGVycyBzaG91bGQgYmUgbGltaXRlZCB0byAxMC4gVGhpcyBmdW5jdGlvbiBhbGxvd3Ncbi8vIHRoYXQgdG8gYmUgaW5jcmVhc2VkLiBTZXQgdG8gemVybyBmb3IgdW5saW1pdGVkLlxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5zZXRNYXhMaXN0ZW5lcnMgPSBmdW5jdGlvbihuKSB7XG4gIGlmICghaXNOdW1iZXIobikgfHwgbiA8IDAgfHwgaXNOYU4obikpXG4gICAgdGhyb3cgVHlwZUVycm9yKCduIG11c3QgYmUgYSBwb3NpdGl2ZSBudW1iZXInKTtcbiAgdGhpcy5fbWF4TGlzdGVuZXJzID0gbjtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmVtaXQgPSBmdW5jdGlvbih0eXBlKSB7XG4gIHZhciBlciwgaGFuZGxlciwgbGVuLCBhcmdzLCBpLCBsaXN0ZW5lcnM7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMpXG4gICAgdGhpcy5fZXZlbnRzID0ge307XG5cbiAgLy8gSWYgdGhlcmUgaXMgbm8gJ2Vycm9yJyBldmVudCBsaXN0ZW5lciB0aGVuIHRocm93LlxuICBpZiAodHlwZSA9PT0gJ2Vycm9yJykge1xuICAgIGlmICghdGhpcy5fZXZlbnRzLmVycm9yIHx8XG4gICAgICAgIChpc09iamVjdCh0aGlzLl9ldmVudHMuZXJyb3IpICYmICF0aGlzLl9ldmVudHMuZXJyb3IubGVuZ3RoKSkge1xuICAgICAgZXIgPSBhcmd1bWVudHNbMV07XG4gICAgICBpZiAoZXIgaW5zdGFuY2VvZiBFcnJvcikge1xuICAgICAgICB0aHJvdyBlcjsgLy8gVW5oYW5kbGVkICdlcnJvcicgZXZlbnRcbiAgICAgIH1cbiAgICAgIHRocm93IFR5cGVFcnJvcignVW5jYXVnaHQsIHVuc3BlY2lmaWVkIFwiZXJyb3JcIiBldmVudC4nKTtcbiAgICB9XG4gIH1cblxuICBoYW5kbGVyID0gdGhpcy5fZXZlbnRzW3R5cGVdO1xuXG4gIGlmIChpc1VuZGVmaW5lZChoYW5kbGVyKSlcbiAgICByZXR1cm4gZmFsc2U7XG5cbiAgaWYgKGlzRnVuY3Rpb24oaGFuZGxlcikpIHtcbiAgICBzd2l0Y2ggKGFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICAgIC8vIGZhc3QgY2FzZXNcbiAgICAgIGNhc2UgMTpcbiAgICAgICAgaGFuZGxlci5jYWxsKHRoaXMpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMjpcbiAgICAgICAgaGFuZGxlci5jYWxsKHRoaXMsIGFyZ3VtZW50c1sxXSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAzOlxuICAgICAgICBoYW5kbGVyLmNhbGwodGhpcywgYXJndW1lbnRzWzFdLCBhcmd1bWVudHNbMl0pO1xuICAgICAgICBicmVhaztcbiAgICAgIC8vIHNsb3dlclxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgbGVuID0gYXJndW1lbnRzLmxlbmd0aDtcbiAgICAgICAgYXJncyA9IG5ldyBBcnJheShsZW4gLSAxKTtcbiAgICAgICAgZm9yIChpID0gMTsgaSA8IGxlbjsgaSsrKVxuICAgICAgICAgIGFyZ3NbaSAtIDFdID0gYXJndW1lbnRzW2ldO1xuICAgICAgICBoYW5kbGVyLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgIH1cbiAgfSBlbHNlIGlmIChpc09iamVjdChoYW5kbGVyKSkge1xuICAgIGxlbiA9IGFyZ3VtZW50cy5sZW5ndGg7XG4gICAgYXJncyA9IG5ldyBBcnJheShsZW4gLSAxKTtcbiAgICBmb3IgKGkgPSAxOyBpIDwgbGVuOyBpKyspXG4gICAgICBhcmdzW2kgLSAxXSA9IGFyZ3VtZW50c1tpXTtcblxuICAgIGxpc3RlbmVycyA9IGhhbmRsZXIuc2xpY2UoKTtcbiAgICBsZW4gPSBsaXN0ZW5lcnMubGVuZ3RoO1xuICAgIGZvciAoaSA9IDA7IGkgPCBsZW47IGkrKylcbiAgICAgIGxpc3RlbmVyc1tpXS5hcHBseSh0aGlzLCBhcmdzKTtcbiAgfVxuXG4gIHJldHVybiB0cnVlO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5hZGRMaXN0ZW5lciA9IGZ1bmN0aW9uKHR5cGUsIGxpc3RlbmVyKSB7XG4gIHZhciBtO1xuXG4gIGlmICghaXNGdW5jdGlvbihsaXN0ZW5lcikpXG4gICAgdGhyb3cgVHlwZUVycm9yKCdsaXN0ZW5lciBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcblxuICBpZiAoIXRoaXMuX2V2ZW50cylcbiAgICB0aGlzLl9ldmVudHMgPSB7fTtcblxuICAvLyBUbyBhdm9pZCByZWN1cnNpb24gaW4gdGhlIGNhc2UgdGhhdCB0eXBlID09PSBcIm5ld0xpc3RlbmVyXCIhIEJlZm9yZVxuICAvLyBhZGRpbmcgaXQgdG8gdGhlIGxpc3RlbmVycywgZmlyc3QgZW1pdCBcIm5ld0xpc3RlbmVyXCIuXG4gIGlmICh0aGlzLl9ldmVudHMubmV3TGlzdGVuZXIpXG4gICAgdGhpcy5lbWl0KCduZXdMaXN0ZW5lcicsIHR5cGUsXG4gICAgICAgICAgICAgIGlzRnVuY3Rpb24obGlzdGVuZXIubGlzdGVuZXIpID9cbiAgICAgICAgICAgICAgbGlzdGVuZXIubGlzdGVuZXIgOiBsaXN0ZW5lcik7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHNbdHlwZV0pXG4gICAgLy8gT3B0aW1pemUgdGhlIGNhc2Ugb2Ygb25lIGxpc3RlbmVyLiBEb24ndCBuZWVkIHRoZSBleHRyYSBhcnJheSBvYmplY3QuXG4gICAgdGhpcy5fZXZlbnRzW3R5cGVdID0gbGlzdGVuZXI7XG4gIGVsc2UgaWYgKGlzT2JqZWN0KHRoaXMuX2V2ZW50c1t0eXBlXSkpXG4gICAgLy8gSWYgd2UndmUgYWxyZWFkeSBnb3QgYW4gYXJyYXksIGp1c3QgYXBwZW5kLlxuICAgIHRoaXMuX2V2ZW50c1t0eXBlXS5wdXNoKGxpc3RlbmVyKTtcbiAgZWxzZVxuICAgIC8vIEFkZGluZyB0aGUgc2Vjb25kIGVsZW1lbnQsIG5lZWQgdG8gY2hhbmdlIHRvIGFycmF5LlxuICAgIHRoaXMuX2V2ZW50c1t0eXBlXSA9IFt0aGlzLl9ldmVudHNbdHlwZV0sIGxpc3RlbmVyXTtcblxuICAvLyBDaGVjayBmb3IgbGlzdGVuZXIgbGVha1xuICBpZiAoaXNPYmplY3QodGhpcy5fZXZlbnRzW3R5cGVdKSAmJiAhdGhpcy5fZXZlbnRzW3R5cGVdLndhcm5lZCkge1xuICAgIHZhciBtO1xuICAgIGlmICghaXNVbmRlZmluZWQodGhpcy5fbWF4TGlzdGVuZXJzKSkge1xuICAgICAgbSA9IHRoaXMuX21heExpc3RlbmVycztcbiAgICB9IGVsc2Uge1xuICAgICAgbSA9IEV2ZW50RW1pdHRlci5kZWZhdWx0TWF4TGlzdGVuZXJzO1xuICAgIH1cblxuICAgIGlmIChtICYmIG0gPiAwICYmIHRoaXMuX2V2ZW50c1t0eXBlXS5sZW5ndGggPiBtKSB7XG4gICAgICB0aGlzLl9ldmVudHNbdHlwZV0ud2FybmVkID0gdHJ1ZTtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJyhub2RlKSB3YXJuaW5nOiBwb3NzaWJsZSBFdmVudEVtaXR0ZXIgbWVtb3J5ICcgK1xuICAgICAgICAgICAgICAgICAgICAnbGVhayBkZXRlY3RlZC4gJWQgbGlzdGVuZXJzIGFkZGVkLiAnICtcbiAgICAgICAgICAgICAgICAgICAgJ1VzZSBlbWl0dGVyLnNldE1heExpc3RlbmVycygpIHRvIGluY3JlYXNlIGxpbWl0LicsXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2V2ZW50c1t0eXBlXS5sZW5ndGgpO1xuICAgICAgaWYgKHR5cGVvZiBjb25zb2xlLnRyYWNlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIC8vIG5vdCBzdXBwb3J0ZWQgaW4gSUUgMTBcbiAgICAgICAgY29uc29sZS50cmFjZSgpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vbiA9IEV2ZW50RW1pdHRlci5wcm90b3R5cGUuYWRkTGlzdGVuZXI7XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUub25jZSA9IGZ1bmN0aW9uKHR5cGUsIGxpc3RlbmVyKSB7XG4gIGlmICghaXNGdW5jdGlvbihsaXN0ZW5lcikpXG4gICAgdGhyb3cgVHlwZUVycm9yKCdsaXN0ZW5lciBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcblxuICB2YXIgZmlyZWQgPSBmYWxzZTtcblxuICBmdW5jdGlvbiBnKCkge1xuICAgIHRoaXMucmVtb3ZlTGlzdGVuZXIodHlwZSwgZyk7XG5cbiAgICBpZiAoIWZpcmVkKSB7XG4gICAgICBmaXJlZCA9IHRydWU7XG4gICAgICBsaXN0ZW5lci5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH1cbiAgfVxuXG4gIGcubGlzdGVuZXIgPSBsaXN0ZW5lcjtcbiAgdGhpcy5vbih0eXBlLCBnKTtcblxuICByZXR1cm4gdGhpcztcbn07XG5cbi8vIGVtaXRzIGEgJ3JlbW92ZUxpc3RlbmVyJyBldmVudCBpZmYgdGhlIGxpc3RlbmVyIHdhcyByZW1vdmVkXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUxpc3RlbmVyID0gZnVuY3Rpb24odHlwZSwgbGlzdGVuZXIpIHtcbiAgdmFyIGxpc3QsIHBvc2l0aW9uLCBsZW5ndGgsIGk7XG5cbiAgaWYgKCFpc0Z1bmN0aW9uKGxpc3RlbmVyKSlcbiAgICB0aHJvdyBUeXBlRXJyb3IoJ2xpc3RlbmVyIG11c3QgYmUgYSBmdW5jdGlvbicpO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzIHx8ICF0aGlzLl9ldmVudHNbdHlwZV0pXG4gICAgcmV0dXJuIHRoaXM7XG5cbiAgbGlzdCA9IHRoaXMuX2V2ZW50c1t0eXBlXTtcbiAgbGVuZ3RoID0gbGlzdC5sZW5ndGg7XG4gIHBvc2l0aW9uID0gLTE7XG5cbiAgaWYgKGxpc3QgPT09IGxpc3RlbmVyIHx8XG4gICAgICAoaXNGdW5jdGlvbihsaXN0Lmxpc3RlbmVyKSAmJiBsaXN0Lmxpc3RlbmVyID09PSBsaXN0ZW5lcikpIHtcbiAgICBkZWxldGUgdGhpcy5fZXZlbnRzW3R5cGVdO1xuICAgIGlmICh0aGlzLl9ldmVudHMucmVtb3ZlTGlzdGVuZXIpXG4gICAgICB0aGlzLmVtaXQoJ3JlbW92ZUxpc3RlbmVyJywgdHlwZSwgbGlzdGVuZXIpO1xuXG4gIH0gZWxzZSBpZiAoaXNPYmplY3QobGlzdCkpIHtcbiAgICBmb3IgKGkgPSBsZW5ndGg7IGktLSA+IDA7KSB7XG4gICAgICBpZiAobGlzdFtpXSA9PT0gbGlzdGVuZXIgfHxcbiAgICAgICAgICAobGlzdFtpXS5saXN0ZW5lciAmJiBsaXN0W2ldLmxpc3RlbmVyID09PSBsaXN0ZW5lcikpIHtcbiAgICAgICAgcG9zaXRpb24gPSBpO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAocG9zaXRpb24gPCAwKVxuICAgICAgcmV0dXJuIHRoaXM7XG5cbiAgICBpZiAobGlzdC5sZW5ndGggPT09IDEpIHtcbiAgICAgIGxpc3QubGVuZ3RoID0gMDtcbiAgICAgIGRlbGV0ZSB0aGlzLl9ldmVudHNbdHlwZV07XG4gICAgfSBlbHNlIHtcbiAgICAgIGxpc3Quc3BsaWNlKHBvc2l0aW9uLCAxKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5fZXZlbnRzLnJlbW92ZUxpc3RlbmVyKVxuICAgICAgdGhpcy5lbWl0KCdyZW1vdmVMaXN0ZW5lcicsIHR5cGUsIGxpc3RlbmVyKTtcbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBmdW5jdGlvbih0eXBlKSB7XG4gIHZhciBrZXksIGxpc3RlbmVycztcblxuICBpZiAoIXRoaXMuX2V2ZW50cylcbiAgICByZXR1cm4gdGhpcztcblxuICAvLyBub3QgbGlzdGVuaW5nIGZvciByZW1vdmVMaXN0ZW5lciwgbm8gbmVlZCB0byBlbWl0XG4gIGlmICghdGhpcy5fZXZlbnRzLnJlbW92ZUxpc3RlbmVyKSB7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApXG4gICAgICB0aGlzLl9ldmVudHMgPSB7fTtcbiAgICBlbHNlIGlmICh0aGlzLl9ldmVudHNbdHlwZV0pXG4gICAgICBkZWxldGUgdGhpcy5fZXZlbnRzW3R5cGVdO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLy8gZW1pdCByZW1vdmVMaXN0ZW5lciBmb3IgYWxsIGxpc3RlbmVycyBvbiBhbGwgZXZlbnRzXG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKSB7XG4gICAgZm9yIChrZXkgaW4gdGhpcy5fZXZlbnRzKSB7XG4gICAgICBpZiAoa2V5ID09PSAncmVtb3ZlTGlzdGVuZXInKSBjb250aW51ZTtcbiAgICAgIHRoaXMucmVtb3ZlQWxsTGlzdGVuZXJzKGtleSk7XG4gICAgfVxuICAgIHRoaXMucmVtb3ZlQWxsTGlzdGVuZXJzKCdyZW1vdmVMaXN0ZW5lcicpO1xuICAgIHRoaXMuX2V2ZW50cyA9IHt9O1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgbGlzdGVuZXJzID0gdGhpcy5fZXZlbnRzW3R5cGVdO1xuXG4gIGlmIChpc0Z1bmN0aW9uKGxpc3RlbmVycykpIHtcbiAgICB0aGlzLnJlbW92ZUxpc3RlbmVyKHR5cGUsIGxpc3RlbmVycyk7XG4gIH0gZWxzZSB7XG4gICAgLy8gTElGTyBvcmRlclxuICAgIHdoaWxlIChsaXN0ZW5lcnMubGVuZ3RoKVxuICAgICAgdGhpcy5yZW1vdmVMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lcnNbbGlzdGVuZXJzLmxlbmd0aCAtIDFdKTtcbiAgfVxuICBkZWxldGUgdGhpcy5fZXZlbnRzW3R5cGVdO1xuXG4gIHJldHVybiB0aGlzO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5saXN0ZW5lcnMgPSBmdW5jdGlvbih0eXBlKSB7XG4gIHZhciByZXQ7XG4gIGlmICghdGhpcy5fZXZlbnRzIHx8ICF0aGlzLl9ldmVudHNbdHlwZV0pXG4gICAgcmV0ID0gW107XG4gIGVsc2UgaWYgKGlzRnVuY3Rpb24odGhpcy5fZXZlbnRzW3R5cGVdKSlcbiAgICByZXQgPSBbdGhpcy5fZXZlbnRzW3R5cGVdXTtcbiAgZWxzZVxuICAgIHJldCA9IHRoaXMuX2V2ZW50c1t0eXBlXS5zbGljZSgpO1xuICByZXR1cm4gcmV0O1xufTtcblxuRXZlbnRFbWl0dGVyLmxpc3RlbmVyQ291bnQgPSBmdW5jdGlvbihlbWl0dGVyLCB0eXBlKSB7XG4gIHZhciByZXQ7XG4gIGlmICghZW1pdHRlci5fZXZlbnRzIHx8ICFlbWl0dGVyLl9ldmVudHNbdHlwZV0pXG4gICAgcmV0ID0gMDtcbiAgZWxzZSBpZiAoaXNGdW5jdGlvbihlbWl0dGVyLl9ldmVudHNbdHlwZV0pKVxuICAgIHJldCA9IDE7XG4gIGVsc2VcbiAgICByZXQgPSBlbWl0dGVyLl9ldmVudHNbdHlwZV0ubGVuZ3RoO1xuICByZXR1cm4gcmV0O1xufTtcblxuZnVuY3Rpb24gaXNGdW5jdGlvbihhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdmdW5jdGlvbic7XG59XG5cbmZ1bmN0aW9uIGlzTnVtYmVyKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ251bWJlcic7XG59XG5cbmZ1bmN0aW9uIGlzT2JqZWN0KGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ29iamVjdCcgJiYgYXJnICE9PSBudWxsO1xufVxuXG5mdW5jdGlvbiBpc1VuZGVmaW5lZChhcmcpIHtcbiAgcmV0dXJuIGFyZyA9PT0gdm9pZCAwO1xufVxuIiwiLy8gc2hpbSBmb3IgdXNpbmcgcHJvY2VzcyBpbiBicm93c2VyXG5cbnZhciBwcm9jZXNzID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcbnZhciBxdWV1ZSA9IFtdO1xudmFyIGRyYWluaW5nID0gZmFsc2U7XG52YXIgY3VycmVudFF1ZXVlO1xudmFyIHF1ZXVlSW5kZXggPSAtMTtcblxuZnVuY3Rpb24gY2xlYW5VcE5leHRUaWNrKCkge1xuICAgIGRyYWluaW5nID0gZmFsc2U7XG4gICAgaWYgKGN1cnJlbnRRdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgcXVldWUgPSBjdXJyZW50UXVldWUuY29uY2F0KHF1ZXVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBxdWV1ZUluZGV4ID0gLTE7XG4gICAgfVxuICAgIGlmIChxdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgZHJhaW5RdWV1ZSgpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gZHJhaW5RdWV1ZSgpIHtcbiAgICBpZiAoZHJhaW5pbmcpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgdGltZW91dCA9IHNldFRpbWVvdXQoY2xlYW5VcE5leHRUaWNrKTtcbiAgICBkcmFpbmluZyA9IHRydWU7XG5cbiAgICB2YXIgbGVuID0gcXVldWUubGVuZ3RoO1xuICAgIHdoaWxlKGxlbikge1xuICAgICAgICBjdXJyZW50UXVldWUgPSBxdWV1ZTtcbiAgICAgICAgcXVldWUgPSBbXTtcbiAgICAgICAgd2hpbGUgKCsrcXVldWVJbmRleCA8IGxlbikge1xuICAgICAgICAgICAgY3VycmVudFF1ZXVlW3F1ZXVlSW5kZXhdLnJ1bigpO1xuICAgICAgICB9XG4gICAgICAgIHF1ZXVlSW5kZXggPSAtMTtcbiAgICAgICAgbGVuID0gcXVldWUubGVuZ3RoO1xuICAgIH1cbiAgICBjdXJyZW50UXVldWUgPSBudWxsO1xuICAgIGRyYWluaW5nID0gZmFsc2U7XG4gICAgY2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xufVxuXG5wcm9jZXNzLm5leHRUaWNrID0gZnVuY3Rpb24gKGZ1bikge1xuICAgIHZhciBhcmdzID0gbmV3IEFycmF5KGFyZ3VtZW50cy5sZW5ndGggLSAxKTtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGFyZ3NbaSAtIDFdID0gYXJndW1lbnRzW2ldO1xuICAgICAgICB9XG4gICAgfVxuICAgIHF1ZXVlLnB1c2gobmV3IEl0ZW0oZnVuLCBhcmdzKSk7XG4gICAgaWYgKHF1ZXVlLmxlbmd0aCA9PT0gMSAmJiAhZHJhaW5pbmcpIHtcbiAgICAgICAgc2V0VGltZW91dChkcmFpblF1ZXVlLCAwKTtcbiAgICB9XG59O1xuXG4vLyB2OCBsaWtlcyBwcmVkaWN0aWJsZSBvYmplY3RzXG5mdW5jdGlvbiBJdGVtKGZ1biwgYXJyYXkpIHtcbiAgICB0aGlzLmZ1biA9IGZ1bjtcbiAgICB0aGlzLmFycmF5ID0gYXJyYXk7XG59XG5JdGVtLnByb3RvdHlwZS5ydW4gPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5mdW4uYXBwbHkobnVsbCwgdGhpcy5hcnJheSk7XG59O1xucHJvY2Vzcy50aXRsZSA9ICdicm93c2VyJztcbnByb2Nlc3MuYnJvd3NlciA9IHRydWU7XG5wcm9jZXNzLmVudiA9IHt9O1xucHJvY2Vzcy5hcmd2ID0gW107XG5wcm9jZXNzLnZlcnNpb24gPSAnJzsgLy8gZW1wdHkgc3RyaW5nIHRvIGF2b2lkIHJlZ2V4cCBpc3N1ZXNcbnByb2Nlc3MudmVyc2lvbnMgPSB7fTtcblxuZnVuY3Rpb24gbm9vcCgpIHt9XG5cbnByb2Nlc3Mub24gPSBub29wO1xucHJvY2Vzcy5hZGRMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLm9uY2UgPSBub29wO1xucHJvY2Vzcy5vZmYgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUFsbExpc3RlbmVycyA9IG5vb3A7XG5wcm9jZXNzLmVtaXQgPSBub29wO1xuXG5wcm9jZXNzLmJpbmRpbmcgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5iaW5kaW5nIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5cbi8vIFRPRE8oc2h0eWxtYW4pXG5wcm9jZXNzLmN3ZCA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuICcvJyB9O1xucHJvY2Vzcy5jaGRpciA9IGZ1bmN0aW9uIChkaXIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuY2hkaXIgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcbnByb2Nlc3MudW1hc2sgPSBmdW5jdGlvbigpIHsgcmV0dXJuIDA7IH07XG4iLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHtcblx0dmFsdWU6IHRydWVcbn0pO1xudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcbnZhciBDb250YWluZXIgPSByZXF1aXJlKCdyZWFjdC1jb250YWluZXInKTtcblxudmFyIEVycm9yVmlldyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblx0ZGlzcGxheU5hbWU6ICdFcnJvclZpZXcnLFxuXG5cdHByb3BUeXBlczoge1xuXHRcdGNoaWxkcmVuOiBSZWFjdC5Qcm9wVHlwZXMubm9kZVxuXHR9LFxuXG5cdHJlbmRlcjogZnVuY3Rpb24gcmVuZGVyKCkge1xuXHRcdHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KFxuXHRcdFx0Q29udGFpbmVyLFxuXHRcdFx0eyBmaWxsOiB0cnVlLCBjbGFzc05hbWU6ICdWaWV3IEVycm9yVmlldycgfSxcblx0XHRcdHRoaXMucHJvcHMuY2hpbGRyZW5cblx0XHQpO1xuXHR9XG59KTtcblxuZXhwb3J0c1snZGVmYXVsdCddID0gRXJyb3JWaWV3O1xubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107IiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7XG5cdHZhbHVlOiB0cnVlXG59KTtcblxudmFyIF9leHRlbmRzID0gT2JqZWN0LmFzc2lnbiB8fCBmdW5jdGlvbiAodGFyZ2V0KSB7IGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7IHZhciBzb3VyY2UgPSBhcmd1bWVudHNbaV07IGZvciAodmFyIGtleSBpbiBzb3VyY2UpIHsgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzb3VyY2UsIGtleSkpIHsgdGFyZ2V0W2tleV0gPSBzb3VyY2Vba2V5XTsgfSB9IH0gcmV0dXJuIHRhcmdldDsgfTtcblxudmFyIGJsYWNrbGlzdCA9IHJlcXVpcmUoJ2JsYWNrbGlzdCcpO1xudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcbnZhciBUYXBwYWJsZSA9IHJlcXVpcmUoJ3JlYWN0LXRhcHBhYmxlJyk7XG52YXIgVHJhbnNpdGlvbnMgPSByZXF1aXJlKCcuLi9taXhpbnMvVHJhbnNpdGlvbnMnKTtcblxudmFyIExpbmsgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cdGRpc3BsYXlOYW1lOiAnTGluaycsXG5cblx0bWl4aW5zOiBbVHJhbnNpdGlvbnNdLFxuXHRwcm9wVHlwZXM6IHtcblx0XHRjaGlsZHJlbjogUmVhY3QuUHJvcFR5cGVzLmFueSxcblx0XHRvcHRpb25zOiBSZWFjdC5Qcm9wVHlwZXMub2JqZWN0LFxuXHRcdHRyYW5zaXRpb246IFJlYWN0LlByb3BUeXBlcy5zdHJpbmcsXG5cdFx0dG86IFJlYWN0LlByb3BUeXBlcy5zdHJpbmcsXG5cdFx0dmlld1Byb3BzOiBSZWFjdC5Qcm9wVHlwZXMuYW55XG5cdH0sXG5cblx0ZG9UcmFuc2l0aW9uOiBmdW5jdGlvbiBkb1RyYW5zaXRpb24oKSB7XG5cdFx0dmFyIG9wdGlvbnMgPSBfZXh0ZW5kcyh7IHZpZXdQcm9wczogdGhpcy5wcm9wcy52aWV3UHJvcHMsIHRyYW5zaXRpb246IHRoaXMucHJvcHMudHJhbnNpdGlvbiB9LCB0aGlzLnByb3BzLm9wdGlvbnMpO1xuXHRcdGNvbnNvbGUuaW5mbygnTGluayB0byBcIicgKyB0aGlzLnByb3BzLnRvICsgJ1wiIHVzaW5nIHRyYW5zaXRpb24gXCInICsgdGhpcy5wcm9wcy50cmFuc2l0aW9uICsgJ1wiJyArICcgd2l0aCBwcm9wcyAnLCB0aGlzLnByb3BzLnZpZXdQcm9wcyk7XG5cdFx0dGhpcy50cmFuc2l0aW9uVG8odGhpcy5wcm9wcy50bywgb3B0aW9ucyk7XG5cdH0sXG5cblx0cmVuZGVyOiBmdW5jdGlvbiByZW5kZXIoKSB7XG5cdFx0dmFyIHRhcHBhYmxlUHJvcHMgPSBibGFja2xpc3QodGhpcy5wcm9wcywgJ2NoaWxkcmVuJywgJ29wdGlvbnMnLCAndHJhbnNpdGlvbicsICd2aWV3UHJvcHMnKTtcblxuXHRcdHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KFxuXHRcdFx0VGFwcGFibGUsXG5cdFx0XHRfZXh0ZW5kcyh7IG9uVGFwOiB0aGlzLmRvVHJhbnNpdGlvbiB9LCB0YXBwYWJsZVByb3BzKSxcblx0XHRcdHRoaXMucHJvcHMuY2hpbGRyZW5cblx0XHQpO1xuXHR9XG59KTtcblxuZXhwb3J0c1snZGVmYXVsdCddID0gTGluaztcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddOyIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywge1xuXHR2YWx1ZTogdHJ1ZVxufSk7XG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG52YXIgVmlldyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblx0ZGlzcGxheU5hbWU6ICdWaWV3JyxcblxuXHRwcm9wVHlwZXM6IHtcblx0XHRjb21wb25lbnQ6IFJlYWN0LlByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG5cdFx0bmFtZTogUmVhY3QuUHJvcFR5cGVzLnN0cmluZy5pc1JlcXVpcmVkXG5cdH0sXG5cdHJlbmRlcjogZnVuY3Rpb24gcmVuZGVyKCkge1xuXHRcdHRocm93IG5ldyBFcnJvcignVG91Y2hzdG9uZUpTIDxWaWV3PiBzaG91bGQgbm90IGJlIHJlbmRlcmVkIGRpcmVjdGx5LicpO1xuXHR9XG59KTtcblxuZXhwb3J0c1snZGVmYXVsdCddID0gVmlldztcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddOyIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywge1xuXHR2YWx1ZTogdHJ1ZVxufSk7XG5cbnZhciBfZXh0ZW5kcyA9IE9iamVjdC5hc3NpZ24gfHwgZnVuY3Rpb24gKHRhcmdldCkgeyBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykgeyB2YXIgc291cmNlID0gYXJndW1lbnRzW2ldOyBmb3IgKHZhciBrZXkgaW4gc291cmNlKSB7IGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoc291cmNlLCBrZXkpKSB7IHRhcmdldFtrZXldID0gc291cmNlW2tleV07IH0gfSB9IHJldHVybiB0YXJnZXQ7IH07XG5cbnZhciBibGFja2xpc3QgPSByZXF1aXJlKCdibGFja2xpc3QnKTtcbnZhciBjbGFzc05hbWVzID0gcmVxdWlyZSgnY2xhc3NuYW1lcycpO1xudmFyIEVycm9yVmlldyA9IHJlcXVpcmUoJy4vRXJyb3JWaWV3Jyk7XG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdC9hZGRvbnMnKTtcbnZhciBUcmFuc2l0aW9uID0gUmVhY3QuYWRkb25zLkNTU1RyYW5zaXRpb25Hcm91cDtcblxuZnVuY3Rpb24gY3JlYXRlVmlld3NGcm9tQ2hpbGRyZW4oY2hpbGRyZW4pIHtcblx0dmFyIHZpZXdzID0ge307XG5cdFJlYWN0LkNoaWxkcmVuLmZvckVhY2goY2hpbGRyZW4sIGZ1bmN0aW9uICh2aWV3KSB7XG5cdFx0dmlld3Nbdmlldy5wcm9wcy5uYW1lXSA9IHZpZXc7XG5cdH0pO1xuXHRyZXR1cm4gdmlld3M7XG59XG5cbnZhciBWaWV3Q29udGFpbmVyID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXHRkaXNwbGF5TmFtZTogJ1ZpZXdDb250YWluZXInLFxuXG5cdHN0YXRpY3M6IHtcblx0XHRzaG91bGRGaWxsVmVydGljYWxTcGFjZTogdHJ1ZVxuXHR9LFxuXHRwcm9wVHlwZXM6IHtcblx0XHRjaGlsZHJlbjogUmVhY3QuUHJvcFR5cGVzLm5vZGVcblx0fSxcblx0cmVuZGVyOiBmdW5jdGlvbiByZW5kZXIoKSB7XG5cdFx0dmFyIHByb3BzID0gYmxhY2tsaXN0KHRoaXMucHJvcHMsICdjaGlsZHJlbicpO1xuXHRcdHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KFxuXHRcdFx0J2RpdicsXG5cdFx0XHRwcm9wcyxcblx0XHRcdHRoaXMucHJvcHMuY2hpbGRyZW5cblx0XHQpO1xuXHR9XG59KTtcblxudmFyIFZpZXdNYW5hZ2VyID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXHRkaXNwbGF5TmFtZTogJ1ZpZXdNYW5hZ2VyJyxcblxuXHRzdGF0aWNzOiB7XG5cdFx0c2hvdWxkRmlsbFZlcnRpY2FsU3BhY2U6IHRydWVcblx0fSxcblx0Y29udGV4dFR5cGVzOiB7XG5cdFx0YXBwOiBSZWFjdC5Qcm9wVHlwZXMub2JqZWN0LmlzUmVxdWlyZWRcblx0fSxcblx0cHJvcFR5cGVzOiB7XG5cdFx0bmFtZTogUmVhY3QuUHJvcFR5cGVzLnN0cmluZyxcblx0XHRjaGlsZHJlbjogUmVhY3QuUHJvcFR5cGVzLm5vZGUsXG5cdFx0Y2xhc3NOYW1lOiBSZWFjdC5Qcm9wVHlwZXMuc3RyaW5nLFxuXHRcdGRlZmF1bHRWaWV3OiBSZWFjdC5Qcm9wVHlwZXMuc3RyaW5nLFxuXHRcdG9uVmlld0NoYW5nZTogUmVhY3QuUHJvcFR5cGVzLmZ1bmNcblx0fSxcblx0Z2V0RGVmYXVsdFByb3BzOiBmdW5jdGlvbiBnZXREZWZhdWx0UHJvcHMoKSB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdG5hbWU6ICdfX2RlZmF1bHQnXG5cdFx0fTtcblx0fSxcblx0Z2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbiBnZXRJbml0aWFsU3RhdGUoKSB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdHZpZXdzOiBjcmVhdGVWaWV3c0Zyb21DaGlsZHJlbih0aGlzLnByb3BzLmNoaWxkcmVuKSxcblx0XHRcdGN1cnJlbnRWaWV3OiB0aGlzLnByb3BzLmRlZmF1bHRWaWV3LFxuXHRcdFx0b3B0aW9uczoge31cblx0XHR9O1xuXHR9LFxuXHRjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24gY29tcG9uZW50RGlkTW91bnQoKSB7XG5cdFx0dGhpcy5jb250ZXh0LmFwcC52aWV3TWFuYWdlcnNbdGhpcy5wcm9wcy5uYW1lXSA9IHRoaXM7XG5cdH0sXG5cdGNvbXBvbmVudFdpbGxVbm1vdW50OiBmdW5jdGlvbiBjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcblx0XHRkZWxldGUgdGhpcy5jb250ZXh0LmFwcC52aWV3TWFuYWdlcnNbdGhpcy5wcm9wcy5uYW1lXTtcblx0fSxcblx0Y29tcG9uZW50V2lsbFJlY2VpdmVQcm9wczogZnVuY3Rpb24gY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcyhuZXh0UHJvcHMpIHtcblx0XHR0aGlzLnNldFN0YXRlKHtcblx0XHRcdHZpZXdzOiBjcmVhdGVWaWV3c0Zyb21DaGlsZHJlbih0aGlzLnByb3BzLmNoaWxkcmVuKVxuXHRcdH0pO1xuXHRcdGlmIChuZXh0UHJvcHMubmFtZSAhPT0gdGhpcy5wcm9wcy5uYW1lKSB7XG5cdFx0XHR0aGlzLmNvbnRleHQuYXBwLnZpZXdNYW5hZ2Vyc1tuZXh0UHJvcHMubmFtZV0gPSB0aGlzO1xuXHRcdFx0ZGVsZXRlIHRoaXMuY29udGV4dC5hcHAudmlld01hbmFnZXJzW3RoaXMucHJvcHMubmFtZV07XG5cdFx0fVxuXHRcdGlmIChuZXh0UHJvcHMuY3VycmVudFZpZXcgJiYgbmV4dFByb3BzLmN1cnJlbnRWaWV3ICE9PSB0aGlzLnN0YXRlLmN1cnJlbnRWaWV3KSB7XG5cdFx0XHR0aGlzLnRyYW5zaXRpb25UbyhuZXh0UHJvcHMuY3VycmVudFZpZXcsIHsgdmlld1Byb3BzOiBuZXh0UHJvcHMudmlld1Byb3BzIH0pO1xuXHRcdH1cblx0fSxcblx0dHJhbnNpdGlvblRvOiBmdW5jdGlvbiB0cmFuc2l0aW9uVG8odmlld0tleSwgb3B0aW9ucykge1xuXHRcdHZhciBfdGhpcyA9IHRoaXM7XG5cblx0XHRpZiAodHlwZW9mIG9wdGlvbnMgPT09ICdzdHJpbmcnKSB7XG5cdFx0XHRvcHRpb25zID0geyB0cmFuc2l0aW9uOiBvcHRpb25zIH07XG5cdFx0fVxuXHRcdGlmICghb3B0aW9ucykgb3B0aW9ucyA9IHt9O1xuXHRcdHRoaXMuYWN0aXZlVHJhbnNpdGlvbk9wdGlvbnMgPSBvcHRpb25zO1xuXHRcdHRoaXMuY29udGV4dC5hcHAudmlld01hbmFnZXJJblRyYW5zaXRpb24gPSB0aGlzO1xuXHRcdHRoaXMucHJvcHMub25WaWV3Q2hhbmdlICYmIHRoaXMucHJvcHMub25WaWV3Q2hhbmdlKHZpZXdLZXkpO1xuXHRcdHRoaXMuc2V0U3RhdGUoe1xuXHRcdFx0Y3VycmVudFZpZXc6IHZpZXdLZXksXG5cdFx0XHRvcHRpb25zOiBvcHRpb25zXG5cdFx0fSwgZnVuY3Rpb24gKCkge1xuXHRcdFx0ZGVsZXRlIF90aGlzLmFjdGl2ZVRyYW5zaXRpb25PcHRpb25zO1xuXHRcdFx0ZGVsZXRlIF90aGlzLmNvbnRleHQuYXBwLnZpZXdNYW5hZ2VySW5UcmFuc2l0aW9uO1xuXHRcdH0pO1xuXHR9LFxuXHRyZW5kZXJWaWV3Q29udGFpbmVyOiBmdW5jdGlvbiByZW5kZXJWaWV3Q29udGFpbmVyKCkge1xuXHRcdHZhciB2aWV3S2V5ID0gdGhpcy5zdGF0ZS5jdXJyZW50Vmlldztcblx0XHRpZiAoIXZpZXdLZXkpIHtcblx0XHRcdHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KFxuXHRcdFx0XHRFcnJvclZpZXcsXG5cdFx0XHRcdG51bGwsXG5cdFx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG5cdFx0XHRcdFx0J3NwYW4nLFxuXHRcdFx0XHRcdHsgY2xhc3NOYW1lOiAnRXJyb3JWaWV3X19oZWFkaW5nJyB9LFxuXHRcdFx0XHRcdCdWaWV3TWFuYWdlcjogJyxcblx0XHRcdFx0XHR0aGlzLnByb3BzLm5hbWVcblx0XHRcdFx0KSxcblx0XHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChcblx0XHRcdFx0XHQnc3BhbicsXG5cdFx0XHRcdFx0eyBjbGFzc05hbWU6ICdFcnJvclZpZXdfX3RleHQnIH0sXG5cdFx0XHRcdFx0J0Vycm9yOiBUaGVyZSBpcyBubyBjdXJyZW50IFZpZXcuJ1xuXHRcdFx0XHQpXG5cdFx0XHQpO1xuXHRcdH1cblx0XHR2YXIgdmlldyA9IHRoaXMuc3RhdGUudmlld3Nbdmlld0tleV07XG5cdFx0aWYgKCF2aWV3IHx8ICF2aWV3LnByb3BzLmNvbXBvbmVudCkge1xuXHRcdFx0cmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG5cdFx0XHRcdEVycm9yVmlldyxcblx0XHRcdFx0bnVsbCxcblx0XHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChcblx0XHRcdFx0XHQnc3BhbicsXG5cdFx0XHRcdFx0eyBjbGFzc05hbWU6ICdFcnJvclZpZXdfX2hlYWRpbmcnIH0sXG5cdFx0XHRcdFx0J1ZpZXdNYW5hZ2VyOiBcIicsXG5cdFx0XHRcdFx0dGhpcy5wcm9wcy5uYW1lLFxuXHRcdFx0XHRcdCdcIidcblx0XHRcdFx0KSxcblx0XHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChcblx0XHRcdFx0XHQnc3BhbicsXG5cdFx0XHRcdFx0eyBjbGFzc05hbWU6ICdFcnJvclZpZXdfX3RleHQnIH0sXG5cdFx0XHRcdFx0J1RoZSBWaWV3IFwiJyxcblx0XHRcdFx0XHR2aWV3S2V5LFxuXHRcdFx0XHRcdCdcIiBpcyBpbnZhbGlkLidcblx0XHRcdFx0KVxuXHRcdFx0KTtcblx0XHR9XG5cdFx0dmFyIG9wdGlvbnMgPSB0aGlzLnN0YXRlLm9wdGlvbnMgfHwge307XG5cdFx0dmFyIHZpZXdDbGFzc05hbWUgPSBjbGFzc05hbWVzKCdWaWV3IFZpZXctLScgKyB2aWV3S2V5LCB2aWV3LnByb3BzLmNsYXNzTmFtZSk7XG5cdFx0dmFyIFZpZXdDb21wb25lbnQgPSB2aWV3LnByb3BzLmNvbXBvbmVudDtcblx0XHR2YXIgdmlld1Byb3BzID0gYmxhY2tsaXN0KHZpZXcucHJvcHMsICdjb21wb25lbnQnLCAnY2xhc3NOYW1lJyk7XG5cdFx0X2V4dGVuZHModmlld1Byb3BzLCBvcHRpb25zLnZpZXdQcm9wcyk7XG5cdFx0dmFyIHZpZXdFbGVtZW50ID0gUmVhY3QuY3JlYXRlRWxlbWVudChWaWV3Q29tcG9uZW50LCB2aWV3UHJvcHMpO1xuXG5cdFx0aWYgKHRoaXMuX19sYXN0UmVuZGVyZWRWaWV3ICE9PSB2aWV3S2V5KSB7XG5cdFx0XHQvLyBjb25zb2xlLmxvZygnaW5pdGlhbGlzaW5nIHZpZXcgJyArIHZpZXdLZXkgKyAnIHdpdGggb3B0aW9ucycsIG9wdGlvbnMpO1xuXHRcdFx0aWYgKHZpZXdFbGVtZW50LnR5cGUubmF2aWdhdGlvbkJhciAmJiB2aWV3RWxlbWVudC50eXBlLmdldE5hdmlnYXRpb24pIHtcblx0XHRcdFx0dmFyIGFwcCA9IHRoaXMuY29udGV4dC5hcHA7XG5cdFx0XHRcdHZhciB0cmFuc2l0aW9uID0gb3B0aW9ucy50cmFuc2l0aW9uO1xuXHRcdFx0XHRpZiAoYXBwLnZpZXdNYW5hZ2VySW5UcmFuc2l0aW9uKSB7XG5cdFx0XHRcdFx0dHJhbnNpdGlvbiA9IGFwcC52aWV3TWFuYWdlckluVHJhbnNpdGlvbi5hY3RpdmVUcmFuc2l0aW9uT3B0aW9ucy50cmFuc2l0aW9uO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdGFwcC5uYXZpZ2F0aW9uQmFyc1t2aWV3RWxlbWVudC50eXBlLm5hdmlnYXRpb25CYXJdLnVwZGF0ZVdpdGhUcmFuc2l0aW9uKHZpZXdFbGVtZW50LnR5cGUuZ2V0TmF2aWdhdGlvbih2aWV3UHJvcHMsIGFwcCksIHRyYW5zaXRpb24pO1xuXHRcdFx0XHR9LCAwKTtcblx0XHRcdH1cblx0XHRcdHRoaXMuX19sYXN0UmVuZGVyZWRWaWV3ID0gdmlld0tleTtcblx0XHR9XG5cblx0XHRyZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChcblx0XHRcdFZpZXdDb250YWluZXIsXG5cdFx0XHR7IGNsYXNzTmFtZTogdmlld0NsYXNzTmFtZSwga2V5OiB2aWV3S2V5IH0sXG5cdFx0XHR2aWV3RWxlbWVudFxuXHRcdCk7XG5cdH0sXG5cdHJlbmRlcjogZnVuY3Rpb24gcmVuZGVyKCkge1xuXHRcdHZhciBjbGFzc05hbWUgPSBjbGFzc05hbWVzKCdWaWV3TWFuYWdlcicsIHRoaXMucHJvcHMuY2xhc3NOYW1lKTtcblx0XHR2YXIgdmlld0NvbnRhaW5lciA9IHRoaXMucmVuZGVyVmlld0NvbnRhaW5lcih0aGlzLnN0YXRlLmN1cnJlbnRWaWV3LCB7IHZpZXdQcm9wczogdGhpcy5zdGF0ZS5jdXJyZW50Vmlld1Byb3BzIH0pO1xuXG5cdFx0dmFyIHRyYW5zaXRpb25OYW1lID0gJ3ZpZXctdHJhbnNpdGlvbi1pbnN0YW50Jztcblx0XHRpZiAodGhpcy5zdGF0ZS5vcHRpb25zLnRyYW5zaXRpb24pIHtcblx0XHRcdC8vIGNvbnNvbGUubG9nKCdhcHBseWluZyB2aWV3IHRyYW5zaXRpb246ICcgKyB0aGlzLnN0YXRlLm9wdGlvbnMudHJhbnNpdGlvbiArICcgdG8gdmlldyAnICsgdGhpcy5zdGF0ZS5jdXJyZW50Vmlldyk7XG5cdFx0XHR0cmFuc2l0aW9uTmFtZSA9ICd2aWV3LXRyYW5zaXRpb24tJyArIHRoaXMuc3RhdGUub3B0aW9ucy50cmFuc2l0aW9uO1xuXHRcdH1cblx0XHRyZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChcblx0XHRcdFRyYW5zaXRpb24sXG5cdFx0XHR7IHRyYW5zaXRpb25OYW1lOiB0cmFuc2l0aW9uTmFtZSwgdHJhbnNpdGlvbkVudGVyOiB0cnVlLCB0cmFuc2l0aW9uTGVhdmU6IHRydWUsIGNsYXNzTmFtZTogY2xhc3NOYW1lLCBjb21wb25lbnQ6ICdkaXYnIH0sXG5cdFx0XHR2aWV3Q29udGFpbmVyXG5cdFx0KTtcblx0fVxufSk7XG5cbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IFZpZXdNYW5hZ2VyO1xubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgYW5pbWF0aW9uID0gcmVxdWlyZSgndHdlZW4uanMnKTtcbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbmZ1bmN0aW9uIHVwZGF0ZSgpIHtcblx0YW5pbWF0aW9uLnVwZGF0ZSgpO1xuXHRpZiAoYW5pbWF0aW9uLmdldEFsbCgpLmxlbmd0aCkge1xuXHRcdHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUodXBkYXRlKTtcblx0fVxufVxuXG5mdW5jdGlvbiBzY3JvbGxUb1RvcChlbCwgb3B0aW9ucykge1xuXHRvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblx0dmFyIGZyb20gPSBlbC5zY3JvbGxUb3A7XG5cdHZhciBkdXJhdGlvbiA9IE1hdGgubWluKE1hdGgubWF4KDIwMCwgZnJvbSAvIDIpLCAzNTApO1xuXHRpZiAoZnJvbSA+IDIwMCkgZHVyYXRpb24gPSAzMDA7XG5cdGVsLnN0eWxlLndlYmtpdE92ZXJmbG93U2Nyb2xsaW5nID0gJ2F1dG8nO1xuXHRlbC5zdHlsZS5vdmVyZmxvdyA9ICdoaWRkZW4nO1xuXHR2YXIgdHdlZW4gPSBuZXcgYW5pbWF0aW9uLlR3ZWVuKHsgcG9zOiBmcm9tIH0pLnRvKHsgcG9zOiAwIH0sIGR1cmF0aW9uKS5lYXNpbmcoYW5pbWF0aW9uLkVhc2luZy5RdWFkcmF0aWMuT3V0KS5vblVwZGF0ZShmdW5jdGlvbiAoKSB7XG5cdFx0ZWwuc2Nyb2xsVG9wID0gdGhpcy5wb3M7XG5cdFx0aWYgKG9wdGlvbnMub25VcGRhdGUpIHtcblx0XHRcdG9wdGlvbnMub25VcGRhdGUoKTtcblx0XHR9XG5cdH0pLm9uQ29tcGxldGUoZnVuY3Rpb24gKCkge1xuXHRcdGVsLnN0eWxlLndlYmtpdE92ZXJmbG93U2Nyb2xsaW5nID0gJ3RvdWNoJztcblx0XHRlbC5zdHlsZS5vdmVyZmxvdyA9ICdzY3JvbGwnO1xuXHRcdGlmIChvcHRpb25zLm9uQ29tcGxldGUpIG9wdGlvbnMub25Db21wbGV0ZSgpO1xuXHR9KS5zdGFydCgpO1xuXHR1cGRhdGUoKTtcblx0cmV0dXJuIHR3ZWVuO1xufVxuXG5leHBvcnRzLnNjcm9sbFRvVG9wID0gc2Nyb2xsVG9Ub3A7XG5cbnZhciBNaXhpbnMgPSBleHBvcnRzLk1peGlucyA9IHt9O1xuXG5NaXhpbnMuU2Nyb2xsQ29udGFpbmVyVG9Ub3AgPSB7XG5cdGNvbXBvbmVudERpZE1vdW50OiBmdW5jdGlvbiBjb21wb25lbnREaWRNb3VudCgpIHtcblx0XHR3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignc3RhdHVzVGFwJywgdGhpcy5zY3JvbGxDb250YWluZXJUb1RvcCk7XG5cdH0sXG5cdGNvbXBvbmVudFdpbGxVbm1vdW50OiBmdW5jdGlvbiBjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcblx0XHR3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcignc3RhdHVzVGFwJywgdGhpcy5zY3JvbGxDb250YWluZXJUb1RvcCk7XG5cdFx0aWYgKHRoaXMuX3Njcm9sbENvbnRhaW5lckFuaW1hdGlvbikge1xuXHRcdFx0dGhpcy5fc2Nyb2xsQ29udGFpbmVyQW5pbWF0aW9uLnN0b3AoKTtcblx0XHR9XG5cdH0sXG5cdHNjcm9sbENvbnRhaW5lclRvVG9wOiBmdW5jdGlvbiBzY3JvbGxDb250YWluZXJUb1RvcCgpIHtcblx0XHR2YXIgX3RoaXMgPSB0aGlzO1xuXG5cdFx0aWYgKCF0aGlzLmlzTW91bnRlZCgpIHx8ICF0aGlzLnJlZnMuc2Nyb2xsQ29udGFpbmVyKSByZXR1cm47XG5cdFx0dGhpcy5fc2Nyb2xsQ29udGFpbmVyQW5pbWF0aW9uID0gc2Nyb2xsVG9Ub3AoUmVhY3QuZmluZERPTU5vZGUodGhpcy5yZWZzLnNjcm9sbENvbnRhaW5lciksIHtcblx0XHRcdG9uQ29tcGxldGU6IGZ1bmN0aW9uIG9uQ29tcGxldGUoKSB7XG5cdFx0XHRcdGRlbGV0ZSBfdGhpcy5fc2Nyb2xsQ29udGFpbmVyQW5pbWF0aW9uO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG59OyIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywge1xuXHR2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLmNyZWF0ZUFwcCA9IGNyZWF0ZUFwcDtcbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbnZhciBhbmltYXRpb24gPSByZXF1aXJlKCcuL2NvcmUvYW5pbWF0aW9uJyk7XG5leHBvcnRzLmFuaW1hdGlvbiA9IGFuaW1hdGlvbjtcbnZhciBMaW5rID0gcmVxdWlyZSgnLi9jb3JlL0xpbmsnKTtcbmV4cG9ydHMuTGluayA9IExpbms7XG52YXIgVmlldyA9IHJlcXVpcmUoJy4vY29yZS9WaWV3Jyk7XG5leHBvcnRzLlZpZXcgPSBWaWV3O1xudmFyIFZpZXdNYW5hZ2VyID0gcmVxdWlyZSgnLi9jb3JlL1ZpZXdNYW5hZ2VyJyk7XG5cbmV4cG9ydHMuVmlld01hbmFnZXIgPSBWaWV3TWFuYWdlcjtcbnZhciBDb250YWluZXIgPSByZXF1aXJlKCdyZWFjdC1jb250YWluZXInKTtcbmV4cG9ydHMuQ29udGFpbmVyID0gQ29udGFpbmVyO1xudmFyIE1peGlucyA9IHJlcXVpcmUoJy4vbWl4aW5zJyk7XG5leHBvcnRzLk1peGlucyA9IE1peGlucztcbnZhciBVSSA9IHJlcXVpcmUoJy4vdWknKTtcblxuZXhwb3J0cy5VSSA9IFVJO1xuXG5mdW5jdGlvbiBjcmVhdGVBcHAoKSB7XG5cdHZhciBhcHAgPSB7XG5cdFx0bmF2aWdhdGlvbkJhcnM6IHt9LFxuXHRcdHZpZXdNYW5hZ2Vyczoge30sXG5cdFx0dmlld3M6IHt9LFxuXHRcdHRyYW5zaXRpb25UbzogZnVuY3Rpb24gdHJhbnNpdGlvblRvKHZpZXcsIG9wdHMpIHtcblx0XHRcdHZhciB2bSA9ICdfX2RlZmF1bHQnO1xuXHRcdFx0dmlldyA9IHZpZXcuc3BsaXQoJzonKTtcblx0XHRcdGlmICh2aWV3Lmxlbmd0aCA+IDEpIHtcblx0XHRcdFx0dm0gPSB2aWV3LnNoaWZ0KCk7XG5cdFx0XHR9XG5cdFx0XHR2aWV3ID0gdmlld1swXTtcblx0XHRcdGFwcC52aWV3TWFuYWdlcnNbdm1dLnRyYW5zaXRpb25Ubyh2aWV3LCBvcHRzKTtcblx0XHR9XG5cdH07XG5cdHJldHVybiB7XG5cdFx0Y2hpbGRDb250ZXh0VHlwZXM6IHtcblx0XHRcdGFwcDogUmVhY3QuUHJvcFR5cGVzLm9iamVjdFxuXHRcdH0sXG5cdFx0Z2V0Q2hpbGRDb250ZXh0OiBmdW5jdGlvbiBnZXRDaGlsZENvbnRleHQoKSB7XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRhcHA6IGFwcFxuXHRcdFx0fTtcblx0XHR9XG5cdH07XG59IiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7XG5cdHZhbHVlOiB0cnVlXG59KTtcbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbnZhciBUcmFuc2l0aW9ucyA9IHtcblx0Y29udGV4dFR5cGVzOiB7XG5cdFx0YXBwOiBSZWFjdC5Qcm9wVHlwZXMub2JqZWN0XG5cdH0sXG5cdHRyYW5zaXRpb25UbzogZnVuY3Rpb24gdHJhbnNpdGlvblRvKHZpZXcsIG9wdHMpIHtcblx0XHR0aGlzLmNvbnRleHQuYXBwLnRyYW5zaXRpb25Ubyh2aWV3LCBvcHRzKTtcblx0fVxufTtcblxuZXhwb3J0c1snZGVmYXVsdCddID0gVHJhbnNpdGlvbnM7XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTsiLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xudmFyIFRyYW5zaXRpb25zID0gcmVxdWlyZSgnLi9UcmFuc2l0aW9ucycpO1xuZXhwb3J0cy5UcmFuc2l0aW9ucyA9IFRyYW5zaXRpb25zOyIsIid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QvYWRkb25zJyk7XG52YXIgY2xhc3NuYW1lcyA9IHJlcXVpcmUoJ2NsYXNzbmFtZXMnKTtcbnZhciBUcmFuc2l0aW9uID0gUmVhY3QuYWRkb25zLkNTU1RyYW5zaXRpb25Hcm91cDtcblxubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cdGRpc3BsYXlOYW1lOiAnQWxlcnRiYXInLFxuXHRwcm9wVHlwZXM6IHtcblx0XHRjaGlsZHJlbjogUmVhY3QuUHJvcFR5cGVzLm5vZGUuaXNSZXF1aXJlZCxcblx0XHRjbGFzc05hbWU6IFJlYWN0LlByb3BUeXBlcy5zdHJpbmcsXG5cdFx0cHVsc2U6IFJlYWN0LlByb3BUeXBlcy5ib29sLFxuXHRcdHR5cGU6IFJlYWN0LlByb3BUeXBlcy5vbmVPZihbJ2RlZmF1bHQnLCAncHJpbWFyeScsICdzdWNjZXNzJywgJ3dhcm5pbmcnLCAnZGFuZ2VyJ10pLFxuXHRcdHZpc2libGU6IFJlYWN0LlByb3BUeXBlcy5ib29sXG5cdH0sXG5cblx0Z2V0RGVmYXVsdFByb3BzOiBmdW5jdGlvbiBnZXREZWZhdWx0UHJvcHMoKSB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdHR5cGU6ICdkZWZhdWx0J1xuXHRcdH07XG5cdH0sXG5cblx0cmVuZGVyOiBmdW5jdGlvbiByZW5kZXIoKSB7XG5cdFx0dmFyIGNsYXNzTmFtZSA9IGNsYXNzbmFtZXMoJ0FsZXJ0YmFyJywgJ0FsZXJ0YmFyLS0nICsgdGhpcy5wcm9wcy50eXBlLCB7XG5cdFx0XHQnQWxlcnRiYXItLXB1bHNlJzogdGhpcy5wcm9wcy5wdWxzZVxuXHRcdH0sIHRoaXMucHJvcHMuY2xhc3NOYW1lKTtcblxuXHRcdHZhciBpbm5lciA9IHRoaXMucHJvcHMucHVsc2UgPyBSZWFjdC5jcmVhdGVFbGVtZW50KFxuXHRcdFx0J2RpdicsXG5cdFx0XHR7IGNsYXNzTmFtZTogJ0FsZXJ0YmFyX19pbm5lcicgfSxcblx0XHRcdHRoaXMucHJvcHMuY2hpbGRyZW5cblx0XHQpIDogdGhpcy5wcm9wcy5jaGlsZHJlbjtcblx0XHR2YXIgY29udGVudCA9IHRoaXMucHJvcHMudmlzaWJsZSA/IFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG5cdFx0XHQnZGl2Jyxcblx0XHRcdHsgY2xhc3NOYW1lOiBjbGFzc05hbWUgfSxcblx0XHRcdGlubmVyXG5cdFx0KSA6IG51bGw7XG5cblx0XHRyZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChcblx0XHRcdFRyYW5zaXRpb24sXG5cdFx0XHR7IHRyYW5zaXRpb25OYW1lOiAnQWxlcnRiYXInLCBjbGFzc05hbWU6ICdBbGVydGJhcl9fdGVzdHl0aGluZycsIGNvbXBvbmVudDogJ2RpdicgfSxcblx0XHRcdGNvbnRlbnRcblx0XHQpO1xuXHR9XG59KTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBfZXh0ZW5kcyA9IE9iamVjdC5hc3NpZ24gfHwgZnVuY3Rpb24gKHRhcmdldCkgeyBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykgeyB2YXIgc291cmNlID0gYXJndW1lbnRzW2ldOyBmb3IgKHZhciBrZXkgaW4gc291cmNlKSB7IGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoc291cmNlLCBrZXkpKSB7IHRhcmdldFtrZXldID0gc291cmNlW2tleV07IH0gfSB9IHJldHVybiB0YXJnZXQ7IH07XG5cbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0L2FkZG9ucycpO1xudmFyIFRhcHBhYmxlID0gcmVxdWlyZSgncmVhY3QtdGFwcGFibGUnKTtcblxudmFyIGJsYWNrbGlzdCA9IHJlcXVpcmUoJ2JsYWNrbGlzdCcpO1xudmFyIGNsYXNzbmFtZXMgPSByZXF1aXJlKCdjbGFzc25hbWVzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXHRkaXNwbGF5TmFtZTogJ0J1dHRvbicsXG5cdHByb3BUeXBlczoge1xuXHRcdGNoaWxkcmVuOiBSZWFjdC5Qcm9wVHlwZXMubm9kZS5pc1JlcXVpcmVkLFxuXHRcdGNsYXNzTmFtZTogUmVhY3QuUHJvcFR5cGVzLnN0cmluZyxcblx0XHR0eXBlOiBSZWFjdC5Qcm9wVHlwZXMub25lT2YoWydkZWZhdWx0JywgJ2luZm8nLCAncHJpbWFyeScsICdzdWNjZXNzJywgJ3dhcm5pbmcnLCAnZGFuZ2VyJ10pXG5cdH0sXG5cblx0Z2V0RGVmYXVsdFByb3BzOiBmdW5jdGlvbiBnZXREZWZhdWx0UHJvcHMoKSB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdHR5cGU6ICdkZWZhdWx0J1xuXHRcdH07XG5cdH0sXG5cblx0cmVuZGVyOiBmdW5jdGlvbiByZW5kZXIoKSB7XG5cdFx0dmFyIGNsYXNzTmFtZSA9IGNsYXNzbmFtZXMoJ0J1dHRvbicsICdCdXR0b24tLScgKyB0aGlzLnByb3BzLnR5cGUsIHRoaXMucHJvcHMuY2xhc3NOYW1lKTtcblx0XHR2YXIgcHJvcHMgPSBibGFja2xpc3QodGhpcy5wcm9wcywgJ3R5cGUnKTtcblxuXHRcdHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KFRhcHBhYmxlLCBfZXh0ZW5kcyh7fSwgcHJvcHMsIHsgY2xhc3NOYW1lOiBjbGFzc05hbWUsIGNvbXBvbmVudDogJ2J1dHRvbicgfSkpO1xuXHR9XG59KTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBfZXh0ZW5kcyA9IE9iamVjdC5hc3NpZ24gfHwgZnVuY3Rpb24gKHRhcmdldCkgeyBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykgeyB2YXIgc291cmNlID0gYXJndW1lbnRzW2ldOyBmb3IgKHZhciBrZXkgaW4gc291cmNlKSB7IGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoc291cmNlLCBrZXkpKSB7IHRhcmdldFtrZXldID0gc291cmNlW2tleV07IH0gfSB9IHJldHVybiB0YXJnZXQ7IH07XG5cbnZhciBibGFja2xpc3QgPSByZXF1aXJlKCdibGFja2xpc3QnKTtcbnZhciBjbGFzc25hbWVzID0gcmVxdWlyZSgnY2xhc3NuYW1lcycpO1xudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QvYWRkb25zJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXHRkaXNwbGF5TmFtZTogJ0J1dHRvbkdyb3VwJyxcblx0cHJvcFR5cGVzOiB7XG5cdFx0Y2hpbGRyZW46IFJlYWN0LlByb3BUeXBlcy5ub2RlLmlzUmVxdWlyZWQsXG5cdFx0Y2xhc3NOYW1lOiBSZWFjdC5Qcm9wVHlwZXMuc3RyaW5nXG5cdH0sXG5cdHJlbmRlcjogZnVuY3Rpb24gcmVuZGVyKCkge1xuXHRcdHZhciBjbGFzc05hbWUgPSBjbGFzc25hbWVzKCdCdXR0b25Hcm91cCcsIHRoaXMucHJvcHMuY2xhc3NOYW1lKTtcblx0XHR2YXIgcHJvcHMgPSBibGFja2xpc3QodGhpcy5wcm9wcywgJ2NsYXNzTmFtZScpO1xuXG5cdFx0cmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoJ2RpdicsIF9leHRlbmRzKHsgY2xhc3NOYW1lOiBjbGFzc05hbWUgfSwgcHJvcHMpKTtcblx0fVxufSk7IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgX2V4dGVuZHMgPSBPYmplY3QuYXNzaWduIHx8IGZ1bmN0aW9uICh0YXJnZXQpIHsgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHsgdmFyIHNvdXJjZSA9IGFyZ3VtZW50c1tpXTsgZm9yICh2YXIga2V5IGluIHNvdXJjZSkgeyBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHNvdXJjZSwga2V5KSkgeyB0YXJnZXRba2V5XSA9IHNvdXJjZVtrZXldOyB9IH0gfSByZXR1cm4gdGFyZ2V0OyB9O1xuXG52YXIgYmxhY2tsaXN0ID0gcmVxdWlyZSgnYmxhY2tsaXN0Jyk7XG52YXIgY2xhc3NuYW1lcyA9IHJlcXVpcmUoJ2NsYXNzbmFtZXMnKTtcbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0L2FkZG9ucycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblx0ZGlzcGxheU5hbWU6ICdGaWVsZENvbnRyb2wnLFxuXHRwcm9wVHlwZXM6IHtcblx0XHRjaGlsZHJlbjogUmVhY3QuUHJvcFR5cGVzLm5vZGUuaXNSZXF1aXJlZCxcblx0XHRjbGFzc05hbWU6IFJlYWN0LlByb3BUeXBlcy5zdHJpbmdcblx0fSxcblx0cmVuZGVyOiBmdW5jdGlvbiByZW5kZXIoKSB7XG5cdFx0dmFyIGNsYXNzTmFtZSA9IGNsYXNzbmFtZXMoJ0ZpZWxkQ29udHJvbCcsIHRoaXMucHJvcHMuY2xhc3NOYW1lKTtcblx0XHR2YXIgcHJvcHMgPSBibGFja2xpc3QodGhpcy5wcm9wcywgJ2NsYXNzTmFtZScpO1xuXG5cdFx0cmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoJ2RpdicsIF9leHRlbmRzKHsgY2xhc3NOYW1lOiBjbGFzc05hbWUgfSwgcHJvcHMpKTtcblx0fVxufSk7IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgX2V4dGVuZHMgPSBPYmplY3QuYXNzaWduIHx8IGZ1bmN0aW9uICh0YXJnZXQpIHsgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHsgdmFyIHNvdXJjZSA9IGFyZ3VtZW50c1tpXTsgZm9yICh2YXIga2V5IGluIHNvdXJjZSkgeyBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHNvdXJjZSwga2V5KSkgeyB0YXJnZXRba2V5XSA9IHNvdXJjZVtrZXldOyB9IH0gfSByZXR1cm4gdGFyZ2V0OyB9O1xuXG52YXIgYmxhY2tsaXN0ID0gcmVxdWlyZSgnYmxhY2tsaXN0Jyk7XG52YXIgY2xhc3NuYW1lcyA9IHJlcXVpcmUoJ2NsYXNzbmFtZXMnKTtcbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0L2FkZG9ucycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblx0ZGlzcGxheU5hbWU6ICdGaWVsZExhYmVsJyxcblx0cHJvcFR5cGVzOiB7XG5cdFx0Y2hpbGRyZW46IFJlYWN0LlByb3BUeXBlcy5ub2RlLmlzUmVxdWlyZWQsXG5cdFx0Y2xhc3NOYW1lOiBSZWFjdC5Qcm9wVHlwZXMuc3RyaW5nXG5cdH0sXG5cdHJlbmRlcjogZnVuY3Rpb24gcmVuZGVyKCkge1xuXHRcdHZhciBjbGFzc05hbWUgPSBjbGFzc25hbWVzKCdGaWVsZExhYmVsJywgdGhpcy5wcm9wcy5jbGFzc05hbWUpO1xuXHRcdHZhciBwcm9wcyA9IGJsYWNrbGlzdCh0aGlzLnByb3BzLCAnY2xhc3NOYW1lJyk7XG5cblx0XHRyZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudCgnZGl2JywgX2V4dGVuZHMoeyBjbGFzc05hbWU6IGNsYXNzTmFtZSB9LCBwcm9wcykpO1xuXHR9XG59KTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBfZXh0ZW5kcyA9IE9iamVjdC5hc3NpZ24gfHwgZnVuY3Rpb24gKHRhcmdldCkgeyBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykgeyB2YXIgc291cmNlID0gYXJndW1lbnRzW2ldOyBmb3IgKHZhciBrZXkgaW4gc291cmNlKSB7IGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoc291cmNlLCBrZXkpKSB7IHRhcmdldFtrZXldID0gc291cmNlW2tleV07IH0gfSB9IHJldHVybiB0YXJnZXQ7IH07XG5cbnZhciBibGFja2xpc3QgPSByZXF1aXJlKCdibGFja2xpc3QnKTtcbnZhciBjbGFzc25hbWVzID0gcmVxdWlyZSgnY2xhc3NuYW1lcycpO1xudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QvYWRkb25zJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXHRkaXNwbGF5TmFtZTogJ0dyb3VwJyxcblx0cHJvcFR5cGVzOiB7XG5cdFx0Y2hpbGRyZW46IFJlYWN0LlByb3BUeXBlcy5ub2RlLmlzUmVxdWlyZWQsXG5cdFx0Y2xhc3NOYW1lOiBSZWFjdC5Qcm9wVHlwZXMuc3RyaW5nXG5cdH0sXG5cdHJlbmRlcjogZnVuY3Rpb24gcmVuZGVyKCkge1xuXHRcdHZhciBjbGFzc05hbWUgPSBjbGFzc25hbWVzKCdHcm91cCcsIHRoaXMucHJvcHMuY2xhc3NOYW1lKTtcblx0XHR2YXIgcHJvcHMgPSBibGFja2xpc3QodGhpcy5wcm9wcywgJ2NsYXNzTmFtZScpO1xuXG5cdFx0cmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoJ2RpdicsIF9leHRlbmRzKHsgY2xhc3NOYW1lOiBjbGFzc05hbWUgfSwgcHJvcHMpKTtcblx0fVxufSk7IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgX2V4dGVuZHMgPSBPYmplY3QuYXNzaWduIHx8IGZ1bmN0aW9uICh0YXJnZXQpIHsgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHsgdmFyIHNvdXJjZSA9IGFyZ3VtZW50c1tpXTsgZm9yICh2YXIga2V5IGluIHNvdXJjZSkgeyBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHNvdXJjZSwga2V5KSkgeyB0YXJnZXRba2V5XSA9IHNvdXJjZVtrZXldOyB9IH0gfSByZXR1cm4gdGFyZ2V0OyB9O1xuXG52YXIgYmxhY2tsaXN0ID0gcmVxdWlyZSgnYmxhY2tsaXN0Jyk7XG52YXIgY2xhc3NuYW1lcyA9IHJlcXVpcmUoJ2NsYXNzbmFtZXMnKTtcbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0L2FkZG9ucycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblx0ZGlzcGxheU5hbWU6ICdHcm91cEJvZHknLFxuXHRwcm9wVHlwZXM6IHtcblx0XHRjaGlsZHJlbjogUmVhY3QuUHJvcFR5cGVzLm5vZGUuaXNSZXF1aXJlZCxcblx0XHRjbGFzc05hbWU6IFJlYWN0LlByb3BUeXBlcy5zdHJpbmdcblx0fSxcblx0cmVuZGVyOiBmdW5jdGlvbiByZW5kZXIoKSB7XG5cdFx0dmFyIGNsYXNzTmFtZSA9IGNsYXNzbmFtZXMoJ0dyb3VwQm9keScsIHRoaXMucHJvcHMuY2xhc3NOYW1lKTtcblx0XHR2YXIgcHJvcHMgPSBibGFja2xpc3QodGhpcy5wcm9wcywgJ2NsYXNzTmFtZScpO1xuXG5cdFx0cmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoJ2RpdicsIF9leHRlbmRzKHsgY2xhc3NOYW1lOiBjbGFzc05hbWUgfSwgcHJvcHMpKTtcblx0fVxufSk7IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgX2V4dGVuZHMgPSBPYmplY3QuYXNzaWduIHx8IGZ1bmN0aW9uICh0YXJnZXQpIHsgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHsgdmFyIHNvdXJjZSA9IGFyZ3VtZW50c1tpXTsgZm9yICh2YXIga2V5IGluIHNvdXJjZSkgeyBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHNvdXJjZSwga2V5KSkgeyB0YXJnZXRba2V5XSA9IHNvdXJjZVtrZXldOyB9IH0gfSByZXR1cm4gdGFyZ2V0OyB9O1xuXG52YXIgYmxhY2tsaXN0ID0gcmVxdWlyZSgnYmxhY2tsaXN0Jyk7XG52YXIgY2xhc3NuYW1lcyA9IHJlcXVpcmUoJ2NsYXNzbmFtZXMnKTtcbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0L2FkZG9ucycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblx0ZGlzcGxheU5hbWU6ICdHcm91cEZvb3RlcicsXG5cdHByb3BUeXBlczoge1xuXHRcdGNoaWxkcmVuOiBSZWFjdC5Qcm9wVHlwZXMubm9kZS5pc1JlcXVpcmVkLFxuXHRcdGNsYXNzTmFtZTogUmVhY3QuUHJvcFR5cGVzLnN0cmluZ1xuXHR9LFxuXHRyZW5kZXI6IGZ1bmN0aW9uIHJlbmRlcigpIHtcblx0XHR2YXIgY2xhc3NOYW1lID0gY2xhc3NuYW1lcygnR3JvdXBGb290ZXInLCB0aGlzLnByb3BzLmNsYXNzTmFtZSk7XG5cdFx0dmFyIHByb3BzID0gYmxhY2tsaXN0KHRoaXMucHJvcHMsICdjbGFzc05hbWUnKTtcblxuXHRcdHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KCdkaXYnLCBfZXh0ZW5kcyh7IGNsYXNzTmFtZTogY2xhc3NOYW1lIH0sIHByb3BzKSk7XG5cdH1cbn0pOyIsIid1c2Ugc3RyaWN0JztcblxudmFyIF9leHRlbmRzID0gT2JqZWN0LmFzc2lnbiB8fCBmdW5jdGlvbiAodGFyZ2V0KSB7IGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7IHZhciBzb3VyY2UgPSBhcmd1bWVudHNbaV07IGZvciAodmFyIGtleSBpbiBzb3VyY2UpIHsgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzb3VyY2UsIGtleSkpIHsgdGFyZ2V0W2tleV0gPSBzb3VyY2Vba2V5XTsgfSB9IH0gcmV0dXJuIHRhcmdldDsgfTtcblxudmFyIGJsYWNrbGlzdCA9IHJlcXVpcmUoJ2JsYWNrbGlzdCcpO1xudmFyIGNsYXNzbmFtZXMgPSByZXF1aXJlKCdjbGFzc25hbWVzJyk7XG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdC9hZGRvbnMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cdGRpc3BsYXlOYW1lOiAnR3JvdXBIZWFkZXInLFxuXHRwcm9wVHlwZXM6IHtcblx0XHRjaGlsZHJlbjogUmVhY3QuUHJvcFR5cGVzLm5vZGUuaXNSZXF1aXJlZCxcblx0XHRjbGFzc05hbWU6IFJlYWN0LlByb3BUeXBlcy5zdHJpbmdcblx0fSxcblx0cmVuZGVyOiBmdW5jdGlvbiByZW5kZXIoKSB7XG5cdFx0dmFyIGNsYXNzTmFtZSA9IGNsYXNzbmFtZXMoJ0dyb3VwSGVhZGVyJywgdGhpcy5wcm9wcy5jbGFzc05hbWUpO1xuXHRcdHZhciBwcm9wcyA9IGJsYWNrbGlzdCh0aGlzLnByb3BzLCAnY2xhc3NOYW1lJyk7XG5cblx0XHRyZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudCgnZGl2JywgX2V4dGVuZHMoeyBjbGFzc05hbWU6IGNsYXNzTmFtZSB9LCBwcm9wcykpO1xuXHR9XG59KTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBfZXh0ZW5kcyA9IE9iamVjdC5hc3NpZ24gfHwgZnVuY3Rpb24gKHRhcmdldCkgeyBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykgeyB2YXIgc291cmNlID0gYXJndW1lbnRzW2ldOyBmb3IgKHZhciBrZXkgaW4gc291cmNlKSB7IGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoc291cmNlLCBrZXkpKSB7IHRhcmdldFtrZXldID0gc291cmNlW2tleV07IH0gfSB9IHJldHVybiB0YXJnZXQ7IH07XG5cbnZhciBJdGVtID0gcmVxdWlyZSgnLi9JdGVtJyk7XG52YXIgSXRlbUNvbnRlbnQgPSByZXF1aXJlKCcuL0l0ZW1Db250ZW50Jyk7XG52YXIgSXRlbUlubmVyID0gcmVxdWlyZSgnLi9JdGVtSW5uZXInKTtcbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0L2FkZG9ucycpO1xuXG52YXIgYmxhY2tsaXN0ID0gcmVxdWlyZSgnYmxhY2tsaXN0Jyk7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXHRkaXNwbGF5TmFtZTogJ0lucHV0JyxcblxuXHRwcm9wVHlwZXM6IHtcblx0XHRjbGFzc05hbWU6IFJlYWN0LlByb3BUeXBlcy5zdHJpbmcsXG5cdFx0Y2hpbGRyZW46IFJlYWN0LlByb3BUeXBlcy5ub2RlLFxuXHRcdGRpc2FibGVkOiBSZWFjdC5Qcm9wVHlwZXMuYm9vbFxuXHR9LFxuXG5cdHJlbmRlcjogZnVuY3Rpb24gcmVuZGVyKCkge1xuXHRcdHZhciBpbnB1dFByb3BzID0gYmxhY2tsaXN0KHRoaXMucHJvcHMsICdjaGlsZHJlbicsICdjbGFzc05hbWUnKTtcblxuXHRcdHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KFxuXHRcdFx0SXRlbSxcblx0XHRcdHsgY2xhc3NOYW1lOiB0aGlzLnByb3BzLmNsYXNzTmFtZSwgc2VsZWN0YWJsZTogdGhpcy5wcm9wcy5kaXNhYmxlZCwgY29tcG9uZW50OiAnbGFiZWwnIH0sXG5cdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFxuXHRcdFx0XHRJdGVtSW5uZXIsXG5cdFx0XHRcdG51bGwsXG5cdFx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG5cdFx0XHRcdFx0SXRlbUNvbnRlbnQsXG5cdFx0XHRcdFx0eyBjb21wb25lbnQ6ICdsYWJlbCcgfSxcblx0XHRcdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KCdpbnB1dCcsIF9leHRlbmRzKHsgY2xhc3NOYW1lOiAnZmllbGQnLCB0eXBlOiAndGV4dCcgfSwgaW5wdXRQcm9wcykpXG5cdFx0XHRcdCksXG5cdFx0XHRcdHRoaXMucHJvcHMuY2hpbGRyZW5cblx0XHRcdClcblx0XHQpO1xuXHR9XG59KTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBfZXh0ZW5kcyA9IE9iamVjdC5hc3NpZ24gfHwgZnVuY3Rpb24gKHRhcmdldCkgeyBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykgeyB2YXIgc291cmNlID0gYXJndW1lbnRzW2ldOyBmb3IgKHZhciBrZXkgaW4gc291cmNlKSB7IGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoc291cmNlLCBrZXkpKSB7IHRhcmdldFtrZXldID0gc291cmNlW2tleV07IH0gfSB9IHJldHVybiB0YXJnZXQ7IH07XG5cbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0L2FkZG9ucycpO1xudmFyIGNsYXNzbmFtZXMgPSByZXF1aXJlKCdjbGFzc25hbWVzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXHRkaXNwbGF5TmFtZTogJ0l0ZW0nLFxuXG5cdHByb3BUeXBlczoge1xuXHRcdGNoaWxkcmVuOiBSZWFjdC5Qcm9wVHlwZXMubm9kZS5pc1JlcXVpcmVkLFxuXHRcdGNsYXNzTmFtZTogUmVhY3QuUHJvcFR5cGVzLnN0cmluZyxcblx0XHRzaG93RGlzY2xvc3VyZUFycm93OiBSZWFjdC5Qcm9wVHlwZXMuYm9vbFxuXHR9LFxuXG5cdHJlbmRlcjogZnVuY3Rpb24gcmVuZGVyKCkge1xuXHRcdHZhciBjbGFzc05hbWUgPSBjbGFzc25hbWVzKCdJdGVtJywge1xuXHRcdFx0J0l0ZW0tLWhhcy1kaXNjbG9zdXJlLWFycm93JzogdGhpcy5wcm9wcy5zaG93RGlzY2xvc3VyZUFycm93XG5cdFx0fSwgdGhpcy5wcm9wcy5jbGFzc05hbWUpO1xuXG5cdFx0cmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoJ2RpdicsIF9leHRlbmRzKHt9LCB0aGlzLnByb3BzLCB7IGNsYXNzTmFtZTogY2xhc3NOYW1lIH0pKTtcblx0fVxufSk7IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgX2V4dGVuZHMgPSBPYmplY3QuYXNzaWduIHx8IGZ1bmN0aW9uICh0YXJnZXQpIHsgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHsgdmFyIHNvdXJjZSA9IGFyZ3VtZW50c1tpXTsgZm9yICh2YXIga2V5IGluIHNvdXJjZSkgeyBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHNvdXJjZSwga2V5KSkgeyB0YXJnZXRba2V5XSA9IHNvdXJjZVtrZXldOyB9IH0gfSByZXR1cm4gdGFyZ2V0OyB9O1xuXG52YXIgYmxhY2tsaXN0ID0gcmVxdWlyZSgnYmxhY2tsaXN0Jyk7XG52YXIgY2xhc3NuYW1lcyA9IHJlcXVpcmUoJ2NsYXNzbmFtZXMnKTtcbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0L2FkZG9ucycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblx0ZGlzcGxheU5hbWU6ICdJdGVtQ29udGVudCcsXG5cdHByb3BUeXBlczoge1xuXHRcdGNoaWxkcmVuOiBSZWFjdC5Qcm9wVHlwZXMubm9kZS5pc1JlcXVpcmVkLFxuXHRcdGNsYXNzTmFtZTogUmVhY3QuUHJvcFR5cGVzLnN0cmluZ1xuXHR9LFxuXHRyZW5kZXI6IGZ1bmN0aW9uIHJlbmRlcigpIHtcblx0XHR2YXIgY2xhc3NOYW1lID0gY2xhc3NuYW1lcygnSXRlbV9fY29udGVudCcsIHRoaXMucHJvcHMuY2xhc3NOYW1lKTtcblx0XHR2YXIgcHJvcHMgPSBibGFja2xpc3QodGhpcy5wcm9wcywgJ2NsYXNzTmFtZScpO1xuXG5cdFx0cmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoJ2RpdicsIF9leHRlbmRzKHsgY2xhc3NOYW1lOiBjbGFzc05hbWUgfSwgcHJvcHMpKTtcblx0fVxufSk7IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgX2V4dGVuZHMgPSBPYmplY3QuYXNzaWduIHx8IGZ1bmN0aW9uICh0YXJnZXQpIHsgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHsgdmFyIHNvdXJjZSA9IGFyZ3VtZW50c1tpXTsgZm9yICh2YXIga2V5IGluIHNvdXJjZSkgeyBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHNvdXJjZSwga2V5KSkgeyB0YXJnZXRba2V5XSA9IHNvdXJjZVtrZXldOyB9IH0gfSByZXR1cm4gdGFyZ2V0OyB9O1xuXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdC9hZGRvbnMnKTtcblxudmFyIGNsYXNzbmFtZXMgPSByZXF1aXJlKCdjbGFzc25hbWVzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXHRkaXNwbGF5TmFtZTogJ0l0ZW1Jbm5lcicsXG5cblx0cHJvcFR5cGVzOiB7XG5cdFx0Y2hpbGRyZW46IFJlYWN0LlByb3BUeXBlcy5ub2RlLmlzUmVxdWlyZWQsXG5cdFx0Y2xhc3NOYW1lOiBSZWFjdC5Qcm9wVHlwZXMuc3RyaW5nXG5cdH0sXG5cblx0cmVuZGVyOiBmdW5jdGlvbiByZW5kZXIoKSB7XG5cdFx0dmFyIGNsYXNzTmFtZSA9IGNsYXNzbmFtZXMoJ0l0ZW1fX2lubmVyJywgdGhpcy5wcm9wcy5jbGFzc05hbWUpO1xuXG5cdFx0cmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoJ2RpdicsIF9leHRlbmRzKHsgY2xhc3NOYW1lOiBjbGFzc05hbWUgfSwgdGhpcy5wcm9wcykpO1xuXHR9XG59KTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0L2FkZG9ucycpO1xudmFyIGNsYXNzbmFtZXMgPSByZXF1aXJlKCdjbGFzc25hbWVzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXHRkaXNwbGF5TmFtZTogJ0l0ZW1NZWRpYScsXG5cdHByb3BUeXBlczoge1xuXHRcdGF2YXRhcjogUmVhY3QuUHJvcFR5cGVzLnN0cmluZyxcblx0XHRhdmF0YXJJbml0aWFsczogUmVhY3QuUHJvcFR5cGVzLnN0cmluZyxcblx0XHRjbGFzc05hbWU6IFJlYWN0LlByb3BUeXBlcy5zdHJpbmcsXG5cdFx0aWNvbjogUmVhY3QuUHJvcFR5cGVzLnN0cmluZyxcblx0XHR0aHVtYm5haWw6IFJlYWN0LlByb3BUeXBlcy5zdHJpbmdcblx0fSxcblxuXHRyZW5kZXI6IGZ1bmN0aW9uIHJlbmRlcigpIHtcblx0XHR2YXIgY2xhc3NOYW1lID0gY2xhc3NuYW1lcyh7XG5cdFx0XHQnSXRlbV9fbWVkaWEnOiB0cnVlLFxuXHRcdFx0J0l0ZW1fX21lZGlhLS1pY29uJzogdGhpcy5wcm9wcy5pY29uLFxuXHRcdFx0J0l0ZW1fX21lZGlhLS1hdmF0YXInOiB0aGlzLnByb3BzLmF2YXRhciB8fCB0aGlzLnByb3BzLmF2YXRhckluaXRpYWxzLFxuXHRcdFx0J0l0ZW1fX21lZGlhLS10aHVtYm5haWwnOiB0aGlzLnByb3BzLnRodW1ibmFpbFxuXHRcdH0sIHRoaXMucHJvcHMuY2xhc3NOYW1lKTtcblxuXHRcdC8vIG1lZGlhIHR5cGVzXG5cdFx0dmFyIGljb24gPSB0aGlzLnByb3BzLmljb24gPyBSZWFjdC5jcmVhdGVFbGVtZW50KCdkaXYnLCB7IGNsYXNzTmFtZTogJ0l0ZW1fX21lZGlhX19pY29uICcgKyB0aGlzLnByb3BzLmljb24gfSkgOiBudWxsO1xuXHRcdHZhciBhdmF0YXIgPSB0aGlzLnByb3BzLmF2YXRhciB8fCB0aGlzLnByb3BzLmF2YXRhckluaXRpYWxzID8gUmVhY3QuY3JlYXRlRWxlbWVudChcblx0XHRcdCdkaXYnLFxuXHRcdFx0eyBjbGFzc05hbWU6ICdJdGVtX19tZWRpYV9fYXZhdGFyJyB9LFxuXHRcdFx0dGhpcy5wcm9wcy5hdmF0YXIgPyBSZWFjdC5jcmVhdGVFbGVtZW50KCdpbWcnLCB7IHNyYzogdGhpcy5wcm9wcy5hdmF0YXIgfSkgOiB0aGlzLnByb3BzLmF2YXRhckluaXRpYWxzXG5cdFx0KSA6IG51bGw7XG5cdFx0dmFyIHRodW1ibmFpbCA9IHRoaXMucHJvcHMudGh1bWJuYWlsID8gUmVhY3QuY3JlYXRlRWxlbWVudChcblx0XHRcdCdkaXYnLFxuXHRcdFx0eyBjbGFzc05hbWU6ICdJdGVtX19tZWRpYV9fdGh1bWJuYWlsJyB9LFxuXHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudCgnaW1nJywgeyBzcmM6IHRoaXMucHJvcHMudGh1bWJuYWlsIH0pXG5cdFx0KSA6IG51bGw7XG5cblx0XHRyZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChcblx0XHRcdCdkaXYnLFxuXHRcdFx0eyBjbGFzc05hbWU6IGNsYXNzTmFtZSB9LFxuXHRcdFx0aWNvbixcblx0XHRcdGF2YXRhcixcblx0XHRcdHRodW1ibmFpbFxuXHRcdCk7XG5cdH1cbn0pOyIsIid1c2Ugc3RyaWN0JztcblxudmFyIGNsYXNzbmFtZXMgPSByZXF1aXJlKCdjbGFzc25hbWVzJyk7XG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdC9hZGRvbnMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cdGRpc3BsYXlOYW1lOiAnSXRlbU5vdGUnLFxuXHRwcm9wVHlwZXM6IHtcblx0XHRjbGFzc05hbWU6IFJlYWN0LlByb3BUeXBlcy5zdHJpbmcsXG5cdFx0aWNvbjogUmVhY3QuUHJvcFR5cGVzLnN0cmluZyxcblx0XHRsYWJlbDogUmVhY3QuUHJvcFR5cGVzLnN0cmluZyxcblx0XHR0eXBlOiBSZWFjdC5Qcm9wVHlwZXMuc3RyaW5nXG5cdH0sXG5cdGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24gZ2V0RGVmYXVsdFByb3BzKCkge1xuXHRcdHJldHVybiB7XG5cdFx0XHR0eXBlOiAnZGVmYXVsdCdcblx0XHR9O1xuXHR9LFxuXHRyZW5kZXI6IGZ1bmN0aW9uIHJlbmRlcigpIHtcblx0XHR2YXIgY2xhc3NOYW1lID0gY2xhc3NuYW1lcygnSXRlbV9fbm90ZScsICdJdGVtX19ub3RlLS0nICsgdGhpcy5wcm9wcy50eXBlLCB0aGlzLnByb3BzLmNsYXNzTmFtZSk7XG5cblx0XHQvLyBlbGVtZW50c1xuXHRcdHZhciBsYWJlbCA9IHRoaXMucHJvcHMubGFiZWwgPyBSZWFjdC5jcmVhdGVFbGVtZW50KFxuXHRcdFx0J2RpdicsXG5cdFx0XHR7IGNsYXNzTmFtZTogJ0l0ZW1fX25vdGVfX2xhYmVsJyB9LFxuXHRcdFx0dGhpcy5wcm9wcy5sYWJlbFxuXHRcdCkgOiBudWxsO1xuXHRcdHZhciBpY29uID0gdGhpcy5wcm9wcy5pY29uID8gUmVhY3QuY3JlYXRlRWxlbWVudCgnZGl2JywgeyBjbGFzc05hbWU6ICdJdGVtX19ub3RlX19pY29uICcgKyB0aGlzLnByb3BzLmljb24gfSkgOiBudWxsO1xuXG5cdFx0cmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG5cdFx0XHQnZGl2Jyxcblx0XHRcdHsgY2xhc3NOYW1lOiBjbGFzc05hbWUgfSxcblx0XHRcdGxhYmVsLFxuXHRcdFx0aWNvblxuXHRcdCk7XG5cdH1cbn0pOyIsIid1c2Ugc3RyaWN0JztcblxudmFyIF9leHRlbmRzID0gT2JqZWN0LmFzc2lnbiB8fCBmdW5jdGlvbiAodGFyZ2V0KSB7IGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7IHZhciBzb3VyY2UgPSBhcmd1bWVudHNbaV07IGZvciAodmFyIGtleSBpbiBzb3VyY2UpIHsgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzb3VyY2UsIGtleSkpIHsgdGFyZ2V0W2tleV0gPSBzb3VyY2Vba2V5XTsgfSB9IH0gcmV0dXJuIHRhcmdldDsgfTtcblxudmFyIGJsYWNrbGlzdCA9IHJlcXVpcmUoJ2JsYWNrbGlzdCcpO1xudmFyIGNsYXNzbmFtZXMgPSByZXF1aXJlKCdjbGFzc25hbWVzJyk7XG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdC9hZGRvbnMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cdGRpc3BsYXlOYW1lOiAnSXRlbVN1YlRpdGxlJyxcblx0cHJvcFR5cGVzOiB7XG5cdFx0Y2hpbGRyZW46IFJlYWN0LlByb3BUeXBlcy5ub2RlLmlzUmVxdWlyZWQsXG5cdFx0Y2xhc3NOYW1lOiBSZWFjdC5Qcm9wVHlwZXMuc3RyaW5nXG5cdH0sXG5cdHJlbmRlcjogZnVuY3Rpb24gcmVuZGVyKCkge1xuXHRcdHZhciBjbGFzc05hbWUgPSBjbGFzc25hbWVzKCdJdGVtX19zdWJ0aXRsZScsIHRoaXMucHJvcHMuY2xhc3NOYW1lKTtcblx0XHR2YXIgcHJvcHMgPSBibGFja2xpc3QodGhpcy5wcm9wcywgJ2NsYXNzTmFtZScpO1xuXG5cdFx0cmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoJ2RpdicsIF9leHRlbmRzKHsgY2xhc3NOYW1lOiBjbGFzc05hbWUgfSwgcHJvcHMpKTtcblx0fVxufSk7IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgX2V4dGVuZHMgPSBPYmplY3QuYXNzaWduIHx8IGZ1bmN0aW9uICh0YXJnZXQpIHsgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHsgdmFyIHNvdXJjZSA9IGFyZ3VtZW50c1tpXTsgZm9yICh2YXIga2V5IGluIHNvdXJjZSkgeyBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHNvdXJjZSwga2V5KSkgeyB0YXJnZXRba2V5XSA9IHNvdXJjZVtrZXldOyB9IH0gfSByZXR1cm4gdGFyZ2V0OyB9O1xuXG52YXIgYmxhY2tsaXN0ID0gcmVxdWlyZSgnYmxhY2tsaXN0Jyk7XG52YXIgY2xhc3NuYW1lcyA9IHJlcXVpcmUoJ2NsYXNzbmFtZXMnKTtcbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0L2FkZG9ucycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblx0ZGlzcGxheU5hbWU6ICdJdGVtVGl0bGUnLFxuXHRwcm9wVHlwZXM6IHtcblx0XHRjaGlsZHJlbjogUmVhY3QuUHJvcFR5cGVzLm5vZGUuaXNSZXF1aXJlZCxcblx0XHRjbGFzc05hbWU6IFJlYWN0LlByb3BUeXBlcy5zdHJpbmdcblx0fSxcblx0cmVuZGVyOiBmdW5jdGlvbiByZW5kZXIoKSB7XG5cdFx0dmFyIGNsYXNzTmFtZSA9IGNsYXNzbmFtZXMoJ0l0ZW1fX3RpdGxlJywgdGhpcy5wcm9wcy5jbGFzc05hbWUpO1xuXHRcdHZhciBwcm9wcyA9IGJsYWNrbGlzdCh0aGlzLnByb3BzLCAnY2xhc3NOYW1lJyk7XG5cblx0XHRyZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudCgnZGl2JywgX2V4dGVuZHMoeyBjbGFzc05hbWU6IGNsYXNzTmFtZSB9LCBwcm9wcykpO1xuXHR9XG59KTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBfZXh0ZW5kcyA9IE9iamVjdC5hc3NpZ24gfHwgZnVuY3Rpb24gKHRhcmdldCkgeyBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykgeyB2YXIgc291cmNlID0gYXJndW1lbnRzW2ldOyBmb3IgKHZhciBrZXkgaW4gc291cmNlKSB7IGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoc291cmNlLCBrZXkpKSB7IHRhcmdldFtrZXldID0gc291cmNlW2tleV07IH0gfSB9IHJldHVybiB0YXJnZXQ7IH07XG5cbnZhciBGaWVsZENvbnRyb2wgPSByZXF1aXJlKCcuL0ZpZWxkQ29udHJvbCcpO1xudmFyIEZpZWxkTGFiZWwgPSByZXF1aXJlKCcuL0ZpZWxkTGFiZWwnKTtcbnZhciBJdGVtID0gcmVxdWlyZSgnLi9JdGVtJyk7XG52YXIgSXRlbUlubmVyID0gcmVxdWlyZSgnLi9JdGVtSW5uZXInKTtcbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0L2FkZG9ucycpO1xuXG52YXIgYmxhY2tsaXN0ID0gcmVxdWlyZSgnYmxhY2tsaXN0Jyk7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXHRkaXNwbGF5TmFtZTogJ0xhYmVsSW5wdXQnLFxuXG5cdHByb3BUeXBlczoge1xuXHRcdGFsaWduVG9wOiBSZWFjdC5Qcm9wVHlwZXMuYm9vbCxcblx0XHRjaGlsZHJlbjogUmVhY3QuUHJvcFR5cGVzLm5vZGUsXG5cdFx0Y2xhc3NOYW1lOiBSZWFjdC5Qcm9wVHlwZXMuc3RyaW5nLFxuXHRcdGRpc2FibGVkOiBSZWFjdC5Qcm9wVHlwZXMuYm9vbCxcblx0XHRsYWJlbDogUmVhY3QuUHJvcFR5cGVzLnN0cmluZyxcblx0XHRyZWFkT25seTogUmVhY3QuUHJvcFR5cGVzLmJvb2wsXG5cdFx0dmFsdWU6IFJlYWN0LlByb3BUeXBlcy5zdHJpbmdcblx0fSxcblxuXHRnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uIGdldERlZmF1bHRQcm9wcygpIHtcblx0XHRyZXR1cm4ge1xuXHRcdFx0cmVhZE9ubHk6IGZhbHNlXG5cdFx0fTtcblx0fSxcblxuXHRyZW5kZXI6IGZ1bmN0aW9uIHJlbmRlcigpIHtcblx0XHR2YXIgaW5wdXRQcm9wcyA9IGJsYWNrbGlzdCh0aGlzLnByb3BzLCAnYWxpZ25Ub3AnLCAnY2hpbGRyZW4nLCAnZmlyc3QnLCAncmVhZE9ubHknKTtcblx0XHR2YXIgcmVuZGVySW5wdXQgPSB0aGlzLnByb3BzLnJlYWRPbmx5ID8gUmVhY3QuY3JlYXRlRWxlbWVudChcblx0XHRcdCdkaXYnLFxuXHRcdFx0eyBjbGFzc05hbWU6ICdmaWVsZCB1LXNlbGVjdGFibGUnIH0sXG5cdFx0XHR0aGlzLnByb3BzLnZhbHVlXG5cdFx0KSA6IFJlYWN0LmNyZWF0ZUVsZW1lbnQoJ2lucHV0JywgX2V4dGVuZHMoeyBjbGFzc05hbWU6ICdmaWVsZCcsIHR5cGU6ICd0ZXh0JyB9LCBpbnB1dFByb3BzKSk7XG5cblx0XHRyZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChcblx0XHRcdEl0ZW0sXG5cdFx0XHR7IGFsaWduVG9wOiB0aGlzLnByb3BzLmFsaWduVG9wLCBzZWxlY3RhYmxlOiB0aGlzLnByb3BzLmRpc2FibGVkLCBjbGFzc05hbWU6IHRoaXMucHJvcHMuY2xhc3NOYW1lLCBjb21wb25lbnQ6ICdsYWJlbCcgfSxcblx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG5cdFx0XHRcdEl0ZW1Jbm5lcixcblx0XHRcdFx0bnVsbCxcblx0XHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChcblx0XHRcdFx0XHRGaWVsZExhYmVsLFxuXHRcdFx0XHRcdG51bGwsXG5cdFx0XHRcdFx0dGhpcy5wcm9wcy5sYWJlbFxuXHRcdFx0XHQpLFxuXHRcdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFxuXHRcdFx0XHRcdEZpZWxkQ29udHJvbCxcblx0XHRcdFx0XHRudWxsLFxuXHRcdFx0XHRcdHJlbmRlcklucHV0LFxuXHRcdFx0XHRcdHRoaXMucHJvcHMuY2hpbGRyZW5cblx0XHRcdFx0KVxuXHRcdFx0KVxuXHRcdCk7XG5cdH1cbn0pOyIsIid1c2Ugc3RyaWN0JztcblxudmFyIEZpZWxkQ29udHJvbCA9IHJlcXVpcmUoJy4vRmllbGRDb250cm9sJyk7XG52YXIgRmllbGRMYWJlbCA9IHJlcXVpcmUoJy4vRmllbGRMYWJlbCcpO1xudmFyIEl0ZW0gPSByZXF1aXJlKCcuL0l0ZW0nKTtcbnZhciBJdGVtSW5uZXIgPSByZXF1aXJlKCcuL0l0ZW1Jbm5lcicpO1xudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QvYWRkb25zJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXHRkaXNwbGF5TmFtZTogJ0xhYmVsU2VsZWN0Jyxcblx0cHJvcFR5cGVzOiB7XG5cdFx0YWxpZ25Ub3A6IFJlYWN0LlByb3BUeXBlcy5ib29sLFxuXHRcdGNsYXNzTmFtZTogUmVhY3QuUHJvcFR5cGVzLnN0cmluZyxcblx0XHRkaXNhYmxlZDogUmVhY3QuUHJvcFR5cGVzLmJvb2wsXG5cdFx0Zmlyc3Q6IFJlYWN0LlByb3BUeXBlcy5ib29sLFxuXHRcdGxhYmVsOiBSZWFjdC5Qcm9wVHlwZXMuc3RyaW5nLFxuXHRcdG9wdGlvbnM6IFJlYWN0LlByb3BUeXBlcy5hcnJheSxcblx0XHR2YWx1ZTogUmVhY3QuUHJvcFR5cGVzLnN0cmluZ1xuXHR9LFxuXG5cdGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24gZ2V0RGVmYXVsdFByb3BzKCkge1xuXHRcdHJldHVybiB7XG5cdFx0XHRjbGFzc05hbWU6ICcnXG5cdFx0fTtcblx0fSxcblxuXHRnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uIGdldEluaXRpYWxTdGF0ZSgpIHtcblx0XHRyZXR1cm4ge1xuXHRcdFx0dmFsdWU6IHRoaXMucHJvcHMudmFsdWVcblx0XHR9O1xuXHR9LFxuXG5cdHVwZGF0ZUlucHV0VmFsdWU6IGZ1bmN0aW9uIHVwZGF0ZUlucHV0VmFsdWUoZXZlbnQpIHtcblx0XHR0aGlzLnNldFN0YXRlKHtcblx0XHRcdHZhbHVlOiBldmVudC50YXJnZXQudmFsdWVcblx0XHR9KTtcblx0fSxcblxuXHRyZW5kZXI6IGZ1bmN0aW9uIHJlbmRlcigpIHtcblx0XHQvLyBNYXAgT3B0aW9uc1xuXHRcdHZhciBvcHRpb25zID0gdGhpcy5wcm9wcy5vcHRpb25zLm1hcChmdW5jdGlvbiAob3ApIHtcblx0XHRcdHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KFxuXHRcdFx0XHQnb3B0aW9uJyxcblx0XHRcdFx0eyBrZXk6ICdvcHRpb24tJyArIG9wLnZhbHVlLCB2YWx1ZTogb3AudmFsdWUgfSxcblx0XHRcdFx0b3AubGFiZWxcblx0XHRcdCk7XG5cdFx0fSk7XG5cblx0XHRyZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChcblx0XHRcdEl0ZW0sXG5cdFx0XHR7IGFsaWduVG9wOiB0aGlzLnByb3BzLmFsaWduVG9wLCBzZWxlY3RhYmxlOiB0aGlzLnByb3BzLmRpc2FibGVkLCBjbGFzc05hbWU6IHRoaXMucHJvcHMuY2xhc3NOYW1lLCBjb21wb25lbnQ6ICdsYWJlbCcgfSxcblx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG5cdFx0XHRcdEl0ZW1Jbm5lcixcblx0XHRcdFx0bnVsbCxcblx0XHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChcblx0XHRcdFx0XHRGaWVsZExhYmVsLFxuXHRcdFx0XHRcdG51bGwsXG5cdFx0XHRcdFx0dGhpcy5wcm9wcy5sYWJlbFxuXHRcdFx0XHQpLFxuXHRcdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFxuXHRcdFx0XHRcdEZpZWxkQ29udHJvbCxcblx0XHRcdFx0XHRudWxsLFxuXHRcdFx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG5cdFx0XHRcdFx0XHQnc2VsZWN0Jyxcblx0XHRcdFx0XHRcdHsgdmFsdWU6IHRoaXMuc3RhdGUudmFsdWUsIG9uQ2hhbmdlOiB0aGlzLnVwZGF0ZUlucHV0VmFsdWUsIGNsYXNzTmFtZTogJ3NlbGVjdC1maWVsZCcgfSxcblx0XHRcdFx0XHRcdG9wdGlvbnNcblx0XHRcdFx0XHQpLFxuXHRcdFx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG5cdFx0XHRcdFx0XHQnZGl2Jyxcblx0XHRcdFx0XHRcdHsgY2xhc3NOYW1lOiAnc2VsZWN0LWZpZWxkLWluZGljYXRvcicgfSxcblx0XHRcdFx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoJ2RpdicsIHsgY2xhc3NOYW1lOiAnc2VsZWN0LWZpZWxkLWluZGljYXRvci1hcnJvdycgfSlcblx0XHRcdFx0XHQpXG5cdFx0XHRcdClcblx0XHRcdClcblx0XHQpO1xuXHR9XG59KTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBfZXh0ZW5kcyA9IE9iamVjdC5hc3NpZ24gfHwgZnVuY3Rpb24gKHRhcmdldCkgeyBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykgeyB2YXIgc291cmNlID0gYXJndW1lbnRzW2ldOyBmb3IgKHZhciBrZXkgaW4gc291cmNlKSB7IGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoc291cmNlLCBrZXkpKSB7IHRhcmdldFtrZXldID0gc291cmNlW2tleV07IH0gfSB9IHJldHVybiB0YXJnZXQ7IH07XG5cbnZhciBibGFja2xpc3QgPSByZXF1aXJlKCdibGFja2xpc3QnKTtcbnZhciBjbGFzc25hbWVzID0gcmVxdWlyZSgnY2xhc3NuYW1lcycpO1xudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QvYWRkb25zJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXHRkaXNwbGF5TmFtZTogJ0xhYmVsVGV4dGFyZWEnLFxuXG5cdHByb3BUeXBlczoge1xuXHRcdGNoaWxkcmVuOiBSZWFjdC5Qcm9wVHlwZXMubm9kZSxcblx0XHRjbGFzc05hbWU6IFJlYWN0LlByb3BUeXBlcy5zdHJpbmcsXG5cdFx0ZGlzYWJsZWQ6IFJlYWN0LlByb3BUeXBlcy5ib29sLFxuXHRcdGZpcnN0OiBSZWFjdC5Qcm9wVHlwZXMuYm9vbCxcblx0XHRsYWJlbDogUmVhY3QuUHJvcFR5cGVzLnN0cmluZyxcblx0XHRyZWFkT25seTogUmVhY3QuUHJvcFR5cGVzLmJvb2wsXG5cdFx0dmFsdWU6IFJlYWN0LlByb3BUeXBlcy5zdHJpbmdcblx0fSxcblxuXHRnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uIGdldERlZmF1bHRQcm9wcygpIHtcblx0XHRyZXR1cm4ge1xuXHRcdFx0cm93czogM1xuXHRcdH07XG5cdH0sXG5cblx0cmVuZGVyOiBmdW5jdGlvbiByZW5kZXIoKSB7XG5cdFx0dmFyIGNsYXNzTmFtZSA9IGNsYXNzbmFtZXModGhpcy5wcm9wcy5jbGFzc05hbWUsICdsaXN0LWl0ZW0nLCAnZmllbGQtaXRlbScsICdhbGlnbi10b3AnLCB7XG5cdFx0XHQnaXMtZmlyc3QnOiB0aGlzLnByb3BzLmZpcnN0LFxuXHRcdFx0J3Utc2VsZWN0YWJsZSc6IHRoaXMucHJvcHMuZGlzYWJsZWRcblx0XHR9KTtcblxuXHRcdHZhciBwcm9wcyA9IGJsYWNrbGlzdCh0aGlzLnByb3BzLCAnY2hpbGRyZW4nLCAnY2xhc3NOYW1lJywgJ2Rpc2FibGVkJywgJ2ZpcnN0JywgJ2xhYmVsJywgJ3JlYWRPbmx5Jyk7XG5cblx0XHR2YXIgcmVuZGVySW5wdXQgPSB0aGlzLnByb3BzLnJlYWRPbmx5ID8gUmVhY3QuY3JlYXRlRWxlbWVudChcblx0XHRcdCdkaXYnLFxuXHRcdFx0eyBjbGFzc05hbWU6ICdmaWVsZCB1LXNlbGVjdGFibGUnIH0sXG5cdFx0XHR0aGlzLnByb3BzLnZhbHVlXG5cdFx0KSA6IFJlYWN0LmNyZWF0ZUVsZW1lbnQoJ3RleHRhcmVhJywgX2V4dGVuZHMoe30sIHByb3BzLCB7IGNsYXNzTmFtZTogJ2ZpZWxkJyB9KSk7XG5cblx0XHRyZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChcblx0XHRcdCdkaXYnLFxuXHRcdFx0eyBjbGFzc05hbWU6IGNsYXNzTmFtZSB9LFxuXHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChcblx0XHRcdFx0J2xhYmVsJyxcblx0XHRcdFx0eyBjbGFzc05hbWU6ICdpdGVtLWlubmVyJyB9LFxuXHRcdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFxuXHRcdFx0XHRcdCdkaXYnLFxuXHRcdFx0XHRcdHsgY2xhc3NOYW1lOiAnZmllbGQtbGFiZWwnIH0sXG5cdFx0XHRcdFx0dGhpcy5wcm9wcy5sYWJlbFxuXHRcdFx0XHQpLFxuXHRcdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFxuXHRcdFx0XHRcdCdkaXYnLFxuXHRcdFx0XHRcdHsgY2xhc3NOYW1lOiAnZmllbGQtY29udHJvbCcgfSxcblx0XHRcdFx0XHRyZW5kZXJJbnB1dCxcblx0XHRcdFx0XHR0aGlzLnByb3BzLmNoaWxkcmVuXG5cdFx0XHRcdClcblx0XHRcdClcblx0XHQpO1xuXHR9XG59KTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBfZXh0ZW5kcyA9IE9iamVjdC5hc3NpZ24gfHwgZnVuY3Rpb24gKHRhcmdldCkgeyBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykgeyB2YXIgc291cmNlID0gYXJndW1lbnRzW2ldOyBmb3IgKHZhciBrZXkgaW4gc291cmNlKSB7IGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoc291cmNlLCBrZXkpKSB7IHRhcmdldFtrZXldID0gc291cmNlW2tleV07IH0gfSB9IHJldHVybiB0YXJnZXQ7IH07XG5cbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbnZhciBibGFja2xpc3QgPSByZXF1aXJlKCdibGFja2xpc3QnKTtcbnZhciBjbGFzc05hbWVzID0gcmVxdWlyZSgnY2xhc3NuYW1lcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblx0ZGlzcGxheU5hbWU6ICdMaXN0SGVhZGVyJyxcblxuXHRwcm9wVHlwZXM6IHtcblx0XHRjbGFzc05hbWU6IFJlYWN0LlByb3BUeXBlcy5zdHJpbmcsXG5cdFx0c3RpY2t5OiBSZWFjdC5Qcm9wVHlwZXMuYm9vbFxuXHR9LFxuXG5cdHJlbmRlcjogZnVuY3Rpb24gcmVuZGVyKCkge1xuXHRcdHZhciBjbGFzc05hbWUgPSBjbGFzc05hbWVzKCdsaXN0LWhlYWRlcicsIHtcblx0XHRcdCdzdGlja3knOiB0aGlzLnByb3BzLnN0aWNreVxuXHRcdH0sIHRoaXMucHJvcHMuY2xhc3NOYW1lKTtcblxuXHRcdHZhciBwcm9wcyA9IGJsYWNrbGlzdCh0aGlzLnByb3BzLCAnc3RpY2t5Jyk7XG5cblx0XHRyZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudCgnZGl2JywgX2V4dGVuZHMoeyBjbGFzc05hbWU6IGNsYXNzTmFtZSB9LCBwcm9wcykpO1xuXHR9XG59KTsiLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHtcblx0dmFsdWU6IHRydWVcbn0pO1xuXG52YXIgX2V4dGVuZHMgPSBPYmplY3QuYXNzaWduIHx8IGZ1bmN0aW9uICh0YXJnZXQpIHsgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHsgdmFyIHNvdXJjZSA9IGFyZ3VtZW50c1tpXTsgZm9yICh2YXIga2V5IGluIHNvdXJjZSkgeyBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHNvdXJjZSwga2V5KSkgeyB0YXJnZXRba2V5XSA9IHNvdXJjZVtrZXldOyB9IH0gfSByZXR1cm4gdGFyZ2V0OyB9O1xuXG52YXIgY2xhc3NOYW1lcyA9IHJlcXVpcmUoJ2NsYXNzbmFtZXMnKTtcbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0L2FkZG9ucycpO1xudmFyIFRhcHBhYmxlID0gcmVxdWlyZSgncmVhY3QtdGFwcGFibGUnKTtcbnZhciBUcmFuc2l0aW9uID0gUmVhY3QuYWRkb25zLkNTU1RyYW5zaXRpb25Hcm91cDtcblxudmFyIERJUkVDVElPTlMgPSB7XG5cdCdyZXZlYWwtZnJvbS1yaWdodCc6IC0xLFxuXHQnc2hvdy1mcm9tLWxlZnQnOiAtMSxcblx0J3Nob3ctZnJvbS1yaWdodCc6IDEsXG5cdCdyZXZlYWwtZnJvbS1sZWZ0JzogMVxufTtcblxudmFyIGRlZmF1bHRDb250cm9sbGVyU3RhdGUgPSB7XG5cdGRpcmVjdGlvbjogMCxcblx0ZmFkZTogZmFsc2UsXG5cdGxlZnRBcnJvdzogZmFsc2UsXG5cdGxlZnRCdXR0b25EaXNhYmxlZDogZmFsc2UsXG5cdGxlZnRJY29uOiAnJyxcblx0bGVmdExhYmVsOiAnJyxcblx0bGVmdEFjdGlvbjogbnVsbCxcblx0cmlnaHRBcnJvdzogZmFsc2UsXG5cdHJpZ2h0QnV0dG9uRGlzYWJsZWQ6IGZhbHNlLFxuXHRyaWdodEljb246ICcnLFxuXHRyaWdodExhYmVsOiAnJyxcblx0cmlnaHRBY3Rpb246IG51bGwsXG5cdHRpdGxlOiAnJ1xufTtcblxuZnVuY3Rpb24gbmV3U3RhdGUoZnJvbSkge1xuXHR2YXIgbnMgPSBfZXh0ZW5kcyh7fSwgZGVmYXVsdENvbnRyb2xsZXJTdGF0ZSk7XG5cdGlmIChmcm9tKSBfZXh0ZW5kcyhucywgZnJvbSk7XG5cdGRlbGV0ZSBucy5uYW1lOyAvLyBtYXkgbGVhayBmcm9tIHByb3BzXG5cdHJldHVybiBucztcbn1cblxudmFyIE5hdmlnYXRpb25CYXIgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cdGRpc3BsYXlOYW1lOiAnTmF2aWdhdGlvbkJhcicsXG5cblx0Y29udGV4dFR5cGVzOiB7XG5cdFx0YXBwOiBSZWFjdC5Qcm9wVHlwZXMub2JqZWN0XG5cdH0sXG5cblx0cHJvcFR5cGVzOiB7XG5cdFx0bmFtZTogUmVhY3QuUHJvcFR5cGVzLnN0cmluZ1xuXHR9LFxuXG5cdGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24gZ2V0SW5pdGlhbFN0YXRlKCkge1xuXHRcdHJldHVybiBuZXdTdGF0ZSh0aGlzLnByb3BzKTtcblx0fSxcblxuXHRjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24gY29tcG9uZW50RGlkTW91bnQoKSB7XG5cdFx0aWYgKHRoaXMucHJvcHMubmFtZSkge1xuXHRcdFx0dGhpcy5jb250ZXh0LmFwcC5uYXZpZ2F0aW9uQmFyc1t0aGlzLnByb3BzLm5hbWVdID0gdGhpcztcblx0XHR9XG5cdH0sXG5cblx0Y29tcG9uZW50V2lsbFVubW91bnQ6IGZ1bmN0aW9uIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuXHRcdGlmICh0aGlzLnByb3BzLm5hbWUpIHtcblx0XHRcdGRlbGV0ZSB0aGlzLmNvbnRleHQuYXBwLm5hdmlnYXRpb25CYXJzW3RoaXMucHJvcHMubmFtZV07XG5cdFx0fVxuXHR9LFxuXG5cdGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHM6IGZ1bmN0aW9uIGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMobmV4dFByb3BzKSB7XG5cdFx0dGhpcy5zZXRTdGF0ZShuZXdTdGF0ZShuZXh0UHJvcHMpKTtcblx0XHRpZiAobmV4dFByb3BzLm5hbWUgIT09IHRoaXMucHJvcHMubmFtZSkge1xuXHRcdFx0aWYgKG5leHRQcm9wcy5uYW1lKSB7XG5cdFx0XHRcdHRoaXMuY29udGV4dC5hcHAubmF2aWdhdGlvbkJhcnNbbmV4dFByb3BzLm5hbWVdID0gdGhpcztcblx0XHRcdH1cblx0XHRcdGlmICh0aGlzLnByb3BzLm5hbWUpIHtcblx0XHRcdFx0ZGVsZXRlIHRoaXMuY29udGV4dC5hcHAubmF2aWdhdGlvbkJhcnNbdGhpcy5wcm9wcy5uYW1lXTtcblx0XHRcdH1cblx0XHR9XG5cdH0sXG5cblx0dXBkYXRlOiBmdW5jdGlvbiB1cGRhdGUoc3RhdGUpIHtcblx0XHQvLyBGSVhNRTogd2hhdCBpcyBoYXBwZW5pbmcgaGVyZVxuXHRcdHN0YXRlID0gbmV3U3RhdGUoc3RhdGUpO1xuXHRcdHRoaXMuc2V0U3RhdGUobmV3U3RhdGUoc3RhdGUpKTtcblx0fSxcblxuXHR1cGRhdGVXaXRoVHJhbnNpdGlvbjogZnVuY3Rpb24gdXBkYXRlV2l0aFRyYW5zaXRpb24oc3RhdGUsIHRyYW5zaXRpb24pIHtcblx0XHRzdGF0ZSA9IG5ld1N0YXRlKHN0YXRlKTtcblx0XHRzdGF0ZS5kaXJlY3Rpb24gPSBESVJFQ1RJT05TW3RyYW5zaXRpb25dIHx8IDA7XG5cblx0XHRpZiAodHJhbnNpdGlvbiA9PT0gJ2ZhZGUnIHx8IHRyYW5zaXRpb24gPT09ICdmYWRlLWNvbnRyYWN0JyB8fCB0cmFuc2l0aW9uID09PSAnZmFkZS1leHBhbmQnKSB7XG5cdFx0XHRzdGF0ZS5mYWRlID0gdHJ1ZTtcblx0XHR9XG5cblx0XHR0aGlzLnNldFN0YXRlKHN0YXRlKTtcblx0fSxcblxuXHRyZW5kZXJMZWZ0QnV0dG9uOiBmdW5jdGlvbiByZW5kZXJMZWZ0QnV0dG9uKCkge1xuXHRcdHZhciBjbGFzc05hbWUgPSBjbGFzc05hbWVzKCdOYXZpZ2F0aW9uQmFyTGVmdEJ1dHRvbicsIHtcblx0XHRcdCdoYXMtYXJyb3cnOiB0aGlzLnN0YXRlLmxlZnRBcnJvd1xuXHRcdH0pO1xuXG5cdFx0cmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG5cdFx0XHRUYXBwYWJsZSxcblx0XHRcdHsgb25UYXA6IHRoaXMuc3RhdGUubGVmdEFjdGlvbiwgY2xhc3NOYW1lOiBjbGFzc05hbWUsIGRpc2FibGVkOiB0aGlzLnN0YXRlLmxlZnRCdXR0b25EaXNhYmxlZCwgY29tcG9uZW50OiAnYnV0dG9uJyB9LFxuXHRcdFx0dGhpcy5yZW5kZXJMZWZ0QXJyb3coKSxcblx0XHRcdHRoaXMucmVuZGVyTGVmdExhYmVsKClcblx0XHQpO1xuXHR9LFxuXG5cdHJlbmRlckxlZnRBcnJvdzogZnVuY3Rpb24gcmVuZGVyTGVmdEFycm93KCkge1xuXHRcdHZhciB0cmFuc2l0aW9uTmFtZSA9ICdOYXZpZ2F0aW9uQmFyVHJhbnNpdGlvbi1JbnN0YW50Jztcblx0XHRpZiAodGhpcy5zdGF0ZS5mYWRlIHx8IHRoaXMuc3RhdGUuZGlyZWN0aW9uKSB7XG5cdFx0XHR0cmFuc2l0aW9uTmFtZSA9ICdOYXZpZ2F0aW9uQmFyVHJhbnNpdGlvbi1GYWRlJztcblx0XHR9XG5cblx0XHR2YXIgYXJyb3cgPSB0aGlzLnN0YXRlLmxlZnRBcnJvdyA/IFJlYWN0LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nLCB7IGNsYXNzTmFtZTogJ05hdmlnYXRpb25CYXJMZWZ0QXJyb3cnIH0pIDogbnVsbDtcblxuXHRcdHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KFxuXHRcdFx0VHJhbnNpdGlvbixcblx0XHRcdHsgdHJhbnNpdGlvbk5hbWU6IHRyYW5zaXRpb25OYW1lIH0sXG5cdFx0XHRhcnJvd1xuXHRcdCk7XG5cdH0sXG5cblx0cmVuZGVyTGVmdExhYmVsOiBmdW5jdGlvbiByZW5kZXJMZWZ0TGFiZWwoKSB7XG5cdFx0dmFyIHRyYW5zaXRpb25OYW1lID0gJ05hdmlnYXRpb25CYXJUcmFuc2l0aW9uLUluc3RhbnQnO1xuXHRcdGlmICh0aGlzLnN0YXRlLmZhZGUpIHtcblx0XHRcdHRyYW5zaXRpb25OYW1lID0gJ05hdmlnYXRpb25CYXJUcmFuc2l0aW9uLUZhZGUnO1xuXHRcdH0gZWxzZSBpZiAodGhpcy5zdGF0ZS5kaXJlY3Rpb24gPiAwKSB7XG5cdFx0XHR0cmFuc2l0aW9uTmFtZSA9ICdOYXZpZ2F0aW9uQmFyVHJhbnNpdGlvbi1Gb3J3YXJkcyc7XG5cdFx0fSBlbHNlIGlmICh0aGlzLnN0YXRlLmRpcmVjdGlvbiA8IDApIHtcblx0XHRcdHRyYW5zaXRpb25OYW1lID0gJ05hdmlnYXRpb25CYXJUcmFuc2l0aW9uLUJhY2t3YXJkcyc7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG5cdFx0XHRUcmFuc2l0aW9uLFxuXHRcdFx0eyB0cmFuc2l0aW9uTmFtZTogdHJhbnNpdGlvbk5hbWUgfSxcblx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG5cdFx0XHRcdCdzcGFuJyxcblx0XHRcdFx0eyBrZXk6IERhdGUubm93KCksIGNsYXNzTmFtZTogJ05hdmlnYXRpb25CYXJMZWZ0TGFiZWwnIH0sXG5cdFx0XHRcdHRoaXMuc3RhdGUubGVmdExhYmVsXG5cdFx0XHQpXG5cdFx0KTtcblx0fSxcblxuXHRyZW5kZXJUaXRsZTogZnVuY3Rpb24gcmVuZGVyVGl0bGUoKSB7XG5cdFx0dmFyIHRpdGxlID0gdGhpcy5zdGF0ZS50aXRsZSA/IFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG5cdFx0XHQnc3BhbicsXG5cdFx0XHR7IGtleTogRGF0ZS5ub3coKSwgY2xhc3NOYW1lOiAnTmF2aWdhdGlvbkJhclRpdGxlJyB9LFxuXHRcdFx0dGhpcy5zdGF0ZS50aXRsZVxuXHRcdCkgOiBudWxsO1xuXHRcdHZhciB0cmFuc2l0aW9uTmFtZSA9ICdOYXZpZ2F0aW9uQmFyVHJhbnNpdGlvbi1JbnN0YW50Jztcblx0XHRpZiAodGhpcy5zdGF0ZS5mYWRlKSB7XG5cdFx0XHR0cmFuc2l0aW9uTmFtZSA9ICdOYXZpZ2F0aW9uQmFyVHJhbnNpdGlvbi1GYWRlJztcblx0XHR9IGVsc2UgaWYgKHRoaXMuc3RhdGUuZGlyZWN0aW9uID4gMCkge1xuXHRcdFx0dHJhbnNpdGlvbk5hbWUgPSAnTmF2aWdhdGlvbkJhclRyYW5zaXRpb24tRm9yd2FyZHMnO1xuXHRcdH0gZWxzZSBpZiAodGhpcy5zdGF0ZS5kaXJlY3Rpb24gPCAwKSB7XG5cdFx0XHR0cmFuc2l0aW9uTmFtZSA9ICdOYXZpZ2F0aW9uQmFyVHJhbnNpdGlvbi1CYWNrd2FyZHMnO1xuXHRcdH1cblxuXHRcdHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KFxuXHRcdFx0VHJhbnNpdGlvbixcblx0XHRcdHsgdHJhbnNpdGlvbk5hbWU6IHRyYW5zaXRpb25OYW1lIH0sXG5cdFx0XHR0aXRsZVxuXHRcdCk7XG5cdH0sXG5cblx0cmVuZGVyUmlnaHRCdXR0b246IGZ1bmN0aW9uIHJlbmRlclJpZ2h0QnV0dG9uKCkge1xuXHRcdHZhciB0cmFuc2l0aW9uTmFtZSA9ICdOYXZpZ2F0aW9uQmFyVHJhbnNpdGlvbi1JbnN0YW50Jztcblx0XHRpZiAodGhpcy5zdGF0ZS5mYWRlIHx8IHRoaXMuc3RhdGUuZGlyZWN0aW9uKSB7XG5cdFx0XHR0cmFuc2l0aW9uTmFtZSA9ICdOYXZpZ2F0aW9uQmFyVHJhbnNpdGlvbi1GYWRlJztcblx0XHR9XG5cdFx0dmFyIGJ1dHRvbiA9IHRoaXMuc3RhdGUucmlnaHRJY29uIHx8IHRoaXMuc3RhdGUucmlnaHRMYWJlbCA/IFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG5cdFx0XHRUYXBwYWJsZSxcblx0XHRcdHsga2V5OiBEYXRlLm5vdygpLCBvblRhcDogdGhpcy5zdGF0ZS5yaWdodEFjdGlvbiwgY2xhc3NOYW1lOiAnTmF2aWdhdGlvbkJhclJpZ2h0QnV0dG9uJywgZGlzYWJsZWQ6IHRoaXMuc3RhdGUucmlnaHRCdXR0b25EaXNhYmxlZCwgY29tcG9uZW50OiAnYnV0dG9uJyB9LFxuXHRcdFx0dGhpcy5yZW5kZXJSaWdodExhYmVsKCksXG5cdFx0XHR0aGlzLnJlbmRlclJpZ2h0SWNvbigpXG5cdFx0KSA6IG51bGw7XG5cdFx0cmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG5cdFx0XHRUcmFuc2l0aW9uLFxuXHRcdFx0eyB0cmFuc2l0aW9uTmFtZTogdHJhbnNpdGlvbk5hbWUgfSxcblx0XHRcdGJ1dHRvblxuXHRcdCk7XG5cdH0sXG5cblx0cmVuZGVyUmlnaHRJY29uOiBmdW5jdGlvbiByZW5kZXJSaWdodEljb24oKSB7XG5cdFx0aWYgKCF0aGlzLnN0YXRlLnJpZ2h0SWNvbikgcmV0dXJuIG51bGw7XG5cblx0XHR2YXIgY2xhc3NOYW1lID0gY2xhc3NOYW1lcygnTmF2aWdhdGlvbkJhclJpZ2h0SWNvbicsIHRoaXMuc3RhdGUucmlnaHRJY29uKTtcblxuXHRcdHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KCdzcGFuJywgeyBjbGFzc05hbWU6IGNsYXNzTmFtZSB9KTtcblx0fSxcblxuXHRyZW5kZXJSaWdodExhYmVsOiBmdW5jdGlvbiByZW5kZXJSaWdodExhYmVsKCkge1xuXHRcdHJldHVybiB0aGlzLnN0YXRlLnJpZ2h0TGFiZWwgPyBSZWFjdC5jcmVhdGVFbGVtZW50KFxuXHRcdFx0J3NwYW4nLFxuXHRcdFx0eyBrZXk6IERhdGUubm93KCksIGNsYXNzTmFtZTogJ05hdmlnYXRpb25CYXJSaWdodExhYmVsJyB9LFxuXHRcdFx0dGhpcy5zdGF0ZS5yaWdodExhYmVsXG5cdFx0KSA6IG51bGw7XG5cdH0sXG5cblx0cmVuZGVyOiBmdW5jdGlvbiByZW5kZXIoKSB7XG5cdFx0cmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG5cdFx0XHQnZGl2Jyxcblx0XHRcdHsgY2xhc3NOYW1lOiAnTmF2aWdhdGlvbkJhcicgfSxcblx0XHRcdHRoaXMucmVuZGVyTGVmdEJ1dHRvbigpLFxuXHRcdFx0dGhpcy5yZW5kZXJUaXRsZSgpLFxuXHRcdFx0dGhpcy5yZW5kZXJSaWdodEJ1dHRvbigpXG5cdFx0KTtcblx0fVxufSk7XG5cbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IE5hdmlnYXRpb25CYXI7XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0L2FkZG9ucycpO1xudmFyIFJlYWN0Q1NTVHJhbnNpdGlvbkdyb3VwID0gUmVhY3QuYWRkb25zLkNTU1RyYW5zaXRpb25Hcm91cDtcblxudmFyIGNsYXNzbmFtZXMgPSByZXF1aXJlKCdjbGFzc25hbWVzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXHRkaXNwbGF5TmFtZTogJ1BvcHVwJyxcblxuXHRwcm9wVHlwZXM6IHtcblx0XHRjaGlsZHJlbjogUmVhY3QuUHJvcFR5cGVzLm5vZGUsXG5cdFx0Y2xhc3NOYW1lOiBSZWFjdC5Qcm9wVHlwZXMuc3RyaW5nLFxuXHRcdHZpc2libGU6IFJlYWN0LlByb3BUeXBlcy5ib29sXG5cdH0sXG5cblx0Z2V0RGVmYXVsdFByb3BzOiBmdW5jdGlvbiBnZXREZWZhdWx0UHJvcHMoKSB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdHRyYW5zaXRpb246ICdub25lJ1xuXHRcdH07XG5cdH0sXG5cblx0cmVuZGVyQmFja2Ryb3A6IGZ1bmN0aW9uIHJlbmRlckJhY2tkcm9wKCkge1xuXHRcdGlmICghdGhpcy5wcm9wcy52aXNpYmxlKSByZXR1cm4gbnVsbDtcblx0XHRyZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudCgnZGl2JywgeyBjbGFzc05hbWU6ICdQb3B1cC1iYWNrZHJvcCcgfSk7XG5cdH0sXG5cblx0cmVuZGVyRGlhbG9nOiBmdW5jdGlvbiByZW5kZXJEaWFsb2coKSB7XG5cdFx0aWYgKCF0aGlzLnByb3BzLnZpc2libGUpIHJldHVybiBudWxsO1xuXG5cdFx0Ly8gU2V0IGNsYXNzbmFtZXNcblx0XHR2YXIgZGlhbG9nQ2xhc3NOYW1lID0gY2xhc3NuYW1lcygnUG9wdXAtZGlhbG9nJywgdGhpcy5wcm9wcy5jbGFzc05hbWUpO1xuXG5cdFx0cmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG5cdFx0XHQnZGl2Jyxcblx0XHRcdHsgY2xhc3NOYW1lOiBkaWFsb2dDbGFzc05hbWUgfSxcblx0XHRcdHRoaXMucHJvcHMuY2hpbGRyZW5cblx0XHQpO1xuXHR9LFxuXG5cdHJlbmRlcjogZnVuY3Rpb24gcmVuZGVyKCkge1xuXHRcdHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KFxuXHRcdFx0J2RpdicsXG5cdFx0XHR7IGNsYXNzTmFtZTogJ1BvcHVwJyB9LFxuXHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChcblx0XHRcdFx0UmVhY3RDU1NUcmFuc2l0aW9uR3JvdXAsXG5cdFx0XHRcdHsgdHJhbnNpdGlvbk5hbWU6ICdQb3B1cC1kaWFsb2cnLCBjb21wb25lbnQ6ICdkaXYnIH0sXG5cdFx0XHRcdHRoaXMucmVuZGVyRGlhbG9nKClcblx0XHRcdCksXG5cdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFxuXHRcdFx0XHRSZWFjdENTU1RyYW5zaXRpb25Hcm91cCxcblx0XHRcdFx0eyB0cmFuc2l0aW9uTmFtZTogJ1BvcHVwLWJhY2tncm91bmQnLCBjb21wb25lbnQ6ICdkaXYnIH0sXG5cdFx0XHRcdHRoaXMucmVuZGVyQmFja2Ryb3AoKVxuXHRcdFx0KVxuXHRcdCk7XG5cdH1cbn0pOyIsIid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QvYWRkb25zJyk7XG52YXIgY2xhc3NOYW1lcyA9IHJlcXVpcmUoJ2NsYXNzbmFtZXMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cdGRpc3BsYXlOYW1lOiAnUG9wdXBJY29uJyxcblx0cHJvcFR5cGVzOiB7XG5cdFx0bmFtZTogUmVhY3QuUHJvcFR5cGVzLnN0cmluZyxcblx0XHR0eXBlOiBSZWFjdC5Qcm9wVHlwZXMub25lT2YoWydkZWZhdWx0JywgJ211dGVkJywgJ3ByaW1hcnknLCAnc3VjY2VzcycsICd3YXJuaW5nJywgJ2RhbmdlciddKSxcblx0XHRzcGlubmluZzogUmVhY3QuUHJvcFR5cGVzLmJvb2xcblx0fSxcblxuXHRyZW5kZXI6IGZ1bmN0aW9uIHJlbmRlcigpIHtcblx0XHR2YXIgY2xhc3NOYW1lID0gY2xhc3NOYW1lcygnUG9wdXBJY29uJywge1xuXHRcdFx0J2lzLXNwaW5uaW5nJzogdGhpcy5wcm9wcy5zcGlubmluZ1xuXHRcdH0sIHRoaXMucHJvcHMubmFtZSwgdGhpcy5wcm9wcy50eXBlKTtcblxuXHRcdHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KCdkaXYnLCB7IGNsYXNzTmFtZTogY2xhc3NOYW1lIH0pO1xuXHR9XG59KTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBjbGFzc25hbWVzID0gcmVxdWlyZSgnY2xhc3NuYW1lcycpO1xudmFyIEl0ZW0gPSByZXF1aXJlKCcuL0l0ZW0nKTtcbnZhciBJdGVtSW5uZXIgPSByZXF1aXJlKCcuL0l0ZW1Jbm5lcicpO1xudmFyIEl0ZW1Ob3RlID0gcmVxdWlyZSgnLi9JdGVtTm90ZScpO1xudmFyIEl0ZW1UaXRsZSA9IHJlcXVpcmUoJy4vSXRlbVRpdGxlJyk7XG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xudmFyIFRhcHBhYmxlID0gcmVxdWlyZSgncmVhY3QtdGFwcGFibGUnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cdGRpc3BsYXlOYW1lOiAnUmFkaW9MaXN0JyxcblxuXHRwcm9wVHlwZXM6IHtcblx0XHRvcHRpb25zOiBSZWFjdC5Qcm9wVHlwZXMuYXJyYXksXG5cdFx0dmFsdWU6IFJlYWN0LlByb3BUeXBlcy5vbmVPZlR5cGUoW1JlYWN0LlByb3BUeXBlcy5zdHJpbmcsIFJlYWN0LlByb3BUeXBlcy5udW1iZXJdKSxcblx0XHRpY29uOiBSZWFjdC5Qcm9wVHlwZXMuc3RyaW5nLFxuXHRcdG9uQ2hhbmdlOiBSZWFjdC5Qcm9wVHlwZXMuZnVuY1xuXHR9LFxuXG5cdG9uQ2hhbmdlOiBmdW5jdGlvbiBvbkNoYW5nZSh2YWx1ZSkge1xuXHRcdHRoaXMucHJvcHMub25DaGFuZ2UodmFsdWUpO1xuXHR9LFxuXG5cdHJlbmRlcjogZnVuY3Rpb24gcmVuZGVyKCkge1xuXHRcdHZhciBzZWxmID0gdGhpcztcblx0XHR2YXIgb3B0aW9ucyA9IHRoaXMucHJvcHMub3B0aW9ucy5tYXAoZnVuY3Rpb24gKG9wLCBpKSB7XG5cdFx0XHR2YXIgaWNvbkNsYXNzbmFtZSA9IGNsYXNzbmFtZXMoJ2l0ZW0taWNvbiBwcmltYXJ5Jywgb3AuaWNvbik7XG5cdFx0XHR2YXIgY2hlY2tNYXJrID0gb3AudmFsdWUgPT09IHNlbGYucHJvcHMudmFsdWUgPyBSZWFjdC5jcmVhdGVFbGVtZW50KEl0ZW1Ob3RlLCB7IHR5cGU6ICdwcmltYXJ5JywgaWNvbjogJ2lvbi1jaGVja21hcmsnIH0pIDogbnVsbDtcblx0XHRcdHZhciBpY29uID0gb3AuaWNvbiA/IFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG5cdFx0XHRcdCdkaXYnLFxuXHRcdFx0XHR7IGNsYXNzTmFtZTogJ2l0ZW0tbWVkaWEnIH0sXG5cdFx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nLCB7IGNsYXNzTmFtZTogaWNvbkNsYXNzbmFtZSB9KVxuXHRcdFx0KSA6IG51bGw7XG5cblx0XHRcdGZ1bmN0aW9uIG9uQ2hhbmdlKCkge1xuXHRcdFx0XHRzZWxmLm9uQ2hhbmdlKG9wLnZhbHVlKTtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG5cdFx0XHRcdFRhcHBhYmxlLFxuXHRcdFx0XHR7IGtleTogJ29wdGlvbi0nICsgaSwgb25UYXA6IG9uQ2hhbmdlIH0sXG5cdFx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG5cdFx0XHRcdFx0SXRlbSxcblx0XHRcdFx0XHR7IGtleTogJ29wdGlvbi0nICsgaSwgb25UYXA6IG9uQ2hhbmdlIH0sXG5cdFx0XHRcdFx0aWNvbixcblx0XHRcdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFxuXHRcdFx0XHRcdFx0SXRlbUlubmVyLFxuXHRcdFx0XHRcdFx0bnVsbCxcblx0XHRcdFx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG5cdFx0XHRcdFx0XHRcdEl0ZW1UaXRsZSxcblx0XHRcdFx0XHRcdFx0bnVsbCxcblx0XHRcdFx0XHRcdFx0b3AubGFiZWxcblx0XHRcdFx0XHRcdCksXG5cdFx0XHRcdFx0XHRjaGVja01hcmtcblx0XHRcdFx0XHQpXG5cdFx0XHRcdClcblx0XHRcdCk7XG5cdFx0fSk7XG5cblx0XHRyZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChcblx0XHRcdCdkaXYnLFxuXHRcdFx0bnVsbCxcblx0XHRcdG9wdGlvbnNcblx0XHQpO1xuXHR9XG59KTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG52YXIgY2xhc3NuYW1lcyA9IHJlcXVpcmUoJ2NsYXNzbmFtZXMnKTtcbnZhciBUYXBwYWJsZSA9IHJlcXVpcmUoJ3JlYWN0LXRhcHBhYmxlJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXHRkaXNwbGF5TmFtZTogJ1NlZ21lbnRlZENvbnRyb2wnLFxuXG5cdHByb3BUeXBlczoge1xuXHRcdGNsYXNzTmFtZTogUmVhY3QuUHJvcFR5cGVzLnN0cmluZyxcblx0XHRlcXVhbFdpZHRoU2VnbWVudHM6IFJlYWN0LlByb3BUeXBlcy5ib29sLFxuXHRcdGhhc0d1dHRlcjogUmVhY3QuUHJvcFR5cGVzLmJvb2wsXG5cdFx0b25DaGFuZ2U6IFJlYWN0LlByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG5cdFx0b3B0aW9uczogUmVhY3QuUHJvcFR5cGVzLmFycmF5LmlzUmVxdWlyZWQsXG5cdFx0dHlwZTogUmVhY3QuUHJvcFR5cGVzLnN0cmluZyxcblx0XHR2YWx1ZTogUmVhY3QuUHJvcFR5cGVzLnN0cmluZ1xuXHR9LFxuXG5cdGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24gZ2V0RGVmYXVsdFByb3BzKCkge1xuXHRcdHJldHVybiB7XG5cdFx0XHR0eXBlOiAncHJpbWFyeSdcblx0XHR9O1xuXHR9LFxuXG5cdG9uQ2hhbmdlOiBmdW5jdGlvbiBvbkNoYW5nZSh2YWx1ZSkge1xuXHRcdHRoaXMucHJvcHMub25DaGFuZ2UodmFsdWUpO1xuXHR9LFxuXG5cdHJlbmRlcjogZnVuY3Rpb24gcmVuZGVyKCkge1xuXHRcdHZhciBjb21wb25lbnRDbGFzc05hbWUgPSBjbGFzc25hbWVzKCdTZWdtZW50ZWRDb250cm9sJywgJ1NlZ21lbnRlZENvbnRyb2wtLScgKyB0aGlzLnByb3BzLnR5cGUsIHtcblx0XHRcdCdTZWdtZW50ZWRDb250cm9sLS1oYXMtZ3V0dGVyJzogdGhpcy5wcm9wcy5oYXNHdXR0ZXIsXG5cdFx0XHQnU2VnbWVudGVkQ29udHJvbC0tZXF1YWwtd2lkdGhzJzogdGhpcy5wcm9wcy5lcXVhbFdpZHRoU2VnbWVudHNcblx0XHR9LCB0aGlzLnByb3BzLmNsYXNzTmFtZSk7XG5cdFx0dmFyIHNlbGYgPSB0aGlzO1xuXG5cdFx0dmFyIG9wdGlvbnMgPSB0aGlzLnByb3BzLm9wdGlvbnMubWFwKGZ1bmN0aW9uIChvcCkge1xuXHRcdFx0ZnVuY3Rpb24gb25DaGFuZ2UoKSB7XG5cdFx0XHRcdHNlbGYub25DaGFuZ2Uob3AudmFsdWUpO1xuXHRcdFx0fVxuXG5cdFx0XHR2YXIgaXRlbUNsYXNzTmFtZSA9IGNsYXNzbmFtZXMoJ1NlZ21lbnRlZENvbnRyb2xfX2l0ZW0nLCB7XG5cdFx0XHRcdCdpcy1zZWxlY3RlZCc6IG9wLnZhbHVlID09PSBzZWxmLnByb3BzLnZhbHVlXG5cdFx0XHR9KTtcblxuXHRcdFx0cmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG5cdFx0XHRcdFRhcHBhYmxlLFxuXHRcdFx0XHR7IGtleTogJ29wdGlvbi0nICsgb3AudmFsdWUsIG9uVGFwOiBvbkNoYW5nZSwgY2xhc3NOYW1lOiBpdGVtQ2xhc3NOYW1lIH0sXG5cdFx0XHRcdG9wLmxhYmVsXG5cdFx0XHQpO1xuXHRcdH0pO1xuXG5cdFx0cmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG5cdFx0XHQnZGl2Jyxcblx0XHRcdHsgY2xhc3NOYW1lOiBjb21wb25lbnRDbGFzc05hbWUgfSxcblx0XHRcdG9wdGlvbnNcblx0XHQpO1xuXHR9XG59KTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBjbGFzc25hbWVzID0gcmVxdWlyZSgnY2xhc3NuYW1lcycpO1xudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcbnZhciBUYXBwYWJsZSA9IHJlcXVpcmUoJ3JlYWN0LXRhcHBhYmxlJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXHRkaXNwbGF5TmFtZTogJ1N3aXRjaCcsXG5cblx0cHJvcFR5cGVzOiB7XG5cdFx0ZGlzYWJsZWQ6IFJlYWN0LlByb3BUeXBlcy5ib29sLFxuXHRcdG9uOiBSZWFjdC5Qcm9wVHlwZXMuYm9vbCxcblx0XHRvblRhcDogUmVhY3QuUHJvcFR5cGVzLmZ1bmMsXG5cdFx0dHlwZTogUmVhY3QuUHJvcFR5cGVzLnN0cmluZ1xuXHR9LFxuXG5cdGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24gZ2V0RGVmYXVsdFByb3BzKCkge1xuXHRcdHJldHVybiB7XG5cdFx0XHR0eXBlOiAnZGVmYXVsdCdcblx0XHR9O1xuXHR9LFxuXG5cdHJlbmRlcjogZnVuY3Rpb24gcmVuZGVyKCkge1xuXHRcdHZhciBjbGFzc05hbWUgPSBjbGFzc25hbWVzKCdTd2l0Y2gnLCAnU3dpdGNoLS0nICsgdGhpcy5wcm9wcy50eXBlLCB7XG5cdFx0XHQnaXMtZGlzYWJsZWQnOiB0aGlzLnByb3BzLmRpc2FibGVkLFxuXHRcdFx0J2lzLW9uJzogdGhpcy5wcm9wcy5vblxuXHRcdH0pO1xuXG5cdFx0cmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG5cdFx0XHRUYXBwYWJsZSxcblx0XHRcdHsgb25UYXA6IHRoaXMucHJvcHMub25UYXAsIGNsYXNzTmFtZTogY2xhc3NOYW1lLCBjb21wb25lbnQ6ICdsYWJlbCcgfSxcblx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG5cdFx0XHRcdCdkaXYnLFxuXHRcdFx0XHR7IGNsYXNzTmFtZTogJ1N3aXRjaF9fdHJhY2snIH0sXG5cdFx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoJ2RpdicsIHsgY2xhc3NOYW1lOiAnU3dpdGNoX19oYW5kbGUnIH0pXG5cdFx0XHQpXG5cdFx0KTtcblx0fVxufSk7IiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7XG5cdHZhbHVlOiB0cnVlXG59KTtcblxudmFyIF9leHRlbmRzID0gT2JqZWN0LmFzc2lnbiB8fCBmdW5jdGlvbiAodGFyZ2V0KSB7IGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7IHZhciBzb3VyY2UgPSBhcmd1bWVudHNbaV07IGZvciAodmFyIGtleSBpbiBzb3VyY2UpIHsgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzb3VyY2UsIGtleSkpIHsgdGFyZ2V0W2tleV0gPSBzb3VyY2Vba2V5XTsgfSB9IH0gcmV0dXJuIHRhcmdldDsgfTtcblxudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcbnZhciBUYXBwYWJsZSA9IHJlcXVpcmUoJ3JlYWN0LXRhcHBhYmxlJyk7XG5cbnZhciBibGFja2xpc3QgPSByZXF1aXJlKCdibGFja2xpc3QnKTtcbnZhciBjbGFzc25hbWVzID0gcmVxdWlyZSgnY2xhc3NuYW1lcycpO1xuXG52YXIgTmF2aWdhdG9yID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXHRkaXNwbGF5TmFtZTogJ05hdmlnYXRvcicsXG5cblx0cHJvcFR5cGVzOiB7XG5cdFx0Y2xhc3NOYW1lOiBSZWFjdC5Qcm9wVHlwZXMuc3RyaW5nXG5cdH0sXG5cblx0cmVuZGVyOiBmdW5jdGlvbiByZW5kZXIoKSB7XG5cdFx0dmFyIGNsYXNzTmFtZSA9IGNsYXNzbmFtZXMoJ1RhYnMtTmF2aWdhdG9yJywgdGhpcy5wcm9wcy5jbGFzc05hbWUpO1xuXHRcdHZhciBvdGhlclByb3BzID0gYmxhY2tsaXN0KHRoaXMucHJvcHMsICdjbGFzc05hbWUnKTtcblxuXHRcdHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KCdkaXYnLCBfZXh0ZW5kcyh7IGNsYXNzTmFtZTogY2xhc3NOYW1lIH0sIG90aGVyUHJvcHMpKTtcblx0fVxufSk7XG5cbmV4cG9ydHMuTmF2aWdhdG9yID0gTmF2aWdhdG9yO1xudmFyIFRhYiA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblx0ZGlzcGxheU5hbWU6ICdUYWInLFxuXG5cdHByb3BUeXBlczoge1xuXHRcdHNlbGVjdGVkOiBSZWFjdC5Qcm9wVHlwZXMuYm9vbFxuXHR9LFxuXG5cdHJlbmRlcjogZnVuY3Rpb24gcmVuZGVyKCkge1xuXHRcdHZhciBjbGFzc05hbWUgPSBjbGFzc25hbWVzKCdUYWJzLVRhYicsIHsgJ2lzLXNlbGVjdGVkJzogdGhpcy5wcm9wcy5zZWxlY3RlZCB9KTtcblx0XHR2YXIgb3RoZXJQcm9wcyA9IGJsYWNrbGlzdCh0aGlzLnByb3BzLCAnc2VsZWN0ZWQnKTtcblxuXHRcdHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KFRhcHBhYmxlLCBfZXh0ZW5kcyh7IGNsYXNzTmFtZTogY2xhc3NOYW1lIH0sIG90aGVyUHJvcHMpKTtcblx0fVxufSk7XG5cbmV4cG9ydHMuVGFiID0gVGFiO1xudmFyIExhYmVsID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXHRkaXNwbGF5TmFtZTogJ0xhYmVsJyxcblxuXHRyZW5kZXI6IGZ1bmN0aW9uIHJlbmRlcigpIHtcblx0XHRyZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudCgnZGl2JywgX2V4dGVuZHMoeyBjbGFzc05hbWU6ICdUYWJzLUxhYmVsJyB9LCB0aGlzLnByb3BzKSk7XG5cdH1cbn0pO1xuZXhwb3J0cy5MYWJlbCA9IExhYmVsOyIsIid1c2Ugc3RyaWN0JztcblxudmFyIF9leHRlbmRzID0gT2JqZWN0LmFzc2lnbiB8fCBmdW5jdGlvbiAodGFyZ2V0KSB7IGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7IHZhciBzb3VyY2UgPSBhcmd1bWVudHNbaV07IGZvciAodmFyIGtleSBpbiBzb3VyY2UpIHsgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzb3VyY2UsIGtleSkpIHsgdGFyZ2V0W2tleV0gPSBzb3VyY2Vba2V5XTsgfSB9IH0gcmV0dXJuIHRhcmdldDsgfTtcblxudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QvYWRkb25zJyk7XG5cbnZhciBJdGVtID0gcmVxdWlyZSgnLi9JdGVtJyk7XG52YXIgSXRlbUNvbnRlbnQgPSByZXF1aXJlKCcuL0l0ZW1Db250ZW50Jyk7XG52YXIgSXRlbUlubmVyID0gcmVxdWlyZSgnLi9JdGVtSW5uZXInKTtcblxudmFyIGJsYWNrbGlzdCA9IHJlcXVpcmUoJ2JsYWNrbGlzdCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblx0ZGlzcGxheU5hbWU6ICdJbnB1dCcsXG5cdHByb3BUeXBlczoge1xuXHRcdGNsYXNzTmFtZTogUmVhY3QuUHJvcFR5cGVzLnN0cmluZyxcblx0XHRjaGlsZHJlbjogUmVhY3QuUHJvcFR5cGVzLm5vZGUsXG5cdFx0ZGlzYWJsZWQ6IFJlYWN0LlByb3BUeXBlcy5ib29sXG5cdH0sXG5cblx0cmVuZGVyOiBmdW5jdGlvbiByZW5kZXIoKSB7XG5cdFx0dmFyIGlucHV0UHJvcHMgPSBibGFja2xpc3QodGhpcy5wcm9wcywgJ2NoaWxkcmVuJywgJ2NsYXNzTmFtZScpO1xuXG5cdFx0cmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG5cdFx0XHRJdGVtLFxuXHRcdFx0eyBzZWxlY3RhYmxlOiB0aGlzLnByb3BzLmRpc2FibGVkLCBjbGFzc05hbWU6IHRoaXMucHJvcHMuY2xhc3NOYW1lLCBjb21wb25lbnQ6ICdsYWJlbCcgfSxcblx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG5cdFx0XHRcdEl0ZW1Jbm5lcixcblx0XHRcdFx0bnVsbCxcblx0XHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChcblx0XHRcdFx0XHRJdGVtQ29udGVudCxcblx0XHRcdFx0XHR7IGNvbXBvbmVudDogJ2xhYmVsJyB9LFxuXHRcdFx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoJ3RleHRhcmVhJywgX2V4dGVuZHMoeyBjbGFzc05hbWU6ICdmaWVsZCcsIHJvd3M6IDMgfSwgaW5wdXRQcm9wcykpXG5cdFx0XHRcdCksXG5cdFx0XHRcdHRoaXMucHJvcHMuY2hpbGRyZW5cblx0XHRcdClcblx0XHQpO1xuXHR9XG59KTsiLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xudmFyIEFsZXJ0YmFyID0gcmVxdWlyZSgnLi9BbGVydGJhcicpO1xuZXhwb3J0cy5BbGVydGJhciA9IEFsZXJ0YmFyO1xudmFyIEJ1dHRvbiA9IHJlcXVpcmUoJy4vQnV0dG9uJyk7XG5leHBvcnRzLkJ1dHRvbiA9IEJ1dHRvbjtcbnZhciBCdXR0b25Hcm91cCA9IHJlcXVpcmUoJy4vQnV0dG9uR3JvdXAnKTtcbmV4cG9ydHMuQnV0dG9uR3JvdXAgPSBCdXR0b25Hcm91cDtcbnZhciBGaWVsZENvbnRyb2wgPSByZXF1aXJlKCcuL0ZpZWxkQ29udHJvbCcpO1xuZXhwb3J0cy5GaWVsZENvbnRyb2wgPSBGaWVsZENvbnRyb2w7XG52YXIgRmllbGRMYWJlbCA9IHJlcXVpcmUoJy4vRmllbGRMYWJlbCcpO1xuZXhwb3J0cy5GaWVsZExhYmVsID0gRmllbGRMYWJlbDtcbnZhciBHcm91cCA9IHJlcXVpcmUoJy4vR3JvdXAnKTtcbmV4cG9ydHMuR3JvdXAgPSBHcm91cDtcbnZhciBHcm91cEJvZHkgPSByZXF1aXJlKCcuL0dyb3VwQm9keScpO1xuZXhwb3J0cy5Hcm91cEJvZHkgPSBHcm91cEJvZHk7XG52YXIgR3JvdXBGb290ZXIgPSByZXF1aXJlKCcuL0dyb3VwRm9vdGVyJyk7XG5leHBvcnRzLkdyb3VwRm9vdGVyID0gR3JvdXBGb290ZXI7XG52YXIgR3JvdXBIZWFkZXIgPSByZXF1aXJlKCcuL0dyb3VwSGVhZGVyJyk7XG5leHBvcnRzLkdyb3VwSGVhZGVyID0gR3JvdXBIZWFkZXI7XG52YXIgSXRlbSA9IHJlcXVpcmUoJy4vSXRlbScpO1xuZXhwb3J0cy5JdGVtID0gSXRlbTtcbnZhciBJdGVtQ29udGVudCA9IHJlcXVpcmUoJy4vSXRlbUNvbnRlbnQnKTtcbmV4cG9ydHMuSXRlbUNvbnRlbnQgPSBJdGVtQ29udGVudDtcbnZhciBJdGVtSW5uZXIgPSByZXF1aXJlKCcuL0l0ZW1Jbm5lcicpO1xuZXhwb3J0cy5JdGVtSW5uZXIgPSBJdGVtSW5uZXI7XG52YXIgSXRlbU1lZGlhID0gcmVxdWlyZSgnLi9JdGVtTWVkaWEnKTtcbmV4cG9ydHMuSXRlbU1lZGlhID0gSXRlbU1lZGlhO1xudmFyIEl0ZW1Ob3RlID0gcmVxdWlyZSgnLi9JdGVtTm90ZScpO1xuZXhwb3J0cy5JdGVtTm90ZSA9IEl0ZW1Ob3RlO1xudmFyIEl0ZW1TdWJUaXRsZSA9IHJlcXVpcmUoJy4vSXRlbVN1YlRpdGxlJyk7XG5leHBvcnRzLkl0ZW1TdWJUaXRsZSA9IEl0ZW1TdWJUaXRsZTtcbnZhciBJdGVtVGl0bGUgPSByZXF1aXJlKCcuL0l0ZW1UaXRsZScpO1xuZXhwb3J0cy5JdGVtVGl0bGUgPSBJdGVtVGl0bGU7XG52YXIgTGFiZWxJbnB1dCA9IHJlcXVpcmUoJy4vTGFiZWxJbnB1dCcpO1xuZXhwb3J0cy5MYWJlbElucHV0ID0gTGFiZWxJbnB1dDtcbnZhciBMYWJlbFNlbGVjdCA9IHJlcXVpcmUoJy4vTGFiZWxTZWxlY3QnKTtcbmV4cG9ydHMuTGFiZWxTZWxlY3QgPSBMYWJlbFNlbGVjdDtcbnZhciBMYWJlbFRleHRhcmVhID0gcmVxdWlyZSgnLi9MYWJlbFRleHRhcmVhJyk7XG5leHBvcnRzLkxhYmVsVGV4dGFyZWEgPSBMYWJlbFRleHRhcmVhO1xudmFyIExpc3RIZWFkZXIgPSByZXF1aXJlKCcuL0xpc3RIZWFkZXInKTtcbmV4cG9ydHMuTGlzdEhlYWRlciA9IExpc3RIZWFkZXI7XG52YXIgTmF2aWdhdGlvbkJhciA9IHJlcXVpcmUoJy4vTmF2aWdhdGlvbkJhcicpO1xuZXhwb3J0cy5OYXZpZ2F0aW9uQmFyID0gTmF2aWdhdGlvbkJhcjtcbnZhciBQb3B1cCA9IHJlcXVpcmUoJy4vUG9wdXAnKTtcbmV4cG9ydHMuUG9wdXAgPSBQb3B1cDtcbnZhciBQb3B1cEljb24gPSByZXF1aXJlKCcuL1BvcHVwSWNvbicpO1xuZXhwb3J0cy5Qb3B1cEljb24gPSBQb3B1cEljb247XG52YXIgUmFkaW9MaXN0ID0gcmVxdWlyZSgnLi9SYWRpb0xpc3QnKTtcbmV4cG9ydHMuUmFkaW9MaXN0ID0gUmFkaW9MaXN0O1xudmFyIFNlZ21lbnRlZENvbnRyb2wgPSByZXF1aXJlKCcuL1NlZ21lbnRlZENvbnRyb2wnKTtcbmV4cG9ydHMuU2VnbWVudGVkQ29udHJvbCA9IFNlZ21lbnRlZENvbnRyb2w7XG52YXIgU3dpdGNoID0gcmVxdWlyZSgnLi9Td2l0Y2gnKTtcbmV4cG9ydHMuU3dpdGNoID0gU3dpdGNoO1xudmFyIFRhYnMgPSByZXF1aXJlKCcuL1RhYnMnKTtcbmV4cG9ydHMuVGFicyA9IFRhYnM7XG52YXIgVGV4dGFyZWEgPSByZXF1aXJlKCcuL1RleHRhcmVhJyk7XG5cbmV4cG9ydHMuVGV4dGFyZWEgPSBUZXh0YXJlYTtcbi8vIGRlcGVuZHMgb24gYWJvdmVcbnZhciBJbnB1dCA9IHJlcXVpcmUoJy4vSW5wdXQnKTtcbmV4cG9ydHMuSW5wdXQgPSBJbnB1dDsiLCIvKipcbiAqIFR3ZWVuLmpzIC0gTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlXG4gKiBodHRwczovL2dpdGh1Yi5jb20vc29sZS90d2Vlbi5qc1xuICogLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICpcbiAqIFNlZSBodHRwczovL2dpdGh1Yi5jb20vc29sZS90d2Vlbi5qcy9ncmFwaHMvY29udHJpYnV0b3JzIGZvciB0aGUgZnVsbCBsaXN0IG9mIGNvbnRyaWJ1dG9ycy5cbiAqIFRoYW5rIHlvdSBhbGwsIHlvdSdyZSBhd2Vzb21lIVxuICovXG5cbi8vIERhdGUubm93IHNoaW0gZm9yIChhaGVtKSBJbnRlcm5ldCBFeHBsbyhkfHIpZXJcbmlmICggRGF0ZS5ub3cgPT09IHVuZGVmaW5lZCApIHtcblxuXHREYXRlLm5vdyA9IGZ1bmN0aW9uICgpIHtcblxuXHRcdHJldHVybiBuZXcgRGF0ZSgpLnZhbHVlT2YoKTtcblxuXHR9O1xuXG59XG5cbnZhciBUV0VFTiA9IFRXRUVOIHx8ICggZnVuY3Rpb24gKCkge1xuXG5cdHZhciBfdHdlZW5zID0gW107XG5cblx0cmV0dXJuIHtcblxuXHRcdFJFVklTSU9OOiAnMTQnLFxuXG5cdFx0Z2V0QWxsOiBmdW5jdGlvbiAoKSB7XG5cblx0XHRcdHJldHVybiBfdHdlZW5zO1xuXG5cdFx0fSxcblxuXHRcdHJlbW92ZUFsbDogZnVuY3Rpb24gKCkge1xuXG5cdFx0XHRfdHdlZW5zID0gW107XG5cblx0XHR9LFxuXG5cdFx0YWRkOiBmdW5jdGlvbiAoIHR3ZWVuICkge1xuXG5cdFx0XHRfdHdlZW5zLnB1c2goIHR3ZWVuICk7XG5cblx0XHR9LFxuXG5cdFx0cmVtb3ZlOiBmdW5jdGlvbiAoIHR3ZWVuICkge1xuXG5cdFx0XHR2YXIgaSA9IF90d2VlbnMuaW5kZXhPZiggdHdlZW4gKTtcblxuXHRcdFx0aWYgKCBpICE9PSAtMSApIHtcblxuXHRcdFx0XHRfdHdlZW5zLnNwbGljZSggaSwgMSApO1xuXG5cdFx0XHR9XG5cblx0XHR9LFxuXG5cdFx0dXBkYXRlOiBmdW5jdGlvbiAoIHRpbWUgKSB7XG5cblx0XHRcdGlmICggX3R3ZWVucy5sZW5ndGggPT09IDAgKSByZXR1cm4gZmFsc2U7XG5cblx0XHRcdHZhciBpID0gMDtcblxuXHRcdFx0dGltZSA9IHRpbWUgIT09IHVuZGVmaW5lZCA/IHRpbWUgOiAoIHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICYmIHdpbmRvdy5wZXJmb3JtYW5jZSAhPT0gdW5kZWZpbmVkICYmIHdpbmRvdy5wZXJmb3JtYW5jZS5ub3cgIT09IHVuZGVmaW5lZCA/IHdpbmRvdy5wZXJmb3JtYW5jZS5ub3coKSA6IERhdGUubm93KCkgKTtcblxuXHRcdFx0d2hpbGUgKCBpIDwgX3R3ZWVucy5sZW5ndGggKSB7XG5cblx0XHRcdFx0aWYgKCBfdHdlZW5zWyBpIF0udXBkYXRlKCB0aW1lICkgKSB7XG5cblx0XHRcdFx0XHRpKys7XG5cblx0XHRcdFx0fSBlbHNlIHtcblxuXHRcdFx0XHRcdF90d2VlbnMuc3BsaWNlKCBpLCAxICk7XG5cblx0XHRcdFx0fVxuXG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiB0cnVlO1xuXG5cdFx0fVxuXHR9O1xuXG59ICkoKTtcblxuVFdFRU4uVHdlZW4gPSBmdW5jdGlvbiAoIG9iamVjdCApIHtcblxuXHR2YXIgX29iamVjdCA9IG9iamVjdDtcblx0dmFyIF92YWx1ZXNTdGFydCA9IHt9O1xuXHR2YXIgX3ZhbHVlc0VuZCA9IHt9O1xuXHR2YXIgX3ZhbHVlc1N0YXJ0UmVwZWF0ID0ge307XG5cdHZhciBfZHVyYXRpb24gPSAxMDAwO1xuXHR2YXIgX3JlcGVhdCA9IDA7XG5cdHZhciBfeW95byA9IGZhbHNlO1xuXHR2YXIgX2lzUGxheWluZyA9IGZhbHNlO1xuXHR2YXIgX3JldmVyc2VkID0gZmFsc2U7XG5cdHZhciBfZGVsYXlUaW1lID0gMDtcblx0dmFyIF9zdGFydFRpbWUgPSBudWxsO1xuXHR2YXIgX2Vhc2luZ0Z1bmN0aW9uID0gVFdFRU4uRWFzaW5nLkxpbmVhci5Ob25lO1xuXHR2YXIgX2ludGVycG9sYXRpb25GdW5jdGlvbiA9IFRXRUVOLkludGVycG9sYXRpb24uTGluZWFyO1xuXHR2YXIgX2NoYWluZWRUd2VlbnMgPSBbXTtcblx0dmFyIF9vblN0YXJ0Q2FsbGJhY2sgPSBudWxsO1xuXHR2YXIgX29uU3RhcnRDYWxsYmFja0ZpcmVkID0gZmFsc2U7XG5cdHZhciBfb25VcGRhdGVDYWxsYmFjayA9IG51bGw7XG5cdHZhciBfb25Db21wbGV0ZUNhbGxiYWNrID0gbnVsbDtcblx0dmFyIF9vblN0b3BDYWxsYmFjayA9IG51bGw7XG5cblx0Ly8gU2V0IGFsbCBzdGFydGluZyB2YWx1ZXMgcHJlc2VudCBvbiB0aGUgdGFyZ2V0IG9iamVjdFxuXHRmb3IgKCB2YXIgZmllbGQgaW4gb2JqZWN0ICkge1xuXG5cdFx0X3ZhbHVlc1N0YXJ0WyBmaWVsZCBdID0gcGFyc2VGbG9hdChvYmplY3RbZmllbGRdLCAxMCk7XG5cblx0fVxuXG5cdHRoaXMudG8gPSBmdW5jdGlvbiAoIHByb3BlcnRpZXMsIGR1cmF0aW9uICkge1xuXG5cdFx0aWYgKCBkdXJhdGlvbiAhPT0gdW5kZWZpbmVkICkge1xuXG5cdFx0XHRfZHVyYXRpb24gPSBkdXJhdGlvbjtcblxuXHRcdH1cblxuXHRcdF92YWx1ZXNFbmQgPSBwcm9wZXJ0aWVzO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fTtcblxuXHR0aGlzLnN0YXJ0ID0gZnVuY3Rpb24gKCB0aW1lICkge1xuXG5cdFx0VFdFRU4uYWRkKCB0aGlzICk7XG5cblx0XHRfaXNQbGF5aW5nID0gdHJ1ZTtcblxuXHRcdF9vblN0YXJ0Q2FsbGJhY2tGaXJlZCA9IGZhbHNlO1xuXG5cdFx0X3N0YXJ0VGltZSA9IHRpbWUgIT09IHVuZGVmaW5lZCA/IHRpbWUgOiAoIHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICYmIHdpbmRvdy5wZXJmb3JtYW5jZSAhPT0gdW5kZWZpbmVkICYmIHdpbmRvdy5wZXJmb3JtYW5jZS5ub3cgIT09IHVuZGVmaW5lZCA/IHdpbmRvdy5wZXJmb3JtYW5jZS5ub3coKSA6IERhdGUubm93KCkgKTtcblx0XHRfc3RhcnRUaW1lICs9IF9kZWxheVRpbWU7XG5cblx0XHRmb3IgKCB2YXIgcHJvcGVydHkgaW4gX3ZhbHVlc0VuZCApIHtcblxuXHRcdFx0Ly8gY2hlY2sgaWYgYW4gQXJyYXkgd2FzIHByb3ZpZGVkIGFzIHByb3BlcnR5IHZhbHVlXG5cdFx0XHRpZiAoIF92YWx1ZXNFbmRbIHByb3BlcnR5IF0gaW5zdGFuY2VvZiBBcnJheSApIHtcblxuXHRcdFx0XHRpZiAoIF92YWx1ZXNFbmRbIHByb3BlcnR5IF0ubGVuZ3RoID09PSAwICkge1xuXG5cdFx0XHRcdFx0Y29udGludWU7XG5cblx0XHRcdFx0fVxuXG5cdFx0XHRcdC8vIGNyZWF0ZSBhIGxvY2FsIGNvcHkgb2YgdGhlIEFycmF5IHdpdGggdGhlIHN0YXJ0IHZhbHVlIGF0IHRoZSBmcm9udFxuXHRcdFx0XHRfdmFsdWVzRW5kWyBwcm9wZXJ0eSBdID0gWyBfb2JqZWN0WyBwcm9wZXJ0eSBdIF0uY29uY2F0KCBfdmFsdWVzRW5kWyBwcm9wZXJ0eSBdICk7XG5cblx0XHRcdH1cblxuXHRcdFx0X3ZhbHVlc1N0YXJ0WyBwcm9wZXJ0eSBdID0gX29iamVjdFsgcHJvcGVydHkgXTtcblxuXHRcdFx0aWYoICggX3ZhbHVlc1N0YXJ0WyBwcm9wZXJ0eSBdIGluc3RhbmNlb2YgQXJyYXkgKSA9PT0gZmFsc2UgKSB7XG5cdFx0XHRcdF92YWx1ZXNTdGFydFsgcHJvcGVydHkgXSAqPSAxLjA7IC8vIEVuc3VyZXMgd2UncmUgdXNpbmcgbnVtYmVycywgbm90IHN0cmluZ3Ncblx0XHRcdH1cblxuXHRcdFx0X3ZhbHVlc1N0YXJ0UmVwZWF0WyBwcm9wZXJ0eSBdID0gX3ZhbHVlc1N0YXJ0WyBwcm9wZXJ0eSBdIHx8IDA7XG5cblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9O1xuXG5cdHRoaXMuc3RvcCA9IGZ1bmN0aW9uICgpIHtcblxuXHRcdGlmICggIV9pc1BsYXlpbmcgKSB7XG5cdFx0XHRyZXR1cm4gdGhpcztcblx0XHR9XG5cblx0XHRUV0VFTi5yZW1vdmUoIHRoaXMgKTtcblx0XHRfaXNQbGF5aW5nID0gZmFsc2U7XG5cblx0XHRpZiAoIF9vblN0b3BDYWxsYmFjayAhPT0gbnVsbCApIHtcblxuXHRcdFx0X29uU3RvcENhbGxiYWNrLmNhbGwoIF9vYmplY3QgKTtcblxuXHRcdH1cblxuXHRcdHRoaXMuc3RvcENoYWluZWRUd2VlbnMoKTtcblx0XHRyZXR1cm4gdGhpcztcblxuXHR9O1xuXG5cdHRoaXMuc3RvcENoYWluZWRUd2VlbnMgPSBmdW5jdGlvbiAoKSB7XG5cblx0XHRmb3IgKCB2YXIgaSA9IDAsIG51bUNoYWluZWRUd2VlbnMgPSBfY2hhaW5lZFR3ZWVucy5sZW5ndGg7IGkgPCBudW1DaGFpbmVkVHdlZW5zOyBpKysgKSB7XG5cblx0XHRcdF9jaGFpbmVkVHdlZW5zWyBpIF0uc3RvcCgpO1xuXG5cdFx0fVxuXG5cdH07XG5cblx0dGhpcy5kZWxheSA9IGZ1bmN0aW9uICggYW1vdW50ICkge1xuXG5cdFx0X2RlbGF5VGltZSA9IGFtb3VudDtcblx0XHRyZXR1cm4gdGhpcztcblxuXHR9O1xuXG5cdHRoaXMucmVwZWF0ID0gZnVuY3Rpb24gKCB0aW1lcyApIHtcblxuXHRcdF9yZXBlYXQgPSB0aW1lcztcblx0XHRyZXR1cm4gdGhpcztcblxuXHR9O1xuXG5cdHRoaXMueW95byA9IGZ1bmN0aW9uKCB5b3lvICkge1xuXG5cdFx0X3lveW8gPSB5b3lvO1xuXHRcdHJldHVybiB0aGlzO1xuXG5cdH07XG5cblxuXHR0aGlzLmVhc2luZyA9IGZ1bmN0aW9uICggZWFzaW5nICkge1xuXG5cdFx0X2Vhc2luZ0Z1bmN0aW9uID0gZWFzaW5nO1xuXHRcdHJldHVybiB0aGlzO1xuXG5cdH07XG5cblx0dGhpcy5pbnRlcnBvbGF0aW9uID0gZnVuY3Rpb24gKCBpbnRlcnBvbGF0aW9uICkge1xuXG5cdFx0X2ludGVycG9sYXRpb25GdW5jdGlvbiA9IGludGVycG9sYXRpb247XG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fTtcblxuXHR0aGlzLmNoYWluID0gZnVuY3Rpb24gKCkge1xuXG5cdFx0X2NoYWluZWRUd2VlbnMgPSBhcmd1bWVudHM7XG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fTtcblxuXHR0aGlzLm9uU3RhcnQgPSBmdW5jdGlvbiAoIGNhbGxiYWNrICkge1xuXG5cdFx0X29uU3RhcnRDYWxsYmFjayA9IGNhbGxiYWNrO1xuXHRcdHJldHVybiB0aGlzO1xuXG5cdH07XG5cblx0dGhpcy5vblVwZGF0ZSA9IGZ1bmN0aW9uICggY2FsbGJhY2sgKSB7XG5cblx0XHRfb25VcGRhdGVDYWxsYmFjayA9IGNhbGxiYWNrO1xuXHRcdHJldHVybiB0aGlzO1xuXG5cdH07XG5cblx0dGhpcy5vbkNvbXBsZXRlID0gZnVuY3Rpb24gKCBjYWxsYmFjayApIHtcblxuXHRcdF9vbkNvbXBsZXRlQ2FsbGJhY2sgPSBjYWxsYmFjaztcblx0XHRyZXR1cm4gdGhpcztcblxuXHR9O1xuXG5cdHRoaXMub25TdG9wID0gZnVuY3Rpb24gKCBjYWxsYmFjayApIHtcblxuXHRcdF9vblN0b3BDYWxsYmFjayA9IGNhbGxiYWNrO1xuXHRcdHJldHVybiB0aGlzO1xuXG5cdH07XG5cblx0dGhpcy51cGRhdGUgPSBmdW5jdGlvbiAoIHRpbWUgKSB7XG5cblx0XHR2YXIgcHJvcGVydHk7XG5cblx0XHRpZiAoIHRpbWUgPCBfc3RhcnRUaW1lICkge1xuXG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblxuXHRcdH1cblxuXHRcdGlmICggX29uU3RhcnRDYWxsYmFja0ZpcmVkID09PSBmYWxzZSApIHtcblxuXHRcdFx0aWYgKCBfb25TdGFydENhbGxiYWNrICE9PSBudWxsICkge1xuXG5cdFx0XHRcdF9vblN0YXJ0Q2FsbGJhY2suY2FsbCggX29iamVjdCApO1xuXG5cdFx0XHR9XG5cblx0XHRcdF9vblN0YXJ0Q2FsbGJhY2tGaXJlZCA9IHRydWU7XG5cblx0XHR9XG5cblx0XHR2YXIgZWxhcHNlZCA9ICggdGltZSAtIF9zdGFydFRpbWUgKSAvIF9kdXJhdGlvbjtcblx0XHRlbGFwc2VkID0gZWxhcHNlZCA+IDEgPyAxIDogZWxhcHNlZDtcblxuXHRcdHZhciB2YWx1ZSA9IF9lYXNpbmdGdW5jdGlvbiggZWxhcHNlZCApO1xuXG5cdFx0Zm9yICggcHJvcGVydHkgaW4gX3ZhbHVlc0VuZCApIHtcblxuXHRcdFx0dmFyIHN0YXJ0ID0gX3ZhbHVlc1N0YXJ0WyBwcm9wZXJ0eSBdIHx8IDA7XG5cdFx0XHR2YXIgZW5kID0gX3ZhbHVlc0VuZFsgcHJvcGVydHkgXTtcblxuXHRcdFx0aWYgKCBlbmQgaW5zdGFuY2VvZiBBcnJheSApIHtcblxuXHRcdFx0XHRfb2JqZWN0WyBwcm9wZXJ0eSBdID0gX2ludGVycG9sYXRpb25GdW5jdGlvbiggZW5kLCB2YWx1ZSApO1xuXG5cdFx0XHR9IGVsc2Uge1xuXG5cdFx0XHRcdC8vIFBhcnNlcyByZWxhdGl2ZSBlbmQgdmFsdWVzIHdpdGggc3RhcnQgYXMgYmFzZSAoZS5nLjogKzEwLCAtMylcblx0XHRcdFx0aWYgKCB0eXBlb2YoZW5kKSA9PT0gXCJzdHJpbmdcIiApIHtcblx0XHRcdFx0XHRlbmQgPSBzdGFydCArIHBhcnNlRmxvYXQoZW5kLCAxMCk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHQvLyBwcm90ZWN0IGFnYWluc3Qgbm9uIG51bWVyaWMgcHJvcGVydGllcy5cblx0XHRcdFx0aWYgKCB0eXBlb2YoZW5kKSA9PT0gXCJudW1iZXJcIiApIHtcblx0XHRcdFx0XHRfb2JqZWN0WyBwcm9wZXJ0eSBdID0gc3RhcnQgKyAoIGVuZCAtIHN0YXJ0ICkgKiB2YWx1ZTtcblx0XHRcdFx0fVxuXG5cdFx0XHR9XG5cblx0XHR9XG5cblx0XHRpZiAoIF9vblVwZGF0ZUNhbGxiYWNrICE9PSBudWxsICkge1xuXG5cdFx0XHRfb25VcGRhdGVDYWxsYmFjay5jYWxsKCBfb2JqZWN0LCB2YWx1ZSApO1xuXG5cdFx0fVxuXG5cdFx0aWYgKCBlbGFwc2VkID09IDEgKSB7XG5cblx0XHRcdGlmICggX3JlcGVhdCA+IDAgKSB7XG5cblx0XHRcdFx0aWYoIGlzRmluaXRlKCBfcmVwZWF0ICkgKSB7XG5cdFx0XHRcdFx0X3JlcGVhdC0tO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Ly8gcmVhc3NpZ24gc3RhcnRpbmcgdmFsdWVzLCByZXN0YXJ0IGJ5IG1ha2luZyBzdGFydFRpbWUgPSBub3dcblx0XHRcdFx0Zm9yKCBwcm9wZXJ0eSBpbiBfdmFsdWVzU3RhcnRSZXBlYXQgKSB7XG5cblx0XHRcdFx0XHRpZiAoIHR5cGVvZiggX3ZhbHVlc0VuZFsgcHJvcGVydHkgXSApID09PSBcInN0cmluZ1wiICkge1xuXHRcdFx0XHRcdFx0X3ZhbHVlc1N0YXJ0UmVwZWF0WyBwcm9wZXJ0eSBdID0gX3ZhbHVlc1N0YXJ0UmVwZWF0WyBwcm9wZXJ0eSBdICsgcGFyc2VGbG9hdChfdmFsdWVzRW5kWyBwcm9wZXJ0eSBdLCAxMCk7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0aWYgKF95b3lvKSB7XG5cdFx0XHRcdFx0XHR2YXIgdG1wID0gX3ZhbHVlc1N0YXJ0UmVwZWF0WyBwcm9wZXJ0eSBdO1xuXHRcdFx0XHRcdFx0X3ZhbHVlc1N0YXJ0UmVwZWF0WyBwcm9wZXJ0eSBdID0gX3ZhbHVlc0VuZFsgcHJvcGVydHkgXTtcblx0XHRcdFx0XHRcdF92YWx1ZXNFbmRbIHByb3BlcnR5IF0gPSB0bXA7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0X3ZhbHVlc1N0YXJ0WyBwcm9wZXJ0eSBdID0gX3ZhbHVlc1N0YXJ0UmVwZWF0WyBwcm9wZXJ0eSBdO1xuXG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiAoX3lveW8pIHtcblx0XHRcdFx0XHRfcmV2ZXJzZWQgPSAhX3JldmVyc2VkO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0X3N0YXJ0VGltZSA9IHRpbWUgKyBfZGVsYXlUaW1lO1xuXG5cdFx0XHRcdHJldHVybiB0cnVlO1xuXG5cdFx0XHR9IGVsc2Uge1xuXG5cdFx0XHRcdGlmICggX29uQ29tcGxldGVDYWxsYmFjayAhPT0gbnVsbCApIHtcblxuXHRcdFx0XHRcdF9vbkNvbXBsZXRlQ2FsbGJhY2suY2FsbCggX29iamVjdCApO1xuXG5cdFx0XHRcdH1cblxuXHRcdFx0XHRmb3IgKCB2YXIgaSA9IDAsIG51bUNoYWluZWRUd2VlbnMgPSBfY2hhaW5lZFR3ZWVucy5sZW5ndGg7IGkgPCBudW1DaGFpbmVkVHdlZW5zOyBpKysgKSB7XG5cblx0XHRcdFx0XHRfY2hhaW5lZFR3ZWVuc1sgaSBdLnN0YXJ0KCB0aW1lICk7XG5cblx0XHRcdFx0fVxuXG5cdFx0XHRcdHJldHVybiBmYWxzZTtcblxuXHRcdFx0fVxuXG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRydWU7XG5cblx0fTtcblxufTtcblxuXG5UV0VFTi5FYXNpbmcgPSB7XG5cblx0TGluZWFyOiB7XG5cblx0XHROb25lOiBmdW5jdGlvbiAoIGsgKSB7XG5cblx0XHRcdHJldHVybiBrO1xuXG5cdFx0fVxuXG5cdH0sXG5cblx0UXVhZHJhdGljOiB7XG5cblx0XHRJbjogZnVuY3Rpb24gKCBrICkge1xuXG5cdFx0XHRyZXR1cm4gayAqIGs7XG5cblx0XHR9LFxuXG5cdFx0T3V0OiBmdW5jdGlvbiAoIGsgKSB7XG5cblx0XHRcdHJldHVybiBrICogKCAyIC0gayApO1xuXG5cdFx0fSxcblxuXHRcdEluT3V0OiBmdW5jdGlvbiAoIGsgKSB7XG5cblx0XHRcdGlmICggKCBrICo9IDIgKSA8IDEgKSByZXR1cm4gMC41ICogayAqIGs7XG5cdFx0XHRyZXR1cm4gLSAwLjUgKiAoIC0tayAqICggayAtIDIgKSAtIDEgKTtcblxuXHRcdH1cblxuXHR9LFxuXG5cdEN1YmljOiB7XG5cblx0XHRJbjogZnVuY3Rpb24gKCBrICkge1xuXG5cdFx0XHRyZXR1cm4gayAqIGsgKiBrO1xuXG5cdFx0fSxcblxuXHRcdE91dDogZnVuY3Rpb24gKCBrICkge1xuXG5cdFx0XHRyZXR1cm4gLS1rICogayAqIGsgKyAxO1xuXG5cdFx0fSxcblxuXHRcdEluT3V0OiBmdW5jdGlvbiAoIGsgKSB7XG5cblx0XHRcdGlmICggKCBrICo9IDIgKSA8IDEgKSByZXR1cm4gMC41ICogayAqIGsgKiBrO1xuXHRcdFx0cmV0dXJuIDAuNSAqICggKCBrIC09IDIgKSAqIGsgKiBrICsgMiApO1xuXG5cdFx0fVxuXG5cdH0sXG5cblx0UXVhcnRpYzoge1xuXG5cdFx0SW46IGZ1bmN0aW9uICggayApIHtcblxuXHRcdFx0cmV0dXJuIGsgKiBrICogayAqIGs7XG5cblx0XHR9LFxuXG5cdFx0T3V0OiBmdW5jdGlvbiAoIGsgKSB7XG5cblx0XHRcdHJldHVybiAxIC0gKCAtLWsgKiBrICogayAqIGsgKTtcblxuXHRcdH0sXG5cblx0XHRJbk91dDogZnVuY3Rpb24gKCBrICkge1xuXG5cdFx0XHRpZiAoICggayAqPSAyICkgPCAxKSByZXR1cm4gMC41ICogayAqIGsgKiBrICogaztcblx0XHRcdHJldHVybiAtIDAuNSAqICggKCBrIC09IDIgKSAqIGsgKiBrICogayAtIDIgKTtcblxuXHRcdH1cblxuXHR9LFxuXG5cdFF1aW50aWM6IHtcblxuXHRcdEluOiBmdW5jdGlvbiAoIGsgKSB7XG5cblx0XHRcdHJldHVybiBrICogayAqIGsgKiBrICogaztcblxuXHRcdH0sXG5cblx0XHRPdXQ6IGZ1bmN0aW9uICggayApIHtcblxuXHRcdFx0cmV0dXJuIC0tayAqIGsgKiBrICogayAqIGsgKyAxO1xuXG5cdFx0fSxcblxuXHRcdEluT3V0OiBmdW5jdGlvbiAoIGsgKSB7XG5cblx0XHRcdGlmICggKCBrICo9IDIgKSA8IDEgKSByZXR1cm4gMC41ICogayAqIGsgKiBrICogayAqIGs7XG5cdFx0XHRyZXR1cm4gMC41ICogKCAoIGsgLT0gMiApICogayAqIGsgKiBrICogayArIDIgKTtcblxuXHRcdH1cblxuXHR9LFxuXG5cdFNpbnVzb2lkYWw6IHtcblxuXHRcdEluOiBmdW5jdGlvbiAoIGsgKSB7XG5cblx0XHRcdHJldHVybiAxIC0gTWF0aC5jb3MoIGsgKiBNYXRoLlBJIC8gMiApO1xuXG5cdFx0fSxcblxuXHRcdE91dDogZnVuY3Rpb24gKCBrICkge1xuXG5cdFx0XHRyZXR1cm4gTWF0aC5zaW4oIGsgKiBNYXRoLlBJIC8gMiApO1xuXG5cdFx0fSxcblxuXHRcdEluT3V0OiBmdW5jdGlvbiAoIGsgKSB7XG5cblx0XHRcdHJldHVybiAwLjUgKiAoIDEgLSBNYXRoLmNvcyggTWF0aC5QSSAqIGsgKSApO1xuXG5cdFx0fVxuXG5cdH0sXG5cblx0RXhwb25lbnRpYWw6IHtcblxuXHRcdEluOiBmdW5jdGlvbiAoIGsgKSB7XG5cblx0XHRcdHJldHVybiBrID09PSAwID8gMCA6IE1hdGgucG93KCAxMDI0LCBrIC0gMSApO1xuXG5cdFx0fSxcblxuXHRcdE91dDogZnVuY3Rpb24gKCBrICkge1xuXG5cdFx0XHRyZXR1cm4gayA9PT0gMSA/IDEgOiAxIC0gTWF0aC5wb3coIDIsIC0gMTAgKiBrICk7XG5cblx0XHR9LFxuXG5cdFx0SW5PdXQ6IGZ1bmN0aW9uICggayApIHtcblxuXHRcdFx0aWYgKCBrID09PSAwICkgcmV0dXJuIDA7XG5cdFx0XHRpZiAoIGsgPT09IDEgKSByZXR1cm4gMTtcblx0XHRcdGlmICggKCBrICo9IDIgKSA8IDEgKSByZXR1cm4gMC41ICogTWF0aC5wb3coIDEwMjQsIGsgLSAxICk7XG5cdFx0XHRyZXR1cm4gMC41ICogKCAtIE1hdGgucG93KCAyLCAtIDEwICogKCBrIC0gMSApICkgKyAyICk7XG5cblx0XHR9XG5cblx0fSxcblxuXHRDaXJjdWxhcjoge1xuXG5cdFx0SW46IGZ1bmN0aW9uICggayApIHtcblxuXHRcdFx0cmV0dXJuIDEgLSBNYXRoLnNxcnQoIDEgLSBrICogayApO1xuXG5cdFx0fSxcblxuXHRcdE91dDogZnVuY3Rpb24gKCBrICkge1xuXG5cdFx0XHRyZXR1cm4gTWF0aC5zcXJ0KCAxIC0gKCAtLWsgKiBrICkgKTtcblxuXHRcdH0sXG5cblx0XHRJbk91dDogZnVuY3Rpb24gKCBrICkge1xuXG5cdFx0XHRpZiAoICggayAqPSAyICkgPCAxKSByZXR1cm4gLSAwLjUgKiAoIE1hdGguc3FydCggMSAtIGsgKiBrKSAtIDEpO1xuXHRcdFx0cmV0dXJuIDAuNSAqICggTWF0aC5zcXJ0KCAxIC0gKCBrIC09IDIpICogaykgKyAxKTtcblxuXHRcdH1cblxuXHR9LFxuXG5cdEVsYXN0aWM6IHtcblxuXHRcdEluOiBmdW5jdGlvbiAoIGsgKSB7XG5cblx0XHRcdHZhciBzLCBhID0gMC4xLCBwID0gMC40O1xuXHRcdFx0aWYgKCBrID09PSAwICkgcmV0dXJuIDA7XG5cdFx0XHRpZiAoIGsgPT09IDEgKSByZXR1cm4gMTtcblx0XHRcdGlmICggIWEgfHwgYSA8IDEgKSB7IGEgPSAxOyBzID0gcCAvIDQ7IH1cblx0XHRcdGVsc2UgcyA9IHAgKiBNYXRoLmFzaW4oIDEgLyBhICkgLyAoIDIgKiBNYXRoLlBJICk7XG5cdFx0XHRyZXR1cm4gLSAoIGEgKiBNYXRoLnBvdyggMiwgMTAgKiAoIGsgLT0gMSApICkgKiBNYXRoLnNpbiggKCBrIC0gcyApICogKCAyICogTWF0aC5QSSApIC8gcCApICk7XG5cblx0XHR9LFxuXG5cdFx0T3V0OiBmdW5jdGlvbiAoIGsgKSB7XG5cblx0XHRcdHZhciBzLCBhID0gMC4xLCBwID0gMC40O1xuXHRcdFx0aWYgKCBrID09PSAwICkgcmV0dXJuIDA7XG5cdFx0XHRpZiAoIGsgPT09IDEgKSByZXR1cm4gMTtcblx0XHRcdGlmICggIWEgfHwgYSA8IDEgKSB7IGEgPSAxOyBzID0gcCAvIDQ7IH1cblx0XHRcdGVsc2UgcyA9IHAgKiBNYXRoLmFzaW4oIDEgLyBhICkgLyAoIDIgKiBNYXRoLlBJICk7XG5cdFx0XHRyZXR1cm4gKCBhICogTWF0aC5wb3coIDIsIC0gMTAgKiBrKSAqIE1hdGguc2luKCAoIGsgLSBzICkgKiAoIDIgKiBNYXRoLlBJICkgLyBwICkgKyAxICk7XG5cblx0XHR9LFxuXG5cdFx0SW5PdXQ6IGZ1bmN0aW9uICggayApIHtcblxuXHRcdFx0dmFyIHMsIGEgPSAwLjEsIHAgPSAwLjQ7XG5cdFx0XHRpZiAoIGsgPT09IDAgKSByZXR1cm4gMDtcblx0XHRcdGlmICggayA9PT0gMSApIHJldHVybiAxO1xuXHRcdFx0aWYgKCAhYSB8fCBhIDwgMSApIHsgYSA9IDE7IHMgPSBwIC8gNDsgfVxuXHRcdFx0ZWxzZSBzID0gcCAqIE1hdGguYXNpbiggMSAvIGEgKSAvICggMiAqIE1hdGguUEkgKTtcblx0XHRcdGlmICggKCBrICo9IDIgKSA8IDEgKSByZXR1cm4gLSAwLjUgKiAoIGEgKiBNYXRoLnBvdyggMiwgMTAgKiAoIGsgLT0gMSApICkgKiBNYXRoLnNpbiggKCBrIC0gcyApICogKCAyICogTWF0aC5QSSApIC8gcCApICk7XG5cdFx0XHRyZXR1cm4gYSAqIE1hdGgucG93KCAyLCAtMTAgKiAoIGsgLT0gMSApICkgKiBNYXRoLnNpbiggKCBrIC0gcyApICogKCAyICogTWF0aC5QSSApIC8gcCApICogMC41ICsgMTtcblxuXHRcdH1cblxuXHR9LFxuXG5cdEJhY2s6IHtcblxuXHRcdEluOiBmdW5jdGlvbiAoIGsgKSB7XG5cblx0XHRcdHZhciBzID0gMS43MDE1ODtcblx0XHRcdHJldHVybiBrICogayAqICggKCBzICsgMSApICogayAtIHMgKTtcblxuXHRcdH0sXG5cblx0XHRPdXQ6IGZ1bmN0aW9uICggayApIHtcblxuXHRcdFx0dmFyIHMgPSAxLjcwMTU4O1xuXHRcdFx0cmV0dXJuIC0tayAqIGsgKiAoICggcyArIDEgKSAqIGsgKyBzICkgKyAxO1xuXG5cdFx0fSxcblxuXHRcdEluT3V0OiBmdW5jdGlvbiAoIGsgKSB7XG5cblx0XHRcdHZhciBzID0gMS43MDE1OCAqIDEuNTI1O1xuXHRcdFx0aWYgKCAoIGsgKj0gMiApIDwgMSApIHJldHVybiAwLjUgKiAoIGsgKiBrICogKCAoIHMgKyAxICkgKiBrIC0gcyApICk7XG5cdFx0XHRyZXR1cm4gMC41ICogKCAoIGsgLT0gMiApICogayAqICggKCBzICsgMSApICogayArIHMgKSArIDIgKTtcblxuXHRcdH1cblxuXHR9LFxuXG5cdEJvdW5jZToge1xuXG5cdFx0SW46IGZ1bmN0aW9uICggayApIHtcblxuXHRcdFx0cmV0dXJuIDEgLSBUV0VFTi5FYXNpbmcuQm91bmNlLk91dCggMSAtIGsgKTtcblxuXHRcdH0sXG5cblx0XHRPdXQ6IGZ1bmN0aW9uICggayApIHtcblxuXHRcdFx0aWYgKCBrIDwgKCAxIC8gMi43NSApICkge1xuXG5cdFx0XHRcdHJldHVybiA3LjU2MjUgKiBrICogaztcblxuXHRcdFx0fSBlbHNlIGlmICggayA8ICggMiAvIDIuNzUgKSApIHtcblxuXHRcdFx0XHRyZXR1cm4gNy41NjI1ICogKCBrIC09ICggMS41IC8gMi43NSApICkgKiBrICsgMC43NTtcblxuXHRcdFx0fSBlbHNlIGlmICggayA8ICggMi41IC8gMi43NSApICkge1xuXG5cdFx0XHRcdHJldHVybiA3LjU2MjUgKiAoIGsgLT0gKCAyLjI1IC8gMi43NSApICkgKiBrICsgMC45Mzc1O1xuXG5cdFx0XHR9IGVsc2Uge1xuXG5cdFx0XHRcdHJldHVybiA3LjU2MjUgKiAoIGsgLT0gKCAyLjYyNSAvIDIuNzUgKSApICogayArIDAuOTg0Mzc1O1xuXG5cdFx0XHR9XG5cblx0XHR9LFxuXG5cdFx0SW5PdXQ6IGZ1bmN0aW9uICggayApIHtcblxuXHRcdFx0aWYgKCBrIDwgMC41ICkgcmV0dXJuIFRXRUVOLkVhc2luZy5Cb3VuY2UuSW4oIGsgKiAyICkgKiAwLjU7XG5cdFx0XHRyZXR1cm4gVFdFRU4uRWFzaW5nLkJvdW5jZS5PdXQoIGsgKiAyIC0gMSApICogMC41ICsgMC41O1xuXG5cdFx0fVxuXG5cdH1cblxufTtcblxuVFdFRU4uSW50ZXJwb2xhdGlvbiA9IHtcblxuXHRMaW5lYXI6IGZ1bmN0aW9uICggdiwgayApIHtcblxuXHRcdHZhciBtID0gdi5sZW5ndGggLSAxLCBmID0gbSAqIGssIGkgPSBNYXRoLmZsb29yKCBmICksIGZuID0gVFdFRU4uSW50ZXJwb2xhdGlvbi5VdGlscy5MaW5lYXI7XG5cblx0XHRpZiAoIGsgPCAwICkgcmV0dXJuIGZuKCB2WyAwIF0sIHZbIDEgXSwgZiApO1xuXHRcdGlmICggayA+IDEgKSByZXR1cm4gZm4oIHZbIG0gXSwgdlsgbSAtIDEgXSwgbSAtIGYgKTtcblxuXHRcdHJldHVybiBmbiggdlsgaSBdLCB2WyBpICsgMSA+IG0gPyBtIDogaSArIDEgXSwgZiAtIGkgKTtcblxuXHR9LFxuXG5cdEJlemllcjogZnVuY3Rpb24gKCB2LCBrICkge1xuXG5cdFx0dmFyIGIgPSAwLCBuID0gdi5sZW5ndGggLSAxLCBwdyA9IE1hdGgucG93LCBibiA9IFRXRUVOLkludGVycG9sYXRpb24uVXRpbHMuQmVybnN0ZWluLCBpO1xuXG5cdFx0Zm9yICggaSA9IDA7IGkgPD0gbjsgaSsrICkge1xuXHRcdFx0YiArPSBwdyggMSAtIGssIG4gLSBpICkgKiBwdyggaywgaSApICogdlsgaSBdICogYm4oIG4sIGkgKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gYjtcblxuXHR9LFxuXG5cdENhdG11bGxSb206IGZ1bmN0aW9uICggdiwgayApIHtcblxuXHRcdHZhciBtID0gdi5sZW5ndGggLSAxLCBmID0gbSAqIGssIGkgPSBNYXRoLmZsb29yKCBmICksIGZuID0gVFdFRU4uSW50ZXJwb2xhdGlvbi5VdGlscy5DYXRtdWxsUm9tO1xuXG5cdFx0aWYgKCB2WyAwIF0gPT09IHZbIG0gXSApIHtcblxuXHRcdFx0aWYgKCBrIDwgMCApIGkgPSBNYXRoLmZsb29yKCBmID0gbSAqICggMSArIGsgKSApO1xuXG5cdFx0XHRyZXR1cm4gZm4oIHZbICggaSAtIDEgKyBtICkgJSBtIF0sIHZbIGkgXSwgdlsgKCBpICsgMSApICUgbSBdLCB2WyAoIGkgKyAyICkgJSBtIF0sIGYgLSBpICk7XG5cblx0XHR9IGVsc2Uge1xuXG5cdFx0XHRpZiAoIGsgPCAwICkgcmV0dXJuIHZbIDAgXSAtICggZm4oIHZbIDAgXSwgdlsgMCBdLCB2WyAxIF0sIHZbIDEgXSwgLWYgKSAtIHZbIDAgXSApO1xuXHRcdFx0aWYgKCBrID4gMSApIHJldHVybiB2WyBtIF0gLSAoIGZuKCB2WyBtIF0sIHZbIG0gXSwgdlsgbSAtIDEgXSwgdlsgbSAtIDEgXSwgZiAtIG0gKSAtIHZbIG0gXSApO1xuXG5cdFx0XHRyZXR1cm4gZm4oIHZbIGkgPyBpIC0gMSA6IDAgXSwgdlsgaSBdLCB2WyBtIDwgaSArIDEgPyBtIDogaSArIDEgXSwgdlsgbSA8IGkgKyAyID8gbSA6IGkgKyAyIF0sIGYgLSBpICk7XG5cblx0XHR9XG5cblx0fSxcblxuXHRVdGlsczoge1xuXG5cdFx0TGluZWFyOiBmdW5jdGlvbiAoIHAwLCBwMSwgdCApIHtcblxuXHRcdFx0cmV0dXJuICggcDEgLSBwMCApICogdCArIHAwO1xuXG5cdFx0fSxcblxuXHRcdEJlcm5zdGVpbjogZnVuY3Rpb24gKCBuICwgaSApIHtcblxuXHRcdFx0dmFyIGZjID0gVFdFRU4uSW50ZXJwb2xhdGlvbi5VdGlscy5GYWN0b3JpYWw7XG5cdFx0XHRyZXR1cm4gZmMoIG4gKSAvIGZjKCBpICkgLyBmYyggbiAtIGkgKTtcblxuXHRcdH0sXG5cblx0XHRGYWN0b3JpYWw6ICggZnVuY3Rpb24gKCkge1xuXG5cdFx0XHR2YXIgYSA9IFsgMSBdO1xuXG5cdFx0XHRyZXR1cm4gZnVuY3Rpb24gKCBuICkge1xuXG5cdFx0XHRcdHZhciBzID0gMSwgaTtcblx0XHRcdFx0aWYgKCBhWyBuIF0gKSByZXR1cm4gYVsgbiBdO1xuXHRcdFx0XHRmb3IgKCBpID0gbjsgaSA+IDE7IGktLSApIHMgKj0gaTtcblx0XHRcdFx0cmV0dXJuIGFbIG4gXSA9IHM7XG5cblx0XHRcdH07XG5cblx0XHR9ICkoKSxcblxuXHRcdENhdG11bGxSb206IGZ1bmN0aW9uICggcDAsIHAxLCBwMiwgcDMsIHQgKSB7XG5cblx0XHRcdHZhciB2MCA9ICggcDIgLSBwMCApICogMC41LCB2MSA9ICggcDMgLSBwMSApICogMC41LCB0MiA9IHQgKiB0LCB0MyA9IHQgKiB0Mjtcblx0XHRcdHJldHVybiAoIDIgKiBwMSAtIDIgKiBwMiArIHYwICsgdjEgKSAqIHQzICsgKCAtIDMgKiBwMSArIDMgKiBwMiAtIDIgKiB2MCAtIHYxICkgKiB0MiArIHYwICogdCArIHAxO1xuXG5cdFx0fVxuXG5cdH1cblxufTtcblxubW9kdWxlLmV4cG9ydHM9VFdFRU47IiwidmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QvYWRkb25zJyk7XG52YXIge1xuXHRDb250YWluZXIsXG5cdGNyZWF0ZUFwcCxcblx0VUksXG5cdFZpZXcsXG5cdFZpZXdNYW5hZ2VyXG59ID0gcmVxdWlyZSgndG91Y2hzdG9uZWpzJyk7XG5cbi8vIEFwcCBDb25maWdcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG52YXIgUGVvcGxlU3RvcmUgPSByZXF1aXJlKCcuL3N0b3Jlcy9wZW9wbGUnKVxudmFyIHBlb3BsZVN0b3JlID0gbmV3IFBlb3BsZVN0b3JlKClcblxudmFyIEFwcCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblx0bWl4aW5zOiBbY3JlYXRlQXBwKCldLFxuXG5cdGNoaWxkQ29udGV4dFR5cGVzOiB7XG5cdFx0cGVvcGxlU3RvcmU6IFJlYWN0LlByb3BUeXBlcy5vYmplY3Rcblx0fSxcblxuXHRnZXRDaGlsZENvbnRleHQgKCkge1xuXHRcdHJldHVybiB7XG5cdFx0XHRwZW9wbGVTdG9yZTogcGVvcGxlU3RvcmVcblx0XHR9O1xuXHR9LFxuXG5cdHJlbmRlciAoKSB7XG5cdFx0dmFyIGFwcFdyYXBwZXJDbGFzc05hbWUgPSAnYXBwLXdyYXBwZXIgZGV2aWNlLS0nICsgKHdpbmRvdy5kZXZpY2UgfHwge30pLnBsYXRmb3JtXG5cblx0XHRyZXR1cm4gKFxuXHRcdFx0PGRpdiBjbGFzc05hbWU9e2FwcFdyYXBwZXJDbGFzc05hbWV9PlxuXHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT1cImRldmljZS1zaWxob3VldHRlXCI+XG5cdFx0XHRcdFx0PFZpZXdNYW5hZ2VyIG5hbWU9XCJhcHBcIiBkZWZhdWx0Vmlldz1cIm1haW5cIj5cblx0XHRcdFx0XHRcdDxWaWV3IG5hbWU9XCJtYWluXCIgY29tcG9uZW50PXtNYWluVmlld0NvbnRyb2xsZXJ9IC8+XG5cdFx0XHRcdFx0XHQ8VmlldyBuYW1lPVwidHJhbnNpdGlvbnMtdGFyZ2V0LW92ZXJcIiBjb21wb25lbnQ9e3JlcXVpcmUoJy4vdmlld3MvdHJhbnNpdGlvbnMtdGFyZ2V0LW92ZXInKX0gLz5cblx0XHRcdFx0XHQ8L1ZpZXdNYW5hZ2VyPlxuXHRcdFx0XHQ8L2Rpdj5cblx0XHRcdDwvZGl2PlxuXHRcdCk7XG5cdH1cbn0pO1xuXG4vLyBNYWluIENvbnRyb2xsZXJcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG52YXIgTWFpblZpZXdDb250cm9sbGVyID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXHRyZW5kZXIgKCkge1xuXHRcdHJldHVybiAoXG5cdFx0XHQ8Q29udGFpbmVyPlxuXHRcdFx0XHQ8VUkuTmF2aWdhdGlvbkJhciBuYW1lPVwibWFpblwiIC8+XG5cdFx0XHRcdDxWaWV3TWFuYWdlciBuYW1lPVwibWFpblwiIGRlZmF1bHRWaWV3PVwidGFic1wiPlxuXHRcdFx0XHRcdDxWaWV3IG5hbWU9XCJ0YWJzXCIgY29tcG9uZW50PXtUYWJWaWV3Q29udHJvbGxlcn0gLz5cblx0XHRcdFx0PC9WaWV3TWFuYWdlcj5cblx0XHRcdDwvQ29udGFpbmVyPlxuXHRcdCk7XG5cdH1cbn0pO1xuXG4vLyBUYWIgQ29udHJvbGxlclxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbnZhciBsYXN0U2VsZWN0ZWRUYWIgPSAnbGlzdHMnXG52YXIgVGFiVmlld0NvbnRyb2xsZXIgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cdGdldEluaXRpYWxTdGF0ZSAoKSB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdHNlbGVjdGVkVGFiOiBsYXN0U2VsZWN0ZWRUYWJcblx0XHR9O1xuXHR9LFxuXG5cdG9uVmlld0NoYW5nZSAobmV4dFZpZXcpIHtcblx0XHRsYXN0U2VsZWN0ZWRUYWIgPSBuZXh0Vmlld1xuXG5cdFx0dGhpcy5zZXRTdGF0ZSh7XG5cdFx0XHRzZWxlY3RlZFRhYjogbmV4dFZpZXdcblx0XHR9KTtcblx0fSxcblxuXHRzZWxlY3RUYWIgKHZhbHVlKSB7XG5cdFx0dmFyIHZpZXdQcm9wcztcblxuXHRcdHRoaXMucmVmcy52bS50cmFuc2l0aW9uVG8odmFsdWUsIHtcblx0XHRcdHRyYW5zaXRpb246ICdpbnN0YW50Jyxcblx0XHRcdHZpZXdQcm9wczogdmlld1Byb3BzXG5cdFx0fSk7XG5cblx0XHR0aGlzLnNldFN0YXRlKHtcblx0XHRcdHNlbGVjdGVkVGFiOiB2YWx1ZVxuXHRcdH0pXG5cdH0sXG5cblx0cmVuZGVyICgpIHtcblx0XHR2YXIgc2VsZWN0ZWRUYWIgPSB0aGlzLnN0YXRlLnNlbGVjdGVkVGFiXG5cdFx0dmFyIHNlbGVjdGVkVGFiU3BhbiA9IHNlbGVjdGVkVGFiXG5cblx0XHRpZiAoc2VsZWN0ZWRUYWIgPT09ICdsaXN0cycgfHwgc2VsZWN0ZWRUYWIgPT09ICdsaXN0LXNpbXBsZScgfHwgc2VsZWN0ZWRUYWIgPT09ICdsaXN0LWNvbXBsZXgnIHx8IHNlbGVjdGVkVGFiID09PSAnbGlzdC1kZXRhaWxzJykge1xuXHRcdFx0c2VsZWN0ZWRUYWJTcGFuID0gJ2xpc3RzJztcblx0XHR9XG5cblx0XHRpZiAoc2VsZWN0ZWRUYWIgPT09ICd0cmFuc2l0aW9ucycgfHwgc2VsZWN0ZWRUYWIgPT09ICd0cmFuc2l0aW9ucy10YXJnZXQnKSB7XG5cdFx0XHRzZWxlY3RlZFRhYlNwYW4gPSAndHJhbnNpdGlvbnMnO1xuXHRcdH1cblxuXHRcdHJldHVybiAoXG5cdFx0XHQ8Q29udGFpbmVyPlxuXHRcdFx0XHQ8Vmlld01hbmFnZXIgcmVmPVwidm1cIiBuYW1lPVwidGFic1wiIGRlZmF1bHRWaWV3PXtzZWxlY3RlZFRhYn0gb25WaWV3Q2hhbmdlPXt0aGlzLm9uVmlld0NoYW5nZX0+XG5cdFx0XHRcdFx0PFZpZXcgbmFtZT1cImxpc3RzXCIgY29tcG9uZW50PXtyZXF1aXJlKCcuL3ZpZXdzL2xpc3RzJyl9IC8+XG5cdFx0XHRcdFx0PFZpZXcgbmFtZT1cImxpc3Qtc2ltcGxlXCIgY29tcG9uZW50PXtyZXF1aXJlKCcuL3ZpZXdzL2xpc3Qtc2ltcGxlJyl9IC8+XG5cdFx0XHRcdFx0PFZpZXcgbmFtZT1cImxpc3QtY29tcGxleFwiIGNvbXBvbmVudD17cmVxdWlyZSgnLi92aWV3cy9saXN0LWNvbXBsZXgnKX0gLz5cblx0XHRcdFx0XHQ8VmlldyBuYW1lPVwibGlzdC1kZXRhaWxzXCIgY29tcG9uZW50PXtyZXF1aXJlKCcuL3ZpZXdzL2xpc3QtZGV0YWlscycpfSAvPlxuXHRcdFx0XHRcdDxWaWV3IG5hbWU9XCJmb3JtXCIgY29tcG9uZW50PXtyZXF1aXJlKCcuL3ZpZXdzL2Zvcm0nKX0gLz5cblx0XHRcdFx0XHQ8VmlldyBuYW1lPVwiY29udHJvbHNcIiBjb21wb25lbnQ9e3JlcXVpcmUoJy4vdmlld3MvY29udHJvbHMnKX0gLz5cblx0XHRcdFx0XHQ8VmlldyBuYW1lPVwidHJhbnNpdGlvbnNcIiBjb21wb25lbnQ9e3JlcXVpcmUoJy4vdmlld3MvdHJhbnNpdGlvbnMnKX0gLz5cblx0XHRcdFx0XHQ8VmlldyBuYW1lPVwidHJhbnNpdGlvbnMtdGFyZ2V0XCIgY29tcG9uZW50PXtyZXF1aXJlKCcuL3ZpZXdzL3RyYW5zaXRpb25zLXRhcmdldCcpfSAvPlxuXHRcdFx0XHQ8L1ZpZXdNYW5hZ2VyPlxuXHRcdFx0XHQ8VUkuVGFicy5OYXZpZ2F0b3I+XG5cdFx0XHRcdFx0PFVJLlRhYnMuVGFiIG9uVGFwPXt0aGlzLnNlbGVjdFRhYi5iaW5kKHRoaXMsICdsaXN0cycpfSBzZWxlY3RlZD17c2VsZWN0ZWRUYWJTcGFuID09PSAnbGlzdHMnfT5cblx0XHRcdFx0XHRcdDxzcGFuIGNsYXNzTmFtZT1cIlRhYnMtSWNvbiBUYWJzLUljb24tLWxpc3RzXCIgLz5cblx0XHRcdFx0XHRcdDxVSS5UYWJzLkxhYmVsPkxpc3RzPC9VSS5UYWJzLkxhYmVsPlxuXHRcdFx0XHRcdDwvVUkuVGFicy5UYWI+XG5cdFx0XHRcdFx0PFVJLlRhYnMuVGFiIG9uVGFwPXt0aGlzLnNlbGVjdFRhYi5iaW5kKHRoaXMsICdmb3JtJyl9IHNlbGVjdGVkPXtzZWxlY3RlZFRhYlNwYW4gPT09ICdmb3JtJ30+XG5cdFx0XHRcdFx0XHQ8c3BhbiBjbGFzc05hbWU9XCJUYWJzLUljb24gVGFicy1JY29uLS1mb3Jtc1wiIC8+XG5cdFx0XHRcdFx0XHQ8VUkuVGFicy5MYWJlbD5Gb3JtczwvVUkuVGFicy5MYWJlbD5cblx0XHRcdFx0XHQ8L1VJLlRhYnMuVGFiPlxuXHRcdFx0XHRcdDxVSS5UYWJzLlRhYiBvblRhcD17dGhpcy5zZWxlY3RUYWIuYmluZCh0aGlzLCAnY29udHJvbHMnKX0gc2VsZWN0ZWQ9e3NlbGVjdGVkVGFiU3BhbiA9PT0gJ2NvbnRyb2xzJ30+XG5cdFx0XHRcdFx0XHQ8c3BhbiBjbGFzc05hbWU9XCJUYWJzLUljb24gVGFicy1JY29uLS1jb250cm9sc1wiIC8+XG5cdFx0XHRcdFx0XHQ8VUkuVGFicy5MYWJlbD5Db250cm9sczwvVUkuVGFicy5MYWJlbD5cblx0XHRcdFx0XHQ8L1VJLlRhYnMuVGFiPlxuXHRcdFx0XHRcdDxVSS5UYWJzLlRhYiBvblRhcD17dGhpcy5zZWxlY3RUYWIuYmluZCh0aGlzLCAndHJhbnNpdGlvbnMnKX0gc2VsZWN0ZWQ9e3NlbGVjdGVkVGFiU3BhbiA9PT0gJ3RyYW5zaXRpb25zJ30+XG5cdFx0XHRcdFx0XHQ8c3BhbiBjbGFzc05hbWU9XCJUYWJzLUljb24gVGFicy1JY29uLS10cmFuc2l0aW9uc1wiIC8+XG5cdFx0XHRcdFx0XHQ8VUkuVGFicy5MYWJlbD5UcmFuc2l0aW9uczwvVUkuVGFicy5MYWJlbD5cblx0XHRcdFx0XHQ8L1VJLlRhYnMuVGFiPlxuXHRcdFx0XHQ8L1VJLlRhYnMuTmF2aWdhdG9yPlxuXHRcdFx0PC9Db250YWluZXI+XG5cdFx0KTtcblx0fVxufSk7XG5cbmZ1bmN0aW9uIHN0YXJ0QXBwICgpIHtcblx0aWYgKHdpbmRvdy5TdGF0dXNCYXIpIHtcblx0XHR3aW5kb3cuU3RhdHVzQmFyLnN0eWxlRGVmYXVsdCgpO1xuXHR9XG5cblx0UmVhY3QucmVuZGVyKDxBcHAgLz4sIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdhcHAnKSk7XG59XG5cbmlmICghd2luZG93LmNvcmRvdmEpIHtcblx0c3RhcnRBcHAoKTtcblxufSBlbHNlIHtcblx0ZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignZGV2aWNlcmVhZHknLCBzdGFydEFwcCwgZmFsc2UpO1xufVxuIiwidmFyIEV2ZW50RW1pdHRlciA9IHJlcXVpcmUoJ2V2ZW50cycpLkV2ZW50RW1pdHRlclxuXG52YXIgYXN5bmMgPSByZXF1aXJlKCdhc3luYycpXG52YXIgaHR0cGlmeSA9IHJlcXVpcmUoJ2h0dHBpZnknKVxuXG5mdW5jdGlvbiBQZW9wbGVTdG9yZSAoKSB7XG5cdEV2ZW50RW1pdHRlci5jYWxsKHRoaXMpXG5cblx0Ly8gaW5pdGlhbGl6ZSBpbnRlcm5hbCBjYWNoZVxuXHR2YXIgc3RvcmFnZSA9IHRoaXMuY2FjaGUgPSB7XG5cdFx0cGVvcGxlOiBbXVxuXHR9XG5cdHZhciBzZWxmID0gdGhpc1xuXG5cdC8vIERpc3BhdGNoZXJzXG5cdHRoaXMuc3RhclF1ZXVlID0gYXN5bmMucXVldWUoKGRhdGEsIGNhbGxiYWNrKSA9PiB7XG5cdFx0dmFyIHsgaWQsIHN0YXJyZWQgfSA9IGRhdGFcblxuXHRcdC8vIHVwZGF0ZSBpbnRlcm5hbCBkYXRhXG5cdFx0c2VsZi5jYWNoZS5wZW9wbGVcblx0XHRcdC5maWx0ZXIocGVyc29uID0+IHBlcnNvbi5pZCA9PT0gaWQpXG5cdFx0XHQuZm9yRWFjaChwZXJzb24gPT4gcGVyc29uLmlzU3RhcnJlZCA9IHN0YXJyZWQpXG5cblx0XHQvLyBlbWl0IGV2ZW50c1xuXHRcdHNlbGYuZW1pdCgncGVvcGxlLXVwZGF0ZWQnLCBzdG9yYWdlLnBlb3BsZSlcblxuXHRcdGNhbGxiYWNrKClcblx0fSwgMSlcblxuXHR0aGlzLnJlZnJlc2hRdWV1ZSA9IGFzeW5jLnF1ZXVlKChfLCBjYWxsYmFjaykgPT4ge1xuXHRcdC8vIHVwZGF0ZVxuXHRcdGh0dHBpZnkoe1xuXHRcdFx0bWV0aG9kOiAnR0VUJyxcblx0XHRcdHVybDogJ2h0dHA6Ly9hcGkucmFuZG9tdXNlci5tZS8/bmF0PWF1JnJlc3VsdHM9MTAnXG5cdFx0fSwgZnVuY3Rpb24gKGVyciwgcmVzKSB7XG5cdFx0XHRpZiAoZXJyKSByZXR1cm4gY2FsbGJhY2soZXJyKVxuXG5cdFx0XHRzdG9yYWdlLnBlb3BsZSA9IHJlcy5ib2R5LnJlc3VsdHMubWFwKHAgPT4gcC51c2VyKVxuXHRcdFx0c3RvcmFnZS5wZW9wbGUuZm9yRWFjaCgocGVyc29uLCBpKSA9PiB7XG5cdFx0XHRcdHBlcnNvbi5uYW1lLmZpcnN0ID0gcGVyc29uLm5hbWUuZmlyc3RbMF0udG9VcHBlckNhc2UoKSArIHBlcnNvbi5uYW1lLmZpcnN0LnNsaWNlKDEpXG5cdFx0XHRcdHBlcnNvbi5uYW1lLmxhc3QgPSBwZXJzb24ubmFtZS5sYXN0WzBdLnRvVXBwZXJDYXNlKCkgKyBwZXJzb24ubmFtZS5sYXN0LnNsaWNlKDEpXG5cblx0XHRcdFx0Ly8gd2UgbmVlZCB0aGlzIHRvb1xuXHRcdFx0XHRwZXJzb24uaWQgPSBpXG5cdFx0XHRcdHBlcnNvbi5uYW1lLmluaXRpYWxzID0gcGVyc29uLm5hbWUuZmlyc3RbMF0gKyBwZXJzb24ubmFtZS5sYXN0WzBdXG5cdFx0XHRcdHBlcnNvbi5uYW1lLmZ1bGwgPSBwZXJzb24ubmFtZS5maXJzdCArICcgJyArIHBlcnNvbi5uYW1lLmxhc3Rcblx0XHRcdFx0cGVyc29uLmNhdGVnb3J5ID0gTWF0aC5yYW5kb20oKSA+IDAuNSA/ICdBJyA6ICdCJ1xuXHRcdFx0XHRwZXJzb24uZ2l0aHViID0gcGVyc29uLm5hbWUuZmlyc3QudG9Mb3dlckNhc2UoKSArIHBlcnNvbi5uYW1lLmxhc3QudG9Mb3dlckNhc2UoKVxuXHRcdFx0XHRwZXJzb24ucGljdHVyZSA9IHBlcnNvbi5waWN0dXJlLm1lZGl1bVxuXHRcdFx0XHRwZXJzb24udHdpdHRlciA9ICdAJyArIHBlcnNvbi5uYW1lLmZpcnN0LnRvTG93ZXJDYXNlKCkgKyAoTWF0aC5yYW5kb20oKS50b1N0cmluZygzMikuc2xpY2UoMiwgNSkpXG5cdFx0XHR9KVxuXG5cdFx0XHQvLyBlbWl0IGV2ZW50c1xuXHRcdFx0c2VsZi5lbWl0KCdwZW9wbGUtdXBkYXRlZCcsIHN0b3JhZ2UucGVvcGxlKVxuXHRcdFx0c2VsZi5lbWl0KCdyZWZyZXNoJylcblxuXHRcdFx0Y2FsbGJhY2sobnVsbCwgc3RvcmFnZS5wZW9wbGUpXG5cdFx0fSlcblx0fSwgMSlcblxuXHQvLyByZWZyZXNoIGltbWVkaWF0ZWx5XG5cdHRoaXMucmVmcmVzaCgpXG59XG5cbk9iamVjdC5hc3NpZ24oUGVvcGxlU3RvcmUucHJvdG90eXBlLCBFdmVudEVtaXR0ZXIucHJvdG90eXBlKVxuXG4vLyBJbnRlbnRzXG5QZW9wbGVTdG9yZS5wcm90b3R5cGUucmVmcmVzaCA9IGZ1bmN0aW9uIChjYWxsYmFjaykge1xuXHR0aGlzLnJlZnJlc2hRdWV1ZS5wdXNoKG51bGwsIGNhbGxiYWNrKVxufVxuXG5QZW9wbGVTdG9yZS5wcm90b3R5cGUuc3RhciA9IGZ1bmN0aW9uICh7IGlkIH0sIHN0YXJyZWQsIGNhbGxiYWNrKSB7XG5cdHRoaXMuc3RhclF1ZXVlLnB1c2goeyBpZCwgc3RhcnJlZCB9LCBjYWxsYmFjaylcbn1cblxuLy8gR2V0dGVyc1xuUGVvcGxlU3RvcmUucHJvdG90eXBlLmdldFBlb3BsZSA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXMuY2FjaGUucGVvcGxlIH1cblxubW9kdWxlLmV4cG9ydHMgPSBQZW9wbGVTdG9yZVxuIiwidmFyIENvbnRhaW5lciA9IHJlcXVpcmUoJ3JlYWN0LWNvbnRhaW5lcicpO1xudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcbnZhciBUYXBwYWJsZSA9IHJlcXVpcmUoJ3JlYWN0LXRhcHBhYmxlJyk7XG52YXIgVGltZXJzID0gcmVxdWlyZSgncmVhY3QtdGltZXJzJyk7XG52YXIgeyBMaW5rLCBVSSB9ID0gcmVxdWlyZSgndG91Y2hzdG9uZWpzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXHRtaXhpbnM6IFtUaW1lcnMoKV0sXG5cdHN0YXRpY3M6IHtcblx0XHRuYXZpZ2F0aW9uQmFyOiAnbWFpbicsXG5cdFx0Z2V0TmF2aWdhdGlvbiAoKSB7XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHR0aXRsZTogJ0NvbnRyb2xzJ1xuXHRcdFx0fVxuXHRcdH1cblx0fSxcblx0Z2V0SW5pdGlhbFN0YXRlICgpIHtcblx0XHRyZXR1cm4ge1xuXHRcdFx0YWxlcnRiYXI6IHtcblx0XHRcdFx0dmlzaWJsZTogZmFsc2UsXG5cdFx0XHRcdHR5cGU6ICcnLFxuXHRcdFx0XHR0ZXh0OiAnJ1xuXHRcdFx0fSxcblx0XHRcdHBvcHVwOiB7XG5cdFx0XHRcdHZpc2libGU6IGZhbHNlXG5cdFx0XHR9XG5cdFx0fVxuXHR9LFxuXHRzaG93TG9hZGluZ1BvcHVwICgpIHtcblx0XHR0aGlzLnNldFN0YXRlKHtcblx0XHRcdHBvcHVwOiB7XG5cdFx0XHRcdHZpc2libGU6IHRydWUsXG5cdFx0XHRcdGxvYWRpbmc6IHRydWUsXG5cdFx0XHRcdGhlYWRlcjogJ0xvYWRpbmcnLFxuXHRcdFx0XHRpY29uTmFtZTogJ2lvbi1sb2FkLWMnLFxuXHRcdFx0XHRpY29uVHlwZTogJ2RlZmF1bHQnXG5cdFx0XHR9XG5cdFx0fSk7XG5cblx0XHR2YXIgc2VsZiA9IHRoaXM7XG5cblx0XHR0aGlzLnNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuXHRcdFx0c2VsZi5zZXRTdGF0ZSh7XG5cdFx0XHRcdHBvcHVwOiB7XG5cdFx0XHRcdFx0dmlzaWJsZTogdHJ1ZSxcblx0XHRcdFx0XHRsb2FkaW5nOiBmYWxzZSxcblx0XHRcdFx0XHRoZWFkZXI6ICdEb25lIScsXG5cdFx0XHRcdFx0aWNvbk5hbWU6ICdpb24taW9zLWNoZWNrbWFyaycsXG5cdFx0XHRcdFx0aWNvblR5cGU6ICdzdWNjZXNzJ1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR9LCAyMDAwKTtcblxuXHRcdHRoaXMuc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG5cdFx0XHRzZWxmLnNldFN0YXRlKHtcblx0XHRcdFx0cG9wdXA6IHtcblx0XHRcdFx0XHR2aXNpYmxlOiBmYWxzZVxuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR9LCAzMDAwKTtcblx0fSxcblx0c2hvd0FsZXJ0YmFyICh0eXBlLCB0ZXh0KSB7XG5cdFx0dmFyIHNlbGYgPSB0aGlzO1xuXG5cdFx0dGhpcy5zZXRTdGF0ZSh7XG5cdFx0XHRhbGVydGJhcjoge1xuXHRcdFx0XHR2aXNpYmxlOiB0cnVlLFxuXHRcdFx0XHR0eXBlOiB0eXBlLFxuXHRcdFx0XHR0ZXh0OiB0ZXh0XG5cdFx0XHR9XG5cdFx0fSk7XG5cblx0XHR0aGlzLnNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuXHRcdFx0c2VsZi5zZXRTdGF0ZSh7XG5cdFx0XHRcdGFsZXJ0YmFyOiB7XG5cdFx0XHRcdFx0dmlzaWJsZTogZmFsc2Vcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0fSwgMjAwMCk7XG5cdH0sXG5cdGhhbmRsZU1vZGVDaGFuZ2UgKG5ld01vZGUpIHtcblx0XHR2YXIgc2VsZWN0ZWRJdGVtID0gbmV3TW9kZTtcblxuXHRcdGlmICh0aGlzLnN0YXRlLnNlbGVjdGVkTW9kZSA9PT0gbmV3TW9kZSkge1xuXHRcdFx0c2VsZWN0ZWRJdGVtID0gbnVsbDtcblx0XHR9XG5cblx0XHR0aGlzLnNldFN0YXRlKHtcblx0XHRcdHNlbGVjdGVkTW9kZTogc2VsZWN0ZWRJdGVtXG5cdFx0fSk7XG5cblx0fSxcblx0cmVuZGVyICgpIHtcblx0XHR2YXIgeyBhbGVydGJhciB9ID0gdGhpcy5zdGF0ZTtcblx0XHRyZXR1cm4gKFxuXHRcdFx0PENvbnRhaW5lciBzY3JvbGxhYmxlPlxuXHRcdFx0XHQ8VUkuQWxlcnRiYXIgdHlwZT17YWxlcnRiYXIudHlwZX0gdmlzaWJsZT17YWxlcnRiYXIudmlzaWJsZX0+e2FsZXJ0YmFyLnRleHR9PC9VSS5BbGVydGJhcj5cblx0XHRcdFx0PFVJLkdyb3VwSGVhZGVyPlNlZ21lbnRlZCBDb250cm9sPC9VSS5Hcm91cEhlYWRlcj5cblx0XHRcdFx0PFVJLlNlZ21lbnRlZENvbnRyb2wgdmFsdWU9e3RoaXMuc3RhdGUuc2VsZWN0ZWRNb2RlfSBvbkNoYW5nZT17dGhpcy5oYW5kbGVNb2RlQ2hhbmdlfSBoYXNHdXR0ZXIgb3B0aW9ucz17W1xuXHRcdFx0XHRcdHsgbGFiZWw6ICdPbmUnLCB2YWx1ZTogJ29uZScgfSxcblx0XHRcdFx0XHR7IGxhYmVsOiAnVHdvJywgdmFsdWU6ICd0d28nIH0sXG5cdFx0XHRcdFx0eyBsYWJlbDogJ1RocmVlJywgdmFsdWU6ICd0aHJlZScgfSxcblx0XHRcdFx0XHR7IGxhYmVsOiAnRm91cicsIHZhbHVlOiAnZm91cicgfVxuXHRcdFx0XHRdfSAvPlxuXG5cdFx0XHRcdDxVSS5Hcm91cEhlYWRlcj5BbGVydCBCYXI8L1VJLkdyb3VwSGVhZGVyPlxuXHRcdFx0XHQ8VUkuQnV0dG9uR3JvdXA+XG5cdFx0XHRcdFx0PFVJLkJ1dHRvbiB0eXBlPVwicHJpbWFyeVwiIG9uVGFwPXt0aGlzLnNob3dBbGVydGJhci5iaW5kKHRoaXMsICdkYW5nZXInLCAnTm8gSW50ZXJuZXQgQ29ubmVjdGlvbicpfSBkaXNhYmxlZD17dGhpcy5zdGF0ZS5hbGVydGJhci52aXNpYmxlfT5cblx0XHRcdFx0XHRcdERhbmdlclxuXHRcdFx0XHRcdDwvVUkuQnV0dG9uPlxuXHRcdFx0XHRcdDxVSS5CdXR0b24gdHlwZT1cInByaW1hcnlcIiBvblRhcD17dGhpcy5zaG93QWxlcnRiYXIuYmluZCh0aGlzLCAnd2FybmluZycsICdDb25uZWN0aW5nLi4uJyl9IGRpc2FibGVkPXt0aGlzLnN0YXRlLmFsZXJ0YmFyLnZpc2libGV9PlxuXHRcdFx0XHRcdFx0V2FybmluZ1xuXHRcdFx0XHRcdDwvVUkuQnV0dG9uPlxuXHRcdFx0XHRcdDxVSS5CdXR0b24gdHlwZT1cInByaW1hcnlcIiBvblRhcD17dGhpcy5zaG93QWxlcnRiYXIuYmluZCh0aGlzLCAnc3VjY2VzcycsICdDb25uZWN0ZWQnKX0gZGlzYWJsZWQ9e3RoaXMuc3RhdGUuYWxlcnRiYXIudmlzaWJsZX0+XG5cdFx0XHRcdFx0XHRTdWNjZXNzXG5cdFx0XHRcdFx0PC9VSS5CdXR0b24+XG5cdFx0XHRcdDwvVUkuQnV0dG9uR3JvdXA+XG5cdFx0XHRcdDxVSS5Hcm91cEhlYWRlcj5Qb3B1cDwvVUkuR3JvdXBIZWFkZXI+XG5cdFx0XHRcdDxVSS5CdXR0b24gdHlwZT1cInByaW1hcnlcIiBvblRhcD17dGhpcy5zaG93TG9hZGluZ1BvcHVwfSBkaXNhYmxlZD17dGhpcy5zdGF0ZS5wb3B1cC52aXNpYmxlfT5cblx0XHRcdFx0XHRTaG93IFBvcHVwXG5cdFx0XHRcdDwvVUkuQnV0dG9uPlxuXHRcdFx0XHQ8VUkuR3JvdXBIZWFkZXI+QXBwbGljYXRpb24gU3RhdGU8L1VJLkdyb3VwSGVhZGVyPlxuXHRcdFx0XHQ8VUkuR3JvdXA+XG5cdFx0XHRcdFx0PExpbmsgbGlua1RvPVwidGFiczpub24tZXhpc3RlbnRcIiB0cmFuc2l0aW9uPVwic2hvdy1mcm9tLXJpZ2h0XCI+XG5cdFx0XHRcdFx0XHQ8VUkuSXRlbSBzaG93RGlzY2xvc3VyZUFycm93PlxuXHRcdFx0XHRcdFx0XHQ8VUkuSXRlbUlubmVyPkludmFsaWQgVmlldzwvVUkuSXRlbUlubmVyPlxuXHRcdFx0XHRcdFx0PC9VSS5JdGVtPlxuXHRcdFx0XHRcdDwvTGluaz5cblx0XHRcdFx0PC9VSS5Hcm91cD5cblxuXHRcdFx0XHQ8VUkuUG9wdXAgdmlzaWJsZT17dGhpcy5zdGF0ZS5wb3B1cC52aXNpYmxlfT5cblx0XHRcdFx0XHQ8VUkuUG9wdXBJY29uIG5hbWU9e3RoaXMuc3RhdGUucG9wdXAuaWNvbk5hbWV9IHR5cGU9e3RoaXMuc3RhdGUucG9wdXAuaWNvblR5cGV9IHNwaW5uaW5nPXt0aGlzLnN0YXRlLnBvcHVwLmxvYWRpbmd9IC8+XHRcdFxuXHRcdFx0XHRcdDxkaXY+PHN0cm9uZz57dGhpcy5zdGF0ZS5wb3B1cC5oZWFkZXJ9PC9zdHJvbmc+PC9kaXY+XG5cdFx0XHRcdDwvVUkuUG9wdXA+XG5cdFx0XHQ8L0NvbnRhaW5lcj5cblx0XHQpO1xuXHR9XG59KTtcbiIsInZhciBDb250YWluZXIgPSByZXF1aXJlKCdyZWFjdC1jb250YWluZXInKTtcbnZhciBkaWFsb2dzID0gcmVxdWlyZSgnY29yZG92YS1kaWFsb2dzJyk7XG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xudmFyIFRhcHBhYmxlID0gcmVxdWlyZSgncmVhY3QtdGFwcGFibGUnKTtcbnZhciB7IFVJIH0gPSByZXF1aXJlKCd0b3VjaHN0b25lanMnKTtcblxuY29uc3Qgc2Nyb2xsYWJsZSA9IENvbnRhaW5lci5pbml0U2Nyb2xsYWJsZSgpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblx0c3RhdGljczoge1xuXHRcdG5hdmlnYXRpb25CYXI6ICdtYWluJyxcblx0XHRnZXROYXZpZ2F0aW9uICgpIHtcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdHRpdGxlOiAnRm9ybXMnXG5cdFx0XHR9XG5cdFx0fVxuXHR9LFxuXHRnZXRJbml0aWFsU3RhdGUgKCkge1xuXHRcdHJldHVybiB7XG5cdFx0XHRmbGF2b3VyOiAnY2hvY29sYXRlJyxcblx0XHRcdHN3aXRjaFZhbHVlOiB0cnVlXG5cdFx0fVxuXHR9LFxuXHRoYW5kbGVGbGF2b3VyQ2hhbmdlIChuZXdGbGF2b3VyKSB7XG5cdFx0dGhpcy5zZXRTdGF0ZSh7XG5cdFx0XHRmbGF2b3VyOiBuZXdGbGF2b3VyXG5cdFx0fSk7XG5cdH0sXG5cdGhhbmRsZVN3aXRjaCAoa2V5LCBldmVudCkge1xuXHRcdHZhciBuZXdTdGF0ZSA9IHt9O1xuXHRcdG5ld1N0YXRlW2tleV0gPSAhdGhpcy5zdGF0ZVtrZXldO1xuXG5cdFx0dGhpcy5zZXRTdGF0ZShuZXdTdGF0ZSk7XG5cdH0sXG5cdGFsZXJ0IChtZXNzYWdlKSB7XG5cdFx0ZGlhbG9ncy5hbGVydChtZXNzYWdlLCBmdW5jdGlvbigpIHt9LCBudWxsKVxuXHR9LFxuXHRyZW5kZXIgKCkge1xuXG5cdFx0cmV0dXJuIChcblx0XHRcdDxDb250YWluZXIgc2Nyb2xsYWJsZT17c2Nyb2xsYWJsZX0+XG5cdFx0XHRcdDxVSS5Hcm91cEhlYWRlcj5DaGVja2JveDwvVUkuR3JvdXBIZWFkZXI+XG5cdFx0XHRcdDxVSS5Hcm91cD5cblx0XHRcdFx0XHQ8VUkuSXRlbT5cblx0XHRcdFx0XHRcdDxVSS5JdGVtSW5uZXI+XG5cdFx0XHRcdFx0XHRcdDxVSS5GaWVsZExhYmVsPlN3aXRjaDwvVUkuRmllbGRMYWJlbD5cblx0XHRcdFx0XHRcdFx0PFVJLlN3aXRjaCBvblRhcD17dGhpcy5oYW5kbGVTd2l0Y2guYmluZCh0aGlzLCAnc3dpdGNoVmFsdWUnKX0gb249e3RoaXMuc3RhdGUuc3dpdGNoVmFsdWV9IC8+XG5cdFx0XHRcdFx0XHQ8L1VJLkl0ZW1Jbm5lcj5cblx0XHRcdFx0XHQ8L1VJLkl0ZW0+XG5cdFx0XHRcdFx0PFVJLkl0ZW0+XG5cdFx0XHRcdFx0XHQ8VUkuSXRlbUlubmVyPlxuXHRcdFx0XHRcdFx0XHQ8VUkuRmllbGRMYWJlbD5EaXNhYmxlZDwvVUkuRmllbGRMYWJlbD5cblx0XHRcdFx0XHRcdFx0PFVJLlN3aXRjaCBkaXNhYmxlZCAvPlxuXHRcdFx0XHRcdFx0PC9VSS5JdGVtSW5uZXI+XG5cdFx0XHRcdFx0PC9VSS5JdGVtPlxuXHRcdFx0XHQ8L1VJLkdyb3VwPlxuXHRcdFx0XHQ8VUkuR3JvdXBIZWFkZXI+UmFkaW88L1VJLkdyb3VwSGVhZGVyPlxuXHRcdFx0XHQ8VUkuR3JvdXA+XG5cdFx0XHRcdFx0PFVJLlJhZGlvTGlzdCB2YWx1ZT17dGhpcy5zdGF0ZS5mbGF2b3VyfSBvbkNoYW5nZT17dGhpcy5oYW5kbGVGbGF2b3VyQ2hhbmdlfSBvcHRpb25zPXtbXG5cdFx0XHRcdFx0XHR7IGxhYmVsOiAnVmFuaWxsYScsICAgIHZhbHVlOiAndmFuaWxsYScgfSxcblx0XHRcdFx0XHRcdHsgbGFiZWw6ICdDaG9jb2xhdGUnLCAgdmFsdWU6ICdjaG9jb2xhdGUnIH0sXG5cdFx0XHRcdFx0XHR7IGxhYmVsOiAnQ2FyYW1lbCcsICAgIHZhbHVlOiAnY2FyYW1lbCcgfSxcblx0XHRcdFx0XHRcdHsgbGFiZWw6ICdTdHJhd2JlcnJ5JywgdmFsdWU6ICdzdHJhd2JlcnJ5JyB9XG5cdFx0XHRcdFx0XX0gLz5cblx0XHRcdFx0PC9VSS5Hcm91cD5cblx0XHRcdFx0PFVJLkdyb3VwSGVhZGVyPklucHV0czwvVUkuR3JvdXBIZWFkZXI+XG5cdFx0XHRcdDxVSS5Hcm91cD5cblx0XHRcdFx0XHQ8VUkuSW5wdXQgcGxhY2Vob2xkZXI9XCJEZWZhdWx0XCIgLz5cblx0XHRcdFx0XHQ8VUkuSW5wdXQgZGVmYXVsdFZhbHVlPVwiV2l0aCBWYWx1ZVwiIHBsYWNlaG9sZGVyPVwiUGxhY2Vob2xkZXJcIiAvPlxuXHRcdFx0XHRcdDxVSS5UZXh0YXJlYSBkZWZhdWx0VmFsdWU9XCJMb25ndGV4dCBpcyBnb29kIGZvciBiaW9zIGV0Yy5cIiBwbGFjZWhvbGRlcj1cIkxvbmd0ZXh0XCIgLz5cblx0XHRcdFx0PC9VSS5Hcm91cD5cblx0XHRcdFx0PFVJLkdyb3VwSGVhZGVyPkxhYmVsbGVkIElucHV0czwvVUkuR3JvdXBIZWFkZXI+XG5cdFx0XHRcdDxVSS5Hcm91cD5cblx0XHRcdFx0XHQ8VUkuTGFiZWxJbnB1dCB0eXBlPVwiZW1haWxcIiBsYWJlbD1cIkVtYWlsXCIgICBwbGFjZWhvbGRlcj1cInlvdXIubmFtZUBleGFtcGxlLmNvbVwiIC8+XG5cdFx0XHRcdFx0PFVJLkxhYmVsSW5wdXQgdHlwZT1cInVybFwiICAgbGFiZWw9XCJVUkxcIiAgICAgcGxhY2Vob2xkZXI9XCJodHRwOi8vd3d3LnlvdXJ3ZWJzaXRlLmNvbVwiIC8+XG5cdFx0XHRcdFx0PFVJLkxhYmVsSW5wdXQgbm9lZGl0ICAgICAgIGxhYmVsPVwiTm8gRWRpdFwiIGRlZmF1bHRWYWx1ZT1cIlVuLWVkaXRhYmxlLCBzY3JvbGxhYmxlLCBzZWxlY3RhYmxlIGNvbnRlbnRcIiAvPlxuXHRcdFx0XHRcdDxVSS5MYWJlbFNlbGVjdCBsYWJlbD1cIkZsYXZvdXJcIiB2YWx1ZT17dGhpcy5zdGF0ZS5mbGF2b3VyfSBvbkNoYW5nZT17dGhpcy5oYW5kbGVGbGF2b3VyQ2hhbmdlfSBvcHRpb25zPXtbXG5cdFx0XHRcdFx0XHR7IGxhYmVsOiAnVmFuaWxsYScsICAgIHZhbHVlOiAndmFuaWxsYScgfSxcblx0XHRcdFx0XHRcdHsgbGFiZWw6ICdDaG9jb2xhdGUnLCAgdmFsdWU6ICdjaG9jb2xhdGUnIH0sXG5cdFx0XHRcdFx0XHR7IGxhYmVsOiAnQ2FyYW1lbCcsICAgIHZhbHVlOiAnY2FyYW1lbCcgfSxcblx0XHRcdFx0XHRcdHsgbGFiZWw6ICdTdHJhd2JlcnJ5JywgdmFsdWU6ICdzdHJhd2JlcnJ5JyB9LFxuXHRcdFx0XHRcdFx0eyBsYWJlbDogJ0JhbmFuYScsICAgICB2YWx1ZTogJ2JhbmFuYScgfSxcblx0XHRcdFx0XHRcdHsgbGFiZWw6ICdMZW1vbicsICAgICAgdmFsdWU6ICdsZW1vbicgfSxcblx0XHRcdFx0XHRcdHsgbGFiZWw6ICdQYXN0YWNjaW8nLCAgdmFsdWU6ICdwYXN0YWNjaW8nIH1cblx0XHRcdFx0XHRdfSAvPlxuXHRcdFx0XHQ8L1VJLkdyb3VwPlxuXHRcdFx0XHQ8VUkuQnV0dG9uIHR5cGU9XCJwcmltYXJ5XCIgb25UYXA9e3RoaXMuYWxlcnQuYmluZCh0aGlzLCAnWW91IGNsaWNrZWQgdGhlIFByaW1hcnkgQnV0dG9uJyl9PlxuXHRcdFx0XHRcdFByaW1hcnkgQnV0dG9uXG5cdFx0XHRcdDwvVUkuQnV0dG9uPlxuXHRcdFx0XHQ8VUkuQnV0dG9uIG9uVGFwPXt0aGlzLmFsZXJ0LmJpbmQodGhpcywgJ1lvdSBjbGlja2VkIHRoZSBEZWZhdWx0IEJ1dHRvbicpfT5cblx0XHRcdFx0XHREZWZhdWx0IEJ1dHRvblxuXHRcdFx0XHQ8L1VJLkJ1dHRvbj5cblx0XHRcdFx0PFVJLkJ1dHRvbiB0eXBlPVwiZGFuZ2VyXCIgb25UYXA9e3RoaXMuYWxlcnQuYmluZCh0aGlzLCAnWW91IGNsaWNrZWQgdGhlIERhbmdlciBCdXR0b24nKX0+XG5cdFx0XHRcdFx0RGFuZ2VyIEJ1dHRvblxuXHRcdFx0XHQ8L1VJLkJ1dHRvbj5cblx0XHRcdFx0PFVJLkJ1dHRvbiB0eXBlPVwiZGFuZ2VyXCIgb25UYXA9e3RoaXMuYWxlcnQuYmluZCh0aGlzLCAnWW91IGNsaWNrZWQgdGhlIERhbmdlciBCdXR0b24nKX0gZGlzYWJsZWQ+XG5cdFx0XHRcdFx0RGlzYWJsZWQgQnV0dG9uXG5cdFx0XHRcdDwvVUkuQnV0dG9uPlxuXHRcdFx0PC9Db250YWluZXI+XG5cdFx0KTtcblx0fVxufSk7XG4iLCJ2YXIgQ29udGFpbmVyID0gcmVxdWlyZSgncmVhY3QtY29udGFpbmVyJyk7XG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xudmFyIFRhcHBhYmxlID0gcmVxdWlyZSgncmVhY3QtdGFwcGFibGUnKTtcbnZhciBTZW50cnkgPSByZXF1aXJlKCdyZWFjdC1zZW50cnknKTtcblxudmFyIHsgTGluaywgVUkgfSA9IHJlcXVpcmUoJ3RvdWNoc3RvbmVqcycpO1xuXG5jb25zdCBzY3JvbGxhYmxlID0gQ29udGFpbmVyLmluaXRTY3JvbGxhYmxlKCk7XG5cbnZhciBDb21wbGV4TGlua0l0ZW0gPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cdGNvbnRleHRUeXBlczogeyBwZW9wbGVTdG9yZTogUmVhY3QuUHJvcFR5cGVzLm9iamVjdC5pc1JlcXVpcmVkIH0sXG5cblx0dG9nZ2xlU3RhciAoKSB7XG5cdFx0dmFyIHBlcnNvbiA9IHRoaXMucHJvcHMucGVyc29uXG5cblx0XHR0aGlzLmNvbnRleHQucGVvcGxlU3RvcmUuc3RhcihwZXJzb24sICFwZXJzb24uaXNTdGFycmVkKVxuXHR9LFxuXG5cdHJlbmRlciAoKSB7XG5cdFx0dmFyIHBlcnNvbiA9IHRoaXMucHJvcHMucGVyc29uO1xuXG5cdFx0cmV0dXJuIChcblx0XHRcdDxMaW5rIHRvPVwidGFiczpsaXN0LWRldGFpbHNcIiB0cmFuc2l0aW9uPVwic2hvdy1mcm9tLXJpZ2h0XCIgdmlld1Byb3BzPXt7IHBlcnNvbjogcGVyc29uLCBwcmV2VmlldzogJ2xpc3QtY29tcGxleCcgfX0+XG5cdFx0XHRcdDxVSS5JdGVtPlxuXHRcdFx0XHRcdDxVSS5JdGVtTWVkaWEgYXZhdGFyPXtwZXJzb24ucGljdHVyZX0gYXZhdGFySW5pdGlhbHM9e3BlcnNvbi5pbml0aWFsc30gLz5cblx0XHRcdFx0XHQ8VUkuSXRlbUlubmVyPlxuXHRcdFx0XHRcdFx0PFVJLkl0ZW1Db250ZW50PlxuXHRcdFx0XHRcdFx0XHQ8VUkuSXRlbVRpdGxlPntwZXJzb24ubmFtZS5mdWxsfTwvVUkuSXRlbVRpdGxlPlxuXHRcdFx0XHRcdFx0XHQ8VUkuSXRlbVN1YlRpdGxlPntwZXJzb24uYmlvfTwvVUkuSXRlbVN1YlRpdGxlPlxuXHRcdFx0XHRcdFx0PC9VSS5JdGVtQ29udGVudD5cblx0XHRcdFx0XHRcdDxUYXBwYWJsZSBvblRhcD17dGhpcy50b2dnbGVTdGFyfSBzdG9wUHJvcGFnYXRpb24+XG5cdFx0XHRcdFx0XHRcdDxVSS5JdGVtTm90ZSBpY29uPXtwZXJzb24uaXNTdGFycmVkID8gJ2lvbi1pb3Mtc3RhcicgOiAnaW9uLWlvcy1zdGFyLW91dGxpbmUnfSB0eXBlPXtwZXJzb24uaXNTdGFycmVkID8gJ3dhcm5pbmcnIDogJ2RlZmF1bHQnfSBjbGFzc05hbWU9XCJpb24tbGdcIiAvPlxuXHRcdFx0XHRcdFx0PC9UYXBwYWJsZT5cblx0XHRcdFx0XHQ8L1VJLkl0ZW1Jbm5lcj5cblx0XHRcdFx0PC9VSS5JdGVtPlxuXHRcdFx0PC9MaW5rPlxuXHRcdCk7XG5cdH1cbn0pO1xuXG4vLyBGSVhNRTogdGhpcyBiaXQgaXMgZ2xvYmFsIGFuZCBoYWNreSwgZXhwZWN0IGl0IHRvIGNoYW5nZVxudmFyIEV2ZW50RW1pdHRlciA9IHJlcXVpcmUoJ2V2ZW50cycpLkV2ZW50RW1pdHRlcjtcbnZhciBlbWl0dGVyID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuXG5mdW5jdGlvbiBnZXROYXZpZ2F0aW9uIChwcm9wcywgYXBwLCBmaWx0ZXJTdGFycmVkKSB7XG5cdHJldHVybiB7XG5cdFx0bGVmdExhYmVsOiAnTGlzdHMnLFxuXHRcdGxlZnRBcnJvdzogdHJ1ZSxcblx0XHRsZWZ0QWN0aW9uOiAoKSA9PiB7IGFwcC50cmFuc2l0aW9uVG8oJ3RhYnM6bGlzdHMnLCB7IHRyYW5zaXRpb246ICdyZXZlYWwtZnJvbS1yaWdodCcgfSkgfSxcblx0XHRyaWdodExhYmVsOiBmaWx0ZXJTdGFycmVkID8gJ0FsbCcgOiAnU3RhcnJlZCcsXG5cdFx0cmlnaHRBY3Rpb246IGVtaXR0ZXIuZW1pdC5iaW5kKGVtaXR0ZXIsICduYXZpZ2F0aW9uQmFyUmlnaHRBY3Rpb24nKSxcblx0XHR0aXRsZTogJ0NvbXBsZXgnXG5cdH07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXHRjb250ZXh0VHlwZXM6IHtcblx0XHRhcHA6IFJlYWN0LlByb3BUeXBlcy5vYmplY3QsXG5cdFx0cGVvcGxlU3RvcmU6IFJlYWN0LlByb3BUeXBlcy5vYmplY3QuaXNSZXF1aXJlZFxuXHR9LFxuXHRtaXhpbnM6IFtTZW50cnkoKV0sXG5cblx0c3RhdGljczoge1xuXHRcdG5hdmlnYXRpb25CYXI6ICdtYWluJyxcblx0XHRnZXROYXZpZ2F0aW9uOiBnZXROYXZpZ2F0aW9uXG5cdH0sXG5cblx0Z2V0SW5pdGlhbFN0YXRlICgpIHtcblx0XHRyZXR1cm4ge1xuXHRcdFx0ZmlsdGVyU3RhcnJlZDogZmFsc2UsXG5cdFx0XHRwZW9wbGU6IHRoaXMuY29udGV4dC5wZW9wbGVTdG9yZS5nZXRQZW9wbGUoKVxuXHRcdH1cblx0fSxcblxuXHRjb21wb25lbnREaWRNb3VudCAoKSB7XG5cdFx0dmFyIHNlbGYgPSB0aGlzXG5cblx0XHR0aGlzLndhdGNoKHRoaXMuY29udGV4dC5wZW9wbGVTdG9yZSwgJ3Blb3BsZS11cGRhdGVkJywgcGVvcGxlID0+IHtcblx0XHRcdHNlbGYuc2V0U3RhdGUoeyBwZW9wbGUgfSlcblx0XHR9KVxuXG5cdFx0dGhpcy53YXRjaChlbWl0dGVyLCAnbmF2aWdhdGlvbkJhclJpZ2h0QWN0aW9uJywgdGhpcy50b2dnbGVTdGFycmVkKTtcblx0fSxcblxuXHR0b2dnbGVTdGFycmVkICgpIHtcblx0XHR2YXIgZmlsdGVyU3RhcnJlZCA9ICF0aGlzLnN0YXRlLmZpbHRlclN0YXJyZWQ7XG5cdFx0dGhpcy5zZXRTdGF0ZSh7IGZpbHRlclN0YXJyZWQgfSk7XG5cdFx0dGhpcy5jb250ZXh0LmFwcC5uYXZpZ2F0aW9uQmFycy5tYWluLnVwZGF0ZShnZXROYXZpZ2F0aW9uKHt9LCB0aGlzLmNvbnRleHQuYXBwLCBmaWx0ZXJTdGFycmVkKSk7XG5cdH0sXG5cblx0aGFuZGxlTW9kZUNoYW5nZSAobmV3TW9kZSkge1xuXHRcdHZhciBzZWxlY3RlZE1vZGUgPSBuZXdNb2RlO1xuXG5cdFx0aWYgKHRoaXMuc3RhdGUuc2VsZWN0ZWRNb2RlID09PSBuZXdNb2RlKSB7XG5cdFx0XHRzZWxlY3RlZE1vZGUgPSBudWxsO1xuXHRcdH1cblxuXHRcdHRoaXMuc2V0U3RhdGUoeyBzZWxlY3RlZE1vZGUgfSlcblx0fSxcblxuXHRyZW5kZXIgKCkge1xuXHRcdHZhciB7IHBlb3BsZSwgZmlsdGVyU3RhcnJlZCwgc2VsZWN0ZWRNb2RlIH0gPSB0aGlzLnN0YXRlXG5cblx0XHRpZiAoZmlsdGVyU3RhcnJlZCkge1xuXHRcdFx0cGVvcGxlID0gcGVvcGxlLmZpbHRlcihwZXJzb24gPT4gcGVyc29uLmlzU3RhcnJlZClcblx0XHR9XG5cblx0XHRpZiAoc2VsZWN0ZWRNb2RlID09PSAnQScgfHwgc2VsZWN0ZWRNb2RlID09PSAnQicpIHtcblx0XHRcdHBlb3BsZSA9IHBlb3BsZS5maWx0ZXIocGVyc29uID0+IHBlcnNvbi5jYXRlZ29yeSA9PT0gc2VsZWN0ZWRNb2RlKVxuXHRcdH1cblxuXHRcdGZ1bmN0aW9uIHNvcnRCeU5hbWUgKGEsIGIpIHsgcmV0dXJuIGEubmFtZS5mdWxsLmxvY2FsZUNvbXBhcmUoYi5uYW1lLmZ1bGwpIH1cblxuXHRcdHZhciBzb3J0ZWRQZW9wbGUgPSBwZW9wbGUuc29ydChzb3J0QnlOYW1lKVxuXHRcdHZhciByZXN1bHRzXG5cblx0XHRpZiAoc29ydGVkUGVvcGxlLmxlbmd0aCkge1xuXHRcdFx0dmFyIGFQZW9wbGUgPSBzb3J0ZWRQZW9wbGVcblx0XHRcdFx0LmZpbHRlcihwZXJzb24gPT4gcGVyc29uLmNhdGVnb3J5ID09PSAnQScpXG5cdFx0XHRcdC5tYXAoKHBlcnNvbiwgaSkgPT4ge1xuXHRcdFx0XHRcdHJldHVybiA8Q29tcGxleExpbmtJdGVtIGtleT17J3BlcnNvbmEnICsgaX0gcGVyc29uPXtwZXJzb259IC8+XG5cdFx0XHRcdH0pXG5cblx0XHRcdHZhciBiUGVvcGxlID0gc29ydGVkUGVvcGxlXG5cdFx0XHRcdC5maWx0ZXIocGVyc29uID0+IHBlcnNvbi5jYXRlZ29yeSA9PT0gJ0InKVxuXHRcdFx0XHQubWFwKChwZXJzb24sIGkpID0+IHtcblx0XHRcdFx0XHRyZXR1cm4gPENvbXBsZXhMaW5rSXRlbSBrZXk9eydwZXJzb25iJyArIGl9IHBlcnNvbj17cGVyc29ufSAvPlxuXHRcdFx0XHR9KVxuXG5cdFx0XHRyZXN1bHRzID0gKFxuXHRcdFx0XHQ8VUkuR3JvdXA+XG5cdFx0XHRcdFx0e2FQZW9wbGUubGVuZ3RoID4gMCA/IDxVSS5MaXN0SGVhZGVyIHN0aWNreT5DYXRlZ29yeSBBPC9VSS5MaXN0SGVhZGVyPiA6ICcnfVxuXHRcdFx0XHRcdHthUGVvcGxlfVxuXHRcdFx0XHRcdHtiUGVvcGxlLmxlbmd0aCA+IDAgPyA8VUkuTGlzdEhlYWRlciBzdGlja3k+Q2F0ZWdvcnkgQjwvVUkuTGlzdEhlYWRlcj4gOiAnJ31cblx0XHRcdFx0XHR7YlBlb3BsZX1cblx0XHRcdFx0PC9VSS5Hcm91cD5cblx0XHRcdClcblxuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXN1bHRzID0gKFxuXHRcdFx0XHQ8Q29udGFpbmVyIGRpcmVjdGlvbj1cImNvbHVtblwiIGFsaWduPVwiY2VudGVyXCIganVzdGlmeT1cImNlbnRlclwiIGNsYXNzTmFtZT1cIm5vLXJlc3VsdHNcIj5cblx0XHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT1cIm5vLXJlc3VsdHNfX2ljb24gaW9uLWlvcy1zdGFyXCIgLz5cblx0XHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT1cIm5vLXJlc3VsdHNfX3RleHRcIj5HbyBzdGFyIHNvbWUgcGVvcGxlITwvZGl2PlxuXHRcdFx0XHQ8L0NvbnRhaW5lcj5cblx0XHRcdClcblx0XHR9XG5cblx0XHRyZXR1cm4gKFxuXHRcdFx0PENvbnRhaW5lciBzY3JvbGxhYmxlPXtzY3JvbGxhYmxlfT5cblx0XHRcdFx0PFVJLlNlZ21lbnRlZENvbnRyb2wgdmFsdWU9e3RoaXMuc3RhdGUuc2VsZWN0ZWRNb2RlfSBvbkNoYW5nZT17dGhpcy5oYW5kbGVNb2RlQ2hhbmdlfSBoYXNHdXR0ZXIgZXF1YWxXaWR0aFNlZ21lbnRzIG9wdGlvbnM9e1tcblx0XHRcdFx0XHR7IGxhYmVsOiAnQScsIHZhbHVlOiAnQScgfSxcblx0XHRcdFx0XHR7IGxhYmVsOiAnQicsIHZhbHVlOiAnQicgfVxuXHRcdFx0XHRdfSAvPlxuXHRcdFx0XHR7cmVzdWx0c31cblx0XHRcdDwvQ29udGFpbmVyPlxuXHRcdCk7XG5cdH1cbn0pO1xuIiwidmFyIENvbnRhaW5lciA9IHJlcXVpcmUoJ3JlYWN0LWNvbnRhaW5lcicpO1xudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cdHN0YXRpY3M6IHtcblx0XHRuYXZpZ2F0aW9uQmFyOiAnbWFpbicsXG5cdFx0Z2V0TmF2aWdhdGlvbiAocHJvcHMsIGFwcCkge1xuXHRcdFx0dmFyIGxlZnRMYWJlbCA9IHByb3BzLnByZXZWaWV3ID09PSAnbGlzdC1zaW1wbGUnID8gJ1NpbXBsZScgOiAnQ29tcGxleCc7XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRsZWZ0QXJyb3c6IHRydWUsXG5cdFx0XHRcdGxlZnRMYWJlbDogbGVmdExhYmVsLFxuXHRcdFx0XHRsZWZ0QWN0aW9uOiAoKSA9PiB7IGFwcC50cmFuc2l0aW9uVG8oJ3RhYnM6JyArIHByb3BzLnByZXZWaWV3LCB7IHRyYW5zaXRpb246ICdyZXZlYWwtZnJvbS1yaWdodCcgfSkgfSxcblx0XHRcdFx0dGl0bGU6ICdQZXJzb24nXG5cdFx0XHR9XG5cdFx0fVxuXHR9LFxuXHRnZXREZWZhdWx0UHJvcHMgKCkge1xuXHRcdHJldHVybiB7XG5cdFx0XHRwcmV2VmlldzogJ2hvbWUnXG5cdFx0fVxuXHR9LFxuXHRyZW5kZXIgKCkge1xuXHRcdHZhciB7IHBlcnNvbiB9ID0gdGhpcy5wcm9wcztcblxuXHRcdHJldHVybiAoXG5cdFx0XHQ8Q29udGFpbmVyIGRpcmVjdGlvbj1cImNvbHVtblwiPlxuXHRcdFx0XHQ8Q29udGFpbmVyIGZpbGwgc2Nyb2xsYWJsZSByZWY9XCJzY3JvbGxDb250YWluZXJcIiBjbGFzc05hbWU9XCJQZXJzb25EZXRhaWxzXCI+XG5cdFx0XHRcdFx0PGltZyBzcmM9e3BlcnNvbi5waWN0dXJlfSBjbGFzc05hbWU9XCJQZXJzb25EZXRhaWxzX19hdmF0YXJcIiAvPlxuXHRcdFx0XHRcdDxkaXYgY2xhc3NOYW1lPVwiUGVyc29uRGV0YWlsc19faGVhZGluZ1wiPntwZXJzb24ubmFtZS5mdWxsfTwvZGl2PlxuXHRcdFx0XHRcdDxkaXYgY2xhc3NOYW1lPVwiUGVyc29uRGV0YWlsc19fdGV4dCB0ZXh0LWJsb2NrXCI+e3BlcnNvbi5iaW99PC9kaXY+XG5cdFx0XHRcdFx0eyhwZXJzb24udHdpdHRlciB8fCBwZXJzb24uZ2l0aHViKSAmJiA8ZGl2IGNsYXNzTmFtZT1cIlBlcnNvbkRldGFpbHNfX3Byb2ZpbGVzXCI+XG5cdFx0XHRcdFx0XHR7cGVyc29uLnR3aXR0ZXIgJiYgPGRpdiBjbGFzc05hbWU9XCJQZXJzb25EZXRhaWxzX19wcm9maWxlXCI+XG5cdFx0XHRcdFx0XHRcdDxzcGFuIGNsYXNzTmFtZT1cIlBlcnNvbkRldGFpbHNfX3Byb2ZpbGVfX2ljb24gaW9uLXNvY2lhbC10d2l0dGVyXCIgLz5cblx0XHRcdFx0XHRcdFx0e3BlcnNvbi50d2l0dGVyfVxuXHRcdFx0XHRcdFx0PC9kaXY+fVxuXHRcdFx0XHRcdFx0e3BlcnNvbi5naXRodWIgJiYgPGRpdiBjbGFzc05hbWU9XCJQZXJzb25EZXRhaWxzX19wcm9maWxlXCI+XG5cdFx0XHRcdFx0XHRcdDxzcGFuIGNsYXNzTmFtZT1cIlBlcnNvbkRldGFpbHNfX3Byb2ZpbGVfX2ljb24gaW9uLXNvY2lhbC1naXRodWJcIiAvPlxuXHRcdFx0XHRcdFx0XHR7cGVyc29uLmdpdGh1Yn1cblx0XHRcdFx0XHRcdDwvZGl2Pn1cblx0XHRcdFx0XHQ8L2Rpdj59XG5cdFx0XHRcdDwvQ29udGFpbmVyPlxuXHRcdFx0PC9Db250YWluZXI+XG5cdFx0KTtcblx0fVxufSk7XG4iLCJ2YXIgQ29udGFpbmVyID0gcmVxdWlyZSgncmVhY3QtY29udGFpbmVyJyk7XG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xudmFyIFRhcHBhYmxlID0gcmVxdWlyZSgncmVhY3QtdGFwcGFibGUnKTtcbnZhciBTZW50cnkgPSByZXF1aXJlKCdyZWFjdC1zZW50cnknKTtcblxudmFyIHsgTGluaywgVUkgfSA9IHJlcXVpcmUoJ3RvdWNoc3RvbmVqcycpO1xuXG52YXIgU2VhcmNoID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXHRkaXNwbGF5TmFtZTogJ1NlYXJjaCcsXG5cdHByb3BUeXBlczoge1xuXHRcdHNlYXJjaFN0cmluZzogUmVhY3QuUHJvcFR5cGVzLnN0cmluZyxcblx0XHRvbkNoYW5nZTogUmVhY3QuUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZFxuXHR9LFxuXG5cdGdldERlZmF1bHRQcm9wcyAoKSB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdHNlYXJjaFN0cmluZzogJydcblx0XHR9XG5cdH0sXG5cblx0aGFuZGxlQ2hhbmdlIChldmVudCkge1xuXHRcdHRoaXMucHJvcHMub25DaGFuZ2UoZXZlbnQudGFyZ2V0LnZhbHVlKTtcblx0fSxcblxuXHRyZXNldCAoKSB7XG5cdFx0dGhpcy5wcm9wcy5vbkNoYW5nZSgnJyk7XG5cdH0sXG5cblx0cmVuZGVyICgpIHtcblx0XHR2YXIgY2xlYXJJY29uO1xuXG5cdFx0aWYgKHRoaXMucHJvcHMuc2VhcmNoU3RyaW5nLmxlbmd0aCA+IDApIHtcblx0XHRcdGNsZWFySWNvbiA9IDxUYXBwYWJsZSBjbGFzc05hbWU9XCJTZWFyY2hGaWVsZF9faWNvbiBTZWFyY2hGaWVsZF9faWNvbi0tY2xlYXJcIiBvblRhcD17dGhpcy5yZXNldH0gLz47XG5cdFx0fVxuXG5cdFx0cmV0dXJuIChcblx0XHRcdDxkaXYgY2xhc3NOYW1lPVwiU2VhcmNoRmllbGRcIj5cblx0XHRcdFx0PHNwYW4gY2xhc3NOYW1lPVwiU2VhcmNoRmllbGRfX2ljb24gU2VhcmNoRmllbGRfX2ljb24tLXNlYXJjaFwiIC8+XG5cdFx0XHRcdDxpbnB1dCByZWY9XCJpbnB1dFwiIHZhbHVlPXt0aGlzLnByb3BzLnNlYXJjaFN0cmluZ30gb25DaGFuZ2U9e3RoaXMuaGFuZGxlQ2hhbmdlfSBjbGFzc05hbWU9XCJTZWFyY2hGaWVsZF9faW5wdXRcIiBwbGFjZWhvbGRlcj0nU2VhcmNoLi4uJyAvPlxuXHRcdFx0XHR7Y2xlYXJJY29ufVxuXHRcdFx0PC9kaXY+XG5cdFx0KTtcblx0fVxufSk7XG5cbnZhciBTaW1wbGVMaW5rSXRlbSA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblx0cHJvcFR5cGVzOiB7XG5cdFx0cGVyc29uOiBSZWFjdC5Qcm9wVHlwZXMub2JqZWN0LmlzUmVxdWlyZWRcblx0fSxcblxuXHRyZW5kZXIgKCkge1xuXHRcdHJldHVybiAoXG5cdFx0XHQ8TGluayB0bz1cInRhYnM6bGlzdC1kZXRhaWxzXCIgdHJhbnNpdGlvbj1cInNob3ctZnJvbS1yaWdodFwiIHZpZXdQcm9wcz17eyBwZXJzb246IHRoaXMucHJvcHMucGVyc29uLCBwcmV2VmlldzogJ2xpc3Qtc2ltcGxlJyB9fT5cblx0XHRcdFx0PFVJLkl0ZW0gc2hvd0Rpc2Nsb3N1cmVBcnJvdz5cblx0XHRcdFx0XHQ8VUkuSXRlbUlubmVyPlxuXHRcdFx0XHRcdFx0PFVJLkl0ZW1UaXRsZT57dGhpcy5wcm9wcy5wZXJzb24ubmFtZS5mdWxsfTwvVUkuSXRlbVRpdGxlPlxuXHRcdFx0XHRcdDwvVUkuSXRlbUlubmVyPlxuXHRcdFx0XHQ8L1VJLkl0ZW0+XG5cdFx0XHQ8L0xpbms+XG5cdFx0KTtcblx0fVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXHRtaXhpbnM6IFtTZW50cnkoKV0sXG5cdGNvbnRleHRUeXBlczogeyBwZW9wbGVTdG9yZTogUmVhY3QuUHJvcFR5cGVzLm9iamVjdC5pc1JlcXVpcmVkIH0sXG5cblx0c3RhdGljczoge1xuXHRcdG5hdmlnYXRpb25CYXI6ICdtYWluJyxcblx0XHRnZXROYXZpZ2F0aW9uIChwcm9wcywgYXBwKSB7XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRsZWZ0QXJyb3c6IHRydWUsXG5cdFx0XHRcdGxlZnRMYWJlbDogJ0xpc3RzJyxcblx0XHRcdFx0bGVmdEFjdGlvbjogKCkgPT4geyBhcHAudHJhbnNpdGlvblRvKCd0YWJzOmxpc3RzJywgeyB0cmFuc2l0aW9uOiAncmV2ZWFsLWZyb20tcmlnaHQnIH0pIH0sXG5cdFx0XHRcdHRpdGxlOiAnU2ltcGxlJ1xuXHRcdFx0fVxuXHRcdH1cblx0fSxcblxuXHRjb21wb25lbnREaWRNb3VudCAoKSB7XG5cdFx0dmFyIHNlbGYgPSB0aGlzXG5cblx0XHR0aGlzLndhdGNoKHRoaXMuY29udGV4dC5wZW9wbGVTdG9yZSwgJ3Blb3BsZS11cGRhdGVkJywgcGVvcGxlID0+IHtcblx0XHRcdHNlbGYuc2V0U3RhdGUoeyBwZW9wbGUgfSlcblx0XHR9KVxuXHR9LFxuXG5cdGdldEluaXRpYWxTdGF0ZSAoKSB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdHNlYXJjaFN0cmluZzogJycsXG5cdFx0XHRwZW9wbGU6IHRoaXMuY29udGV4dC5wZW9wbGVTdG9yZS5nZXRQZW9wbGUoKVxuXHRcdH1cblx0fSxcblxuXHR1cGRhdGVTZWFyY2ggKHN0cikge1xuXHRcdHRoaXMuc2V0U3RhdGUoeyBzZWFyY2hTdHJpbmc6IHN0ciB9KTtcblx0fSxcblxuXHRyZW5kZXIgKCkge1xuXHRcdHZhciB7IHNlYXJjaFN0cmluZyB9ID0gdGhpcy5zdGF0ZVxuXHRcdHZhciBzZWFyY2hSZWdleCA9IG5ldyBSZWdFeHAoc2VhcmNoU3RyaW5nKVxuXG5cdFx0ZnVuY3Rpb24gc2VhcmNoRmlsdGVyIChwZXJzb24pIHsgcmV0dXJuIHNlYXJjaFJlZ2V4LnRlc3QocGVyc29uLm5hbWUuZnVsbCkgfVxuXHRcdGZ1bmN0aW9uIHNvcnRCeU5hbWUgKGEsIGIpIHsgcmV0dXJuIGEubmFtZS5mdWxsLmxvY2FsZUNvbXBhcmUoYi5uYW1lLmZ1bGwpIH1cblxuXHRcdHZhciB7IHBlb3BsZSB9ID0gdGhpcy5zdGF0ZVxuXHRcdHZhciBmaWx0ZXJlZFBlb3BsZSA9IHBlb3BsZS5maWx0ZXIoc2VhcmNoRmlsdGVyKVxuXHRcdFx0LnNvcnQoc29ydEJ5TmFtZSlcblxuXHRcdHZhciByZXN1bHRzXG5cblx0XHRpZiAoc2VhcmNoU3RyaW5nICYmICFmaWx0ZXJlZFBlb3BsZS5sZW5ndGgpIHtcblx0XHRcdHJlc3VsdHMgPSAoXG5cdFx0XHRcdDxDb250YWluZXIgZGlyZWN0aW9uPVwiY29sdW1uXCIgYWxpZ249XCJjZW50ZXJcIiBqdXN0aWZ5PVwiY2VudGVyXCIgY2xhc3NOYW1lPVwibm8tcmVzdWx0c1wiPlxuXHRcdFx0XHRcdDxkaXYgY2xhc3NOYW1lPVwibm8tcmVzdWx0c19faWNvbiBpb24taW9zLXNlYXJjaC1zdHJvbmdcIiAvPlxuXHRcdFx0XHRcdDxkaXYgY2xhc3NOYW1lPVwibm8tcmVzdWx0c19fdGV4dFwiPnsnTm8gcmVzdWx0cyBmb3IgXCInICsgc2VhcmNoU3RyaW5nICsgJ1wiJ308L2Rpdj5cblx0XHRcdFx0PC9Db250YWluZXI+XG5cdFx0XHQpO1xuXG5cdFx0fSBlbHNlIHtcblx0XHRcdHZhciBhUGVvcGxlID0gZmlsdGVyZWRQZW9wbGVcblx0XHRcdFx0LmZpbHRlcihwZXJzb24gPT4gcGVyc29uLmNhdGVnb3J5ID09PSAnQScpXG5cdFx0XHRcdC5tYXAoKHBlcnNvbiwgaSkgPT4ge1xuXHRcdFx0XHRcdHJldHVybiA8U2ltcGxlTGlua0l0ZW0ga2V5PXsncGVyc29uYScgKyBpfSBwZXJzb249e3BlcnNvbn0gLz5cblx0XHRcdFx0fSlcblxuXHRcdFx0dmFyIGJQZW9wbGUgPSBmaWx0ZXJlZFBlb3BsZVxuXHRcdFx0XHQuZmlsdGVyKHBlcnNvbiA9PiBwZXJzb24uY2F0ZWdvcnkgPT09ICdCJylcblx0XHRcdFx0Lm1hcCgocGVyc29uLCBpKSA9PiB7XG5cdFx0XHRcdFx0cmV0dXJuIDxTaW1wbGVMaW5rSXRlbSBrZXk9eydwZXJzb25iJyArIGl9IHBlcnNvbj17cGVyc29ufSAvPlxuXHRcdFx0XHR9KVxuXG5cdFx0XHRyZXN1bHRzID0gKFxuXHRcdFx0XHQ8VUkuR3JvdXA+XG5cdFx0XHRcdFx0e2FQZW9wbGUubGVuZ3RoID4gMCA/IDxVSS5MaXN0SGVhZGVyIHN0aWNreT5DYXRlZ29yeSBBPC9VSS5MaXN0SGVhZGVyPiA6ICcnfVxuXHRcdFx0XHRcdHthUGVvcGxlfVxuXHRcdFx0XHRcdHtiUGVvcGxlLmxlbmd0aCA+IDAgPyA8VUkuTGlzdEhlYWRlciBzdGlja3k+Q2F0ZWdvcnkgQjwvVUkuTGlzdEhlYWRlcj4gOiAnJ31cblx0XHRcdFx0XHR7YlBlb3BsZX1cblx0XHRcdFx0PC9VSS5Hcm91cD5cblx0XHRcdClcblx0XHR9XG5cblx0XHRyZXR1cm4gKFxuXHRcdFx0PENvbnRhaW5lciBzY3JvbGxhYmxlPlxuXHRcdFx0XHQ8U2VhcmNoIHNlYXJjaFN0cmluZz17dGhpcy5zdGF0ZS5zZWFyY2hTdHJpbmd9IG9uQ2hhbmdlPXt0aGlzLnVwZGF0ZVNlYXJjaH0gLz5cblx0XHRcdFx0e3Jlc3VsdHN9XG5cdFx0XHQ8L0NvbnRhaW5lcj5cblx0XHQpO1xuXHR9XG59KTtcbiIsInZhciBDb250YWluZXIgPSByZXF1aXJlKCdyZWFjdC1jb250YWluZXInKTtcbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG52YXIgeyBMaW5rLCBVSSB9ID0gcmVxdWlyZSgndG91Y2hzdG9uZWpzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXHRzdGF0aWNzOiB7XG5cdFx0bmF2aWdhdGlvbkJhcjogJ21haW4nLFxuXHRcdGdldE5hdmlnYXRpb24gKCkge1xuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0dGl0bGU6ICdMaXN0cydcblx0XHRcdH1cblx0XHR9XG5cdH0sXG5cblx0cmVuZGVyOiBmdW5jdGlvbiAoKSB7XG5cdFx0cmV0dXJuIChcblx0XHRcdDxDb250YWluZXIgc2Nyb2xsYWJsZT5cblx0XHRcdFx0PFVJLkdyb3VwSGVhZGVyPkxpc3RzPC9VSS5Hcm91cEhlYWRlcj5cblx0XHRcdFx0PFVJLkdyb3VwPlxuXHRcdFx0XHRcdDxMaW5rIHRvPVwidGFiczpsaXN0LXNpbXBsZVwiIHRyYW5zaXRpb249XCJzaG93LWZyb20tcmlnaHRcIj5cblx0XHRcdFx0XHRcdDxVSS5JdGVtIHNob3dEaXNjbG9zdXJlQXJyb3c+XG5cdFx0XHRcdFx0XHRcdDxVSS5JdGVtSW5uZXI+XG5cdFx0XHRcdFx0XHRcdFx0U2ltcGxlIExpc3Rcblx0XHRcdFx0XHRcdFx0PC9VSS5JdGVtSW5uZXI+XG5cdFx0XHRcdFx0XHQ8L1VJLkl0ZW0+XG5cdFx0XHRcdFx0PC9MaW5rPlxuXHRcdFx0XHRcdDxMaW5rIHRvPVwidGFiczpsaXN0LWNvbXBsZXhcIiB0cmFuc2l0aW9uPVwic2hvdy1mcm9tLXJpZ2h0XCI+XG5cdFx0XHRcdFx0XHQ8VUkuSXRlbSBzaG93RGlzY2xvc3VyZUFycm93PlxuXHRcdFx0XHRcdFx0XHQ8VUkuSXRlbUlubmVyPlxuXHRcdFx0XHRcdFx0XHRcdENvbXBsZXggTGlzdFxuXHRcdFx0XHRcdFx0XHQ8L1VJLkl0ZW1Jbm5lcj5cblx0XHRcdFx0XHRcdDwvVUkuSXRlbT5cblx0XHRcdFx0XHQ8L0xpbms+XG5cdFx0XHRcdDwvVUkuR3JvdXA+XG5cdFx0XHRcdDxVSS5Hcm91cEhlYWRlcj5Hcm91cEhlYWRlcjwvVUkuR3JvdXBIZWFkZXI+XG5cdFx0XHRcdDxVSS5Hcm91cD5cblx0XHRcdFx0XHQ8VUkuR3JvdXBCb2R5PlVzZSBncm91cHMgdG8gY29udGFpbiBjb250ZW50IG9yIGxpc3RzLiBXaGVyZSBhcHByb3ByaWF0ZSBhIEdyb3VwIHNob3VsZCBiZSBhY2NvbXBhbmllZCBieSBhIEdyb3VwSGVhZGluZyBhbmQgb3B0aW9uYWxseSBhIEdyb3VwRm9vdGVyLjwvVUkuR3JvdXBCb2R5PlxuXHRcdFx0XHRcdDxVSS5Hcm91cEJvZHk+WW91IGNhbiB1c2UgR3JvdXBCb2R5IGZvciBjb250ZW50IGluc2lkZSBncm91cHMuIFN1YnNlcXVlbnQgR3JvdXBCb2R5IGNvbXBvbmVudHMgd2lsbCBiZSBzZXBhcmF0ZWQuPC9VSS5Hcm91cEJvZHk+XG5cdFx0XHRcdDwvVUkuR3JvdXA+XG5cdFx0XHRcdDxVSS5Hcm91cEZvb3Rlcj5Hcm91cEZvb3RlcjogdXNlZnVsIGZvciBhIGRldGFpbGVkIGV4cGxhaW5hdGlvbiB0byBleHByZXNzIHRoZSBpbnRlbnRpb25zIG9mIHRoZSBHcm91cC4gVHJ5IHRvIGJlIGNvbmNpc2UgLSByZW1lbWJlciB0aGF0IHVzZXJzIGFyZSBsaWtlbHkgdG8gcmVhZCB0aGUgdGV4dCBpbiB5b3VyIFVJIG1hbnkgdGltZXMuPC9VSS5Hcm91cEZvb3Rlcj5cblx0XHRcdDwvQ29udGFpbmVyPlxuXHRcdCk7XG5cdH1cbn0pO1xuIiwidmFyIENvbnRhaW5lciA9IHJlcXVpcmUoJ3JlYWN0LWNvbnRhaW5lcicpO1xudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcbnZhciBUaW1lcnMgPSByZXF1aXJlKCdyZWFjdC10aW1lcnMnKTtcbnZhciB7IE1peGlucywgVUkgfSA9IHJlcXVpcmUoJ3RvdWNoc3RvbmVqcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblx0bWl4aW5zOiBbTWl4aW5zLlRyYW5zaXRpb25zLCBUaW1lcnMoKV0sXG5cdGNvbXBvbmVudERpZE1vdW50ICgpIHtcblx0XHR2YXIgc2VsZiA9IHRoaXM7XG5cdFx0dGhpcy5zZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcblx0XHRcdHNlbGYudHJhbnNpdGlvblRvKCdhcHA6bWFpbicsIHsgdHJhbnNpdGlvbjogJ2ZhZGUnIH0pO1xuXHRcdH0sIDEwMDApO1xuXHR9LFxuXHRyZW5kZXIgKCkge1xuXHRcdHJldHVybiAoXG5cdFx0XHQ8Q29udGFpbmVyIGRpcmVjdGlvbj1cImNvbHVtblwiPlxuXHRcdFx0XHQ8VUkuTmF2aWdhdGlvbkJhciBuYW1lPVwib3ZlclwiIHRpdGxlPXt0aGlzLnByb3BzLm5hdmJhclRpdGxlfSAvPlxuXHRcdFx0XHQ8Q29udGFpbmVyIGRpcmVjdGlvbj1cImNvbHVtblwiIGFsaWduPVwiY2VudGVyXCIganVzdGlmeT1cImNlbnRlclwiIGNsYXNzTmFtZT1cIm5vLXJlc3VsdHNcIj5cblx0XHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT1cIm5vLXJlc3VsdHNfX2ljb24gaW9uLWlvcy1waG90b3NcIiAvPlxuXHRcdFx0XHRcdDxkaXYgY2xhc3NOYW1lPVwibm8tcmVzdWx0c19fdGV4dFwiPkhvbGQgb24gYSBzZWMuLi48L2Rpdj5cblx0XHRcdFx0PC9Db250YWluZXI+XG5cdFx0XHQ8L0NvbnRhaW5lcj5cblx0XHQpO1xuXHR9XG59KTtcbiIsInZhciBDb250YWluZXIgPSByZXF1aXJlKCdyZWFjdC1jb250YWluZXInKTtcbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG52YXIgVGltZXJzID0gcmVxdWlyZSgncmVhY3QtdGltZXJzJyk7XG52YXIgeyBNaXhpbnMgfSA9IHJlcXVpcmUoJ3RvdWNoc3RvbmVqcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblx0bWl4aW5zOiBbTWl4aW5zLlRyYW5zaXRpb25zLCBUaW1lcnMoKV0sXG5cdHN0YXRpY3M6IHtcblx0XHRuYXZpZ2F0aW9uQmFyOiAnbWFpbicsXG5cdFx0Z2V0TmF2aWdhdGlvbiAocHJvcHMpIHtcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdHRpdGxlOiBwcm9wcy5uYXZiYXJUaXRsZVxuXHRcdFx0fVxuXHRcdH1cblx0fSxcblx0Y29tcG9uZW50RGlkTW91bnQgKCkge1xuXHRcdHZhciBzZWxmID0gdGhpcztcblxuXHRcdHRoaXMuc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG5cdFx0XHRzZWxmLnRyYW5zaXRpb25UbygndGFiczp0cmFuc2l0aW9ucycsIHsgdHJhbnNpdGlvbjogJ2ZhZGUnIH0pO1xuXHRcdH0sIDEwMDApO1xuXHR9LFxuXHRyZW5kZXIgKCkge1xuXHRcdHJldHVybiAoXG5cdFx0XHQ8Q29udGFpbmVyIGRpcmVjdGlvbj1cImNvbHVtblwiIGFsaWduPVwiY2VudGVyXCIganVzdGlmeT1cImNlbnRlclwiIGNsYXNzTmFtZT1cIm5vLXJlc3VsdHNcIj5cblx0XHRcdFx0PGRpdiBjbGFzc05hbWU9XCJuby1yZXN1bHRzX19pY29uIGlvbi1pb3MtcGhvdG9zXCIgLz5cblx0XHRcdFx0PGRpdiBjbGFzc05hbWU9XCJuby1yZXN1bHRzX190ZXh0XCI+SG9sZCBvbiBhIHNlYy4uLjwvZGl2PlxuXHRcdFx0PC9Db250YWluZXI+XG5cdFx0KTtcblx0fVxufSk7XG4iLCJ2YXIgQ29udGFpbmVyID0gcmVxdWlyZSgncmVhY3QtY29udGFpbmVyJyk7XG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xudmFyIHsgTGluaywgVUkgfSA9IHJlcXVpcmUoJ3RvdWNoc3RvbmVqcycpO1xuXG5jb25zdCBzY3JvbGxhYmxlID0gQ29udGFpbmVyLmluaXRTY3JvbGxhYmxlKCk7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXHRzdGF0aWNzOiB7XG5cdFx0bmF2aWdhdGlvbkJhcjogJ21haW4nLFxuXHRcdGdldE5hdmlnYXRpb24gKCkge1xuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0dGl0bGU6ICdUcmFuc2l0aW9ucydcblx0XHRcdH1cblx0XHR9XG5cdH0sXG5cdHJlbmRlciAoKSB7XG5cdFx0cmV0dXJuIChcblx0XHRcdDxDb250YWluZXIgc2Nyb2xsYWJsZT17c2Nyb2xsYWJsZX0+XG5cdFx0XHRcdDxVSS5Hcm91cEhlYWRlcj5EZWZhdWx0PC9VSS5Hcm91cEhlYWRlcj5cblx0XHRcdFx0PFVJLkdyb3VwPlxuXHRcdFx0XHRcdDxMaW5rIHRvPVwidGFiczp0cmFuc2l0aW9ucy10YXJnZXRcIiB2aWV3UHJvcHM9e3sgbmF2YmFyVGl0bGU6ICdJbnN0YW50JyB9fT5cblx0XHRcdFx0XHRcdDxVSS5JdGVtIHNob3dEaXNjbG9zdXJlQXJyb3c+XG5cdFx0XHRcdFx0XHRcdDxVSS5JdGVtSW5uZXI+SW5zdGFudDwvVUkuSXRlbUlubmVyPlxuXHRcdFx0XHRcdFx0PC9VSS5JdGVtPlxuXHRcdFx0XHRcdDwvTGluaz5cblx0XHRcdFx0PC9VSS5Hcm91cD5cblx0XHRcdFx0PFVJLkdyb3VwSGVhZGVyPkZhZGU8L1VJLkdyb3VwSGVhZGVyPlxuXHRcdFx0XHQ8VUkuR3JvdXA+XG5cdFx0XHRcdFx0PExpbmsgdG89XCJ0YWJzOnRyYW5zaXRpb25zLXRhcmdldFwiIHRyYW5zaXRpb249XCJmYWRlXCIgdmlld1Byb3BzPXt7IG5hdmJhclRpdGxlOiAnRmFkZScgfX0+XG5cdFx0XHRcdFx0XHQ8VUkuSXRlbSBzaG93RGlzY2xvc3VyZUFycm93PlxuXHRcdFx0XHRcdFx0XHQ8VUkuSXRlbUlubmVyPkZhZGU8L1VJLkl0ZW1Jbm5lcj5cblx0XHRcdFx0XHRcdDwvVUkuSXRlbT5cblx0XHRcdFx0XHQ8L0xpbms+XG5cdFx0XHRcdFx0PExpbmsgdG89XCJ0YWJzOnRyYW5zaXRpb25zLXRhcmdldFwiIHRyYW5zaXRpb249XCJmYWRlLWV4cGFuZFwiIHZpZXdQcm9wcz17eyBuYXZiYXJUaXRsZTogJ0ZhZGUgRXhwYW5kJyB9fT5cblx0XHRcdFx0XHRcdDxVSS5JdGVtIHNob3dEaXNjbG9zdXJlQXJyb3c+XG5cdFx0XHRcdFx0XHRcdDxVSS5JdGVtSW5uZXI+PHNwYW4+RmFkZSBFeHBhbmQgPHNwYW4gY2xhc3NOYW1lPVwidGV4dC1tdXRlZFwiPihub24tc3RhbmRhcmQpPC9zcGFuPjwvc3Bhbj48L1VJLkl0ZW1Jbm5lcj5cblx0XHRcdFx0XHRcdDwvVUkuSXRlbT5cblx0XHRcdFx0XHQ8L0xpbms+XG5cdFx0XHRcdFx0PExpbmsgdG89XCJ0YWJzOnRyYW5zaXRpb25zLXRhcmdldFwiIHRyYW5zaXRpb249XCJmYWRlLWNvbnRyYWN0XCIgdmlld1Byb3BzPXt7IG5hdmJhclRpdGxlOiAnRmFkZSBDb250cmFjdCcgfX0+XG5cdFx0XHRcdFx0XHQ8VUkuSXRlbSBzaG93RGlzY2xvc3VyZUFycm93PlxuXHRcdFx0XHRcdFx0XHQ8VUkuSXRlbUlubmVyPjxzcGFuPkZhZGUgQ29udHJhY3QgPHNwYW4gY2xhc3NOYW1lPVwidGV4dC1tdXRlZFwiPihub24tc3RhbmRhcmQpPC9zcGFuPjwvc3Bhbj48L1VJLkl0ZW1Jbm5lcj5cblx0XHRcdFx0XHRcdDwvVUkuSXRlbT5cblx0XHRcdFx0XHQ8L0xpbms+XG5cdFx0XHRcdDwvVUkuR3JvdXA+XG5cdFx0XHRcdDxVSS5Hcm91cEhlYWRlcj5TaG93PC9VSS5Hcm91cEhlYWRlcj5cblx0XHRcdFx0PFVJLkdyb3VwPlxuXHRcdFx0XHRcdDxMaW5rIHRvPVwidGFiczp0cmFuc2l0aW9ucy10YXJnZXRcIiB0cmFuc2l0aW9uPVwic2hvdy1mcm9tLWxlZnRcIiB2aWV3UHJvcHM9e3sgbmF2YmFyVGl0bGU6ICdTaG93IGZyb20gTGVmdCcgfX0+XG5cdFx0XHRcdFx0XHQ8VUkuSXRlbSBzaG93RGlzY2xvc3VyZUFycm93PlxuXHRcdFx0XHRcdFx0XHQ8VUkuSXRlbUlubmVyPjxzcGFuPlNob3cgZnJvbSBMZWZ0IDxzcGFuIGNsYXNzTmFtZT1cInRleHQtbXV0ZWRcIj4obm9uLXN0YW5kYXJkKTwvc3Bhbj48L3NwYW4+PC9VSS5JdGVtSW5uZXI+XG5cdFx0XHRcdFx0XHQ8L1VJLkl0ZW0+XG5cdFx0XHRcdFx0PC9MaW5rPlxuXHRcdFx0XHRcdDxMaW5rIHRvPVwidGFiczp0cmFuc2l0aW9ucy10YXJnZXRcIiB0cmFuc2l0aW9uPVwic2hvdy1mcm9tLXJpZ2h0XCIgdmlld1Byb3BzPXt7IG5hdmJhclRpdGxlOiAnU2hvdyBmcm9tIFJpZ2h0JyB9fT5cblx0XHRcdFx0XHRcdDxVSS5JdGVtIHNob3dEaXNjbG9zdXJlQXJyb3c+XG5cdFx0XHRcdFx0XHRcdDxVSS5JdGVtSW5uZXI+U2hvdyBmcm9tIFJpZ2h0PC9VSS5JdGVtSW5uZXI+XG5cdFx0XHRcdFx0XHQ8L1VJLkl0ZW0+XG5cdFx0XHRcdFx0PC9MaW5rPlxuXHRcdFx0XHRcdDxMaW5rIHRvPVwiYXBwOnRyYW5zaXRpb25zLXRhcmdldC1vdmVyXCIgdHJhbnNpdGlvbj1cInNob3ctZnJvbS10b3BcIiB2aWV3UHJvcHM9e3sgbmF2YmFyVGl0bGU6ICdTaG93IGZyb20gVG9wJyB9fT5cblx0XHRcdFx0XHRcdDxVSS5JdGVtIHNob3dEaXNjbG9zdXJlQXJyb3c+XG5cdFx0XHRcdFx0XHRcdDxVSS5JdGVtSW5uZXI+PHNwYW4+U2hvdyBmcm9tIFRvcCA8c3BhbiBjbGFzc05hbWU9XCJ0ZXh0LW11dGVkXCI+KG5vbi1zdGFuZGFyZCk8L3NwYW4+PC9zcGFuPjwvVUkuSXRlbUlubmVyPlxuXHRcdFx0XHRcdFx0PC9VSS5JdGVtPlxuXHRcdFx0XHRcdDwvTGluaz5cblx0XHRcdFx0XHQ8TGluayB0bz1cImFwcDp0cmFuc2l0aW9ucy10YXJnZXQtb3ZlclwiIHRyYW5zaXRpb249XCJzaG93LWZyb20tYm90dG9tXCIgdmlld1Byb3BzPXt7IG5hdmJhclRpdGxlOiAnU2hvdyBmcm9tIEJvdHRvbScgfX0+XG5cdFx0XHRcdFx0XHQ8VUkuSXRlbSBzaG93RGlzY2xvc3VyZUFycm93PlxuXHRcdFx0XHRcdFx0XHQ8VUkuSXRlbUlubmVyPlNob3cgZnJvbSBCb3R0b208L1VJLkl0ZW1Jbm5lcj5cblx0XHRcdFx0XHRcdDwvVUkuSXRlbT5cblx0XHRcdFx0XHQ8L0xpbms+XG5cdFx0XHRcdDwvVUkuR3JvdXA+XG5cdFx0XHRcdDxVSS5Hcm91cEhlYWRlcj5SZXZlYWw8L1VJLkdyb3VwSGVhZGVyPlxuXHRcdFx0XHQ8VUkuR3JvdXA+XG5cdFx0XHRcdFx0PExpbmsgdG89XCJ0YWJzOnRyYW5zaXRpb25zLXRhcmdldFwiIHRyYW5zaXRpb249XCJyZXZlYWwtZnJvbS1sZWZ0XCIgdmlld1Byb3BzPXt7IG5hdmJhclRpdGxlOiAnUmV2ZWFsIGZyb20gTGVmdCcgfX0+XG5cdFx0XHRcdFx0XHQ8VUkuSXRlbSBzaG93RGlzY2xvc3VyZUFycm93PlxuXHRcdFx0XHRcdFx0XHQ8VUkuSXRlbUlubmVyPjxzcGFuPlJldmVhbCBmcm9tIExlZnQgPHNwYW4gY2xhc3NOYW1lPVwidGV4dC1tdXRlZFwiPihub24tc3RhbmRhcmQpPC9zcGFuPjwvc3Bhbj48L1VJLkl0ZW1Jbm5lcj5cblx0XHRcdFx0XHRcdDwvVUkuSXRlbT5cblx0XHRcdFx0XHQ8L0xpbms+XG5cdFx0XHRcdFx0PExpbmsgdG89XCJ0YWJzOnRyYW5zaXRpb25zLXRhcmdldFwiIHRyYW5zaXRpb249XCJyZXZlYWwtZnJvbS1yaWdodFwiIHZpZXdQcm9wcz17eyBuYXZiYXJUaXRsZTogJ1JldmVhbCBmcm9tIFJpZ2h0JyB9fT5cblx0XHRcdFx0XHRcdDxVSS5JdGVtIHNob3dEaXNjbG9zdXJlQXJyb3c+XG5cdFx0XHRcdFx0XHRcdDxVSS5JdGVtSW5uZXI+UmV2ZWFsIGZyb20gUmlnaHQ8L1VJLkl0ZW1Jbm5lcj5cblx0XHRcdFx0XHRcdDwvVUkuSXRlbT5cblx0XHRcdFx0XHQ8L0xpbms+XG5cdFx0XHRcdFx0PExpbmsgdG89XCJhcHA6dHJhbnNpdGlvbnMtdGFyZ2V0LW92ZXJcIiB0cmFuc2l0aW9uPVwicmV2ZWFsLWZyb20tdG9wXCIgdmlld1Byb3BzPXt7IG5hdmJhclRpdGxlOiAnUmV2ZWFsIGZyb20gVG9wJyB9fT5cblx0XHRcdFx0XHRcdDxVSS5JdGVtIHNob3dEaXNjbG9zdXJlQXJyb3c+XG5cdFx0XHRcdFx0XHRcdDxVSS5JdGVtSW5uZXI+PHNwYW4+UmV2ZWFsIGZyb20gVG9wIDxzcGFuIGNsYXNzTmFtZT1cInRleHQtbXV0ZWRcIj4obm9uLXN0YW5kYXJkKTwvc3Bhbj48L3NwYW4+PC9VSS5JdGVtSW5uZXI+XG5cdFx0XHRcdFx0XHQ8L1VJLkl0ZW0+XG5cdFx0XHRcdFx0PC9MaW5rPlxuXHRcdFx0XHRcdDxMaW5rIHRvPVwiYXBwOnRyYW5zaXRpb25zLXRhcmdldC1vdmVyXCIgdHJhbnNpdGlvbj1cInJldmVhbC1mcm9tLWJvdHRvbVwiIHZpZXdQcm9wcz17eyBuYXZiYXJUaXRsZTogJ1JldmVhbCBmcm9tIEJvdHRvbScgfX0+XG5cdFx0XHRcdFx0XHQ8VUkuSXRlbSBzaG93RGlzY2xvc3VyZUFycm93PlxuXHRcdFx0XHRcdFx0XHQ8VUkuSXRlbUlubmVyPlJldmVhbCBmcm9tIEJvdHRvbTwvVUkuSXRlbUlubmVyPlxuXHRcdFx0XHRcdFx0PC9VSS5JdGVtPlxuXHRcdFx0XHRcdDwvTGluaz5cblx0XHRcdFx0PC9VSS5Hcm91cD5cblx0XHRcdDwvQ29udGFpbmVyPlxuXHRcdCk7XG5cdH1cbn0pO1xuIl19
