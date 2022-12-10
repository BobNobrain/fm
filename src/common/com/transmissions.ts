import { Encodable, MakeEncodable } from '../datalayer';
import { User } from '../domain/user';
import { EventChannelID, FMEvent, FMEventCreateData } from '../events/types';
import { ID } from '../domain/id';

export enum DMType {
    Handshake = 1,
    Notification = 2,
    Publish = 3,
}

export type DataMessage = MakeEncodable<
    | HandshakeServerDM
    | EventsDM
    | PublishEventsDM
>;

export interface HandshakeServerDM {
    t: DMType.Handshake;
    /** User data */
    u: User;
    /** Generated client id */
    cid: ID;
}

export interface EventsDM {
    t: DMType.Notification;
    b: {
        /** Target channel id */
        ch: EventChannelID;
        /**  */
        e: FMEvent[];
    }[];
}

export interface PublishEventsDM {
    t: DMType.Publish;
    /** Target channel id */
    ch: EventChannelID;
    /** Events to publish */
    e: FMEventCreateData[];
}
