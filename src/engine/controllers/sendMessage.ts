import {  TextChannel, DMChannel, MessageOptions, Message } from 'discord.js';

/**
 * Sends a message in channel
 * @param channel - Discord channel to send the message in
 * @param message - message as a MessageOptions object
 */
export default function sendMessage (channel: TextChannel | DMChannel, message: MessageOptions): Promise<Message> {
    return channel.send(message);
}