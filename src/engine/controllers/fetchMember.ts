import { Guild, GuildMember } from "discord.js";

export default async function fetchGuild(guild: Guild, userID: string): Promise<GuildMember | undefined> {
    return guild.members.resolve(userID) as GuildMember | undefined;
}