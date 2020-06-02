import { TextChannel, Message } from 'discord.js';

/**
 * Delete discord message in a channel by its discord message id
 * @param channel - Discord channel object
 * @param messageID - Discord message id of a message in the channel
 */
export default async function deleteMessage (channel: TextChannel, messageID: string): Promise<Message> {
    const message = await channel.messages.fetch(messageID);
    return await message.delete();
}