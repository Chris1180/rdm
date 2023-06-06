import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Style } from "../model/style";

@Injectable({
    providedIn: 'root'
  })

export class StyleService {
    
    private apiUrl = '';

    constructor (private http: HttpClient){
        // permet d'adapter l'adresse en fonction de l'environnement
        if (window.location.port == '4200'){
            this.apiUrl = `http://${window.location.hostname}:8080/`
        }
    }

    public getStylesFromDB() : Observable<Style[]> {
        return this.http.get<Style[]>(this.apiUrl+'styles')
    }

}