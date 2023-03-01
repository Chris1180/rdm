export interface Rule {
    id : number;
    part : string;
    label : string;
    condition : string;
    command : string;
    mandatory : boolean;
    initialValue : string;
    example : string;
    position : string;
    format : string;
    comment : string;
    application : string;
}

export interface PageRule{
    rules : Rule[];
    page : number;
    size : number;
    totalPages : number;
    totalResults : number;
}