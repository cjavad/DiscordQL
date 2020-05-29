import { Client } from "discord.js";

export default async function fetchChannel(client: Client, channelId: string) {
    return client.channels.fetch(channelId);
}