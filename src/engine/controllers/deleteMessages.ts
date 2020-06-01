import { TextChannel, ChannelLogsQueryOptions, Collection, Snowflake, Message, Channel, DMChannel } from "discord.js";
import readChannel from "./readChannel";

export default async function deleteMessages (channel: TextChannel, options: ChannelLogsQueryOptions): Promise<Collection<Snowflake, Message>> {
    var messages = await readChannel(channel, options);
    return await channel.bulkDelete(messages, true);
}