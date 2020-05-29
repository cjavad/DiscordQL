# Intro to making your own programming scripting. language

In this albeit short course, i'll show you some of the basics of creating a language that computers can understand, and parse.

To keep things simple you won't be doing any work on the language in itself, but rather you'll be solving small assignments similar to the task at hand and you'll see how to implement your solutions on a larger scale.

## Goal & Purpose

My original idea, which i the `client` came up with, is a discord script language and interactive terminal so i can interract with my discord bot using code.

So as an example something like `SAY 'hello' in CHANNEL1;` would do that.
And that would result in the bot typing 'hello' in CHANNEL1.

### WHYYYY!!!!

1. Why am I making an entirely new language?
2. What will make my language stand out?
3. What will my language offer that others don't?
4. What tools will I use?
5. What features does it have?
6. Is it an object-orientated language?
7. What level is it?
8. Who's my target audience?
9. Have I got the time and patience for such a project?
10. What's the structure going to look like?
11. Am I going to be a Billy on this project?

When talking about developing a new thing you need to clearify whether or not it's actually something you should do.

I like to look at this list (http://www.cplusplus.com/forum/general/46764/#msg254178) and going over them never hurts.

**1. Why am I making an entirely new language?**

This one is easy, the point of this project is to create something i can use, that nobody else has made.

**2. What will make my language stand out?**

Again the fact that it's unique, and usable espessialy for discord bot makers.

**3. What will my language offer that others don't?**

It will be an easy way to interract with a discord server as a bot user, without having to worry about bot logic and what not.

**4. What tools will I use?**

This one requires some general knowledge, since we'll mostly be working on the parser anything goes, but i'll write my implentation in node.js using a popular discord api library called discord.js to handle the api functions.

**5. What features does it have?**

A complete feature list will come later, but for now some of the basics is the following:

- Complete interface with the standard discord api.
  - reading message history
  - sending messages in channel
  - deleting messages
  - editting messages
  - uploading files
  - making embeds
  - mass deletion

- Interactive mode with ability to listen into a channel or guild

- Ability to extend it with your own commands? (optional, since it requires a full flegded programming language)

**6. Is it an object-orientated language?**

This question is less relevant to our scripting solution, but very relevant if you wanted to make a proper system language.

**7. What level is it?**

Here we're talking about at what level it operates on, you might have heard of the terms highlevel, lowlevel and such, but ours as a scripting language falls under the high level category as it in theory interacts with a third party api.

**8. Who's my target audience?**

This would be discord bot developers and users.

**9. Have I got the time and patience for such a project?**

It's always important to consider the scale of the project you're working on, in our case i'll be guiding you through it, but only because i decided that i have that kinda time :).

**10. What's the structure going to look like?**

This is also one of the things you don't have to worry about since i'll handle all of it. But for your information this will be a standard node.js project so it'll be like this:

    .
    ├── LICENSE
    ├── README.md
    ├── main.js
    ├── node_modules
    ├── package-lock.json
    └── package.json

**11. Am I going to be a Billy on this project?**

According to urban.com a Billy is "someone who thinks or acts like they are a badass" or "a bong" :p.

Don't be a billy. Be a Bob.

## End note

I might wanna add this is a super beginner friendly and all of this is just to give an idea of what we'll be working with, so no need to feel pressured by all of this info, but having a clear idea of where we wanna end up from the beginning helps us later on.

Next up is [Syntax.md](Syntax.md)
