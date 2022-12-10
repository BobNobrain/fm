import type { BufferBuilder } from './builder';
import { readIntegerUntagged, writeIntegerUntagged } from './integer';
import type { BufferReader } from './reader';
import { getTail, Tag, withTail } from './tag';

export function writeLengthCompact(to: BufferBuilder, tag: Tag, emptyByte: number, length: number) {
    if (length === 0) {
        to.writeByte(emptyByte);
        return;
    }

    if (length <= 0b1111) {
        to.writeByte(withTail(tag, length));
        return;
    }

    writeIntegerUntagged(to, length);
}

export function readLengthCompact(reader: BufferReader): number {
    const tail = getTail(reader.consumeByte());
    if (tail === 0) {
        return readIntegerUntagged(reader);
    }

    return tail;
}
