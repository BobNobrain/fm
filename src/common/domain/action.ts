import { Entity } from './entity';

export interface Action<Type extends string, Payload> {
    type: Type;
    payload: Payload;
}

export enum EntityActionType {
    Create = 'c',
    Created = 'cd',
    Update = 'u',
    Delete = 'd',
}

export type EntityCreateAction<CreateData> = Action<EntityActionType.Create, CreateData>;
export type EntityCreatedAction<E extends Entity> = Action<EntityActionType.Created, E>;
export type EntityDeleteAction<E extends Entity> = Action<EntityActionType.Delete, {
    id: E['id'];
}>;
export type EntityUpdateAction<
    E extends Entity,
    P = Partial<Omit<E, 'id'>>
> = Action<EntityActionType.Update, UpdateActionPayload<E, P>>;

export type UpdateActionPayload<E extends Entity, P = Partial<Omit<E, 'id'>>> = {
    id: E['id'];
    patch: P;
};
