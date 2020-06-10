import { SerialClientEvents, SerialVoid, SerialMessage, SerialUser, SerialMember, SerialChannel, SerialGuild, SerialEmoji, SerialReaction, SerialRole, SerialPresence, SerialActivity, SerialPermissions } from './serial';

/** Object containing discord context for a event, that being optionally a guild or channel id */
export interface Ids {
    channelID?: string,
    guildID?: string
}

/** Event object containing the name of the ClientEvent, its return params and a its discord id context */
export interface Event {
    name: keyof SerialClientEvents,
    params: Array<SerialVoid | SerialMessage | SerialUser | SerialMember | SerialChannel | SerialGuild | SerialEmoji | SerialReaction | SerialRole | SerialPresence | SerialActivity | SerialPermissions | any>,
    ids: Ids
}