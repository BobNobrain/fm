import type { BufferBuilder } from './builder';
import type { BufferReader } from './reader';
import { getTail, Tag, withTail } from './tag';

const THE_EIGHTH_BIT = 0b1000_000;
const FIRST_SEVEN_BITS = 0b0111_1111;
const TAIL_SIGN_BIT = 0b0001;

export function writeInteger(to: BufferBuilder, value: number) {
    const tail = TAIL_SIGN_BIT & (value < 0 ? 1 : 0);
    to.writeByte(withTail(Tag.Integer, tail));

    let rem = Math.abs(value);
    while (rem > FIRST_SEVEN_BITS) {
        to.writeByte((rem & FIRST_SEVEN_BITS) | THE_EIGHTH_BIT);
        rem >>= 7;
    }

    to.writeByte(rem);
}
export function writeIntegerUntagged(to: BufferBuilder, value: number) {
    let rem = Math.abs(value);
    while (rem > FIRST_SEVEN_BITS) {
        to.writeByte((rem & FIRST_SEVEN_BITS) | THE_EIGHTH_BIT);
        rem >>= 7;
    }

    to.writeByte(rem);
}

export function readInteger(reader: BufferReader) {
    const header = reader.consumeByte();
    const tail = getTail(header);
    const value = readIntegerUntagged(reader);
    const isNegative = (tail & TAIL_SIGN_BIT) === TAIL_SIGN_BIT;
    return isNegative ? -value : value;
}
export function readIntegerUntagged(reader: BufferReader) {
    let result = 0;
    let finished = false;
    while (!reader.isEof()) {
        const nextByte = reader.consumeByte();
        const value = nextByte & FIRST_SEVEN_BITS;
        const isLast = (nextByte & THE_EIGHTH_BIT) === 0;
        result |= value;
        if (isLast) {
            finished = true;
            break;
        }
        result <<= 7;
    }
    if (!finished) {
        throw new Error('unexpected eof while reading an integer');
    }
    return result;
}
