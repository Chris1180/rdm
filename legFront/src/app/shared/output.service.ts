import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Output } from "../model/output";

@Injectable({
    providedIn: 'root'
  })

export class OutputService {
    private apiUrl = '';

    constructor (private http: HttpClient){
        // permet d'adapter l'adresse en fonction de l'environnement
        if (window.location.port == '4200'){
            this.apiUrl = `http://${window.location.hostname}:8080/`
        }
    }

    public getOutputsFromDB() : Observable<Output[]> {
        return this.http.get<Output[]>(this.apiUrl+'getAllOutputs')
    }
    public modifyOutput(output: Output) : Observable<Output>{
        return this.http.post<Output>(this.apiUrl+'newOutput', output);
    }

    public deleteOutput(id: Number) : Observable<any>{
        return this.http.post(this.apiUrl+'deleteOutput/'+id, '');
    }

}