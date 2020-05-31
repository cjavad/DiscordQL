import { Client, ClientEvents } from "discord.js";
import { callbackify } from "util";

export interface ids {
  channelID?: string,
  guildID?: string
}


export interface event {
  eventName: keyof ClientEvents,
  params: any,
  ids: ids
}

function eventCallback(eventName: keyof ClientEvents, params: any, ids: ids): event {
  return {
    eventName: eventName,
    params: params,
    ids: ids
  }
}

export async function eventListener(client: Client, callback: (event: event) => void ): Promise <void> {
  client.on('channelCreate', (channel: any) => {
    callback(eventCallback('channelCreate', {
      channel: channel
    }, { channelID: channel.id, guildID: channel.guild ? channel.guild.id : undefined }));
  });

  client.on('channelDelete', (channel: any) => {
    callback(eventCallback('channelDelete', {
      channel: channel
    }, { channelID: channel.id, guildID: channel.guild ? channel.guild.id : undefined }));
  });

  client.on('channelPinsUpdate', (channel: any, time) => {
    callback(eventCallback('channelPinsUpdate', {
      channel: channel,
      time: time
    }, { channelID: channel.id, guildID: channel.guild ? channel.guild.id : undefined }));
  });

  client.on('channelUpdate', (oldChannel, newChannel: any) => {
    callback(eventCallback('channelUpdate', {
      oldChannel: oldChannel,
      newChannel: newChannel
    }, { channelID: newChannel.id, guildID: newChannel.guild ? newChannel.guild.id : undefined }));
  });

  client.on('emojiCreate', (emoji) => {
    callback(eventCallback('emojiCreate', {
      emoji: emoji
    }, { guildID: emoji.guild.id }));
  });

  client.on('emojiDelete', (emoji) => {
    callback(eventCallback('emojiDelete', {
      emoji: emoji
    }, { guildID: emoji.guild.id }));
  });

  client.on('emojiUpdate', (oldEmoji, newEmoji) => {
    callback(eventCallback('emojiUpdate', {
      oldEmoji: oldEmoji,
      newEmoji: newEmoji
    }, { guildID: newEmoji.guild.id }));
  });

  client.on('guildBanAdd', (guild, user) => {
    callback(eventCallback('guildBanAdd', {
      guild: guild,
      user: user
    }, { guildID: guild.id }));
  });

  client.on('guildBanRemove', (guild, user) => {
    callback(eventCallback('guildBanRemove', {
      guild: guild,
      user: user
    }, { guildID: guild.id }));
  });

  client.on('guildCreate', (guild) => {
    callback(eventCallback('guildCreate', {
      guild: guild
    }, { guildID: guild.id }));
  });

  client.on('guildDelete', (guild) => {
    callback(eventCallback('guildDelete', {
      guild: guild
    }, { guildID: guild.id }));
  });

  client.on('guildMemberAdd', (member) => {
    callback(eventCallback('guildMemberAdd', {
      member: member
    }, { guildID: member.guild.id }));
  });

  client.on('guildMemberAvailable', (member) => {
    callback(eventCallback('guildMemberAvailable', {
      member: member
    }, { guildID: member.guild.id }));
  });

  client.on('guildMemberRemove', (member) => {
    callback(eventCallback('guildMemberRemove', {
      member: member
    }, { guildID: member.guild.id }));
  });

  client.on('guildMembersChunk', (members, guild) => {
    callback(eventCallback('guildMembersChunk', {
      members: members,
      guild: guild
    }, { guildID: guild.id }));
  });

  client.on('guildMemberSpeaking', (member, speaking) => {
    callback(eventCallback('guildMemberSpeaking', {
      member: member,
      speaking: speaking
    }, { guildID: member.guild.id }));
  });

  client.on('guildMemberUpdate', (oldMember, newMember) => {
    callback(eventCallback('guildMemberUpdate', {
      oldMember: oldMember,
      newMember: newMember
    }, { guildID: newMember.guild.id }));
  });

  client.on('guildUnavailable', (guild) => {
    callback(eventCallback('guildUnavailable', {
      guild: guild
    }, { guildID: guild.id }));
  });

  client.on('guildUpdate', (oldGuild, newGuild) => {
    callback(eventCallback('guildUpdate', {
      oldGuild: oldGuild,
      newGuild: newGuild
    }, { guildID: newGuild.id }));
  });

  client.on('message', (message: any) => {
    callback(eventCallback('message', {
      message: message
    }, { channelID: message.channel.id, guildID: message.channel.guild ? message.channel.guild.id : undefined }));
  });

  client.on('messageDelete', (message: any) => {
    callback(eventCallback('messageDelete', {
      message: message
    }, { channelID: message.channel.id, guildID: message.channel.guild ? message.channel.guild.id : undefined }));
  });

  client.on('messageDeleteBulk', (messages: any) => {
    callback(eventCallback('messageDeleteBulk', {
      messages: messages
    }, { channelID: messages.random().channel.id, guildID: messages.random().channel.guild.id }));
  });

  client.on('messageReactionAdd', (messageReaction: any, user) => {
    callback(eventCallback('messageReactionAdd', {
      messageReaction: messageReaction,
      user: user
    }, { channelID: messageReaction.message.channel.id, guildID: messageReaction.message.channel.guild ? messageReaction.message.channel.guild.id : undefined }));
  });

  client.on('messageReactionRemove', (messageReaction: any, user) => {
    callback(eventCallback('messageReactionRemove', {
      messageReaction: messageReaction,
      user: user
    }, { channelID: messageReaction.message.channel.id, guildID: messageReaction.message.channel.guild ? messageReaction.message.channel.guild.id : undefined }));
  });

  client.on('messageReactionRemoveAll', (message: any) => {
    callback(eventCallback('messageReactionRemoveAll', {
      message: message
    }, { channelID: message.channel.id, guildID: message.channel.guild ? message.channel.guild.id : undefined }));
  });

  client.on('messageUpdate', (oldMessage, newMessage: any) => {
    callback(eventCallback('messageUpdate', {
      oldMessage: oldMessage,
      newMessage: newMessage
    }, { channelID: newMessage.channel.id, guildID: newMessage.channel.guild ? newMessage.channel.guild.id : undefined }));
  });

  client.on('presenceUpdate', (oldPresence, newPresence: any) => {
    callback(eventCallback('presenceUpdate', {
      oldPresence: oldPresence,
      newPresence: newPresence
    }, { guildID: newPresence.guild.id }));
  });

  client.on('roleCreate', (role) => {
    callback(eventCallback('roleCreate', {
      role: role
    }, { guildID: role.guild.id }));
  });

  client.on('roleDelete', (role) => {
    callback(eventCallback('roleDelete', {
      role: role
    }, { guildID: role.guild.id }));
  });

  client.on('roleUpdate', (oldRole, newRole) => {
    callback(eventCallback('roleUpdate', {
      oldRole: oldRole,
      newRole: newRole
    }, { guildID: newRole.guild.id }));
  });

  client.on('typingStart', (channel: any, user) => {
    callback(eventCallback('typingStart', {
      channel: channel,
      user: user
    }, { channelID: channel.id, guildID: channel.guild ? channel.guild.id : undefined }));
  });

  client.on('userUpdate', (oldUser, newUser) => {
    callback(eventCallback('userUpdate', {
      oldUser: oldUser,
      newUser: newUser
    }, {}));
  });

  client.on('voiceStateUpdate', (oldMember, newMember) => {
    callback(eventCallback('voiceStateUpdate', {
      oldMember: oldMember,
      newMember: newMember
    }, { guildID: newMember.guild.id }));
  });
}