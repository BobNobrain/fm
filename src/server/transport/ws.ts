import type * as WebSocket from 'ws';
import { Transport } from '../../common/transport';

type MsgListener = (msg: Uint8Array) => void;
type CloseListener = (code: number, reason: string) => void;

export class WSTransport implements Transport {
    private onMsg: MsgListener[] = [];
    private onClose: CloseListener[] = [];

    constructor(
        private ws: WebSocket,
    ) {
        ws.on('message', (data) => {
            const converted = toUint8Array(data);
            for (const l of this.onMsg) {
                l(new Uint8Array(converted));
            }
            this.onClose.length = 0;
            this.onMsg.length = 0;
        });
        ws.on('close', (code, reason) => {
            const reasonTxt = reason.toString();
            for (const l of this.onClose) {
                l(code, reasonTxt);
            }
            this.onClose.length = 0;
            this.onMsg.length = 0;
        });
    }

    isConnected(): boolean {
        return this.ws.readyState === this.ws.OPEN;
    }

    disconnect(): void {
        this.ws.close(1000, 'done');
    }

    send(data: Uint8Array): void {
        this.ws.send(data);
    }
    receive(): Promise<Uint8Array> {
        return new Promise((resolve, reject) => {
            this.onMsg.push(resolve);
            this.onClose.push((code, reason) => reject(
                new Error(`socket closed: ${reason} (${code})`),
            ));
        });
    }
}

function toUint8Array(raw: WebSocket.RawData) {
    if (Array.isArray(raw)) {
        throw new Error('do not know what to do with Buffer[] :|');
    }

    return new Uint8Array(raw);
}
