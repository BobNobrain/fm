import type * as WebSocket from 'ws';

import { KeysGenerationAlgorithm } from '../../common/domain/key';
import { SocketClient } from '../client/SocketClient';
import { Client } from '../client/types';
import { KeysRepo, loadOrCreateNewAndSave } from '../../common/repo/keys';
import { UsersRepo } from '../../common/repo/users';
import { WebServer } from './web';
import { EventChannelsRepo } from '../../common/repo/channels';
import { EventChannel, EventChannelID } from '../../common/events/types';
import { generateRandomId } from '../../common/domain/id';


const MAIN_CHANNEL_ID = '#main' as EventChannelID;

export interface FMServerOptions {
    serverName: string;
    serverVersion: string;
    keysRepo: KeysRepo;
    usersRepo: UsersRepo;
    channelsRepo: EventChannelsRepo;
}

const KEY_ALGO: KeysGenerationAlgorithm = { name: 'ECHD', namedCurve: 'P-256' };

export class FMServer {
    private mainChannel: EventChannel;

    public readonly keysRepo: KeysRepo;
    public readonly usersRepo: UsersRepo;
    public readonly channelsRepo: EventChannelsRepo;
    public readonly serverName: string;
    public readonly serverVersion: string;

    private keys: CryptoKeyPair | null = null;
    private pubKeyJwk: JsonWebKey | null = null;
    private web: WebServer | null = null;

    constructor({
        serverName, serverVersion,
        keysRepo,
        usersRepo,
        channelsRepo,
    }: FMServerOptions) {
        this.serverName = serverName;
        this.serverVersion = serverVersion;
        this.keysRepo = keysRepo;
        this.usersRepo = usersRepo;
        this.channelsRepo = channelsRepo;

        this.mainChannel = channelsRepo.create(MAIN_CHANNEL_ID);
    }

    async start() {
        this.keys = await loadOrCreateNewAndSave(this.keysRepo, KEY_ALGO);
        this.pubKeyJwk = await crypto.subtle.exportKey('jwk', this.keys.publicKey);

        this.web = new WebServer({
            serverName: this.serverName,
            serverVersion: this.serverVersion,
            protocolVersion: '0.0.1',
            mainChannel: MAIN_CHANNEL_ID,

            usersRepo: this.usersRepo,
            publicKey: {
                jwk: this.pubKeyJwk,
                algo: KEY_ALGO,
            },

            onNewConnection: (ws, username) => this.handleConnection(ws, username),
        });
    }

    private async handleConnection(ws: WebSocket, username: string) {
        if (!this.keys) {
            ws.close(1000, 'too early');
            return;
        }

        const user = await this.usersRepo.getByUsername(username);
        if (!user) {
            ws.close(1000, 'not found');
            return;
        }

        const client = new SocketClient(ws, user, this);
        try {
            await client.init(this.keys.privateKey);
            this.addClient(client);
            client.listen();
        } catch (error) {}
    }

    addClient(c: Client) {
        this.mainChannel.addListener(c);
        this.mainChannel.publish(c.getId(), [{
            id: generateRandomId({ prefix: 'e' }),
            type: 'update',
            at: new Date(),
            data: {
                target: c.getId(),
                prop: 'online',
                value: true,
            },
        }]);
    }
}
