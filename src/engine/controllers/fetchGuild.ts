import { Client, Guild } from 'discord.js';

/**
 * Fetches a guild from the client by id
 * @param client - Discord client instance
 * @param guildID - Discord guild id of a guild client exists in
 */
export default async function fetchGuild (client: Client, guildID: string): Promise<Guild | undefined> {
    return (client.guilds.resolve(guildID) as Guild | undefined)?.fetch();
}