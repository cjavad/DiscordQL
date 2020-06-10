import * as fs from 'fs';
import chalk from 'chalk';
import yargs from 'yargs';
import repl from 'repl';
import { DiscordQuery } from './runtime';
import { DiscordQueryParsingError, DiscordQueryRuntimeError } from './runtime/errors';
import { EngineCommand } from './types/engine';
import { Event } from './types/listener';
import { SerialGuild, SerialChannel, SerialMessage, SerialMember, SerialUser, SerialEmoji, SerialReaction, SerialRole, SerialPresence } from './types/serial';

/** Class formatting serialized data into neat printable output */
class Formatter {
    /** Polyfill function returning an empty string */
    static void (): string {
        return '';
    }

    /**
     * Date parser expressing all dates for the output
     * @param date - Date object
     */
    static date (date: Date): string {
        return new Intl.DateTimeFormat('en', {
            year: 'numeric', month: 'numeric', day: 'numeric',
            hour: 'numeric', minute: 'numeric', second: 'numeric',
            hour12: false
        })
        .format(date).replace(/\,/, '');
    }

    /**
     * Formats a array of guilds into a single string
     * @param guilds - Array of serialized guilds to contain in one string
     */
    static guilds (guilds: Array<SerialGuild>): string {
        if (!guilds) return this.void();
        let formatted = `Guild Count ${guilds.length}\n`;
        guilds.reverse();
        guilds.forEach(guild => formatted += this.guild(guild) + '\n');
        return formatted;
    }

    /**
     * Formats a array of channels into a single string
     * @param channels - Array of serialized channels to contain in one string
     */
    static channels (channels: Array<SerialChannel>): string {
        if (!channels) return this.void();
        let formatted = `Channel Count ${channels.length}\n`;
        channels.reverse();
        channels.forEach(channel => formatted += this.channel(channel) + '\n');
        return formatted;
    }

    /**
     * Formats a array of messages into a single string
     * @param messages - Array of serialized messages to contain in one string
     */
    static messages (messages: Array<SerialMessage>): string {
        if (!messages) return this.void();
        let formatted = `Message Count: ${messages.length}\n`;
        messages.reverse();
        messages.forEach(message => formatted += this.message(message) + '\n');
        return formatted;
    }

    /**
     * Formats a array of members into a single string
     * @param members - Array of serialized members to contain in one string
     */
    static members (members: Array<SerialMember>): string {
        if (!members) return this.void();
        let formatted = `Member Count: ${members.length}\n`;
        members.reverse();
        members.forEach(member => formatted += this.member(member) + ' ');
        return formatted;
    }

    /**
     * Formats a single serialized message into a console ready string
     * @param message - Serialized message object
     * @param partial - Whether to return the formatted data or the whole output
     */
    static message (message: SerialMessage, partial?: boolean): string {
        if (!message) return this.void();
        const date = message.createdAt as Date;
        let formatted = '';
        formatted += chalk.green(message.channel.name);
        formatted += ' ' + chalk.bgGray(this.date(date));
        formatted += ' ' + chalk.yellow(message.author.tag);
        formatted += ': ' + message.content;
        if (partial) return formatted;
        return `${chalk.cyan('MESSAGE')} ${formatted}`;
    }

     /**
     * Formats a single serialized user into a console ready string
     * @param user - Serialized user object
     * @param partial - Whether to return the formatted data or the whole output
     */
    static user (user: SerialUser, partial?: boolean): string {
        if (!user) return this.void();
        let formatted = '';
        formatted += user.tag ? chalk.yellow(user.tag) + ' (' : '';
        formatted += chalk.blue(user.id) + user.tag ? ')' : '';
        formatted += ' ' + chalk.bgGray(this.date(user.createdAt));
        if (partial) return formatted;
        return `${user.bot ? chalk.cyan('BOT') : chalk.cyan('USER')} ${formatted}`;
    }

     /**
     * Formats a single serialized member into a console ready string
     * @param member - Serialized member object
     * @param partial - Whether to return the formatted data or the whole output
     */
    static member (member: SerialMember, partial?: boolean): string {
        if (!member) return this.void();
        let formatted = '';
        formatted += member.user ? this.user(member.user, true) : chalk.yellow(member.id);
        formatted += member.joinedAt ? ' Joined: ' + chalk.bgGray(this.date(member.joinedAt)) : '';
        if (partial) return formatted;
        return `${member.user?.bot ? chalk.cyan('BOT') : chalk.cyan('MEMBER')} ${formatted}`;
    }

