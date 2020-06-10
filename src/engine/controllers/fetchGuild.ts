import { Client } from 'discord.js';
import Serializer from './serializer';
import { SerialGuild } from '../../types/serial';

/**
 * Fetches a guild from the client by id
 * @param client - Discord client instance
 * @param guildID - Discord guild id of a guild client exists in
 */
export default async function fetchGuild (client: Client, guildID: string): Promise<SerialGuild | undefined> {
    const guild = client.guilds.resolve(guildID);
    return guild ? Serializer.guild(await guild.fetch()) : undefined;
}