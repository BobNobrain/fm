import { KeysGenerationAlgorithm } from '../../../common/domain/key';
import { Route } from './types';

export const registerRoute: Route = (r, web) => {
    r.post('/register', async (ctx) => {
        const body = ctx.request.body;
        if (!body || typeof body !== 'object') {
            ctx.throw(400, 'bad request body');
        }

        const username: string = body.username;
        const fullName: string | undefined = body.fullName;
        const pb: JsonWebKey = body.pb;
        const pbAlgo: KeysGenerationAlgorithm = body.algo;

        const user = await web.getUsersRepo().create({
            username,
            fullName,
            pb,
            pbAlgo,
        });

        ctx.body = {
            ok: true,
            user,
        };
    });
};
