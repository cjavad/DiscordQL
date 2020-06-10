import {  TextChannel, DMChannel, MessageOptions } from 'discord.js';
import { SerialMessage } from '../../types/serial';
import Serializer from './serializer';

/**
 * Sends a message in channel
 * @param channel - Discord channel to send the message in
 * @param message - message as a MessageOptions object
 */
export default async function sendMessage (channel: TextChannel | DMChannel, message: MessageOptions): Promise<SerialMessage> {
    return Serializer.message(await channel.send(message));
}