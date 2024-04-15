import { Injectable } from "@angular/core";
import { RuleToEvaluate } from "../model/ruleToEvaluate";
import { Input } from "../model/input";
import { NewRule } from "../model/newrule";

@Injectable({
    providedIn: 'root'
  })
export class OrderCustomSortService {
    customSort(data: RuleToEvaluate[]): RuleToEvaluate[] {
        return data.sort((a, b) => {
            const regex = /(\d+)(\D*)/; // Expression régulière pour extraire les parties numérique et alphabétique
            const matchA = a.order.match(regex);
            const matchB = b.order.match(regex);
    
            if (!matchA || !matchB) {
                return 0; // En cas d'erreur dans l'appariement, ne changez pas l'ordre
            }
    
            const numA = parseInt(matchA[1], 10); // Partie numérique de 'a'
            const numB = parseInt(matchB[1], 10); // Partie numérique de 'b'
    
            // Comparaison des parties numériques
            if (numA !== numB) {
                return numA - numB;
            }
    
            // Si numériques sont égales, comparaison des parties alphabétiques
            return matchA[2].localeCompare(matchB[2]);
        });
    }

    customSortInput(data: Input[]): Input[] {
        return data.sort((a, b) => {
            // classement du label
            if (a.label < b.label) {
                return -1;
              } else if (a.label > b.label) {
                return 1;
              }

            // classement par ordre
            const regex = /(\d+)(\D*)/; // Expression régulière pour extraire les parties numérique et alphabétique
            const matchA = a.order.match(regex);
            const matchB = b.order.match(regex);
    
            if (!matchA || !matchB) {
                return 0; // En cas d'erreur dans l'appariement, ne changez pas l'ordre
            }
    
            const numA = parseInt(matchA[1], 10); // Partie numérique de 'a'
            const numB = parseInt(matchB[1], 10); // Partie numérique de 'b'
    
            // Comparaison des parties numériques
            if (numA !== numB) {
                return numA - numB;
            }
    
            // Si numériques sont égales, comparaison des parties alphabétiques
            return matchA[2].localeCompare(matchB[2]);
        });
    }

    customSortRules(data: NewRule[]): NewRule[] {
        return data.sort((a, b) => {
            // classement par Part
            if (a.part < b.part) {
                return -1;
              } else if (a.part > b.part) {
                return 1;
              }

            // classement par ordre
            const regex = /(\d+)(\D*)/; // Expression régulière pour extraire les parties numérique et alphabétique
            const matchA = a.order.match(regex);
            const matchB = b.order.match(regex);
    
            if (!matchA || !matchB) {
                return 0; // En cas d'erreur dans l'appariement, ne changez pas l'ordre
            }
    
            const numA = parseInt(matchA[1], 10); // Partie numérique de 'a'
            const numB = parseInt(matchB[1], 10); // Partie numérique de 'b'
    
            // Comparaison des parties numériques
            if (numA !== numB) {
                return numA - numB;
            }
    
            // Si numériques sont égales, comparaison des parties alphabétiques
            return matchA[2].localeCompare(matchB[2]);
        });
    }
}
