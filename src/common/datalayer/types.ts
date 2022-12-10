import { MakeID } from '../domain/id';

export type Encodable =
    | undefined
    | null
    | boolean
    | number
    | string
    | MakeID<string>
    | Date
    | Uint8Array
    | Encodable[]
    | { [key: string]: Encodable }

// just a helper type that makes typescript think properly
export type MakeEncodable<T> = T extends Encodable
    ? T
    : { [key in keyof T]: MakeEncodable<T[key]> }
;
