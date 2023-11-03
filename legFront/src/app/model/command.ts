export interface Command{
    id : number;
    name : string;
    description : string;
    mandatory : boolean;
    initValue : string;
    application : string; 
    example : string;
}