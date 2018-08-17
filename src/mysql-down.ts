import {
    AbstractLevelDOWN,
    Callback,
    IBatch,
    IBatchOptions,
    IDelOptions,
    IGetOptions, IIteratorOptions,
    IOpenOptions
} from 'abstract-leveldown';
import { ParsedLocation, parseLocation } from './utils';
import mysql from 'mysql';
import SqlString from 'sqlstring';
import { Stream } from 'stream';
import { MysqlIterator } from './mysql-iterator';

const debug = require('debug')('mysqldown');

export class MysqlDown extends AbstractLevelDOWN {
    static INSTANCES = new Map<string, MysqlDown>();
    
    readonly connectionInfo : ParsedLocation;
    
    protected connectionPool? : mysql.Pool;
    
    constructor(location : string) {
        super(location);
        
        this.connectionInfo = parseLocation(location);
        debug('connectionInfo', this.connectionInfo);
        MysqlDown.INSTANCES.set(this.connectionInfo.table, this);
    }
    
    protected _query(query : string|string[], callback : Callback<any[]>) {
        debug('_query', query);
        this.connectionPool!.getConnection((err, connection) => {
            if(err) {
                debug('_query: connection error', err);
                return callback(err);
            }
            
            
            debug('_query: got connection');
            connection.query(Array.isArray(query) ? query.join(';\n') : query, (err, result) => {
                connection.release();
                if(err) {
                    debug('_query: query error', err);
                }
                
                debug('_query: ran query', query);
                callback(err, result);
            })
        })
    }
    
    _streamingQuery(query : string, callback : Callback<Stream>) : void {
        debug('_streamingQuery', query);
        this.connectionPool!.getConnection((err, connection) => {
            if(err) {
                debug('_streamingQuery: connection error', err);
                return callback(err);
            }
    
    
            debug('_streamingQuery: got connection');
            
            const stream = connection.query(query).stream({ highWaterMark: 100 });
            
            stream.once('end', () => {
                connection.release();
            });
            
            callback(undefined, stream);
        })
    }
    
    protected _parseValue(data : { value: string }[], asBuffer : boolean) : string|Buffer {
        return false !== asBuffer ? new Buffer(data[0].value) : data[0].value;
    }
    
    _open(options : IOpenOptions, callback : Callback<never>) : void {
        debug('_open', options);
    
        const { user, password, host, port, database } = this.connectionInfo;
        
        this.connectionPool = mysql.createPool({
            user, password, host, port, database,
            multipleStatements: true
        });
        
        this._query([
            SqlString.format(`CREATE TABLE IF NOT EXISTS ?? (
                \`id\` int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
                \`key\` TEXT,
                \`value\` TEXT,
                UNIQUE(\`key\`(767))
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8;`, [ this.connectionInfo.table, 'id', 'key', 'value', 'key' ])
        ], err => {
            if(err) {
                debug('_open: error', err);
                return callback(err);
            }
            callback();
        })
    }
    
    _close(callback : Callback<never>) : void {
        this.connectionPool!.end(callback);
    }
    
    _get(key : string, options : IGetOptions, callback : Callback<string|Buffer>) : void {
        debug('_get', key, options);
        this._query(
            SqlString.format('SELECT `value` FROM ?? WHERE `key` = ?', [ this.connectionInfo.table, key ]),
            (err, result) => {
                if(!err && 0 === result!.length) {
                    err = new Error('notFound');
                }
                if(err) {
                    debug('_get: error', err);
                    return callback(err);
                }
                
                callback(undefined, this._parseValue(result!, options.asBuffer!));
            })
    }
    
    _put(key : string, value : string, options : IGetOptions, callback : Callback<never>) : void {
        debug('_put', key, value, options);
        this._query(
            SqlString.format('INSERT INTO ?? SET ? ON DUPLICATE KEY UPDATE ?', [ this.connectionInfo.table, { key, value }, { key, value } ]),
            err => {
                if(err) {
                    debug('_put: error', err);
                }
                callback(err);
            }
        )
    }
    
    _del<T>(key : string, options : IDelOptions, callback : Callback<T>) : void {
        debug('_del', key, options);
        this._query(
            SqlString.format('DELETE FROM ?? WHERE `key` = ?', [ this.connectionInfo.table, key ]),
            err => {
                if(err) {
                    debug('_del: error', err);
                }
                callback(err);
            }
        )
    }
    
    _batch(array : IBatch[], options : IBatchOptions, callback : Callback<any[]>) : void {
        debug('_batch', array, options);
        if(0 === array.length) {
            return process.nextTick(() => callback());
        }
        
        this._query(array.map(({ type, key, value }) => {
            if(type === 'del') {
                return SqlString.format('DELETE FROM ?? WHERE `key` = ?', [ this.connectionInfo.table, key ]);
            } else {
                return SqlString.format('INSERT INTO ?? SET ? ON DUPLICATE KEY UPDATE ?', [ this.connectionInfo.table, { key, value }, { key, value } ])
            }
        }), (err, result) => {
            if(err) {
                debug('_batch: error', err);
            }
            debug('_batch: done');
            callback(err, result);
        })
    }
    
    
    _iterator(options : IIteratorOptions) {
        return new MysqlIterator(this, options);
    }
}
