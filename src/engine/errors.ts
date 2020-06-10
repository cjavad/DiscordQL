import { EngineCommand } from '../types/engine';
import { Engine } from '.';

/** Engine error type used to throw errors when the engine fails */
export class EngineError extends Error {
    /** The engine command */
    command: keyof EngineCommand;
    /** Client state boolean */
    clientConnected: boolean;
    /** Instance.currentGuild boolean */
    guildSelected: boolean;
    /** Instance.currentChannel boolean */
    channelSelected: boolean;

    /**
     * Creates EngineError
     * @param command - The EngineCommands command the error occured in
     * @param engine - The Engine instance that failed
     * @param params - Error arguments passed to super()
     */
    constructor (command: keyof EngineCommand, engine: Engine,  ...params: any) {
        super(...params);
        Error.captureStackTrace(this, EngineError);
        this.name = 'EngineError';
        this.command = command;
        this.clientConnected = engine.client.token ? true : false;
        this.guildSelected = engine.instance.currentGuild ? true : false;
        this.channelSelected = engine.instance.currentChannel ? true : false;
    }
}