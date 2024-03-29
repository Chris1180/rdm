import { Style } from "./style";

export interface RuleToEvaluate {
    idRule: number;
    order: number;
    part: string;
    condition: string;
    conditionFormated: string;
    command: string;
    outputValue: string
    style: Style
    comment: string
}