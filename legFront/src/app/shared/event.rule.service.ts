import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { ActionEvent } from "./rules.state";

@Injectable({providedIn:"root"})
// tous les composants souscrivent à ce service pour être informé des changements liés à des actions
export class EventRuleService {
    sourceEventSubject: Subject<ActionEvent> = new Subject<ActionEvent>();
    sourceEventSubjectObservable = this.sourceEventSubject.asObservable();

    publishEvent(event: ActionEvent){
        this.sourceEventSubject.next(event);
    }
}