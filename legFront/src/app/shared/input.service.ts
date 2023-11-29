import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Input } from "../model/input";

@Injectable({
    providedIn: 'root'
  })

export class InputService {
    private apiUrl = '';

    constructor (private http: HttpClient){
        // permet d'adapter l'adresse en fonction de l'environnement
        if (window.location.port == '4200'){
            this.apiUrl = `http://${window.location.hostname}:8080/`
        }
    }

    public getInputsFromDB() : Observable<Input[]> {
        return this.http.get<Input[]>(this.apiUrl+'getAllInputs')
    }
    public modifyInput(input: Input) : Observable<Input>{
        return this.http.post<Input>(this.apiUrl+'newInput', input);
    }

    public deleteInput(id: Number) : Observable<any>{
        return this.http.post(this.apiUrl+'deleteInput/'+id, '');
    }

}