import { AesCypher } from './aes';
import { NullCypher } from './null';
import { CryptoValue, Cypher, EncryptionConfig } from './types';

const nullCypher = new NullCypher();

function getCypher(config: EncryptionConfig): Cypher {
    if (!config) {
        return nullCypher;
    }

    switch (config.name) {
        case 'AES-GCM':
            return new AesCypher(config.length);
    }
}

export function encrypt(
    data: Uint8Array,
    config: EncryptionConfig,
    key: CryptoKey,
): Promise<CryptoValue> {
    const cypher = getCypher(config);
    return cypher.encrypt(data, key);
}

export function decrypt(data: CryptoValue, key: CryptoKey): Promise<Uint8Array> {
    const cypher = getCypher(data.enc);
    return cypher.decrypt(data, key);
}
