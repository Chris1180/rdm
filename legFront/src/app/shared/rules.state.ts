export enum RuleActionTypes{
    GET_ALL_RULES= "[Rule] Get All Rules",
    SEARCH_RULES= "[Rule] Search Rules",
    EDIT_RULE = "[Rule] Edit Rule",
    RULE_EDITION_SUCCESS = "[Rule] Edit Rule successfully done in BackEnd",
    RULE_EDITION_FAILURE = "[Rule] Edit Rule failed in BackEnd",
    RULE_EDITION_ONGOING = "[Rule] Edition on-going in backEnd"
}

export interface AppDataState<T> {
    dataState:RuleStateEnum,
    data?:T,
    errorMessage?:string
  }

export interface ActionEvent {
    type: RuleActionTypes,
    payload?: any,
    error?: any  //? Non obligatoire
}

export enum RuleStateEnum {
    LOADING,
    LOADED,
    ERROR
}

