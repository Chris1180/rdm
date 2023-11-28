package eu.europa.europarl.csio.elegislate.controller;


import java.util.List;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import eu.europa.europarl.csio.elegislate.DAO.CommandRepository;
import eu.europa.europarl.csio.elegislate.DAO.ConditionRepository;
import eu.europa.europarl.csio.elegislate.DAO.LanguageRepository;
import eu.europa.europarl.csio.elegislate.DAO.RuleCommandRepository;
import eu.europa.europarl.csio.elegislate.DAO.RuleConditionRepository;
import eu.europa.europarl.csio.elegislate.DAO.RuleRepository;
import eu.europa.europarl.csio.elegislate.DAO.RulesRepository;
import eu.europa.europarl.csio.elegislate.DAO.StyleRepository;
import eu.europa.europarl.csio.elegislate.domain.Command;
import eu.europa.europarl.csio.elegislate.domain.Condition;
import eu.europa.europarl.csio.elegislate.domain.Language;
import eu.europa.europarl.csio.elegislate.domain.Rule;
import eu.europa.europarl.csio.elegislate.domain.RuleCommand;
import eu.europa.europarl.csio.elegislate.domain.RuleCondition;
import eu.europa.europarl.csio.elegislate.domain.Rules;
import eu.europa.europarl.csio.elegislate.domain.Style;


@RestController
public class Controller {

	@Autowired
	private RuleRepository ruleRepository;
	@Autowired
	private LanguageRepository languageRepository;
	@Autowired
	private StyleRepository styleRepository;
	@Autowired
	private RulesRepository rulesRepository;
	@Autowired
	private ConditionRepository conditionRepository;
	@Autowired
	private CommandRepository commandRepository;
	@Autowired
	private RuleConditionRepository ruleConditionRepository;
	@Autowired
	private RuleCommandRepository ruleCommandRepository;
	
	// new controllers
	@GetMapping ("/getAllRules")
	public List<Rules> getAllRules() {
		return rulesRepository.findAllByOrderByOrderAsc();
	}
	
	@PostMapping ("/saveRule")
	public Rules saveRule (@RequestBody Rules rule ) {

		RuleCondition rcond = rule.getRuleCondition();
		Set<RuleCommand> rcs = rcond.getRuleCommand();
		
		if (rule.getId()==0) {
			// il s'agit d'une nouvelle règle il faut donc mettre les id de ruleCondition et ruleCommand à null puis récupérer les nouveaux Id
			rcond.setId(null);
			RuleCondition newrc =  ruleConditionRepository.save(rcond);
			rcond.setId(newrc.getId());
			for(RuleCommand rcom: rcs) {
				if (rcom.getCommand().length()!=0) {
					RuleCommand r = ruleCommandRepository.save(new RuleCommand(null, rcom.getLang(), rcom.getCommand(), newrc));
					rcom.setId(r.getId());
				}
			}
		}else {
			for(RuleCommand rc : rcs) {
				rc.setRuleCondition(rcond);
				if (rc.getId() == 0) {
					// new record
					RuleCommand r = ruleCommandRepository.save(rc);
					rc.setId(r.getId());
				}else {
					//pour supprimer une commande dans une langue il faut que le champ texte soit vide
					if (rc.getCommand().length()==0) {
						System.out.println("Le champ est vide pour la commande "+ rc.getId() + rc.getLang());
						//suppression de la commande
						ruleCommandRepository.deleteById(rc.getId());
					}else {
						ruleCommandRepository.save(rc);
					}
					
				}
			}
			rcs.removeIf(rc -> rc.getCommand().length() == 0);
			ruleConditionRepository.save(rcond);
		}
		
		//suppression des sous-conditions si besoin
		if (!rule.getNestedCondition()) {
			//on récupère toutes les sous-conditions
			List<RuleCondition> ruleConds = ruleConditionRepository.findByIdPreCondition(rule.getRuleCondition().getId());
			// si une ou plusieurs sous-condition(s) sont dispo alors il faut pour chacune d'entre elles effacer les ruleCommand
			if (ruleConds.size()!=0) {
				for (RuleCondition ruleCondition : ruleConds) {
					// on récupère toute les commandes
					ruleCommandRepository.deleteByIdCondition(ruleCondition.getId());
					ruleConditionRepository.deleteById(ruleCondition.getId());
				}
			}
		} 
		
		return rulesRepository.save(rule);
	}
	
