import { Guild, GuildChannel, Collection, Snowflake } from "discord.js";

export default function showChannels(guild: Guild, search?: string) {
    let channels: Collection<Snowflake, GuildChannel> = guild.channels.cache;
    if (search) channels = channels.filter(channel => channel.name.includes(search));
    return channels.array();
}