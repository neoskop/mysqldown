import { AbstractIterator, Callback, IIteratorOptions } from 'abstract-leveldown';
import { MysqlDown } from './mysql-down';
import { PassThrough } from 'stream';
import SqlString from 'sqlstring';
const debug = require('debug')('mysqldown');

export class MysqlIterator extends AbstractIterator {
    protected _stream : PassThrough;
    
    protected _keyAsBuffer : boolean;
    protected _valueAsBuffer : boolean;
    
    protected _endEmitted = false;
    
    constructor(db : MysqlDown, options : IIteratorOptions) {
        super(db, options);
     
        this._stream = new PassThrough({ objectMode: true });
        this._stream.once('end', () => {
            this._endEmitted = true;
        });
        
        this._keyAsBuffer = !!options.keyAsBuffer;
        this._valueAsBuffer = !!options.valueAsBuffer;
        
        let { start, end, gt, gte, lt, lte } = options;
        
        let query = SqlString.format('SELECT * FROM ??', [ db.connectionInfo.table ]);
        
        if(undefined != start || undefined != end) {
            if(options.reverse) {
                [ end, start ] = [ start, end ];
            }
            
            if(undefined != start && undefined != end) {
                query = SqlString.format(`${query} WHERE \`key\` <= ? AND \`key\` >= ?`, [ end, start ]);
            } else if(undefined != start) {
                query = SqlString.format(`${query} WHERE \`key\` >= ?`, [ start ]);
            } else {
                query = SqlString.format(`${query} WHERE \`key\` <= ?`, [ end ]);
            }
        } else if(undefined != gte || undefined != lte) {
            if(undefined != gte && undefined != lte) {
                query = SqlString.format(`${query} WHERE \`key\` <= ? AND \`key\` >= ?`, [ lte, gte ]);
            } else if(undefined != gte) {
                query = SqlString.format(`${query} WHERE \`key\` >= ?`, [ gte ]);
            } else {
                query = SqlString.format(`${query} WHERE \`key\` <= ?`, [ lte ]);
            }
        } else if(undefined != gt || undefined != lt) {
            if(undefined != gt && undefined != lt) {
                query = SqlString.format(`${query} WHERE \`key\` < ? AND \`key\` > ?`, [ lt, gt ]);
            } else if(undefined != gt) {
                query = SqlString.format(`${query} WHERE \`key\` > ?`, [ gt ]);
            } else {
                query = SqlString.format(`${query} WHERE \`key\` < ?`, [ lt ]);
            }
        }
        
        query = `${query} ORDER BY \`key\` ${options.reverse ? 'DESC' : 'ASC'}`;
        
        if(options.limit! > -1) {
            query = SqlString.format(`${query} LIMIT ?`, [ options.limit ])
        }
        
        db._streamingQuery(query, (err, stream) => {
            if(err) {
                throw err;
            }
            
            stream!.pipe(this._stream);
        })
    }
    
    _next(callback : Callback<any, any>) : void {
        debug('_next');
        if(this._endEmitted) {
            debug('_next: ended');
            return setImmediate(() => callback());
        }
        
        const obj = this._stream.read();
        
        if(null == obj) {
            debug('_next: null');
            const onReadable = () => {
                this._stream.removeListener('end', onEnd);
                this._next(callback);
            };
            
            const onEnd = () => {
                this._stream.removeListener('readable', onReadable);
                callback();
            };
            
            this._stream.once('readable', onReadable);
            this._stream.once('end', onEnd);
        } else {
            debug('_next: read', obj);
            let key = obj.key;
            if(this._keyAsBuffer) key = new Buffer(key);
            
            let value = obj.value;
            if(this._valueAsBuffer) value = new Buffer(value);
            
            callback(undefined, key, value);
        }
    }
    
    _end(callback : Callback<void>) : void {
        this._stream = new PassThrough({ objectMode: true });
        setImmediate(() => callback());
    }
}
