import { TextChannel, DMChannel, MessageEditOptions, Message } from 'discord.js';

/**
 * Edits a discord message in a channel
 * @param channel - Discord channel to edit message in
 * @param messageID - Discord message id of a message in the channel
 * @param newMessage - MessageEditOptions of the new message
 */
export default async function editMessage (channel: TextChannel | DMChannel, messageID: string, newMessage: MessageEditOptions): Promise<Message> {
    const message = await channel.messages.fetch(messageID);
    return await message.edit(newMessage.content, newMessage);
}