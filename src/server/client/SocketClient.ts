import type * as WebSocket from 'ws';
import { timeout } from '../../common/async/timeout';
import { Communicator } from '../../common/com/com';
import { DataMessage, DMType, PublishEventsDM } from '../../common/com/transmissions';
import { EncryptionConfig } from '../../common/crypto/types';
import { Encodable, MakeEncodable } from '../../common/datalayer';
import { User } from '../../common/domain/user';
import { EventChannel, EventChannelID, FMEvent } from '../../common/events/types';
import { generateRandomId } from '../../common/domain/id';
import type { FMServer } from '../srv/FMServer';
import { WSTransport } from '../transport/ws';
import type { Client } from './types';

const ENCRYPTION_CONFIG: NonNullable<EncryptionConfig> = { name: 'AES-GCM', length: 256 };

export class SocketClient implements Client {
    private com: Communicator<DataMessage> | null = null;
    private clientId: string;
    private subscriptions: EventChannel[] = []

    constructor(
        private userData: User,
        private srv: FMServer,
    ) {
        this.clientId = generateRandomId();
    }

    async init(sock: WebSocket, serverPrivKey: CryptoKey) {
        const userPubKey = await crypto.subtle.importKey(
            'jwk',
            this.userData.pb,
            this.userData.pbAlgo,
            true,
            ['deriveKey', 'deriveBits'],
        );

        const transport = new WSTransport(sock);
        this.com = new Communicator(
            transport,
            ENCRYPTION_CONFIG,
            await crypto.subtle.deriveKey(
                { name: 'ECDH', public: userPubKey },
                serverPrivKey,
                ENCRYPTION_CONFIG,
                true,
                ['encrypt', 'decrypt'],
            ),
        );

        this.handshake(this.com);
    }

    async listen() {
        if (!this.com) {
            return;
        }

        while (this.com.isConnected()) {
            try {
                const dm = await this.com.receive();
                switch (dm.t) {
                    case DMType.Publish:
                        this.publishEvents(dm);
                }
            } catch (error) {
                console.error(error);
                this.com.disconnect();
                return;
            }
        }
    }

    getId(): string {
        return this.clientId;
    }

    notify(ch: EventChannelID, events: FMEvent[]): void {
        this.com?.send({
            t: DMType.Notification,
            b: [{
                ch,
                e: events,
            }],
        });
    }

    getPubKey(): JsonWebKey {
        return this.userData.pb;
    }

    addSubscription(ech: EventChannel): void {
        this.subscriptions.push(ech);
    }

    destroy() {
        this.com?.disconnect();
        for (const s of this.subscriptions) {
            s.removeListenerById(this.clientId);
        }
    }

    private async handshake(com: Communicator<DataMessage>) {
        com.send({
            t: DMType.Handshake,
            u: this.userData,
            cid: this.clientId,
        });
    }

    private publishEvents(msg: PublishEventsDM) {
        const ch = this.srv.channelsRepo.getChannelById(msg.ch);
        if (!ch) {
            return;
        }

        ch.publish(this.clientId, msg.e);
    }
}