     /**
     * Formats a single serialized channel into a console ready string
     * @param channel - Serialized channel object
     * @param partial - Whether to return the formatted data or the whole output
     */
    static channel (channel: SerialChannel, partial?: boolean): string {
        if (!channel) return this.void();
        let formatted = '';
        formatted += chalk.magenta(channel.name);
        formatted += ' (' + chalk.green(channel.id) + ')';
        formatted += ' ^' + channel.position;
        formatted += channel.createdAt ? ' ' + chalk.bgGray(this.date(channel.createdAt as Date)) : '';
        if (partial) return formatted;
        return `${chalk.cyan('CHANNEL')} ${formatted}`;
    }

     /**
     * Formats a single serialized guild into a console ready string
     * @param guild - Serialized guild object
     * @param partial - Whether to return the formatted data or the whole output
     */
    static guild (guild: SerialGuild, partial?: boolean): string {
        if (!guild) return this.void();
        let formatted = '';
        formatted += chalk.blue(guild.name);
        formatted += ' (' + chalk.red(guild.id) + ')';
        formatted += ' Region: ' + chalk.green(guild.region);
        formatted += ' Members: ' + chalk.red(guild.memberCount);
        formatted += guild.owner ? (guild.owner.user ? ' Owner: ' + guild.owner.user.tag : '') : '';
        formatted += guild.owner ? (!guild.owner.user ? 'Owner:' : '') + ' (' + chalk.blue(guild.owner.id) + ')' : '';
        formatted += guild.createdAt ? ' ' + chalk.bgGray(this.date(guild.createdAt)) : '';
        if (partial) return formatted;
        return `${chalk.cyan('GUILD')} ${formatted}`;
    }

     /**
     * Formats a single serialized emoji into a console ready string
     * @param emoji - Serialized emoji object
     * @param partial - Whether to return the formatted data or the whole output
     */
    static emoji (emoji: SerialEmoji, partial?: boolean): string {
        if (!emoji) return this.void();
        let formatted = '';
        formatted += ':' + emoji.name + ':';
        formatted += ' (' + chalk.bgYellowBright(emoji.id) + ')';
        if (partial) return formatted;
        return `${chalk.cyan('EMOJI')} ${formatted} ${emoji.createdAt ? 'Created: ' + this.date(emoji.createdAt) : ''}`;
    }

     /**
     * Formats a single serialized reaction into a console ready string
     * @param reaction - Serialized reaction object
     * @param partial - Whether to return the formatted data or the whole output
     */
    static reaction (reaction: SerialReaction, partial?: boolean): string {
        if (!reaction) return this.void();
        let formatted = '';
        formatted += this.emoji(reaction.emoji, true);
        formatted += ' x ' + (reaction.count || 1).toString();
        formatted += ' ' + this.message(reaction.message, true);
        if (partial) return formatted;
        return `${chalk.cyan('REACTION')} ${formatted}`;
    }

     /**
     * Formats a single serialized role into a console ready string
     * @param role - Serialized role object
     * @param partial - Whether to return the formatted data or the whole output
     */
    static role (role: SerialRole, partial?: boolean): string {
        if (!role) return this.void();
        let formatted = JSON.stringify(role);
        formatted = '';
        if (partial) return formatted;
        return formatted;
    }

     /**
     * Formats a single serialized presence into a console ready string
     * @param presence - Serialized presence object
     * @param partial - Whether to return the formatted data or the whole output
     */
    static presence (presence: SerialPresence, partial?: boolean): string {
        if (!presence) return this.void();
        let formatted = '';
        formatted += presence.member ? this.member(presence.member, true) : '';
        formatted += ' Status: ' + presence.status;
        formatted += ' ' + presence.activities.map(activity => `${activity.emoji ? ':' + activity.emoji + ': ' : ''}${activity.name} ${chalk.bgGray(this.date(activity.createdAt))}`).join(' ');
        if (partial) return formatted;
        return `${chalk.cyan('PRESENCE')} ${formatted}`;
    }
}

function showParserError (src: string, error: DiscordQueryParsingError) {
    const lines = src.split('\n');
    let currentIndex = 0;
    let currentLine = 0;

    for (let i = 0; i < src.length; i++) {
        if (i === error.index) {
            currentLine = src.substring(0, i).split('\n').length - 1;
            for (let j = 0; j < lines.length; j++) {
                if (j === currentLine) { break; }
                currentIndex += lines[j].length;
            }
            break;
        }
    }

    console.error(lines[currentLine]);
    const offset = ' '.repeat(error.index - currentIndex - (error.index > 0 ? 1 : 0));
    console.error(`${offset}^`, error.name + ':', chalk.red(error.message), chalk.yellow(`${currentLine}:${error.index - currentIndex}`), `(${error.index})`);
}

