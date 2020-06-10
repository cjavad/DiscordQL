import { Guild } from 'discord.js';
import { SerialMember } from '../../types/serial';
import Serializer from './serializer';

/**
 * Fetches a member from the specified guild by id
 * @param guild - Discord guild object of the guild to fetch a member from
 * @param userID - Discord user id of a member in guild
 */
export default async function fetchGuild (guild: Guild, userID: string): Promise<SerialMember | undefined> {
    const member = await guild.members.resolve(userID)?.fetch();
    return member ? Serializer.member(member) : undefined;
}