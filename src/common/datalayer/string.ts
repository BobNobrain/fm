import type { BufferBuilder } from './builder';
import { readIntegerUntagged, writeIntegerUntagged } from './integer';
import { readLengthCompact, writeLengthCompact } from './length';
import type { BufferReader } from './reader';
import { Constant, getTail, Tag, withTail } from './tag';

const encoder = new TextEncoder();
const decoder = new TextDecoder();

export function writeString(to: BufferBuilder, value: string) {
    writeLengthCompact(to, Tag.String, withTail(Tag.Constant, Constant.EmptyString), value.length);
    if (value.length) {
        writeStringContent(to, value);
    }
}
export function writeStringContent(to: BufferBuilder, value: string) {
    const encoded = encoder.encode(value);
    to.writeBuffer(encoded);
}

export function readString(reader: BufferReader) {
    const len = readLengthCompact(reader);
    return readStringContent(reader, len);
}
export function readStringContent(reader: BufferReader, len: number) {
    const content = new Uint8Array(len);
    reader.consumeInto(content);
    return decoder.decode(content);
}
