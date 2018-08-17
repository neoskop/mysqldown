declare module "abstract-leveldown" {
    
    export type Callback<T, T2 = never> = (err? : any, result?: T, result2? : T2) => void;
    
    export type Key = any;
    
    export interface IOpenOptions {
        /**
         * default true
         */
        createIfMissing?: boolean;
        /**
         * default false
         */
        errorIfExists?: boolean;
    }
    
    export interface IGetOptions {
        /**
         * default true
         */
        asBuffer?: boolean;
    }
    
    export interface IDelOptions {
    
    }
    
    export interface IBatch {
        type: 'put'|'del',
        key: Key,
        value?: any;
    }
    
    export interface IBatchOptions {
    
    }
    
    export interface IIteratorOptions {
        /**
         * default false
         */
        reverse?: boolean;
    
        /**
         * default true
         */
        keys?: boolean;
        
        /**
         * default true
         */
        values?: boolean;
        
        limit?: number;
    
        /**
         * default false
         */
        keyAsBuffer?: boolean;
        
        /**
         * default false
         */
        valueAsBuffer?: boolean;
        
        start?: Key;
        end?: Key;
        gt?: Key;
        gte?: Key;
        lt?: Key;
        lte?: Key;
    }
    
    export abstract class AbstractLevelDOWN<
        ChainedBatch extends AbstractChainedBatch = AbstractChainedBatch,
        Iterator extends AbstractIterator = AbstractIterator> {
        readonly status : 'new'|'opening'|'open'|'closing'|'closed';
        
        constructor(location : any);
        
        open(options : IOpenOptions, callback : Callback<never>) : void;
        open(callback : Callback<never>) : void;
        abstract _open(options : IOpenOptions, callback : Callback<never>) : void;
        
        close(callback : Callback<never>) : void;
        abstract _close(callback : Callback<never>) : void;
        
        get(key : Key, options : IGetOptions, callback : Callback<string|Buffer>) : void;
        get(key : Key, callback : Callback<string|Buffer>) : void;
        abstract _get(key : string, options : IGetOptions, callback : Callback<string|Buffer>) : void;
        
        put(key : Key, value : any, options : IGetOptions, callback : Callback<never>) : void;
        put(key : Key, value : any, callback : Callback<never>) : void;
        abstract _put(key : string, value : string, options : IGetOptions, callback : Callback<never>) : void;
        
        del<T>(key : Key, options : IDelOptions, callback : Callback<T>) : void;
        del<T>(key : Key, callback : Callback<T>) : void;
        abstract _del<T>(key : string, options : IDelOptions, callback : Callback<T>) : void;
        
        batch(array : IBatch[], options : IBatchOptions, callback : Callback<any[]>) : void;
        batch(array : IBatch[], callback : Callback<any[]>) : void;
        batch() : ChainedBatch;
        _chainedBatch() : ChainedBatch;
        abstract _batch(array : IBatch[], options : IBatchOptions, callback : Callback<any[]>) : void;
        
        iterator(options? : IIteratorOptions) : Iterator;
        _iterator(options : IIteratorOptions) : Iterator;
        
        _serializeKey(key : Key) : string;
        _serializeValue(key : Key) : string;
        
        _checkKey(key : Key) : void|Error;
        _checkValue(value : any) : void|Error;
    }
    
    export class AbstractChainedBatch {
        private db : AbstractLevelDOWN;
        private _ended : boolean;
        private _nexting : boolean;
        
        constructor(db : AbstractLevelDOWN);
        
        _checkWritten() : void;
        
        put(key : Key, value : any) : this;
        _put(key : Key, value : any) : void;
        
        del(key : Key) : this;
        _del(key : Key) : void;
        
        clear() : this;
        _clear() : void;
        
        write(options : IBatchOptions, callback : Callback<any[]>) : void;
        write(callback : Callback<any[]>) : void;
        _write(options : IBatchOptions, callback : Callback<any[]>) : void;
    }
    
    export abstract class AbstractIterator {
        private db : AbstractLevelDOWN;
        private _operations : IBatch[];
        private _written : boolean;
        
        constructor(db : AbstractLevelDOWN, options : IIteratorOptions);
        
        next(callback : Callback<any>) : this;
        abstract _next(callback : Callback<any>) : void;
        
        seek(target : Key) : void;
        _seek(target : Key) : void;
        
        end(callback : Callback<void>) : void;
        abstract _end(callback : Callback<void>) : void;
        
    }
}
