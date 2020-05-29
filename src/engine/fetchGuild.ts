import { Client } from "discord.js";

export default async function fetchGuild(client: Client, guildId: string) {
    return client.guilds.resolve(guildId);
}