export class BufferReader {
    private offset = 0;

    constructor(
        private buffer: Uint8Array,
    ) {}

    isEof() {
        return this.offset >= this.buffer.length;
    }

    readByte(): number {
        return this.buffer[this.offset];
    }
    consumeByte(): number {
        const byte = this.buffer[this.offset];
        ++this.offset;
        return byte;
    }

    readBytes(n: number): number[] {
        const bytes: number[] = [];
        for (let i = 0; i < n; i++) {
            bytes.push(this.buffer[this.offset + i]);
        }
        return bytes;
    }
    consumeBytes(n: number): number[] {
        const bytes = this.readBytes(n);
        this.markConsumed(n);
        return bytes;
    }

    readInto(into: Uint8Array) {
        for (let i = 0; i < into.length; i++) {
            into[i] = this.buffer[this.offset + i];
        }
    }
    consumeInto(into: Uint8Array) {
        this.readInto(into);
        this.offset += into.length;
    }

    markConsumed(n = 1) {
        this.offset += n;
    }
}
