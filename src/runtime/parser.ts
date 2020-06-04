import { Lexer, keywords } from './lexer';
import { Token, TokenContext, Keywords } from './types/tokens';
import { ASTNode } from './types/ast';

/** Class that creates an abstract syntax three node */
export class Node implements ASTNode {
    /**
     * @param token - token enum from lexer
     * @param value - value attached to the token
     * @param keyword - true if token is a keyword
     * @param annotation - annotation token attached to the value
     * @param children - Nested nodes with a relation
     */
    constructor (public token: Token, public value?: string, public keyword?: boolean, public annotation?: Token, public children: Array<ASTNode> = []) {

    }
}

/** Class that creates a context for a lexer token */
export class Context implements TokenContext {
    /**
     * @param token - token enum from lexer
     * @param index - index of the token and its value?
     * @param value - value attached to the token
     * @param keyword - keyword token attached to the value
     */
    constructor (public token: Token, public index: number, public value?: string, public keyword?: Token) {

    }
}

/** Error class for parser errors */
export class ParserError extends Error {
    /** Index in source where error occurred */
    index: number;

    /**
     * Creates error for parsing errors.
     * @param index - Index in source where error occurred
     * @param args - Additional error args.
     */
    constructor (index: number, ...args: Array<any>) {
        super(...args);
        this.index = index;
    }
}

/** Parser class that converts tokens into a abstract syntax three */
export class Parser {
    /** Private tokens array with token context */
    private _tokens: Array<Array<TokenContext>> = [];
    /** Private abstract syntax three */
    private _ast: Array<ASTNode> = [];

    /**
     * Convert a lexer and its tokenized output into an abstract syntax three
     * by sorting the tokens by semicolons known as statements into lists of
     * TokenContext's that are then sorted into an abstract syntax three.
     * @param lexer - Lexer providing a tokenized output
     */
    constructor (lexer: Lexer) {
        let next: Token = lexer.next();
        let i = 0;

        while (next !== Token.EOF) {
            if (next === Token.ERROR) {
                throw new ParserError(lexer.prev);
            }
            this._tokens[i] = [];
            while (next !== Token.SEMICOLON && next !== Token.EOF) {
                if (!([Token.NEWLINE, Token.NIL, Token.WHITESPACE].indexOf(next) > -1)) {
                    this._tokens[i].push(new Context(next, lexer.prev, lexer.value, lexer.keyword));
                }
                next = lexer.next();
            }
            i++;
            next = lexer.next();
        }

        this.generate();
    }

    /** Expose _ast */
    get ast (): Array<ASTNode> {
        return this._ast;
    }

    /** Expose _tokens */
    get tokens (): Array<Array<TokenContext>> {
        return this._tokens;
    }

    /** Convert _tokens into nodes and attach values */
    private generate (): void {
        this._tokens.forEach((statement: Array<TokenContext>) => {
            if (statement.length && this.isSeperate(statement[0].token)) {
                const node = new Node(statement[0].token);
                node.keyword = true;
                node.value = statement[0].value;

                for (let i = 1; i < statement.length; i++) {
                    if (this.hasValue(statement[i].token)) {
                        node.children.push(new Node(statement[i].token, statement[i].value, false));
                        if (statement[i + 1] && this.isAnnotation(statement[i + 1].token)) {
                            node.children[node.children.length - 1].annotation = statement[i + 1].token;
                            i = i + 1;
                        }
                    } else if (this.isKeyword(statement[i].token)) {
                        const [keywordNode, newIndex] = this.keywordValuesAnnotations(statement, i);
                        node.children.push(keywordNode);
                        i = newIndex;
                    }
                }
                this._ast.push(node);
            }
        });
    }

    /**
     * Function that takes a statement array and an index to start looking for tokens
     * with values and attach them with annotations if possible. Returns a node for
     * the new keyword + values with annotations and the index it finished on so the main
     * process can continue from there.
     * @param statement - Array of TokenContext that forms a statement
     * @param startIndex - Index to start looking for values + annotations
     */
    private keywordValuesAnnotations (statement: Array<TokenContext>, startIndex: number): [Node, number] {
        const node = new Node(statement[startIndex].token, statement[startIndex].value, true);
        let index = startIndex;

        for (; index < statement.length;) {
            if (statement[index + 1] && this.hasValue(statement[index + 1].token)) {
                node.children.push(new Node(statement[index + 1].token, statement[index + 1].value, false));
                if (statement[index + 2] && this.isAnnotation(statement[index + 2].token)) {
                    node.children[node.children.length - 1].annotation = statement[index + 2].token;
                    index = index + 1;
                }
                index = index + 1;
            } else {
                break;
            }
        }

        return [node, index];
    }

    /**
     * Check if a token is a keyword
     * @param token - Token enum
     */
    public isKeyword (token: Token): boolean {
        return keywords[Token[token].toLowerCase() as keyof Keywords] !== undefined;
    }

    /**
     * Check if a value is required by the token
     * @param token - Token enum
     */
    public hasValue (token: Token): boolean {
        return [Token.OBJECT, Token.STRING, Token.NUMBER].indexOf(token) > -1;
    }

    /**
     * Check if the token is actually an annotation
     * @param token - Token enum
     */
    public isAnnotation (token: Token): boolean {
        return [Token.t, Token.g, Token.c, Token.m, Token.u, Token.A, Token.E, Token.M].indexOf(token) > -1;
    }

    /**
     * Check if the token is a top level (seperate) one
     * @param token - Token enum
     */
    public isSeperate (token: Token): boolean {
        return [Token.USE, Token.LISTEN, Token.FETCH, Token.READ, Token.DELETE, Token.SEND, Token.EDIT, Token.SHOW, Token.PRESENCE, Token.RAW].indexOf(token) > -1;
    }
}