import { Client, Guild, Collection, Snowflake } from "discord.js";

export default function showGuilds(client: Client, search?: string) {
    let guilds: Collection<Snowflake, Guild> = client.guilds.cache;
    if (search) guilds = guilds.filter(guild => guild.name.includes(search));
    return guilds.array();
}