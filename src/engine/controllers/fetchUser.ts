import { Client, User } from 'discord.js';

/**
 * Fetches publically available information about a discord user
 * @param client - Discord client instance
 * @param userID - Discord user id of a global discord user
 */
export default async function fetchUser (client: Client, userID: string): Promise<User | undefined> {
    return (await client.users.fetch(userID)) as User | undefined;
}