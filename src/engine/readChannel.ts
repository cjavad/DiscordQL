import { TextChannel, DMChannel, ChannelLogsQueryOptions, Collection, Snowflake, Message, SnowflakeUtil } from "discord.js";
import { rejects } from "assert";

export default async function readChannel ( channel: TextChannel | DMChannel, options?: ChannelLogsQueryOptions): Promise<Collection<Snowflake, Message>> {
    let limit: number;

    if (options) {
        limit = options.limit as number;
    } else {
        limit = 99;
    }

    return new Promise((resolve, reject) => {
        let concatenated: Collection<Snowflake, Message>;

        channel.messages.fetch({ limit: limit < 100 ? limit : 100 })
            .then(collection => {
                const nextBatch = (): void => {
                    var remaining = limit - collection.size;

                    if (remaining <= 0) return resolve(collection);

                    channel.messages.fetch({ limit: remaining < 100 ? remaining : 100, before: collection.lastKey() })
                        .then(next => {
                            concatenated = collection.concat(next);

                            if (collection.size >= limit || collection.size === concatenated.size) return resolve(concatenated);

                            collection = concatenated;
                            nextBatch();
                        })
                        .catch(error => reject(error));
                }

                nextBatch();
            })
            .catch(error => reject(error));
    });
};

