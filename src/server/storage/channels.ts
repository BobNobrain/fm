import { BaseEventsChannel } from '../../common/events/channel';
import { EventChannel, EventChannelID } from '../../common/events/types';
import { EventChannelsRepo } from '../../common/repo/channels';

export class InMemEventChannelStorage implements EventChannelsRepo {
    private channels: Record<EventChannelID, EventChannel> = {};

    create(id: EventChannelID): EventChannel {
        if (id in this.channels) {
            throw new ReferenceError(`channel with id "${id}" already exists`);
        }

        const ch = new BaseEventsChannel(id);
        this.channels[id] = ch;
        return ch;
    }

    remove(id: EventChannelID): void {
        if (!(id in this.channels)) {
            throw new ReferenceError(`channel with id "${id}" does not exist`);
        }

        delete this.channels[id];
    }

    getChannelById(id: EventChannelID): EventChannel | null {
        return this.channels[id] ?? null;
    }
}
