import { NewRule } from "./newrule";

export interface PageRules{
    rules : NewRule[];
    page : number;
    size : number;
    totalPages : number;
    totalResults : number;
}