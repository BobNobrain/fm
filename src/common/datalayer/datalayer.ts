import { readBuffer, writeBuffer } from './buffer';
import { BufferBuilder } from './builder';
import { readConstant, writeBool, writeNull, writeUndefined } from './constants';
import { readDate, writeDate } from './date';
import { readFloat, writeFloat } from './float';
import { readInteger, readIntegerUntagged, writeInteger, writeIntegerUntagged } from './integer';
import { readLengthCompact, writeLengthCompact } from './length';
import { BufferReader } from './reader';
import { readString, readStringContent, writeString, writeStringContent } from './string';
import { Constant, getTag, Tag, withTail } from './tag';
import type { Encodable } from './types';

export function toDataLayer(value: Encodable): Uint8Array {
    const builder = new BufferBuilder();
    writeValue(builder, value);
    return builder.render();
}
export function fromDataLayer(data: Uint8Array): Encodable {
    const reader = new BufferReader(data);
    return readValue(reader);
}

export function writeValue(to: BufferBuilder, value: Encodable) {
    switch (typeof value) {
        case 'undefined':
            writeUndefined(to);
            break;

        case 'boolean':
            writeBool(to, value);
            break;

        case 'number':
            if (Number.isInteger(value)) {
                writeInteger(to, value);
            } else {
                writeFloat(to, value);
            }
            break;

        case 'string':
            writeString(to, value);
            break;

        case 'object':
            if (value === null) {
                writeNull(to);
                break;
            }
            if (value instanceof Uint8Array) {
                writeBuffer(to, value);
                break;
            }
            if (value instanceof Date) {
                writeDate(to, value);
                break;
            }
            if (Array.isArray(value)) {
                writeArray(to, value);
                break;
            }
            writeObject(to, value);
            break;

        default:
            throw new TypeError(`cannot serialize ${typeof value}`);
    }
}

export function readValue(reader: BufferReader): Encodable {
    const tag = getTag(reader.readByte());
    switch (tag) {
        case Tag.Constant:
            return readConstant(reader);

        case Tag.Array:
            return readArray(reader);

        case Tag.Buffer:
            return readBuffer(reader);

        case Tag.Date:
            return readDate(reader);

        case Tag.Float:
            return readFloat(reader);

        case Tag.Integer:
            return readInteger(reader);

        case Tag.Object:
            return readObject(reader);

        case Tag.String:
            return readString(reader);

        default:
            throw new Error(`unknown tag: 0x${(tag as number).toString(16)}`);
    }
}

export function writeArray(to: BufferBuilder, value: Encodable[]) {
    writeLengthCompact(to, Tag.Array, withTail(Tag.Constant, Constant.EmptyArray), value.length);
    for (const v of value) {
        writeValue(to, v);
    }
}
export function readArray(reader: BufferReader) {
    const length = readLengthCompact(reader);
    const result: Encodable[] = new Array(length);
    for (let i = 0; i < length; i++) {
        result[i] = readValue(reader);
    }
    return result;
}

export function writeObject(to: BufferBuilder, value: { [key in string]: Encodable }) {
    const entries = Object.entries(value);
    writeLengthCompact(to, Tag.Object, withTail(Tag.Constant, Constant.EmptyObject), entries.length);
    for (const [k, v] of entries) {
        writeIntegerUntagged(to, k.length);
        writeStringContent(to, k);
        writeValue(to, v);
    }
}
export function readObject(reader: BufferReader) {
    const result: { [key in string]: Encodable } = {};
    const len = readLengthCompact(reader);
    for (let i = 0; i < len; i++) {
        const keyLen = readIntegerUntagged(reader);
        const key = readStringContent(reader, keyLen);
        const value = readValue(reader);
        result[key] = value;
    }
    return result;
}
