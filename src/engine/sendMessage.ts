import { TextChannel, DMChannel, MessageOptions } from "discord.js";

export default function sendMessage (channel: TextChannel | DMChannel, message: MessageOptions) {
    channel.send(message);
}