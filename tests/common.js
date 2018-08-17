"use strict";

const mysql = require('mysql');

const connection = mysql.createConnection({ user: 'root', password: 'root' });

let index = 0;

function location() {
    return 'root:root@localhost/leveldown/dbtest_' + index++;
}

function lastLocation() {
    return 'root:root@localhost/leveldown/dbtest_' + index;
}

function tearDown(t) {
    connection._socket && connection._socket.unref();
    t.end();
}

function collectEntries(iterator, callback) {
    const data = [];
    function next() {
        iterator.next(function(err, key, value) {
            if (err) return callback(err);
            if (!arguments.length) {
                return iterator.end(function(err) {
                    callback(err, data)
                })
            }
            if (key == +key) key = +key;
            key = (key < 10 ? '0' : '') + key;
            data.push({ key: key, value: value });
            process.nextTick(next)
        })
    }
    next()
}

module.exports = {
    location,
    lastLocation,
    tearDown,
    collectEntries
};
