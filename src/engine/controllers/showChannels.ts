import { Guild } from "discord.js";

export default function showChannels(guild: Guild, search?: string) {
    if (!search) {
        return guild.channels.cache.array();
    }

    return guild.channels.cache.filter(channel => {
        return channel.name.includes(search);
    }).array();
}