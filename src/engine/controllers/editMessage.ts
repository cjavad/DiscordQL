import { TextChannel, DMChannel, MessageEditOptions } from 'discord.js';
import { SerialMessage } from '../../types/serial';
import Serializer from './serializer';


/**
 * Edits a discord message in a channel
 * @param channel - Discord channel to edit message in
 * @param messageID - Discord message id of a message in the channel
 * @param newMessage - MessageEditOptions of the new message
 */
export default async function editMessage (channel: TextChannel | DMChannel, messageID: string, newMessage: MessageEditOptions): Promise<SerialMessage> {
    const message = await channel.messages.fetch(messageID);
    const editedMessage = await message.edit(newMessage.content, newMessage);
    return Serializer.message(editedMessage);
}