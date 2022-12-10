import Koa from 'koa';
import koaBody from 'koa-body';
import websockify from 'koa-websocket';
import cors from '@koa/cors';
import type * as WebSocket from 'ws';

import { KeysGenerationAlgorithm } from '../../common/domain/key';
import { ServerInfo } from '../../common/types/server';
import { UsersRepo } from '../../common/repo/users';
import { createRoutes } from './routes';

export interface WebServerOptions {
    serverName: string;
    serverVersion: string;
    protocolVersion: string;
    mainChannel: string;

    publicKey: {
        jwk: JsonWebKey;
        algo: KeysGenerationAlgorithm;
    };

    usersRepo: UsersRepo;

    onNewConnection: (ws: WebSocket, username: string) => void;
}

const SOCKET_PATH = '/fmsock';

export class WebServer {
    private app = websockify(new Koa());

    constructor(
        private opts: WebServerOptions,
    ) {}

    start() {
        this.app.use(koaBody());
        this.app.use(cors());
        this.app.use(createRoutes(this));

        this.app.ws.use((ctx, next) => {
            if (ctx.path !== SOCKET_PATH) {
                return next();
            }

            const username = ctx.query.u;
            if (typeof username !== 'string') {
                ctx.throw('missing username', 400);
                return;
            }

            this.opts.onNewConnection(ctx.ws, username);
        });
    }

    getServerInfo(): ServerInfo {
        return {
            server: this.opts.serverName,
            serverVersion: this.opts.serverVersion,
            protocolVersion: this.opts.protocolVersion,
            mainChannel: this.opts.mainChannel,
            pb: this.opts.publicKey.jwk,
            pbAlgo: this.opts.publicKey.algo,
            endpoints: [
                {
                    type: 'ws',
                    url: SOCKET_PATH,
                },
            ],
        }
    }

    getUsersRepo() {
        return this.opts.usersRepo;
    }
}