function showEngineError (error: DiscordQueryRuntimeError) {
    console.error(chalk.red(`Error running ${error.command} [${error.name}]: ${error.message}`));
    console.error(`
    ${chalk.yellow('[STATE]')}
    Client: ${error.clientConnected ? chalk.green('connected') : chalk.red('not connected')}
    Guild: ${error.guildSelected ? chalk.green('selected') : chalk.red('not selected')}
    Channel: ${error.channelSelected ? chalk.green('selected') : chalk.red('not selected')}
    `);
}

// Create discordQuery (language parser & runner)
const discordQuery = new DiscordQuery();

// Setup callback funtions

discordQuery.callback = (command: keyof EngineCommand, values: any) => {
    if (!discordQuery.raw) {
        let concatenated = Formatter.void();

        if (values) {
            switch (command) {
                case 'selectGuild': concatenated = Formatter.guild(values[0]); break;
                case 'selectChannel': concatenated = Formatter.channel(values[0]); break;
                case 'fetchGuild': concatenated = Formatter.guild(values[0]); break;
                case 'fetchChannel': concatenated = Formatter.channel(values[0]); break;
                case 'fetchUser':  concatenated = Formatter.user(values[0]); break;
                case 'fetchMember': concatenated = Formatter.member(values[0]); break;
                case 'showGuilds': concatenated = Formatter.guilds(values); break;
                case 'showChannels': concatenated = Formatter.channels(values); break;
                case 'showMembers':  concatenated = Formatter.members(values); break;
                case 'updatePrecense': concatenated = Formatter.void(); break;
                case 'sendMessage': concatenated = Formatter.message(values[0]); break;
                case 'editMessage': concatenated = Formatter.message(values[0]); break;
                case 'deleteMessage': concatenated = Formatter.message(values[0]); break;
                case 'deleteMessages': concatenated = Formatter.messages(values); break;
                case 'readChannel': concatenated = Formatter.messages(values); break;
                case 'listenClient': concatenated = Formatter.void(); break;
                case 'listenGuild': concatenated = Formatter.void(); break;
                case 'listenChannel': concatenated = Formatter.void(); break;
                default: concatenated = Formatter.void(); break;
            }
        }
        console.log(command, concatenated);
    } else if (values) {
        values.forEach((value: any) => console.log(JSON.stringify(value)));
    }
};

discordQuery.listener = (event: Event) => {
    let prefix = '';
    let formatted = '';

    if (event.ids.guildID) {
        prefix += chalk.bgBlueBright.white(event.ids.guildID) + ' ';
    }

    if (event.ids.channelID) {
        prefix += chalk.bgMagenta.white(event.ids.channelID) + ' ';
    }

    prefix += chalk.black.bgWhite(event.name);

    if (event.params) {
        switch (event.name) {
            case 'channelCreate': formatted = Formatter.channel(event.params[0]); break;
            case 'channelDelete': formatted = Formatter.channel(event.params[0]); break;
            case 'channelPinsUpdate': formatted = Formatter.channel(event.params[0]) + event.params[1]; break;
            case 'channelUpdate': formatted = Formatter.channel(event.params[0]) + '\n' + Formatter.channel(event.params[1] as any); break;
            case 'emojiCreate': formatted = Formatter.emoji(event.params[0]); break;
            case 'emojiDelete': formatted = Formatter.emoji(event.params[0]); break;
            case 'emojiUpdate': formatted = Formatter.emoji(event.params[0]) + '\n' + Formatter.emoji(event.params[1] as SerialEmoji); break;
            case 'guildBanAdd': formatted = Formatter.guild(event.params[0]) + '\n' + Formatter.user(event.params[1] as SerialUser); break;
            case 'guildBanRemove': formatted = Formatter.guild(event.params[0]) + '\n' + Formatter.user(event.params[1] as SerialUser); break;
            case 'guildCreate': formatted = Formatter.guild(event.params[0]); break;
            case 'guildDelete': formatted = Formatter.guild(event.params[0]); break;
            case 'guildMemberAdd': formatted = Formatter.member(event.params[0]); break;
            case 'guildMemberAvailable': formatted = Formatter.member(event.params[0]); break;
            case 'guildMemberRemove': formatted = Formatter.member(event.params[0]); break;
            case 'guildMembersChunk':  formatted = Formatter.members(event.params[0]) + '\n' + Formatter.guild(event.params[1] as SerialGuild); break;
            case 'guildMemberSpeaking': formatted = Formatter.member(event.params[0]) + '\n' + event.params[1];
            case 'guildMemberUpdate': formatted = Formatter.member(event.params[0]) + '\n' + Formatter.member(event.params[1] as SerialMember); break;
            case 'guildUnavailable': formatted = Formatter.guild(event.params[0]); break;
            case 'guildUpdate': formatted = Formatter.guild(event.params[0]) + '\n' + Formatter.guild(event.params[1] as SerialGuild); break;
            case 'message': formatted = Formatter.message(event.params[0]); break;
            case 'messageDelete': formatted = Formatter.message(event.params[0]); break;
            case 'messageDeleteBulk': formatted = Formatter.messages(event.params[0]); break;
            case 'messageUpdate': formatted = Formatter.message(event.params[0]) + '\n' + Formatter.message(event.params[1] as SerialMessage); break;
            case 'messageReactionAdd': formatted = Formatter.reaction(event.params[0]) + '\n' + Formatter.user(event.params[1] as SerialUser); break;
            case 'messageReactionRemove': formatted = Formatter.reaction(event.params[0]) + '\n' + Formatter.user(event.params[1] as SerialUser); break;
            case 'messageReactionRemoveAll': formatted = Formatter.message(event.params[0]); break;
            case 'roleCreate': formatted = Formatter.role(event.params[0]); break;
            case 'roleDelete': formatted = Formatter.role(event.params[0]); break;
            case 'roleUpdate': formatted = Formatter.role(event.params[0]) + '\n' + Formatter.role(event.params[1] as SerialRole); break;
            case 'presenceUpdate': formatted = Formatter.presence(event.params[0]) + '\n' + Formatter.presence(event.params[1] as SerialPresence); break;
            case 'typingStart': formatted = Formatter.channel(event.params[0]) + '\n' + Formatter.user(event.params[1] as SerialUser); break;
            case 'userUpdate': formatted = Formatter.user(event.params[0]) + '\n' + Formatter.user(event.params[1] as SerialUser); break;
            case 'voiceStateUpdate':  formatted = Formatter.member(event.params[0]) + '\n' + Formatter.member(event.params[1] as SerialMember); break;
            default: formatted = Formatter.void(); break;
        }
    }

    console.log(prefix + (formatted ? ': ' : ' ') + '\n' + formatted + '\n');
};

