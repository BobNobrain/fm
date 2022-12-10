import type { BufferBuilder } from './builder';
import { readIntegerUntagged, writeIntegerUntagged } from './integer';
import { readLengthCompact, writeLengthCompact } from './length';
import type { BufferReader } from './reader';
import { Constant, Tag, withTail } from './tag';

export function writeBuffer(to: BufferBuilder, value: Uint8Array) {
    writeLengthCompact(to, Tag.Buffer, withTail(Tag.Constant, Constant.EmptyBuffer), value.length);
    to.writeBuffer(value);
}

export function readBuffer(reader: BufferReader) {
    const n = readLengthCompact(reader);
    const result = new Uint8Array(n);
    reader.consumeInto(result);
    return result;
}
