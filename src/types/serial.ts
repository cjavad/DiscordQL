export interface SerialVoid {
    type: 'void'
}

export interface SerialMessage {
    type: 'message',
    id: string,
    author: SerialUser,
    channel: SerialChannel,
    content: string,
    createdAt: Date,
    createdTimestamp: number,
    deletable: boolean,
    deleted: boolean,
    editable: boolean,
    editedAt?: Date,
    editedTimestamp?: number
}

export interface SerialUser {
    type: 'user',
    id: string,
    username: string,
    tag: string,
    discriminator: string,
    bot: boolean,
    avatar?: string,
    createdAt: Date,
    createdTimestamp: number,
    lastMessageID?: string
}

export interface SerialMember {
    type: 'member',
    id: string,
    user?: SerialUser,
    nickname?: string,
    displayColor: number,
    displayHexColor: string,
    displayName: string,
    joinedAt?: Date,
    joinedTimestamp?: number,
    kickable: boolean,
    lastMessageID?: string,
    manageable: boolean,
    premiumSince?: Date,
    premiumSinceTimestamp?: number,
}

export interface SerialChannel {
    type: 'channel',
    id: string,
    name: string,
    createdAt: Date,
    createdTimestamp: number
    guild?: SerialGuild,
    manageable: boolean,
    viewable: boolean,
    position: number
}

export interface SerialGuild {
    type: 'guild',
    id: string,
    name: string,
    ownerID: string,
    owner?: SerialMember,
    createdAt: Date,
    createdTimestamp: number,
    deleted: boolean,
    description?: string,
    icon?: string,
    memberCount: number,
    region: string
}

export interface SerialEmoji {
    type: 'emoji',
    id?: string,
    name: string,
    createdAt?: Date,
    createdTimestamp?: number
}

export interface SerialReaction {
    type: 'reaction',
    message: SerialMessage,
    count?: number,
    emoji: SerialEmoji,
    me: boolean
}

export interface SerialRole {
    type: 'role',
    id: string,
    name: string,
    color: number
    hexColor: string,
    position: number,
    guild: SerialGuild,
    createdAt: Date,
    createdTimestamp: number,
    deleted: boolean,
    mentionable: boolean,
    managed: boolean,
    editable: boolean,
    hoist: boolean,
    permissions: Array<SerialPermissions>
}

export interface SerialPresence {
    type: 'presence',
    status: 'online' | 'idle' | 'dnd' | 'offline',
    clientStatus?: {
        web?: 'online' | 'idle' | 'dnd';
        mobile?: 'online' | 'idle' | 'dnd';
        desktop?: 'online' | 'idle' | 'dnd';
    },
    activities: Array<SerialActivity>,
    guild?: SerialGuild,
    member?: SerialMember,
}

export interface SerialActivity {
    type: 'activity',
    applicationID?: string,
    createdAt: Date,
    details?: string,
    emoji?: SerialEmoji,
    state?: string,
    timestamps?: {
        start?: Date,
        end?: Date
    },
    name: string,
    url?: string
}

export type SerialPermissions =
| 'CREATE_INSTANT_INVITE'
| 'KICK_MEMBERS'
| 'BAN_MEMBERS'
| 'ADMINISTRATOR'
| 'MANAGE_CHANNELS'
| 'MANAGE_GUILD'
| 'ADD_REACTIONS'
| 'VIEW_AUDIT_LOG'
| 'PRIORITY_SPEAKER'
| 'STREAM'
| 'VIEW_CHANNEL'
| 'SEND_MESSAGES'
| 'SEND_TTS_MESSAGES'
| 'MANAGE_MESSAGES'
| 'EMBED_LINKS'
| 'ATTACH_FILES'
| 'READ_MESSAGE_HISTORY'
| 'MENTION_EVERYONE'
| 'USE_EXTERNAL_EMOJIS'
| 'VIEW_GUILD_INSIGHTS'
| 'CONNECT'
| 'SPEAK'
| 'MUTE_MEMBERS'
| 'DEAFEN_MEMBERS'
| 'MOVE_MEMBERS'
| 'USE_VAD'
| 'CHANGE_NICKNAME'
| 'MANAGE_NICKNAMES'
| 'MANAGE_ROLES'
| 'MANAGE_WEBHOOKS'
| 'MANAGE_EMOJIS';