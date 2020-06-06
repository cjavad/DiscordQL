import { Lexer } from '../src/runtime/lexer';
import { Token } from '../src/types/tokens';

import { expect } from 'chai';

describe('Lexing tokens', () => {
    it('EOF', () => {
        expect(new Lexer('').next()).to.equal(Token.EOF);
    });

    it('Whitespace', () => {
        expect(new Lexer(' ').next()).to.equal(Token.WHITESPACE);
    });

    it('Number', () => {
        expect(new Lexer('5').next()).to.equal(Token.NUMBER);
    });

    it('Float', () => {
        expect(new Lexer('5.5').next()).to.equal(Token.NUMBER);
    });

    it('String', () => {
        expect(new Lexer('"string"').next()).to.equal(Token.STRING);
    });

    it('Object', () => {
        expect(new Lexer('{"key":"value"}').next()).to.equal(Token.OBJECT);
    });

    it('Comment', () => {
        expect(new Lexer('# A comment').next()).to.equal(Token.COMMENT);
    });

    it('Newline', () => {
        expect(new Lexer('\n').next()).to.equal(Token.NEWLINE);
    });

    it('Semicolon', () => {
        expect(new Lexer(';').next()).to.equal(Token.SEMICOLON);
    });

    it('Type t', () => {
        expect(new Lexer('t').next()).to.equal(Token.t);
    });

    it('Type g', () => {
        expect(new Lexer('g').next()).to.equal(Token.g);
    });

    it('Type c', () => {
        expect(new Lexer('c').next()).to.equal(Token.c);
    });

    it('Type m', () => {
        expect(new Lexer('m').next()).to.equal(Token.m);
    });

    it('Type u', () => {
        expect(new Lexer('u').next()).to.equal(Token.u);
    });

    it('Type A', () => {
        expect(new Lexer('A').next()).to.equal(Token.A);
    });

    it('Type E', () => {
        expect(new Lexer('E').next()).to.equal(Token.E);
    });

    it('Type M', () => {
        expect(new Lexer('M').next()).to.equal(Token.M);
    });

    it('USE', () => {
        expect(new Lexer('USE').next()).to.equal(Token.USE);
    });

    it('LISTEN', () => {
        expect(new Lexer('LISTEN').next()).to.equal(Token.LISTEN);
    });

    it('INCLUDE', () => {
        expect(new Lexer('INCLUDE').next()).to.equal(Token.INCLUDE);
    });

    it('EXCLUDE', () => {
        expect(new Lexer('EXCLUDE').next()).to.equal(Token.EXCLUDE);
    });

    it('FETCH', () => {
        expect(new Lexer('FETCH').next()).to.equal(Token.FETCH);
    });

    it('FROM', () => {
        expect(new Lexer('FROM').next()).to.equal(Token.FROM);
    });

    it('READ', () => {
        expect(new Lexer('READ').next()).to.equal(Token.READ);
    });

    it('LIMIT', () => {
        expect(new Lexer('LIMIT').next()).to.equal(Token.LIMIT);
    });

    it('BEFORE', () => {
        expect(new Lexer('BEFORE').next()).to.equal(Token.BEFORE);
    });

    it('AFTER', () => {
        expect(new Lexer('AFTER').next()).to.equal(Token.AFTER);
    });

    it('AROUND', () => {
        expect(new Lexer('AROUND').next()).to.equal(Token.AROUND);
    });

    it('DELETE', () => {
        expect(new Lexer('DELETE').next()).to.equal(Token.DELETE);
    });

    it('SEND', () => {
        expect(new Lexer('SEND').next()).to.equal(Token.SEND);
    });

    it('IN', () => {
        expect(new Lexer('IN').next()).to.equal(Token.IN);
    });

    it('EDIT', () => {
        expect(new Lexer('EDIT').next()).to.equal(Token.EDIT);
    });

    it('WITH', () => {
        expect(new Lexer('WITH').next()).to.equal(Token.WITH);
    });

    it('SHOW', () => {
        expect(new Lexer('SHOW').next()).to.equal(Token.SHOW);
    });

    it('PRESENCE', () => {
        expect(new Lexer('PRESENCE').next()).to.equal(Token.PRESENCE);
    });

    it('RAW', () => {
        expect(new Lexer('RAW').next()).to.equal(Token.RAW);
    });
});

describe('Lexing sequences', () => {
    it('USE "token"t;', () => {
        const sequence = [Token.USE, Token.WHITESPACE, Token.STRING, Token.t, Token.SEMICOLON];
    const lexer = new Lexer('USE "token"t;');
    let next = lexer.next();

        while (next !== Token.EOF) {
            expect(next).to.equal(sequence.shift());
            next = lexer.next();
        }
    });
});