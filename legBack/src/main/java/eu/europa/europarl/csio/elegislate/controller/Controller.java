package eu.europa.europarl.csio.elegislate.controller;

import java.util.Iterator;
import java.util.List;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import eu.europa.europarl.csio.elegislate.DAO.LanguageRepository;
import eu.europa.europarl.csio.elegislate.DAO.RuleRepository;
import eu.europa.europarl.csio.elegislate.DAO.StyleRepository;
import eu.europa.europarl.csio.elegislate.domain.Language;
import eu.europa.europarl.csio.elegislate.domain.Rule;
import eu.europa.europarl.csio.elegislate.domain.Style;


@RestController
public class Controller {

	@Autowired
	private RuleRepository ruleRepository;
	@Autowired
	private LanguageRepository languageRepository;
	@Autowired
	private StyleRepository styleRepository;
	
	
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
					rule.getInitialValue(), rule.getExample(), rule.getPosition(), rule.getFormat(), rule.getComment(), rule.getApplication(), null));
		}else { 
			//System.out.println("modif de la règle");
			// modif d'une règle existante
			ruleRepository.save(new Rule(rule.getId(), rule.getOrder(), rule.getPart(), rule.getLabel(), rule.getCondition(), rule.getCommand(), rule.getMandatory(), 
					rule.getInitialValue(), rule.getExample(), rule.getPosition(), rule.getFormat(), rule.getComment(), rule.getApplication(), null));
			}
		
		//System.out.println(rule);
		//System.out.println(languages);
		// sauvegarde des version linguistique
		for (Language lang: languages) {
			lang.setRule(rule);
			if(lang.getId() == 0) {
				// nouvelle version linguistique
				// vérification que la valeur n'est pas un champ texte blanc
				if (!lang.getValue().isBlank())
					languageRepository.save(new Language(null, lang.getLang(), lang.getValue(), lang.getRule()));
			}else {
				
				// Si la valeur du champ value est pas vide on supprime l'entrée dans la BDD 
				if(lang.getValue().isBlank()) {
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
		return styleRepository.findAll();
		
	}
	
	@PostMapping("/newstyle")
	public Style addNewStyle(@RequestBody Style style) {
		return styleRepository.save(style);
	}
}
