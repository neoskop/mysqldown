const test = require('tape');
const common = require('./common');
const mysqlDown = require('../lib');

const buffer = new Buffer('hello');

require('abstract-leveldown/abstract/leveldown-test').args(mysqlDown, test);
require('abstract-leveldown/abstract/open-test').args(mysqlDown, test, common);

require('abstract-leveldown/abstract/del-test').all(mysqlDown, test, common);
require('abstract-leveldown/abstract/put-test').all(mysqlDown, test, common);
require('abstract-leveldown/abstract/get-test').all(mysqlDown, test, common);
require('abstract-leveldown/abstract/put-get-del-test').all(mysqlDown, test, common, buffer);

require('abstract-leveldown/abstract/close-test').close(mysqlDown, test, common);

require('abstract-leveldown/abstract/iterator-test').all(mysqlDown, test, common);
require('abstract-leveldown/abstract/iterator-range-test').all(mysqlDown, test, common);

require('abstract-leveldown/abstract/batch-test').all(mysqlDown, test, common);
require('abstract-leveldown/abstract/chained-batch-test').all(mysqlDown, test, common);
