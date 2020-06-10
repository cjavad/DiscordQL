import { Client, PresenceData } from 'discord.js';
import { SerialPresence } from '../../types/serial';
import Serializer from './serializer';

/**
 * Updates discord bot presence
 * @param client - Discord client instance
 * @param presence - Discord PresenceData object that overwrites the discord bots current precence
 */
export default async function updatePresence (client: Client, presence: PresenceData): Promise<SerialPresence | undefined> {
    return client.user ? Serializer.presence(await client.user.setPresence(presence)) : undefined;
}