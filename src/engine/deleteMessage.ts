import { TextChannel, DMChannel } from "discord.js";

export default async function deleteMessage (channel: TextChannel | DMChannel, messageId: string) {
    var message = await channel.messages.fetch(messageId);
    return await message.delete();
}