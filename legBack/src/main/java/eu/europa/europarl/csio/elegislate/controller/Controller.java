package eu.europa.europarl.csio.elegislate.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import eu.europa.europarl.csio.elegislate.DAO.RuleRepository;
import eu.europa.europarl.csio.elegislate.domain.Rule;


@RestController
public class Controller {

	@Autowired
	private RuleRepository ruleRepository;
	
	@GetMapping ("/hello")
	public String hello() {
		return "Bonjour";
	}
	
	@GetMapping ("/rules")
	public List<Rule> getRules() {
		return ruleRepository.findAll();
		
	}
	
	@PostMapping ("/update")
	public Rule updateRule(@RequestBody Rule rule ) {
		System.out.println(rule);
		if (rule.getId()==0) {
			// ajout d'une nouvelle règle
			rule = ruleRepository.save(new Rule(null, rule.getPart(), rule.getLabel(), rule.getCondition(), rule.getCommand(), rule.getMandatory(), 
					rule.getInitialValue(), rule.getExample(), rule.getPosition(), rule.getFormat(), rule.getComment(), rule.getApplication()));
			//System.out.println(rule);
		}else { // modif d'une règle existante
			ruleRepository.save(rule);
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
}
