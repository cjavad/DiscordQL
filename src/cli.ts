/** TODO: Document this file */
import * as fs from 'fs';
import chalk from 'chalk';
import yargs from 'yargs';
import repl from 'repl';
import { DiscordQuery } from './runtime';
import { DiscordQueryParsingError, DiscordQueryRuntimeError } from './runtime/errors';
import { EngineCommands } from './types/engine';
import { Event } from './types/listener';
import { ClientEvents } from 'discord.js';
import Formatter from './controllers/formatter';
import Serializer from './controllers/serializer';
import { Context } from 'vm';

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

discordQuery.callback = (command: keyof EngineCommands, value: any) => {
    const values = Serializer.normalizeQuery(command, value);
    if (!discordQuery.raw) {
        console.log(command, Formatter.formatQuery(command, values));
    } else {
        values.forEach(value => console.log(JSON.stringify(value)));
    }
};

discordQuery.listener = (event: Event<keyof ClientEvents>) => {
    let formatted = '';

    if (event.ids.guildID) {
        formatted += chalk.bgBlueBright.white(event.ids.guildID) + ' ';
    }

    if (event.ids.channelID) {
        formatted += ' ' + chalk.bgMagenta.white(event.ids.channelID);
    }

    formatted += ' ' + chalk.black.bgWhite(event.name) + ':';

    const values = Serializer.normalizeListener(event);
    Formatter.formatEvent(event.name, values).forEach(output => console.log(formatted, output));
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
        .alias('ka', 'keep-alive')
        .argv;

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
        function discordQueryEval (cmd: string, _context: Context, filename: string, callback: () => void): void {
            try {
                discordQuery.parse(cmd);
                discordQuery.execute(false, argv.token ? argv.token as string : undefined)
                .catch(error => {
                    if (error instanceof DiscordQueryRuntimeError) {
                        showEngineError(error);
                    } else {
                        throw error;
                    }
                })
                .finally(() => {
                    return callback();
                });
            } catch (error) {
                if (error instanceof DiscordQueryParsingError) {
                    showParserError(cmd, error);
                } else {
                    throw error;
                }
            } finally {
                return callback();
            }
        }

        const replServer = repl.start({ prompt:'> ', eval: discordQueryEval as any });

        replServer.on('SIGINT', () => {
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