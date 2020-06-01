import { Client, PresenceData } from "discord.js";

export default async function updatePresence (client: Client, presence: PresenceData) {
    return await client.user?.setPresence(presence);
}