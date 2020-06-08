import { Client, User } from 'discord.js';

/**
 * Fetches publically available information about a discord user
 * @param client - Discord client instance
 * @param userID - Discord user id of a global discord user
 */
export default async function fetchUser (client: Client, userID: string): Promise<User | undefined> {
    const user = client.users.fetch(userID);
    return user ? user : undefined;
}