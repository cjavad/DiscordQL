import { Guild, GuildMember, Collection, Snowflake } from 'discord.js';

/**
 * Gets a list of current available users in a guild
 * @param guild - Discord guild to list all users in
 * @param search - String to match username#0000 with
 */
export default async function showMembers (guild: Guild, search?: string): Promise<Array<GuildMember>> {
    let members: Collection<Snowflake, GuildMember> = await guild.members.fetch();
    if (search) members = members.filter(member => (member.user.username + member.user.discriminator).includes(search) );
    return members.array();
}