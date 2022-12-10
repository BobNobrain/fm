import { EventChannel, EventListener } from '../../common/events/types';

export interface Client extends EventListener {
    getPubKey(): JsonWebKey;
    addSubscription(ech: EventChannel): void;
}
