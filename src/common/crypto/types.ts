export interface Signature {
    by: string;
    as: string;
    sig: Uint8Array;
}

export interface CryptoValue {
    val: Uint8Array;
    enc: DecryptionConfig;
    sigs?: Signature[];
}

export type EncryptionConfig =
    | null
    | { name: 'AES-GCM'; length: 256 | 512 }
;

export type DecryptionConfig =
    | null
    | { name: 'AES-GCM'; length: 256 | 512; iv: Uint8Array }
;

export interface Cypher {
    encrypt(data: Uint8Array, key: CryptoKey): Promise<CryptoValue>;
    decrypt(data: CryptoValue, key: CryptoKey): Promise<Uint8Array>;
}
