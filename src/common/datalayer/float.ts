import type { BufferBuilder } from './builder';
import { readLengthCompact, writeLengthCompact } from './length';
import type { BufferReader } from './reader';
import { readStringContent, writeStringContent } from './string';
import { Tag } from './tag';

export function writeFloat(to: BufferBuilder, value: number) {
    const exp = value.toExponential();
    writeLengthCompact(to, Tag.Float, Tag.Float, exp.length);
    writeStringContent(to, exp);
}

export function readFloat(reader: BufferReader) {
    const n = readLengthCompact(reader);
    const str = readStringContent(reader, n);
    return Number(str);
}
