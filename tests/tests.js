const test = require('tape');
const common = require('./common');
const { mysqlDownFactory } = require('../lib');

const buffer = new Buffer('hello');

require('abstract-leveldown/abstract/leveldown-test').args(mysqlDownFactory, test);
require('abstract-leveldown/abstract/open-test').args(mysqlDownFactory, test, common);

require('abstract-leveldown/abstract/del-test').all(mysqlDownFactory, test, common);
require('abstract-leveldown/abstract/put-test').all(mysqlDownFactory, test, common);
require('abstract-leveldown/abstract/get-test').all(mysqlDownFactory, test, common);
require('abstract-leveldown/abstract/put-get-del-test').all(mysqlDownFactory, test, common, buffer);

require('abstract-leveldown/abstract/close-test').close(mysqlDownFactory, test, common);

require('abstract-leveldown/abstract/iterator-test').all(mysqlDownFactory, test, common);
require('abstract-leveldown/abstract/iterator-range-test').all(mysqlDownFactory, test, common);

require('abstract-leveldown/abstract/batch-test').all(mysqlDownFactory, test, common);
require('abstract-leveldown/abstract/chained-batch-test').all(mysqlDownFactory, test, common);
