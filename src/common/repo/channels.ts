import { EventChannel, EventChannelID } from '../events/types';

export interface EventChannelsRepo {
    create(id: EventChannelID): EventChannel;
    remove(id: EventChannelID): void;
    getChannelById(id: EventChannelID): EventChannel | null;
}

export function getOrCreateChannel(repo: EventChannelsRepo, id: EventChannelID): EventChannel {
    const existing = repo.getChannelById(id);
    if (existing) {
        return existing;
    }

    return repo.create(id);
}
