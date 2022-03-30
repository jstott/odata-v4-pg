import { Token } from "@jwstott/odata-v4-parser/lib/lexer";
import { Visitor } from "odata-v4-sql/lib/visitor";
import { SqlOptions } from "./index";
export declare class PGVisitor extends Visitor {
    parameters: any[];
    includes: PGVisitor[];
    constructor(options?: SqlOptions);
    /**
     * returns parameters as {0: 'abc', 1: '2019', ...}
     */
    parameterObject(): any[];
    from(table: string): string;
    protected VisitExpand(node: Token, context: any): void;
    protected toSnakeCase(str: string): string;
    protected VisitSelectItem(node: Token, context: any): void;
    protected VisitODataIdentifier(node: Token, context: any): void;
    protected VisitJsonPathExpression(node: Token, context: any): void;
    protected VisitEqualsExpression(node: Token, context: any): void;
    protected VisitNotEqualsExpression(node: Token, context: any): void;
    protected VisitLiteral(node: Token, context: any): void;
    protected VisitInExpression(node: Token, context: any): void;
    protected VisitArrayOrObject(node: Token, context: any): void;
    protected VisitMethodCallExpression(node: Token, context: any): void;
}
