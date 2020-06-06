import { TextChannel, Client, DMChannel } from 'discord.js';

/**
 * Fetches a channel from the client by its id
 * @param client - Discord client instance
 * @param channelID - Discord channel id of a channel client exists in
 */
export default async function fetchChannel (client: Client, channelID: string): Promise<TextChannel | DMChannel | undefined> {
    return (await (await client.channels.fetch(channelID)).fetch()) as TextChannel | DMChannel | undefined;
}