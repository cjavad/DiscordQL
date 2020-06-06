import { Token, Keywords } from '../types/tokens';

/** Keywords to Token translation object */
export const keywords = {
    use: Token.USE,
    listen: Token.LISTEN,
    include: Token.INCLUDE,
    exclude: Token.EXCLUDE,
    fetch: Token.FETCH,
    from: Token.FROM,
    read: Token.READ,
    limit: Token.LIMIT,
    before: Token.BEFORE,
    after: Token.AFTER,
    around: Token.AROUND,
    delete: Token.DELETE,
    send: Token.SEND,
    in: Token.IN,
    edit: Token.EDIT,
    with: Token.WITH,
    show: Token.SHOW,
    presence: Token.PRESENCE,
    raw: Token.RAW
};

/** Lexer class */
export class Lexer {
    /** Source to tokenize */
    private src: string;
    /** Source index, or the current character index to lex */
    private si: number;
    /** Previous valid source index */
    private _prev: number;
    /** Entire value an index amounts to */
    private _value: string;
    /** Keyword index amounts to */
    private _keyword: Token;

    /**
     * Create a lexer
     * @param src - Source string to tokenize
     */
    constructor (src: string) {
        this.src = src;
        this.si = 0;
        this._prev = 0;
        this._value = '';
        this._keyword = Token.ERROR;
    }

    /** Expose Lexer#_prev */
    get prev (): number {
        return this._prev;
    }

    /** Expose Lexer#_value */
    get value (): string {
        return this._value;
    }

    /** Expose Lexer#_keyword */
    get keyword (): Token {
        return this._keyword;
    }

    /** Tokenize next (or first) character in Lexer#src */
    next (): Token {
        this._prev = this.si;
        if (this.si >= this.src.length) return Token.EOF;
        const char = this.src[this.si];
        if (this.isWhite(char)) return this.whitespace();
        this.si++;
        switch (char) {
            case '#': return this.lineComment();
            case ';': return Token.SEMICOLON;
            case '{': return this.jsonObject('{', '}');
            case '"': case '\'': return this.quotedString(char);
            case 't': if (this.annotation()) return Token.t;
            case 'g': if (this.annotation()) return Token.g;
            case 'c': if (this.annotation()) return Token.c;
            case 'm': if (this.annotation()) return Token.m;
            case 'u': if (this.annotation()) return Token.u;
            case 'A': if (this.annotation()) return Token.A;
            case 'E': if (this.annotation()) return Token.E;
            case 'M': if (this.annotation()) return Token.M;
            default: return this.isDigit(char) ? this.number() : this.isAlpha(char) ? this.identifier() : Token.ERROR;
        }
    }

    /** Checks if next index is blank or a newline / EOL */
    private annotation (): boolean {
        return this.src[this.si] ? this.isWhite(this.src[this.si]) || this.src[this.si] === ';' : true;
    }

    /** Check if index is a whitespace or a newline  */
    private whitespace (): Token {
        for (; this.isWhite(this.src[this.si]); ++this.si) {
            if (this.src[this.si] === '\n' || this.src[this.si] === '\r') { this.si++; return Token.NEWLINE; }
        }
        return Token.WHITESPACE;
    }

    /** Ignores entire line the comment exists on */
    private lineComment (): Token {
        this.matchWhile(char => char !== '\r' && char !== '\n');
        return Token.COMMENT;
    }

    /** Finds entire quoted string and places in values */
    private quotedString (quote: string): Token {
        this._value = '';
        while (this.si < this.src.length && this.src[this.si] !== quote) {
            this._value += this.escape();
        }
        this.matchChar(quote);
        return Token.STRING;
    }

    /** Finds entire json object and places in values */
    private jsonObject (startKey: string, endKey: string): Token {
        this._value = startKey;
        let depth = 0;

        while (this.si < this.src.length) {
            const char = this.escape();
            this._value += char;
            if (char === startKey) depth++;
            if (char === endKey && depth > 0) { depth = depth - 1; }
            if (char === endKey && depth <= 0) { this.si++; break; }
        }

        const countStartKey = this._value.split(startKey).length - 1;
        const countEndKey = this._value.split(endKey).length - 1;

        if (countStartKey > countEndKey) {
            this._value += endKey.repeat(countStartKey - countEndKey);
        }

        this.matchChar(startKey);
        this.si--;
        return Token.OBJECT;
    }

