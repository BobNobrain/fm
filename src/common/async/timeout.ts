export function after<T>(ms: number, value: T): Promise<T> {
    return new Promise((resolve) => {
        setTimeout(resolve, ms, value);
    });
}

export function timeout<T>(process: Promise<T>, timeoutMs: number): Promise<T> {
    return new Promise((resolve, reject) => {
        process.then(resolve);
        setTimeout(reject, timeoutMs, new Error('timeout'));
    });
}
