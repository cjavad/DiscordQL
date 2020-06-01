import { Client, User } from "discord.js";

export default async function fetchUser (client: Client, userID: string): Promise<User | undefined> {
    return (await client.users.fetch(userID)) as User | undefined;
}