import { RuleCondition } from "./rulecondition";
import { Style } from "./style";

export interface NewRule {
    id: number;
    order: number;
    part: string;
    label: string;
    comment: string;
    nestedCondition: boolean;
    ruleCondition: RuleCondition;
    style?: Style
}