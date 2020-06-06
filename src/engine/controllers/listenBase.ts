import { Client, ClientEvents } from 'discord.js';
import { Ids, Event } from '../../types/listener';

/**
 * Creates an Event object to return to callback(event: Event)
 * @param name ClientEvents event name
 * @param ids event context in the form of an Ids object
 * @param params values contained by each event
 */
function eventCallback<K extends keyof ClientEvents> (name: K, ids: Ids, ...params: ClientEvents[K]): Event<K> {
  return {
    name: name,
    params: params,
    ids: ids
  };
}

/**
 * Handles all discord events and calls callback() with a Event object made by eventCallback
 * @param client - Discord client instance
 * @param callback - Callback function that takes an Event object that is called on every event
 */
export async function eventListener (client: Client, callback: (event: Event<keyof ClientEvents>) => void ): Promise <void> {
  client.on('channelCreate', (channel: any) => {
    callback(eventCallback('channelCreate', { channelID: channel.id, guildID: channel.guild ? channel.guild.id : undefined }, channel));
  });

  client.on('channelDelete', (channel: any) => {
    callback(eventCallback('channelDelete', { channelID: channel.id, guildID: channel.guild ? channel.guild.id : undefined }, channel));
  });

  client.on('channelPinsUpdate', (channel: any, time) => {
    callback(eventCallback('channelPinsUpdate', { channelID: channel.id, guildID: channel.guild ? channel.guild.id : undefined }, channel, time));
  });

  client.on('channelUpdate', (oldChannel, newChannel: any) => {
    callback(eventCallback('channelUpdate', { channelID: newChannel.id, guildID: newChannel.guild ? newChannel.guild.id : undefined }, oldChannel, newChannel));
  });

  client.on('emojiCreate', (emoji) => {
    callback(eventCallback('emojiCreate', { guildID: emoji.guild.id }, emoji));
  });

  client.on('emojiDelete', (emoji) => {
    callback(eventCallback('emojiDelete', { guildID: emoji.guild.id }, emoji));
  });

  client.on('emojiUpdate', (oldEmoji, newEmoji) => {
    callback(eventCallback('emojiUpdate', { guildID: newEmoji.guild.id }, oldEmoji, newEmoji));
  });

  client.on('guildBanAdd', (guild, user) => {
    callback(eventCallback('guildBanAdd', { guildID: guild.id }, guild, user));
  });

  client.on('guildBanRemove', (guild, user) => {
    callback(eventCallback('guildBanRemove', { guildID: guild.id }, guild, user));
  });

  client.on('guildCreate', (guild) => {
    callback(eventCallback('guildCreate', { guildID: guild.id }, guild));
  });

  client.on('guildDelete', (guild) => {
    callback(eventCallback('guildDelete', { guildID: guild.id }, guild));
  });

  client.on('guildMemberAdd', (member) => {
    callback(eventCallback('guildMemberAdd', { guildID: member.guild.id }, member));
  });

  client.on('guildMemberAvailable', (member) => {
    callback(eventCallback('guildMemberAvailable', { guildID: member.guild.id }, member));
  });

  client.on('guildMemberRemove', (member) => {
    callback(eventCallback('guildMemberRemove', { guildID: member.guild.id }, member));
  });

  client.on('guildMembersChunk', (members, guild) => {
    callback(eventCallback('guildMembersChunk', { guildID: guild.id }, members, guild));
  });

  client.on('guildMemberSpeaking', (member, speaking) => {
    callback(eventCallback('guildMemberSpeaking', { guildID: member.guild.id }, member, speaking));
  });

  client.on('guildMemberUpdate', (oldMember, newMember) => {
    callback(eventCallback('guildMemberUpdate', { guildID: newMember.guild.id }, oldMember, newMember));
  });

  client.on('guildUnavailable', (guild) => {
    callback(eventCallback('guildUnavailable', { guildID: guild.id }, guild));
  });

  client.on('guildUpdate', (oldGuild, newGuild) => {
    callback(eventCallback('guildUpdate', { guildID: newGuild.id }, oldGuild, newGuild));
  });

  client.on('message', (message: any) => {
    callback(eventCallback('message', { channelID: message.channel.id, guildID: message.channel.guild ? message.channel.guild.id : undefined }, message));
  });

  client.on('messageDelete', (message: any) => {
    callback(eventCallback('messageDelete', { channelID: message.channel.id, guildID: message.channel.guild ? message.channel.guild.id : undefined }, message));
  });

  client.on('messageDeleteBulk', (messages: any) => {
    callback(eventCallback('messageDeleteBulk', { channelID: messages.random().channel.id, guildID: messages.random().channel.guild.id }, messages));
  });

  client.on('messageReactionAdd', (messageReaction: any, user) => {
    callback(eventCallback('messageReactionAdd', { channelID: messageReaction.message.channel.id, guildID: messageReaction.message.channel.guild ? messageReaction.message.channel.guild.id : undefined }, messageReaction, user));
  });

  client.on('messageReactionRemove', (messageReaction: any, user) => {
    callback(eventCallback('messageReactionRemove', { channelID: messageReaction.message.channel.id, guildID: messageReaction.message.channel.guild ? messageReaction.message.channel.guild.id : undefined }, messageReaction, user));
  });

  client.on('messageReactionRemoveAll', (message: any) => {
    callback(eventCallback('messageReactionRemoveAll', { channelID: message.channel.id, guildID: message.channel.guild ? message.channel.guild.id : undefined }, message));
  });

  client.on('messageUpdate', (oldMessage, newMessage: any) => {
    callback(eventCallback('messageUpdate', { channelID: newMessage.channel.id, guildID: newMessage.channel.guild ? newMessage.channel.guild.id : undefined }, oldMessage, newMessage));
  });

  client.on('presenceUpdate', (oldPresence, newPresence: any) => {
    callback(eventCallback('presenceUpdate', { guildID: newPresence.guild.id }, oldPresence, newPresence));
  });

  client.on('roleCreate', (role) => {
    callback(eventCallback('roleCreate', { guildID: role.guild.id }, role));
  });

  client.on('roleDelete', (role) => {
    callback(eventCallback('roleDelete', { guildID: role.guild.id }, role));
  });

  client.on('roleUpdate', (oldRole, newRole) => {
    callback(eventCallback('roleUpdate', { guildID: newRole.guild.id }, oldRole, newRole));
  });

  client.on('typingStart', (channel: any, user) => {
    callback(eventCallback('typingStart', { channelID: channel.id, guildID: channel.guild ? channel.guild.id : undefined }, channel, user));
  });

  client.on('userUpdate', (oldUser, newUser) => {
    callback(eventCallback('userUpdate', {}, oldUser, newUser));
  });

  client.on('voiceStateUpdate', (oldMember, newMember) => {
    callback(eventCallback('voiceStateUpdate', { guildID: newMember.guild.id }, oldMember, newMember));
  });
}