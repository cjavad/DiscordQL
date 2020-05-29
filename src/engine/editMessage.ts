import { TextChannel, DMChannel, MessageEditOptions } from "discord.js";

export default async function editMessage (channel: TextChannel | DMChannel, messageId: string, newMessage: MessageEditOptions) {
    var message = await channel.messages.fetch(messageId);
    return await message.edit(newMessage.content, newMessage);
}