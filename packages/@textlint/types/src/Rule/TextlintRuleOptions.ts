/**
 * textlint rule option values is object or boolean.
 * if this option value is false, disable the rule.
 */

export type TextlintRuleOptions<T extends object = {}> = {
    [index: string]: any;
    severity?: string;
} & T;
