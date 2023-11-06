import { RuleCommand } from "./rulecommand";

export interface RuleCondition {
    id: number;
    idSubCondition: number;
    textCondition: string;
    ruleCommand: Array<RuleCommand>;
}