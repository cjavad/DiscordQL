# Syntax and basic language design

So now we have the formalities out of the way, we need to actually design our programming language before we can begin implementing.

Since we're in principel creating a query type language i'll decide not to support multi line statements, in the sense we have a delimiter such as `;` and we execute the query line by line or on a per delimiter basis.

An example would be something like this

    COMMAND1 FROM 2; HELLO();

Would execute the same way as

    COMMAND1
    FROM
    2;
    HELLO();

Or

    COMMAND1 FROM 2
    HELLO()

For reference the order of execution will be synchronous and would look something like `1. COMMAND1 2. HELLO`

## Query schema and built-in functions

Before we can begin creating anything like a parser we need to agree on the basic format of the queries we'll be running. Also whether we should support any commands such as fx Embed() and Time().

Since we have to deal with a lot of types such as guilds, channels, messages and such using a keyword based query language like SQL would be more efficent.

I will also decide to make built-in functions for id'ing different Objects, such as channels fx. so

    TextChannel(identifier)

Where identifier could be the id or name of the channel, would return a channel object.

Since we're making a very interactive language, we won't be dealing with any real variables, and will instead only print data from queries with a keyword like `SHOW`

Some examples given our current syntax:

```s
SHOW 'id' FROM TextChannel("general")
```

Maybe something like this if there is multiple `general` channels:

```s
SHOW TextChannel("general");
```

So reading messages from a channel would be something like this

```s
READ TextChannel("general") LIMIT 10
```

And writing messages could be done like this:

```s
WRITE 'Hello People' IN TextChannel("general")
```

Sending multiline messages easily or sending embeds/attachments could be done like this.

```s
WRITE 'First Line\nSecond Line' 'Third Line' Embed('title', 'description', [('name', 'value')]) Attachment("Path to file") IN TextChannel("general")
```

Also delete and edit keywords for using those actions:

```s
DELETE Message(id)
```

```s
EDIT Message(id) SET 'HELLO WORLD'
```
