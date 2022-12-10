import type { BufferBuilder } from './builder';
import { readIntegerUntagged, writeIntegerUntagged } from './integer';
import type { BufferReader } from './reader';
import { getTail, Tag, withTail } from './tag';

const TAIL_SIGN_BIT = 0b0001;

export function writeDate(to: BufferBuilder, value: Date) {
    const n = Math.floor(value.getTime());
    const tail = TAIL_SIGN_BIT & (n < 0 ? TAIL_SIGN_BIT : 0);
    to.writeByte(withTail(Tag.Date, tail));
    writeIntegerUntagged(to, n);
}

export function readDate(reader: BufferReader) {
    const header = reader.consumeByte();
    const isNegative = (getTail(header) & TAIL_SIGN_BIT) === TAIL_SIGN_BIT;
    const time = readIntegerUntagged(reader);
    const timeSigned = isNegative ? -time : time;
    return new Date(timeSigned);
}
