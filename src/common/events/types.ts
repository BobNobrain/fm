import { Encodable } from '../datalayer';
import { ID, MakeID } from '../domain/id';

export type EventChannelID = MakeID<'EventsChannel'>;

export interface FMEventCreateData {
    id: ID;
    type: string;
    at: Date;
    data: Encodable;
}

export interface FMEvent extends FMEventCreateData {
    by: ID;
    registered: Date;
}

export interface EventListener {
    getId(): ID;
    notify(source: EventChannelID, events: FMEvent[]): void;
}

export interface EventChannel {
    getId(): EventChannelID;

    publish(by: ID, events: FMEventCreateData[]): void;

    addListener(l: EventListener): void;
    removeListenerById(id: string): void;
    removeListener(l: EventListener): void;
}
