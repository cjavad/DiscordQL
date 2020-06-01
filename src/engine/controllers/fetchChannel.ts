import { TextChannel, Client, DMChannel, Channel } from "discord.js";

export default async function fetchChannel(client: Client, channelID: string) {
    return (await client.channels.fetch(channelID)) as TextChannel | DMChannel | undefined;
}