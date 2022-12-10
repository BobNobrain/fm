export enum CypherType {
    None,
    Aes256,
    Aes512,
    EcdhP256,
}

export type AlgoImportParams =
    // | AlgorithmIdentifier
    | RsaHashedImportParams
    | EcKeyImportParams
    | HmacImportParams
    | AesKeyAlgorithm

export function describeCypherTypeImport(ct: CypherType): AlgoImportParams | null {
    switch (ct) {
        case CypherType.None:
            return null;

        case CypherType.Aes256:
            return { name: 'AES-GCM', length: 256 } as const;

        case CypherType.Aes512:
            return { name: 'AES-GCM', length: 512 } as const;

        case CypherType.EcdhP256:
            return { name: 'ECDH', namedCurve: 'P-256' } as const;
    }
}

export function getCypherTypeByDescription(
    algo: AlgoImportParams | null
): CypherType {
    if (!algo) {
        return CypherType.None;
    }

    switch (algo.name) {
        case 'AES-GCM':
            if ((algo as AesKeyAlgorithm).length === 256) {
                return CypherType.Aes256;
            }

            return CypherType.Aes512;

        case 'ECDH':
            return CypherType.EcdhP256;

        default:
            return CypherType.None;
    }
}
