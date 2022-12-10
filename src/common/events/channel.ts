import { Encodable } from '../datalayer';
import { EventChannel, EventChannelID, EventListener, FMEvent, FMEventCreateData } from './types';

export class BaseEventsChannel implements EventChannel {
    private listenersById: Record<string, EventListener> = {};

    constructor(
        private id: EventChannelID,
    ) {}

    getId() { return this.id; }

    addListener(l: EventListener): void {
        this.listenersById[l.getId()] = l;
    }
    removeListener(l: EventListener): void {
        delete this.listenersById[l.getId()];
    }
    removeListenerById(id: string): void {
        delete this.listenersById[id];
    }

    publish(by: string, ecd: FMEventCreateData[]): void {
        const registrationDate = new Date();
        const events = ecd.map(({ id, type, at, data }): FMEvent => ({
            id,
            type,
            at,
            by,
            registered: registrationDate,
            data,
        }));

        for (const l of Object.values(this.listenersById)) {
            l.notify(this.id, events);
        }
    }
}
