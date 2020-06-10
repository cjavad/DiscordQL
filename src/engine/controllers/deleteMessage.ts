import { TextChannel } from 'discord.js';
import { SerialMessage } from '../../types/serial';
import Serializer from './serializer';

/**
 * Delete discord message in a channel by its discord message id
 * @param channel - Discord channel object
 * @param messageID - Discord message id of a message in the channel
 */
export default async function deleteMessage (channel: TextChannel, messageID: string): Promise<SerialMessage> {
    const message = await (await channel.messages.fetch(messageID)).delete();
    return Serializer.message(message);
}