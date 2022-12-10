import type { AlgoImportParams } from '../crypto/algo';

export interface ServerInfo {
    server: string;
    serverVersion: string;
    protocolVersion: string;

    mainChannel: string;
    endpoints: ServerEndpoint[];

    pb: JsonWebKey;
    pbAlgo: AlgoImportParams;
}

export interface ServerEndpoint {
    type: string;
    url: string;
}
