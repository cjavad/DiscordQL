import { TextChannel, Client, GuildChannel } from 'discord.js';
import { SerialChannel } from '../../types/serial';
import Serializer from './serializer';
/**
 * Fetches a channel from the client by its id
 * @param client - Discord client instance
 * @param channelID - Discord channel id of a channel client exists in
 */
export default async function fetchChannel (client: Client, channelID: string): Promise<SerialChannel | undefined> {
    const channel = await client.channels.fetch(channelID);
    return channel ? Serializer.channel(channel as TextChannel | GuildChannel) : undefined;
}