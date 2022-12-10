import { decrypt, encrypt } from '../crypto/crypto';
import { CryptoValue, EncryptionConfig } from '../crypto/types';
import { Encodable, fromDataLayer, MakeEncodable, toDataLayer } from '../datalayer';
import { Transport } from '../transport';

export class Communicator<M extends Encodable = Encodable> {
    constructor(
        private transport: Transport,
        private encryption: EncryptionConfig,
        private derivedKey: CryptoKey,
    ) {}

    isConnected() {
        return this.transport.isConnected();
    }
    disconnect() {
        return this.transport.disconnect();
    }

    async send(data: M): Promise<void> {
        const buffer = toDataLayer(data);
        const encrypted = encrypt(buffer, this.encryption, this.derivedKey);
        const message = toDataLayer(encrypted as MakeEncodable<typeof encrypted>);
        this.transport.send(message);
    }

    async receive(): Promise<M> {
        const msg = await this.transport.receive();
        const encrypted = fromDataLayer(msg) as unknown as CryptoValue;
        const buffer = await decrypt(encrypted, this.derivedKey);
        return fromDataLayer(buffer) as M;
    }
}
