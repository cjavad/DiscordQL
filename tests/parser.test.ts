import { Lexer } from '../src/runtime/lexer';
import { Parser } from '../src/runtime/parser';

import { expect } from 'chai';
import { Token } from '../src/types/tokens';

describe('Keyword targets', () => {
    it('FETCH ... FROM [target]', () => {
        const parser = new Parser(new Lexer('FETCH "user"u FROM "target"g'));
        expect(parser.semantic).length(1);
        expect(parser.semantic[0].target?.value).equals('target');
    });

    it('SEND ... IN [target]', () => {
        const parser = new Parser(new Lexer('SEND "message" IN "target"c'));
        expect(parser.semantic).length(1);
        expect(parser.semantic[0].target?.value).equals('target');
    });

    it('DELETE ... IN [target]', () => {
        const parser = new Parser(new Lexer('DELETE "message"m IN "target"c'));
        expect(parser.semantic).length(1);
        expect(parser.semantic[0].target?.value).equals('target');
    });

    it('READ [target] ...', () => {
        const parser = new Parser(new Lexer('READ "target"c'));
        expect(parser.semantic).length(1);
        expect(parser.semantic[0].target?.value).equals('target');
    });
});

describe('Keyword values', () => {
    it('USE "token"t "guild"g "channel"c;', () => {
        const parser = new Parser(new Lexer('USE "token"t "guild"g "channel"c;'));
        expect(parser.semantic).length(1);
        expect(parser.semantic[0].values).length(3);
        expect(parser.semantic[0].values[0].annotation).equals(Token.t);
        expect(parser.semantic[0].values[0].value).equals('token');
        expect(parser.semantic[0].values[1].annotation).equals(Token.g);
        expect(parser.semantic[0].values[1].value).equals('guild');
        expect(parser.semantic[0].values[2].annotation).equals(Token.c);
        expect(parser.semantic[0].values[2].value).equals('channel');
    });

    it('DELETE "channel"c LIMIT 100 AROUND "message"m BEFORE "message"m AFTER "message"m;', () => {
        const parser = new Parser(new Lexer('DELETE "channel"c LIMIT 100 AROUND "message"m BEFORE "message"m AFTER "message"m;'));
        expect(parser.semantic).length(1);
        expect(parser.semantic[0].values).length(5);
        expect(parser.semantic[0].values[1].key).equals(Token.LIMIT);
        expect(parser.semantic[0].values[1].value).equals('100');
        expect(parser.semantic[0].values[2].key).equals(Token.AROUND);
        expect(parser.semantic[0].values[2].annotation).equals(Token.m);
        expect(parser.semantic[0].values[2].value).equals('message');
        expect(parser.semantic[0].values[3].key).equals(Token.BEFORE);
        expect(parser.semantic[0].values[3].annotation).equals(Token.m);
        expect(parser.semantic[0].values[3].value).equals('message');
        expect(parser.semantic[0].values[4].key).equals(Token.AFTER);
        expect(parser.semantic[0].values[4].annotation).equals(Token.m);
        expect(parser.semantic[0].values[4].value).equals('message');
    });
});