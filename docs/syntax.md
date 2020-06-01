# discord-cli query language + syntax -> lexing -> parsing flow

Recommended implementation of @discord-cli/engine as a query language. Inspired by SQL/FQL and Gremlin.
In this document syntax rules are outlined by a continues numeric list that follows through the document.

## Types/Annotations

Types are essential for the language to differenciate between different data types.
Some data types are implicit given a certain keyword but some keywords can take multiple data types so being able to specify that is key.

`1.` "Annotations" are used to determin what type of data is passed. `"000000000000"g`

- Annotations can be implicit.
- Annotations are to be appended at the end of a input.

These annotations includes but are not limited to:

| Char     |  Type       |  Expects               | Example                                                          |
|:--------:|:-----------:|:----------------------:|-----------------------------------------------------------------:|
| t        | token       | string                 | "MTg-this-IzNzU3OTA5NjA-is.not-DCeFB-a.real-r4DQlO-t0ken-qerT0"t |
| g        | guildID     | string{18}             | "364140226775784869"g                                            |
| c        | channelID   | string{18}             | "228666916018118541"c                                            |
| m        | messageID   | string{18}             | "343341358242773387"m                                            |
| u        | userID      | string{18}             | "382158480187811123"u                                            |
| A        | attachment  | [string, URI or data]  | ["filename.ext", "./path/to/file.jpg" or "filedata"]             |
| E        | embed       | Embed (JSON)           | {"title": "Hello World!", "url": "https://example.com"}E         |
| " " or M | text*       | string                 | "My text string" or "My explicist text string"M                  |

##### \* `text` is always implicict due to it's simple nature but for compatibility sake also be used explicitly.

## General Syntax

First we'll use `;` as a seperator. Virtually allowing for multiline queries, this might be useful considering readability. It might not come as a surprise that `U+00A0` also known as a whitespace or more commonly as `&nbsp;` by frontend devs is used as the seperator for basically everything.

Comments are made with `#` and account for the single line the comment was made on, until a newline breaks it.

`2.` `;` used as query seperator.

- In the case of comments `\n` acts as the EOL for said comment and effectivly ignores the rest of the line.

### Keyword syntax

`3.` Keywords can take multiple arguments.

- Terminated by EOL, another keyword or the seperator.

- Some keywords only takes one argument.

Allowing keywords to take multiple arguments until it's terminated by either a new keyword or the seperator allows less complicated queries to do more.

#### USE

Since @discord-cli/engine relies on a few instance objects, we'll need the language to ensure a few required bits of information is passed, such as the discord bot token.

Hence the keyword `USE` to enable us to select and use the 3 basic Engine variables, the bot instance or its token, the current guild and the current channel.

This keyword should be able to set all 3 things at once as so:

```py
USE "MTg-this-IzNzU3OTA5NjA-is.not-DCeFB-a.real-r4DQlO-t0ken-qerT0"t "364140226775784869"g "228666916018118541"c;
```

Or individually:

```py
USE "MTg-this-IzNzU3OTA5NjA-is.not-DCeFB-a.real-r4DQlO-t0ken-qerT0"t;
USE "364140226775784869"g;
USE "228666916018118541"c;
```

Or over multiple lines:

```py
USE
"MTg-this-IzNzU3OTA5NjA-is.not-DCeFB-a.real-r4DQlO-t0ken-qerT0"t
"364140226775784869"g
"228666916018118541"c;
```

#### LISTEN

One of the most important feature @discord-cli/engine supports is probably the client events handeling. Live feedback is an important part of discord, so being able to see exactly what's going on in a guild, a channel or just everything you bot sees and being able to choose what kinds of events you want to see is very helpful.

`4.` When keywords taken location specific information such as guilds and channels are left empty (no arguments provided) it will if it supports it default to the entire client.

