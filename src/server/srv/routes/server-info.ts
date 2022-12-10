import { Route } from './types';

export const serverInfoRoute: Route = (router, server) => {
    const info = server.getServerInfo();
    router.get('/server-info', (ctx) => {
        ctx.body = info;
    });
};