	@PostMapping ("/deleteRule")
	public void deleteOneRule(@RequestBody Rules ruleToDelete) {	
		// suppression d'une règle dans le tables rules, rule_condition et rule_command
		rulesRepository.deleteById(ruleToDelete.getId());
		ruleConditionRepository.deleteById(ruleToDelete.getRuleCondition().getId());
		ruleCommandRepository.deleteByIdCondition(ruleToDelete.getRuleCondition().getId());
		// il faut vérifier si la règle possède des sous conditions pour les supprimer avec également les sous commandes
		if (ruleToDelete.getNestedCondition()) {
			List<RuleCondition> rcs = this.ruleConditionRepository.findByIdPreCondition(ruleToDelete.getRuleCondition().getId());
			for (RuleCondition rc : rcs) {
				ruleCommandRepository.deleteByIdCondition(rc.getId());
				ruleConditionRepository.deleteById(rc.getId());
			}
		}
				
	}
		
	
	@GetMapping ("/getAllConditions")
	public List<Condition> getAllConditions() {
		return conditionRepository.findAll();	
	}
	@PostMapping("/newCondition")
	public Condition addNewCondition(@RequestBody Condition condition) {
		if (condition.getId()==0) {
			condition.setId(null);
		}
		return conditionRepository.save(condition);
	}
	@PostMapping("/deleteCondition/{id}")
	public void deleteCondition(@PathVariable int id) {
		conditionRepository.deleteById(id);
		
	}
	
	@GetMapping ("/getAllOutputs")
	public List<Command> getAllCommands() {
		return commandRepository.findAll();	
	}
	@PostMapping("/newOutput")
	public Command addNewCommand(@RequestBody Command command) {
		if (command.getId()==0) {
			command.setId(null);
		}
		return commandRepository.save(command);
	}
	@PostMapping("/deleteOutput/{id}")
	public void deleteCommand(@PathVariable int id) {
		commandRepository.deleteById(id);
		
	}
	
	@GetMapping("/getSubConditions/{idRulePreCondition}")
	public List<RuleCondition> getSubConditions(@PathVariable Integer idRulePreCondition) {
		
		return ruleConditionRepository.findByIdPreConditionOrderByIdAsc(idRulePreCondition);
	}
	
	@PostMapping ("/saveSubConditionsinDB")
	public List<RuleCondition> saveSubConditionsinDB(@RequestBody List<RuleCondition> subConditions ){
		//Pour ne pas devoir vérifier les sous-conditions à supprimer on les supprime toutes
		//pour ce faire on récupère l'id de la condition principale avec la première entrée du tableau
		if (subConditions.size()>0) {
			Integer idPrecondition = subConditions.get(0).getIdPreCondition();
			// une fois que l'on connait l'id de la précondition on récupère toutes les sous conditions dans la BDD
			List<RuleCondition> rcs = ruleConditionRepository.findByIdPreCondition(idPrecondition);
			for (RuleCondition ruleCondition : rcs) {
				// pour chaque sous-condition on supprime les commandes
				ruleCommandRepository.deleteByIdCondition(ruleCondition.getId());
				// et la sous-condition
				ruleConditionRepository.deleteById(ruleCondition.getId());
			}
		}
		
		//this.ruleConditionRepository.deleteById(idPrecondition);
		
		for (RuleCondition ruleCondition : subConditions) {
			if(ruleCondition.getId()==0) ruleCondition.setId(null);
			
			RuleCondition rc = this.ruleConditionRepository.save(new RuleCondition(ruleCondition.getId(), ruleCondition.getIdPreCondition(), ruleCondition.getTextCondition(), null, null));
			ruleCondition.setId(rc.getId());
			
			System.out.println(ruleCondition);
			for (RuleCommand ruleCommand : ruleCondition.getRuleCommand()) {
				ruleCommand.setRuleCondition(ruleCondition);
				// il faut vérifier si la commande est un champ texte vide ou non
				// parce que s'il est vide on ne sauvegarde pas en BDD et il est inutile de le supprimer puisque déjà supprimé au début
				if(ruleCommand.getCommand().length()>0) {
					if(ruleCommand.getId()==0) ruleCommand.setId(null);
					this.ruleCommandRepository.save(ruleCommand);
				}
				//System.out.println(ruleCommand.getId());
				
			}
		}
		return subConditions;
	}
	// end new controllers
	
