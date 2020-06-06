/** Token values for lexer */
export enum Token {
    NIL = 0,
    EOF,
    WHITESPACE,
    ERROR,
    NUMBER,
    STRING,
    OBJECT,
    COMMENT,
    NEWLINE,
    SEMICOLON,
    t,
    g,
    c,
    m,
    u,
    A,
    E,
    M,
    USE,
    LISTEN,
    INCLUDE,
    EXCLUDE,
    FETCH,
    FROM,
    READ,
    LIMIT,
    BEFORE,
    AFTER,
    AROUND,
    DELETE,
    SEND,
    IN,
    EDIT,
    WITH,
    SHOW,
    PRESENCE,
    RAW
}

/** Token context containing information about each token */
export interface TokenContext {
    token: Token,
    index: number,
    value?: string,
    keyword?: Token
}

/** Keywords for identifiers */
export interface Keywords {
    use: [string],
    listen: [string],
    include: [string],
    exclude: [string],
    fetch: [string],
    from: [string],
    read: [string],
    limit: [number],
    before: [string],
    after: [string],
    around: [string],
    delete: [string],
    send: [string],
    in: [string],
    edit: [string],
    with: [string],
    show: [string],
    presence: [string],
    raw: []
}