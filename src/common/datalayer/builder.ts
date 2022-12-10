export class BufferBuilder {
    private values: (number | Uint8Array)[] = [];
    private length = 0;

    writeByte(byte: number) {
        if (byte < 0 || byte >= 256) {
            throw new TypeError('byte overflow');
        }

        this.values.push(byte);
        ++this.length;
    }
    writeBytes(bytes: number[]) {
        for (const byte of bytes) {
            if (byte < 0 || byte >= 256) {
                throw new TypeError('byte overflow');
            }

            this.values.push(byte);
        }
        this.length += bytes.length;
    }
    writeBuffer(buffer: Uint8Array) {
        this.values.push(buffer);
        this.length += buffer.length;
    }

    render(): Uint8Array {
        const result = new Uint8Array(this.length);
        let i = 0;
        for (const v of this.values) {
            if (typeof v === 'number') {
                result[i] = v;
                ++i;
                continue;
            }

            for (let j = 0; j < v.length; j++) {
                result[i] = v[j];
                ++i;
            }
        }

        return result;
    }
}
