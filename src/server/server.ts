import Koa from 'koa';
import koaBody from 'koa-body';
import websockify from 'koa-websocket';
import cors from '@koa/cors';
import KoaRouter from '@koa/router';

import { FMServer } from './srv/FMServer';
import { SocketClient } from './client/SocketClient';
import { loadKeys } from './srv/keys';


export default async function createApp() {
    const keys = await loadKeys();
    const pubJwk = await crypto.subtle.exportKey('jwk', keys.publicKey);

    const app = websockify(new Koa());
    const fms = new FMServer({
        serverName: 'FM-koa-test',
        serverVersion: '0.0.1',
        keys,
        pubKeyJwk: pubJwk,
    });

    app.use(koaBody());
    app.use(cors());

    const appRouter = new KoaRouter();
    appRouter.get('/server-info', (ctx) => {
        ctx.response.body = fms.getInfo();
    });

    app.use(appRouter.routes());

    app.ws.use((ctx, next) => {
        if (ctx.path !== '/fmsock') {
            return next();
        }

        new SocketClient(ctx.websocket, fms);
    });

    return app;
}