    /** Espaces current index character */
    private escape (): string {
        if (!this.matchChar('\\')) return this.src[this.si++];
        const save = this.si;
        let d1, d2, d3;
        if (this.matchChar('n')) return '\n';
        if (this.matchChar('r')) return '\r';
        if (this.matchChar('t')) return '\t';
        if (this.matchChar('\\')) return '\\';
        if (this.matchChar('\'')) return '\'';
        if (this.matchChar('\"')) return '\'';
        if (this.matchChar('x') && -1 !== (d1 = this.digit(16)) && -1 !== (d2 = this.digit(16))) return String.fromCharCode(16 * d1 + d2);
        if (-1 !== (d1 = this.digit(8)) && -1 !== (d2 = this.digit(8)) && -1 !== (d3 = this.digit(8))) return String.fromCharCode(64 * d1 + 8 * d2 + d3);
        this.si = save;
        return '\\';
    }

    /** Gets charcode of escaped character by it's base (radix) */
    private digit (radix: number): number {
        const char = this.src[this.si++];
        const dig = this.isDigit(char) ? char.charCodeAt(0) - 48 : this.isHexDigit(char) ? 10 + char.toLowerCase().charCodeAt(0) - 97 : 99;
        return (dig < radix) ? dig : -1;
    }

    /** Finds entire int or float value and sets in values */
    private number (): Token {
        --this.si;
        this.matchWhile(this.isDigit);
        if (this.matchChar('.')) this.matchWhile(this.isDigit);
        if (this.src[this.si - 1] === '.') --this.si;
        this.setValue();
        return Token.NUMBER;
    }

    /** Finds entire keyword and sets in keywords */
    private identifier (): Token {
        this.matchWhile(char => this.isAlphaNum(char) || char === '_');
        this.matchIf(char => char === '!' || char === '?');
        this.setValue();
        const keyword: Token = keywords[this._value.toLowerCase() as keyof Keywords];
        this._keyword = keyword ? keyword : Token.ERROR;
        return this._keyword;
    }

    /** Check if the character matches the source index */
    private matchChar (char: string): boolean {
        if (this.src[this.si] !== char) return false;
        ++this.si;
        return true;
    }

    /** Match on a condition */
    private matchIf (pred: (string: string) => boolean): boolean {
        if (this.si >= this.src.length || !pred(this.src[this.si])) return false;
        ++this.si;
        return true;
    }

    /** Match until a condition */
    private matchWhile (pred: (string: string) => boolean): boolean {
        const start = this.si;
        while (this.si < this.src.length && pred(this.src[this.si])) {
            ++this.si;
        }
        return this.si > start;
    }

    /** Set value to start index (previous) and current index */
    private setValue (): void {
        this._value = this.src.substring(this._prev, this.si);
    }

    /**
    * Returns true if the character is a whitespace
    * @param char - character to check
    */
    public isWhite (char: string): boolean {
        if (!char) return false;
        const a = char.charCodeAt(0);
        return a === 32 || (9 <= a && a <= 13);
    }

    /**
     * Checks if character is alpha
     * @param char - character to check
     */
    public isAlpha (char: string): boolean {
        if (!char) return false;
        const code = char.charCodeAt(0);
        return (code >= 65 && code <= 90) || (code >= 97 && code <= 122);
    }

    /**
     * Checks if the charcter is a digit
     * @param char - character to check
     */
    public isDigit (char: string): boolean {
        if (!char) return false;
        const code = char.charCodeAt(0);
        return code >= 48 && code <= 57;
    }

    /**
     * Checks if the charcter is a hexadeximal
     * @param char - character to check
     */
    public isHexDigit (char: string): boolean {
        if (!char) return false;
        const code = char.charCodeAt(0);
        return (code >= 48 && code <= 57) || (code >= 65 && code <= 70) || (code >= 97 && code <= 102);
    }

    /**
     * Checks if the charcter is alphanumerical
     * @param char - character to check
     */
    public isAlphaNum (char: string): boolean {
        if (!char) return false;
        return this.isAlpha(char) || this.isDigit(char);
    }
}