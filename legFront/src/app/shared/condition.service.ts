import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Condition } from "../model/condition";

@Injectable({
    providedIn: 'root'
  })

export class ConditionService {
    private apiUrl = '';

    constructor (private http: HttpClient){
        // permet d'adapter l'adresse en fonction de l'environnement
        if (window.location.port == '4200'){
            this.apiUrl = `http://${window.location.hostname}:8080/`
        }
    }

    public getConditionsFromDB() : Observable<Condition[]> {
        return this.http.get<Condition[]>(this.apiUrl+'getAllConditions')
    }
    public modifyCondition(condition: Condition) : Observable<Condition>{
        return this.http.post<Condition>(this.apiUrl+'newCondition', condition);
    }

    public deleteCondition(id: Number) : Observable<any>{
        return this.http.post(this.apiUrl+'deleteCondition/'+id, '');
    }

}