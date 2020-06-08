import { DiscordQuery } from '../src/runtime';

import { expect } from 'chai';

describe('Engine command order', () => {
    it('USE ...;', () => {
        const dq = new DiscordQuery();
        const expectedOrder = ['login', 'selectGuild', 'selectChannel'];
        dq.parse('USE "MTgthisaIzNzUa3TA5NjAais.notaDC.eBaarealar4DQlOat0kenaqerT0"t "364140226775784869"g "228666916018118541"c;');
        for (let i = 0; i < dq.callstack.length; i++) {
            expect(dq.callstack[i].command).to.equal(expectedOrder[i]);
        }
    });

    it('USE ...; USE ...; USE ...;', () => {
        const dq = new DiscordQuery();
        const expectedOrder = ['login', 'selectGuild', 'selectChannel'];
        dq.parse('USE "MTgthisaIzNzUa3TA5NjAais.notaDC.eBaarealar4DQlOat0kenaqerT0"t; USE "364140226775784869"g; USE "228666916018118541"c;');
        for (let i = 0; i < dq.callstack.length; i++) {
            expect(dq.callstack[i].command).to.equal(expectedOrder[i]);
        }
    });

    it('LISTEN; LISTEN ... LISTEN ...;', () => {
        const dq = new DiscordQuery();
        const expectedOrder = ['listenClient', 'selectGuild', 'listenGuild', 'selectChannel', 'listenChannel'];
        dq.parse('LISTEN; LISTEN "364140226775784869"g; LISTEN "228666916018118541"c;');
        for (let i = 0; i < dq.callstack.length; i++) {
            expect(dq.callstack[i].command).to.equal(expectedOrder[i]);
        }
    });

    it('FETCH ...; FETCH ... FROM ...; FETCH ... FROM ...; FETCH ...; FETCH ...;', () => {
        const dq = new DiscordQuery();
        const expectedOrder = ['fetchGuild', 'selectGuild', 'fetchChannel', 'selectChannel', 'readChannel', 'selectGuild', 'fetchMember', 'fetchUser'];
        dq.parse('FETCH "364140226775784869"g; FETCH "228666916018118541"c FROM "364140226775784869"g; FETCH "343341358242773387"m FROM "228666916018118541"c; FETCH "382158480187811123"u FROM "228666916018118541"c FROM "364140226775784869"g; FETCH "382158480187811123"u;');
        for (let i = 0; i < dq.callstack.length; i++) {
            expect(dq.callstack[i].command).to.equal(expectedOrder[i]);
        }
    });

    it('DELETE ... IN ...;', () => {
        const dq = new DiscordQuery();
        const expectedOrder = ['selectChannel', 'deleteMessage', 'deleteMessage', 'deleteMessage'];
        dq.parse('DELETE "343341358242773387"m "343341358242773387"m "343341358242773387"m IN "228666916018118541"c;');
        for (let i = 0; i < dq.callstack.length; i++) {
            expect(dq.callstack[i].command).to.equal(expectedOrder[i]);
        }
    });

    it('DELETE LIMIT ... BEFORE ... AFTER ... AROUND ... IN ...;', () => {
        const dq = new DiscordQuery();
        const expectedOrder = ['selectChannel', 'deleteMessages'];
        dq.parse('DELETE LIMIT 1 BEFORE "343341358242773387"m AFTER "343341358242773387"m AROUND "343341358242773387"m IN "228666916018118541"c;');
        for (let i = 0; i < dq.callstack.length; i++) {
            expect(dq.callstack[i].command).to.equal(expectedOrder[i]);
        }
    });

    it('SEND ... IN ...;', () => {
        const dq = new DiscordQuery();
        const expectedOrder = ['selectChannel', 'sendMessage'];
        dq.parse('SEND "My message which will end up in the content field" "newline!" "./image.jpg"A {"thumbnail":{ "url":"https://example.com/file.jpg" }} IN "228666916018118541"c;');
        for (let i = 0; i < dq.callstack.length; i++) {
            expect(dq.callstack[i].command).to.equal(expectedOrder[i]);
        }
    });

    it('EDIT ... WITH ... IN ...;', () => {
        const dq = new DiscordQuery();
        const expectedOrder = ['selectChannel', 'editMessage'];
        dq.parse('EDIT "343341358242773387"m WITH "Next message text" {"title":"embed override"} IN "228666916018118541"c;');
        for (let i = 0; i < dq.callstack.length; i++) {
            expect(dq.callstack[i].command).to.equal(expectedOrder[i]);
        }
    });

    it('SHOW; SHOW ...;', () => {
        const dq = new DiscordQuery();
        const expectedOrder = ['showGuilds', 'selectGuild', 'showChannels', 'showMembers'];
        dq.parse('SHOW; SHOW "364140226775784869"g;');
        for (let i = 0; i < dq.callstack.length; i++) {
            expect(dq.callstack[i].command).to.equal(expectedOrder[i]);
        }
    });

    it('PRESENCE ...;', () => {
        const dq = new DiscordQuery();
        const expectedOrder = ['updatePrecense'];
        dq.parse('PRESENCE {"status": "dnd"};');
        for (let i = 0; i < dq.callstack.length; i++) {
            expect(dq.callstack[i].command).to.equal(expectedOrder[i]);
        }
    });

    it('RAW;', () => {
        const dq = new DiscordQuery();
        dq.parse('RAW;');
        expect(dq.callstack).length(0);
    });
});