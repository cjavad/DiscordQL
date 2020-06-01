import { Client, Guild } from "discord.js";

export default async function fetchGuild(client: Client, guildID: string): Promise<Guild | undefined> {
    return client.guilds.resolve(guildID) as Guild | undefined;
}