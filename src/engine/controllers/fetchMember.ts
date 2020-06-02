import { Guild, GuildMember } from 'discord.js';

/**
 * Fetches a member from the specified guild by id
 * @param guild - Discord guild object of the guild to fetch a member from
 * @param userID - Discord user id of a member in guild
 */
export default async function fetchGuild (guild: Guild, userID: string): Promise<GuildMember | undefined> {
    return guild.members.resolve(userID) as GuildMember | undefined;
}