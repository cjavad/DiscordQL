import { TextChannel, ChannelLogsQueryOptions, Collection, Snowflake, Message } from 'discord.js';
import readChannel from './readChannel';

/**
 * Delete multiple messsages from a channel with a ChannelLogsQueryOptions query.
 * @param channel - Discord channel to delete messages in
 * @param options - ChannelLogsQueryOptions query options
 */
export default async function deleteMessages (channel: TextChannel, options: ChannelLogsQueryOptions): Promise<Collection<Snowflake, Message>> {
    const messages = await readChannel(channel, options);
    return await channel.bulkDelete(messages, true);
}