For that we'll reserve the `LISTEN` keyword. We need to be able to specify where we'll listen (what scope we'll be wanting info from) so that will be the first argument provided to listen as so:

```py
LISTEN; # Listens too the entire client
LISTEN "364140226775784869"g; # Listens only too events from a guild
LISTEN "228666916018118541"c; # Focuses on a channel
```

What is more is that @discord-cli supports listening to only certain types of events which we can include in our syntax with the `EXCLUDE` and `INCLUDE` keywords.

```py
# Only listen too new messages, editted messages and deleted messages in a channel.
LISTEN "228666916018118541"c INCLUDE "message" "messageUpdate" "messageDelete";

# Exclude all guild events with a wildcard on a bot
LISTEN EXCLUDE "guild*";
```

The actually implementation will use some kind of approach to ensure the correct `includeEvents?: Array<keyof ClientEvents>` array is passed to the listener.

The listen keyword holds the process until it has been exited, making it run in the background is also an option for other implementations.

#### FETCH

One of the key components of this query langauge is the ability to use the discord api to garther data, for that purpose the keyword `FETCH` exists. This keyword needs to handle quite a bit of data so it supports multiple types.

First off you can use `FETCH` to fetch a Guild by it's id (data type) and a Channel (given `instance.currentGuild` is set) by its channelID.

```py
FETCH "364140226775784869"g;

FETCH "228666916018118541"c;
```

You can also use it to fetch a single message by its ID though it's hard to come across any scenarios where you have the ID before hand.

```py
FETCH "343341358242773387"m;
```

It can also be used to lookup a discord user by their ID, if the current guild is set and the user is to be found in that guild, it'll return a `GuildMember` object for that userID, but given that the user is not on the selected guild or no guild is selected a `User` object will return with publically available information.

```py
FETCH "382158480187811123"u;
```

#### READ

To expand on `FETCH` and specifically the `FETCH m` method of getting a message, @discord-cli/engine also has amazing multi message fetching support sitting under the keyword `READ`.

`READ` takes a single optional argument that being a channel type and if none is provided it will fall back on `instance.currentChannel` and in turn fail if none of those are provided.

To demonstrate a more conventional query format here is an example that will use all specificed api points to fetch the same single message.

```py
READ "228666916018118541"c LIMIT 1 BEFORE "343341358242773387"m AFTER "343341358242773387"m AROUND "343341358242773387"m;
```

These values can be included and excluded at will making the smallest possible `READ` query possible this one:

```py
READ;
```

Which will return a surprising 50 messages from `instance.currentChannel` should it be set.

#### DELETE

There are 2 options when it comes to deleting messages in discord, a normal single message delete, and bulkDelete a multimessage deleting endpoint.

The `DELETE` keyword has to input modes. First is using a normal single message deletion approach:

```py
# For the example sake i've repeated the same message 3 times but it's to demonstrate the ability to specify multiple messages.
DELETE "343341358242773387"m "343341358242773387"m "343341358242773387"m;
```

Then it supports a `READ` like approach.

```py
DELETE "228666916018118541"c LIMIT 1 BEFORE "343341358242773387"m AFTER "343341358242773387"m AROUND "343341358242773387"m;
```

Where again you can play around with the values until you can delete your satisifed amount of messages.

#### SEND

Being able to send messages over discord is quite important too, `SEND` aims to do just that. Using the capitilized data types combined with strings for the content we can mix togehter basically any discord message at will.

`SEND` supports embeds with the `E` data type which in reality is a JSON Embed object documented here at [discord.js.org](https://discord.js.org/#/docs/main/stable/class/MessageEmbed) and at [discord.com](https://discord.com/developers/docs/resources/channel#embed-object).

`SEND` also supports file attachemnts with the `A` data type which in turn can be provided with either a file path (relative to your current process) or the plain text data which will go into the file.

After which the target channel in your current guild can be specified. Again if this is not specified then it will simply fall back to `instance.currentChannel` or fail.

```py
SEND "My message which will end up in the content field" "newline!" "./image.jpg"A {"thumbnail":{ "url":"https://example.com/file.jpg" }}E IN "228666916018118541"c;
```

#### EDIT

Editting previous messages (only messages sent with the current bot) is a help feature to correct mistakes or change previous content. `EDIT`provides easy and extensible keyword to edit discord messages sent by a bot user.

Using the same message options building method as `SEND` just instead by specifing a single message in the `instance.currentChannel`.
`EDIT` overwrites so no further issues are created.

```py
EDIT "343341358242773387"m WITH "Next message text" {"title":"embed override"}E;
```

#### SHOW

The `SHOW` keyword is like a fancy `FETCH` in that it lists either all guilds the client is in or all channels* in a guild.

##### \* channels needs to be cached after the guild becomes active so it might not return a result instantly

```py
# Lists all guilds available for the client.
SHOW;

# Lists all channels in guild
SHOW "364140226775784869"g;
```

#### PRESENCE

Discord presence is a funny one so to simplify it the keyword `PRECENSE` takes a single [PresenceData](https://discord.js.org/#/docs/main/stable/typedef/PresenceData) object.

```py
PRESENCE {"status": "dnd"};
```

#### RAW

This simply keyword `RAW` toggles between the way you see data outputted. When `RAW` is off you'll see all the data and data types neatly outputted to fit your terminal or your custom output format but when it's toggled you'll see the raw object structure instead.

```py
# Toggles
RAW;
```

### Syntax Table

| Keyword  | Used with?    | Optional?  | Expects [type]           | Required? (Amount) |
|:---------|:-------------:|:----------:|:------------------------:|:------------------:|
| USE      |               |            | [t] / [g] / [c]          | YES (+)            |
| LISTEN   |               |            | [] / [g] / [c]           | NO (1)             |
| INCLUDE  | LISTEN        | YES        | string                   | YES (?*)           |
| EXCLUDE  | LISTEN        | YES        | string                   | YES (?*)           |
| FETCH    |               |            | [g] / [c] / [m] / [u]    | YES (1)            |
| READ     |               |            | [] / [c]                 | NO (1)             |
| LIMIT    | READ / DELETE | YES        | number                   | YES (1)            |
| BEFORE   | READ / DELETE | YES        | [m]                      | YES (1)            |
| AFTER    | READ / DELETE | YES        | [m]                      | YES (1)            |
| AROUND   | READ / DELETE | YES        | [m]                      | YES (1)            |
| DELETE   |               |            | [m] or [c]               | YES (+) or NO (1)  |
| SEND     |               |            | "" / [A] / [E]           | YES (+)            |
| IN       | SEND          | NO         | [c]                      | YES (1)            |
| EDIT     |               |            | [m]                      | YES (1)            |
| WITH     | EDIT          | NO         | "" / [A] / [E]           | YES (+)            |
| SHOW     |               |            | [] / [g]                 | YES (1)            |
| PRESENCE |               |            | object                   | YES (1)            |
| RAW      |               |            | []                       | NO (0)             |

## Lexing -> Parsing

Now we have the syntax out of the way we can begin working with token examples of the query langauge and explore it's behavior.
