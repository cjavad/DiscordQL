import { Client, Guild, Collection, Snowflake } from 'discord.js';
import { SerialGuild } from '../../types/serial';
import Serializer from './serializer';

/**
 * Gets a list of current available guilds
 * @param client - Discord client instance
 * @param search - String to match guild names with
 */
export default function showGuilds (client: Client, search?: string): Array<SerialGuild> {
    let guilds: Collection<Snowflake, Guild> = client.guilds.cache;
    if (search) guilds = guilds.filter(guild => guild.name.includes(search));
    return Serializer.guilds(guilds.array());
}