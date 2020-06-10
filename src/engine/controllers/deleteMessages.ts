import { TextChannel, ChannelLogsQueryOptions, Collection, Snowflake, Message } from 'discord.js';
import { SerialMessage } from '../../types/serial';
import Serializer from './serializer';

/**
 * Delete multiple messsages from a channel with a ChannelLogsQueryOptions query.
 * @param channel - Discord channel to delete messages in
 * @param options - ChannelLogsQueryOptions query options
 */
export default async function deleteMessages (channel: TextChannel, options: ChannelLogsQueryOptions): Promise<Array<SerialMessage>> {
    const limit: number = options?.limit || 2;
    delete options?.limit;

    return new Promise((resolve, reject) => {
        let concatenated: Collection<Snowflake, Message>;

        channel.messages.fetch({ limit: limit < 100 ? limit : 100, ...options })
            .then(collection => {
                const nextBatch = (): void => {
                    const remaining = limit - collection.size;

                    if (remaining <= 0) {
                        channel.bulkDelete(collection, true)
                            .then(messages => {
                                resolve(Serializer.messages(messages.array()));
                            });
                        return;
                    }

                    delete options?.before;
                    channel.messages.fetch({ limit: remaining < 100 ? remaining : 100, before: collection.lastKey(), ...options })
                        .then(next => {
                            concatenated = collection.concat(next);

                            if (collection.size >= limit || collection.size === concatenated.size) {
                                channel.bulkDelete(concatenated, true)
                                    .then(messages => {
                                        resolve(Serializer.messages(messages.array()));
                                    });
                                return;
                            }

                            collection = concatenated;
                            nextBatch();
                        })
                        .catch(error => reject(error));
                };

                nextBatch();
            })
            .catch(error => reject(error));
    });
}