import { RuleCommand } from "./rulecommand";

export interface RuleCondition {
    id: number;
    idPreCondition: number;
    textCondition: string;
    ruleCommand: Array<RuleCommand>;
}