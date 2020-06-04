import { Token } from './tokens';

/** Node instance for AST */
export interface ASTNode {
    token: Token,
    value?: string,
    keyword?: boolean
    annotation?: Token,
    children: Array<ASTNode>
}

/** Value with token identifiers */
export interface AnnotatedValue {
    key: Token,
    value: string,
    annotation?: Token
}

/** Contextual AST Entry */
export interface SemanticAST {
    command: Token,
    target?: AnnotatedValue,
    values: Array<AnnotatedValue>
}