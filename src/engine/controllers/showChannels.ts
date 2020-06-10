import { Guild, GuildChannel, Collection, Snowflake } from 'discord.js';
import { SerialChannel } from '../../types/serial';
import Serializer from './serializer';

/**
 * Gets a list of current available channels in a guild
 * @param guild - Discord guild to list all channels in
 * @param search - String to match channel names with
 */
export default function showChannels (guild: Guild, search?: string): Array<SerialChannel> {
    let channels: Collection<Snowflake, GuildChannel> = guild.channels.cache;
    if (search) channels = channels.filter(channel => channel.name.includes(search));
    return Serializer.channels(channels.array());
}