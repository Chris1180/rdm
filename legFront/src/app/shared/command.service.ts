import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Command } from "../model/command";

@Injectable({
    providedIn: 'root'
  })

export class CommandService {
    private apiUrl = '';

    constructor (private http: HttpClient){
        // permet d'adapter l'adresse en fonction de l'environnement
        if (window.location.port == '4200'){
            this.apiUrl = `http://${window.location.hostname}:8080/`
        }
    }

    public getCommandsFromDB() : Observable<Command[]> {
        return this.http.get<Command[]>(this.apiUrl+'getAllCommands')
    }
    public modifyCommand(command: Command) : Observable<Command>{
        return this.http.post<Command>(this.apiUrl+'newCommand', command);
    }

    public deleteCommand(id: Number) : Observable<any>{
        return this.http.post(this.apiUrl+'deleteCommand/'+id, '');
    }

}