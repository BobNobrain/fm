export interface Transport {
    disconnect(): void;

    send(data: Uint8Array): void;
    receive(): Promise<Uint8Array>;

    isConnected(): boolean;
}
