import { TextChannel, DMChannel } from "discord.js";

export default async function deleteMessage (channel: TextChannel | DMChannel, messageID: string) {
    var message = await channel.messages.fetch(messageID);
    return await message.delete();
}