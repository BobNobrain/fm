import type { BufferBuilder } from './builder';
import type { BufferReader } from './reader';
import { Tag, Constant, withTail, getTail } from './tag';

export function writeBool(to: BufferBuilder, value: boolean) {
    to.writeByte(withTail(Tag.Constant, value ? Constant.True : Constant.False));
}

export function writeNull(to: BufferBuilder) {
    to.writeByte(withTail(Tag.Constant, Constant.Null));
}
export function writeUndefined(to: BufferBuilder) {
    to.writeByte(withTail(Tag.Constant, Constant.Undefined));
}

export function readConstant(reader: BufferReader) {
    const byte = reader.readByte();
    reader.markConsumed();

    const tail = getTail(byte);
    switch (tail) {
        case Constant.Undefined:
            return undefined;

        case Constant.Null:
            return null;

        case Constant.False:
            return false;

        case Constant.True:
            return true;

        case Constant.EmptyString:
            return '';

        case Constant.EmptyArray:
            return [];

        case Constant.EmptyObject:
            return {};

        case Constant.EmptyBuffer:
            return new Uint8Array(0);

        default:
            throw new Error(`unknown constant 0x${tail.toString(16)}`);
    }
}
