import { Client } from 'discord.js';
import { SerialUser } from '../../types/serial';
import Serializer from './serializer';

/**
 * Fetches publically available information about a discord user
 * @param client - Discord client instance
 * @param userID - Discord user id of a global discord user
 */
export default async function fetchUser (client: Client, userID: string): Promise<SerialUser | undefined> {
    const user = await client.users.fetch(userID);
    return user ? Serializer.user(user) : undefined;
}