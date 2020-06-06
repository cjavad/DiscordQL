import { Node } from '../parser';
import { AnnotatedValue } from '../../types/ast';
import { Token } from '../../types/tokens';

/**
* Find targeted item by keyword
* @param statement - Keyword node with entire statement tree
*/
export default function statementTarget (statement: Node, optionals: Array<Token>): AnnotatedValue | undefined {
    let target: AnnotatedValue = { index: 0, key: 0, value: '' };

    for (let i = 0; i < statement.children.length; i++) {
        const childNode = statement.children[i];
        if ([Token.FETCH, Token.SEND, Token.DELETE].indexOf(statement.token) > -1) {
            for (let j = 0; j < childNode.children.length; j++) {
                if (optionals.indexOf(childNode.token) > -1) {
                    target = {
                        index: childNode.children[j].index,
                        key: childNode.children[j].token,
                        value: childNode.children[j].value as string,
                        annotation: childNode.children[j].annotation
                    };
                }
            }
        } else if (!childNode.keyword && childNode.value && childNode.annotation) {
            target = {
                index: childNode.index,
                key: childNode.token,
                value: childNode.value,
                annotation: childNode.annotation
            };
        }
    }

    return target.value.length ? target : undefined;
}