	@GetMapping ("/rules")
	public List<Rule> getRules() {
		return ruleRepository.findAllByOrderByOrderAsc();
		
	}
	
	@GetMapping ("/language")
	public List<Language> getLang() {
		return languageRepository.findAll();
		
	}
	
	@PostMapping ("/update")
	public Rule updateRule(@RequestBody Rule rule ) {
		
		Set<Language> languages = rule.getLanguages();
		
		// sauvegarde de la règle
		if (rule.getId()==0) {
			//System.out.println("ajout");
			// ajout d'une nouvelle règle 
			rule = ruleRepository.save(new Rule(null, rule.getOrder(), rule.getPart(), rule.getLabel(), rule.getCondition(), rule.getCommand(), rule.getMandatory(), 
					rule.getInitialValue(), rule.getExample(), rule.getPosition(), rule.getFormat(), rule.getComment(), rule.getApplication(), null, rule.getStyle()));
		}else { 
			//System.out.println("modif de la règle");
			// modif d'une règle existante
			ruleRepository.save(new Rule(rule.getId(), rule.getOrder(), rule.getPart(), rule.getLabel(), rule.getCondition(), rule.getCommand(), rule.getMandatory(), 
					rule.getInitialValue(), rule.getExample(), rule.getPosition(), rule.getFormat(), rule.getComment(), rule.getApplication(), null, rule.getStyle()));
			}
		
		//System.out.println(rule);
		//System.out.println(languages);
		// sauvegarde des versions linguistiques contenues dans le tableau languages
		for (Language lang: languages) {
			lang.setRule(rule);
			if(lang.getId() == 0) {
				// nouvelle version linguistique
				// vérification que la valeur n'est pas un champ texte blanc
				if (lang.getValue() != null || !"".equals(lang.getValue()))  //(!lang.getValue().isBlank())
					languageRepository.save(new Language(null, lang.getLang(), lang.getValue(), lang.getRule()));
			}else {
				
				// Si la valeur du champ value est pas vide on supprime l'entrée dans la BDD 
				if(lang.getValue() == null || "".equals(lang.getValue())) {
					languageRepository.delete(lang);
				}else {
					languageRepository.save(lang);
				}
				
			}
			
		}
		
		return rule;
	}
	
	
	@PostMapping ("/delete")
	public void deleteRule(@RequestBody Integer idRule) {
		//System.out.println(idRule);
		if (idRule!=0) {
			// suppression d'une règle
			ruleRepository.deleteById(idRule);
			
		}
		
	}
	@GetMapping ("/styles")
	public List<Style> getStyles() {
		return styleRepository.findAllByOrderByNameAsc(); 
	// styleRepository.findAll();
		
	}
	
	@PostMapping("/newstyle")
	public Style addNewStyle(@RequestBody Style style) {
		if (style.getId()==0) {
			style.setId(null);
		}
		return styleRepository.save(style);
	}
	
	@PostMapping("/deletestyle/{id}")
	public void delete(@PathVariable int id) {
		styleRepository.deleteById(id);
		
	}
}
