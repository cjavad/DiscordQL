import { Client } from "discord.js";

export default function showGuilds(client: Client, search?: string) {
    if (!search) {
        return client.guilds.cache.array();
    }

    return client.guilds.cache.filter(guild => {
        return guild.name.includes(search);
    }).array();
}