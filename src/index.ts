import { MysqlDown as MysqlDown_ } from './mysql-down';
import { MysqlIterator as MysqlIterator_ } from './mysql-iterator';


function mysqlDown(location : string) {
    return new MysqlDown_(location);
}

module mysqlDown {
    export const MysqlDown : typeof MysqlDown_ = require('./mysql-down').MysqlDown;
    export const MysqlIterator : typeof MysqlIterator_ = require('./mysql-iterator').MysqlIterator;
}

export = mysqlDown;
