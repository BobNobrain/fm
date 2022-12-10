import { CryptoValue, Cypher } from './types';

export class AesCypher implements Cypher {
    constructor(
        private length: 256 | 512 = 256,
    ) {}

    async encrypt(data: Uint8Array, key: CryptoKey): Promise<CryptoValue> {
        const iv = this.getRandomIV();
        const encData = await crypto.subtle.encrypt(
            { name: 'AES-GCM', iv, length: this.length },
            key,
            data,
        );

        return {
            val: new Uint8Array(encData),
            enc: {
                name: 'AES-GCM',
                iv,
                length: this.length,
            },
        }
    }

    async decrypt(data: CryptoValue, key: CryptoKey): Promise<Uint8Array> {
        if (data.enc?.name !== 'AES-GCM') {
            throw new Error('Wrong decryption algorithm');
        }

        const decData = await crypto.subtle.decrypt(
            { name: 'AES-GCM', length: data.enc.length, iv: data.enc.iv },
            key,
            data.val,
        );

        return new Uint8Array(decData);
    }

    private getRandomIV() {
        // TODO
        return new TextEncoder().encode('totally random')
    }
}