export function cli (args: Array<string>): void {
    /* Expecting argv[3] to be a filename, which then will become argv._[0]. If no filename is passed it'll default to interactive mode */
    const argv = yargs(args)
        .option('token', {
            description: '',
            alias: 't',
            required: false
        })
        .boolean('keep-alive')
        .boolean('raw')
        .alias('ka', 'keep-alive')
        .alias('r', 'raw')
        .argv;

    discordQuery.raw = argv.raw || false;

    if (argv._[0] && fs.existsSync(argv._[0])) {
    const src = fs.readFileSync(argv._[0]).toString();

    try {
        discordQuery.parse(src);
    } catch (error) {
        if (error instanceof DiscordQueryParsingError) {
            showParserError(src, error);
            process.exit(1);
        } else {
            throw error;
        }
    }

    discordQuery.execute(argv['keep-alive'] ? false : true, argv.token ? argv.token as string : undefined)
        .catch(error => {
            if (error instanceof DiscordQueryRuntimeError) {
                showEngineError(error);
                process.exit(1);
            } else {
                throw error;
            }
        })
        .finally(() => {
            if (!argv['keep-alive']) {
                process.exit(0);
            }
        });
    } else if (argv._[0]) {
        // File passed, but it could not be found
        console.error(chalk.redBright(`Couldn't open ${argv._[0]}: No such file or directory`));
    } else {
        function discordQueryEval (cmd: string, _context: any, _filename: string, callback: () => void): void {
            try {
                discordQuery.parse(cmd);
                discordQuery.execute(false, argv.token ? argv.token as string : undefined)
                .then(() => {
                    callback();
                })
                .catch(error => {
                    if (error instanceof DiscordQueryRuntimeError) {
                        showEngineError(error);
                        callback();
                    } else {
                        throw error;
                    }
                });
            } catch (error) {
                if (error instanceof DiscordQueryParsingError) {
                    showParserError(cmd, error);
                    callback();
                } else {
                    throw error;
                }
            }
        }

        const replServer = repl.start({ prompt:'> ', eval: discordQueryEval as any });

        // Reload bot on .clear
        replServer.on('reset', () => {
            console.clear();
            discordQuery.reload()
                .then((success: boolean) => {
                    // Reload was succesful
                    if (success) console.log('Reloaded bot');
                })
                .catch(error => {
                    if (error) return;
                });
        });

        replServer.on('exit', () => {
            process.exit(0);
        });
    }
}