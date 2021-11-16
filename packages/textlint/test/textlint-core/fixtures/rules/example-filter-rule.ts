import { TextlintFilterRuleContext, TextlintFilterRuleReportHandler } from "@textlint/types";

export default function (context: TextlintFilterRuleContext): TextlintFilterRuleReportHandler {
    return {
        [context.Syntax.Str](node) {
            context.shouldIgnore(node.range, {});
        }
    };
}
