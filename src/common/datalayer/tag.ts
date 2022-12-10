export enum Tag {
    // End = 0x00,
    Constant = 0x10,
    Integer = 0x20,
    Float = 0x30,
    Date = 0x40,
    String = 0x50,
    Buffer = 0x60,
    Array = 0x70,
    Object = 0x80,
}

const TAG_MASK = 0xF0;
const TAIL_MASK = 0x0F;

export enum Constant {
    Undefined = 0x00,
    Null = 0x01,
    False = 0x02,
    True = 0x03,
    EmptyString = 0x04,
    EmptyArray = 0x05,
    EmptyObject = 0x06,
    EmptyBuffer = 0x07,
}

export function withTail(tag: Tag, tail: number): number {
    if (tail < 0 || tail >= 0x10) {
        throw new TypeError('tail too big');
    }
    return tag | tail;
}

export function getTag(byte: number): Tag {
    return byte & TAG_MASK;
}
export function getTail(byte: number): number {
    return byte & TAIL_MASK;
}
