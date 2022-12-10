export async function loadKeys(): Promise<CryptoKeyPair> {
    // for testing purposes, we will just regenerate keys every time
    const keys = await crypto.subtle.generateKey(
        {
            name: 'ECDH',
            namedCurve: 'P-256',
        },
        true,
        ['deriveKey', 'deriveBits'],
    );

    return keys;
}
