import { encrypt } from '../common/crypto/crypto';
import { Encodable, MakeEncodable, toDataLayer } from '../common/datalayer';
import { ServerInfo } from '../common/types/server';

type Listener<T> = (t: T) => void;

export class WebClient {
    private sock: WebSocket | null = null;
    private srvPubKey: CryptoKey | null = null;
    private derivedKey: CryptoKey | null = null;
    private serverInfo: ServerInfo | null = null;

    constructor(
        private serverHost: string,
    ) {}

    async connect() {
        const data: ServerInfo = await (await fetch(`${this.serverHost}/server-info`)).json();
        console.log(`Found server at ${this.serverHost}`, data);
        this.serverInfo = data;

        const serverPub = await window.crypto.subtle.importKey(
            'jwk',
            data.pb,
            data.pbAlgo,
            true,
            [],
        );
        this.srvPubKey = serverPub;

        for (const e of data.endpoints) {
            if (e.type === 'ws') {
                return this.enstablishWebSocket(e.url);
            }
        }
    }

    async login(username: string, keys: CryptoKeyPair) {
        if (!this.srvPubKey || !this.serverInfo) {
            throw new Error('Not connected');
        }

        const algoName = typeof this.serverInfo.pbAlgo === 'string'
            ? this.serverInfo.pbAlgo
            : this.serverInfo.pbAlgo.name

        this.derivedKey = await window.crypto.subtle.deriveKey(
            { name: algoName, public: this.srvPubKey },
            keys.privateKey,
            { name: 'AES-GCM', length: 256 },
            true,
            ['encrypt', 'decrypt'],
        );

        const loginInfo = {
            u: username,
            pb: await window.crypto.subtle.exportKey('jwk', keys.publicKey),
        };

        return this.send(loginInfo as MakeEncodable<typeof loginInfo>);
    }

    private enstablishWebSocket(url: string): Promise<void> {
        const u = new window.URL(url, this.serverHost);
        u.protocol = 'ws:'
        console.log('Connecting to', u.toString());
        const sock = new window.WebSocket(u);

        sock.onmessage = function (evt) {
            console.log(evt.data);
        };

        sock.onclose = function (evt) {
            console.log('closed:', evt.code, evt.reason);
        };

        sock.onerror = function (evt) {
            console.error('sock error', evt);
        };

        return new Promise((resolve) => {
            sock.onopen = () => {
                this.sock = sock;
                resolve();
            };
        })
    }

    async send(msg: Encodable) {
        if (!this.sock || !this.derivedKey) {
            throw new Error('Not connected');
        }

        const data = toDataLayer(msg);
        const encryped = await encrypt(data, { name: 'AES-GCM', length: 256 }, this.derivedKey);
        this.sock.send(toDataLayer(encryped as MakeEncodable<typeof encryped>));
    }
}
