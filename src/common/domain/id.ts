export type ID = string;
export type MakeID<Entity extends string> = ID & { __entity__: Entity };

const ID_SYMBOLS = 'ABCDEFGHJKLMNOPQRSTUVWXYZabcdefghjklmnopqrstuvwxyz';

interface RandomIdOptions {
    prefix?: string | undefined
    length?: number | undefined
    alphabet?: string | undefined
}

export const generateRandomId = ({
    prefix = '',
    length = 15,
    alphabet = ID_SYMBOLS,
}: RandomIdOptions = {}): ID => {
    const result = [prefix]

    const missing = length - prefix.length
    for (let i = 0; i < missing; i++) {
        result.push(alphabet[Math.floor(Math.random() * alphabet.length)]);
    }

    return result.join('');
};
