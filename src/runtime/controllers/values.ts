import { Node } from '../parser';
import { AnnotatedValue } from '../../types/ast';
import { Token } from '../../types/tokens';

/**
* Find additional values given to the keywords
* @param statement - Keyword node with entire statement tree
*/
export default function statementValues (statement: Node, optionals: Array<Token>): Array<AnnotatedValue> {
    const values: Array<AnnotatedValue> = [];

    for (let i = 0; i < statement.children.length; i++) {
        const childNode = statement.children[i];
        if ([Token.LISTEN, Token.READ, Token.DELETE].indexOf(statement.token) > -1) {
            if (childNode.keyword && optionals.indexOf(childNode.token) > -1) {
                for (let j = 0; j < childNode.children.length; j++) {
                    values.push({
                        index: childNode.index,
                        key: childNode.token,
                        value: childNode.children[j].value as string,
                        annotation: childNode.children[j].annotation
                    });
                }
            } else if (childNode.value && [Token.READ, Token.DELETE].indexOf(statement.token) > -1) {
                values.push({
                    index: childNode.index,
                    key: childNode.token,
                    value: childNode.value,
                    annotation: childNode.annotation
                });
            }
        } else if (childNode.keyword && optionals.indexOf(childNode.token) > -1 && [Token.SEND, Token.FETCH].indexOf(statement.token) < 0) {
            for (let j = 0; j < childNode.children.length; j++) {
                values.push({
                    index: childNode.index,
                    key: childNode.children[j].token,
                    value: childNode.children[j].value as string,
                    annotation: childNode.children[j].annotation
                });
            }
        } else if (childNode.value && (([Token.SEND, Token.FETCH].indexOf(statement.token) > -1) ? !childNode.keyword : true)) {
            values.push({
                index: childNode.index,
                key: childNode.token,
                value: childNode.value,
                annotation: childNode.annotation
            });
        }
    }

    return values;
}