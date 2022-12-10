import { CryptoValue, Cypher } from './types';

export class NullCypher implements Cypher {
    encrypt(data: Uint8Array, key: CryptoKey): Promise<CryptoValue> {
        return Promise.resolve({
            val: data,
            enc: null,
        });
    }
    decrypt(data: CryptoValue, key: CryptoKey): Promise<Uint8Array> {
        if (data.enc) {
            return Promise.reject(new Error('Wrong cypher'));
        }

        return Promise.resolve(data.val);
    }
}
