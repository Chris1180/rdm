import { Lang } from "./lang";

export interface Rule {
    id : number;
    order : number;
    part : string;
    label : string;
    condition : string;
    command : string;
    mandatory : boolean;
    initialValue : string;
    outputValue : string;
    example : string;
    position : string;
    format : string;
    comment : string;
    application : string;
    languages : Lang[];
    finalCondition : string
}

export interface PageRule{
    rules : Rule[];
    page : number;
    size : number;
    totalPages : number;
    totalResults : number;
}