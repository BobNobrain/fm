import { KeysGenerationAlgorithm } from './key';

export interface User {
    id: string;
    username: string;

    pb: JsonWebKey;
    pbAlgo: KeysGenerationAlgorithm;

    isOnline: boolean;
    lastSeen: Date;
}

export interface UserCreateData {
    username?: string;
    pb: JsonWebKey;
    pbAlgo: KeysGenerationAlgorithm;
    fullName?: string | undefined;
}
