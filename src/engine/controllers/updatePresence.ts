import { Client, PresenceData, Presence } from 'discord.js';

/**
 * Updates discord bot presence
 * @param client - Discord client instance
 * @param presence - Discord PresenceData object that overwrites the discord bots current precence
 */
export default async function updatePresence (client: Client, presence: PresenceData): Promise<Presence | undefined> {
    return await client.user?.setPresence(presence);
}