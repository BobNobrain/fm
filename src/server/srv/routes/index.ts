import KoaRouter from '@koa/router';
import type { WebServer } from '../web';
import { registerRoute } from './registerRoute';
import { serverInfoRoute } from './server-info';

export function createRoutes(srv: WebServer) {
    const appRouter = new KoaRouter();

    serverInfoRoute(appRouter, srv);
    registerRoute(appRouter, srv);

    return appRouter.routes();
}
