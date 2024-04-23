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
          // Classement par le label
          if (a.label < b.label) {
            return -1;
          } else if (a.label > b.label) {
            return 1;
          }
      
          const regex = /(\d+)([a-z]*)(\d+)([a-z]*)/;
          let matchA = a.order.match(regex);
          let matchB = b.order.match(regex);
      
          // Vérifie que les matchs ne sont pas null
          if (!matchA || !matchB) {
            // Gestion d'erreur ou comparaison alternative si match est null
            //console.error('Erreur de correspondance regex pour:', a.order, b.order);
            return 0;
          }
      
          // Comparaison du premier nombre
          if (parseInt(matchA[1], 10) !== parseInt(matchB[1], 10)) {
            return parseInt(matchA[1], 10) - parseInt(matchB[1], 10);
          }
      
          // Comparaison de la chaîne de caractères entre les nombres
          if (matchA[2] !== matchB[2]) {
            return matchA[2].localeCompare(matchB[2]);
          }
      
          // Comparaison du second nombre
          if (parseInt(matchA[3], 10) !== parseInt(matchB[3], 10)) {
            return parseInt(matchA[3], 10) - parseInt(matchB[3], 10);
          }
      
          // Comparaison des caractères optionnels finaux
          return matchA[4].localeCompare(matchB[4]);
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
