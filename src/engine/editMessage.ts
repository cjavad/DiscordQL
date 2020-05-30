import { TextChannel, DMChannel, MessageEditOptions } from "discord.js";

export default async function editMessage (channel: TextChannel | DMChannel, messageID: string, newMessage: MessageEditOptions) {
    var message = await channel.messages.fetch(messageID);
    return await message.edit(newMessage.content, newMessage);
}