import { Transport } from '../../common/transport';

type MsgListener = (msg: Uint8Array) => void;
type CloseListener = (code: number, reason: string) => void;

export class WSTransport implements Transport {
    private sock: WebSocket | null = null;
    private onMsg: MsgListener[] = [];
    private onClose: CloseListener[] = [];

    async connect(url: string | URL): Promise<void> {
        if (this.sock) {
            throw new Error('already connected');
        }

        const sock = new WebSocket(url);

        sock.onerror = (error) => {
            console.error(error);
        };

        sock.onclose = (ev) => {
            for (const l of this.onClose) {
                l(ev.code, ev.reason);
            }
            this.onClose.length = 0;
            this.onMsg.length = 0;
        };
        sock.onmessage = async (ev) => {
            for (const l of this.onMsg) {
                const blob: Blob = ev.data;
                const data = new Uint8Array(await blob.arrayBuffer())
                l(data);
            }
            this.onClose.length = 0;
            this.onMsg.length = 0;
        };

        return new Promise((resolve) => {
            sock.onopen = () => {
                this.sock = sock;
                resolve();
            };
        });
    }

    disconnect(): void {
        this.requireSock().close(1000, 'done');
        this.sock = null;
        this.onMsg.length = 0;
        this.onClose.length = 0;
    }

    isConnected(): boolean {
        return this.sock !== null;
    }

    send(data: Uint8Array): void {
        this.requireSock().send(data);
    }

    receive(): Promise<Uint8Array> {
        return new Promise((resolve, reject) => {
            this.onMsg.push(resolve);
            this.onClose.push(
                (code, reason) => reject(new Error(`socket closed: ${reason} (${code})`)),
            );
        });
    }

    private requireSock() {
        if (!this.sock) {
            throw new Error('not connected');
        }
        return this.sock;
    }
}
