import { KeysGenerationAlgorithm } from '../domain/key';

export interface KeysRepo {
    generate(
        algo: KeysGenerationAlgorithm,
    ): Promise<CryptoKeyPair>;

    load(): Promise<CryptoKeyPair | null>;
    save(keys: CryptoKeyPair): Promise<void>;
}

export async function loadOrCreateNewAndSave(
    repo: KeysRepo,
    algo: KeysGenerationAlgorithm,
): Promise<CryptoKeyPair> {
    const loaded = await repo.load();
    if (loaded) {
        return loaded;
    }

    const newlyGenerated = await repo.generate(algo);
    await repo.save(newlyGenerated);
    return newlyGenerated;
}
