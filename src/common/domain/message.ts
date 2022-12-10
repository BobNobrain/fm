import { CryptoValue } from '../crypto/types';
import { Encodable } from '../datalayer';

export type MessageType =
    | 'text'
    | 'file'
    | 'object'
    | 'compound'

export interface EncodedMessage {
    type: MessageType;
    content: CryptoValue;
}

interface DecodedMessageData<T extends MessageType, C extends Encodable> {
    type: T;
    content: C;
}

export type DecodedMessage =
    | DecodedMessageData<'text', string>
    | DecodedMessageData<'file', {}> // TODO
    | DecodedMessageData<'object', {}> // TODO
    | DecodedMessageData<'compound', {}> // TODO
