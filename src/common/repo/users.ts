import { User, UserCreateData } from '../domain/user';

export interface UsersRepo {
    getByUsername(username: string): Promise<User | null>;
    create(data: UserCreateData): Promise<User>;

    updateIsOnline(where: { id: string }, isOnline: boolean): Promise<void>;
}
