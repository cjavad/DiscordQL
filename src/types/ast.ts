import { Token } from './tokens';

/** Node instance for AST */
export interface ASTNode {
    index: number,
    token: Token,
    value?: string,
    keyword?: boolean
    annotation?: Token,
    children: Array<ASTNode>
}

/** Value with token identifiers */
export interface AnnotatedValue {
    index: number,
    key: Token,
    value: string,
    annotation?: Token
}

/** Contextual AST Entry */
export interface SemanticAST {
    command: AnnotatedValue,
    target?: AnnotatedValue,
    values: Array<AnnotatedValue>
}