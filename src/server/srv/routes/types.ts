import type KoaRouter from '@koa/router';
import type { WebServer } from '../web';

export type Router = KoaRouter;
export type Route = (r: Router, web: WebServer) => void;
