import { Client, Guild, Collection, Snowflake } from 'discord.js';

/**
 * Gets a list of current available guilds
 * @param client - Discord client instance
 * @param search - String to match guild names with
 */
export default function showGuilds (client: Client, search?: string): Array<Guild> {
    let guilds: Collection<Snowflake, Guild> = client.guilds.cache;
    if (search) guilds = guilds.filter(guild => guild.name.includes(search));
    return guilds.array();
}