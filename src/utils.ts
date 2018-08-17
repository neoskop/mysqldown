import url from 'url';

export interface ParsedLocation {
    user: string;
    password?: string;
    host: string;
    port?: number,
    database: string,
    table : string
}

export function parseLocation(location : string) : ParsedLocation {
    if(!location.startsWith('mysql://')) {
        location = `mysql://${location}`;
    }
    const { hostname, port, auth, path } = url.parse(location);
    
    const [ database, table ] = (path || '').split(/\//).filter(Boolean);
    const [ user, password ] = (auth || '').split(/:/);
    
    return {
        user,
        password,
        host: hostname!,
        port: port ? +port : undefined,
        database,
        table
    }
    
}
