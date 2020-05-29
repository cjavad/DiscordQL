import { TextChannel, DMChannel, ChannelLogsQueryOptions } from "discord.js";

export default async function readChannel ( channel: TextChannel | DMChannel, options?: ChannelLogsQueryOptions) {
    return (await channel.messages.fetch(options)).array();
}
