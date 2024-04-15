import { RuleCondition } from "./rulecondition";
import { Style } from "./style";

export interface NewRule {
    id: number;
    order: string;
    part: string;
    label: string;
    comment: string;
    nestedCondition: boolean;
    ruleCondition: RuleCondition;
    finalCondition: string;
    outputValue : string;
    style?: Style
    expanded?: Boolean
}