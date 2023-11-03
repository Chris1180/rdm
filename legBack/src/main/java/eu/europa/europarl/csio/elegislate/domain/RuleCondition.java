package eu.europa.europarl.csio.elegislate.domain;

import java.util.Set;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.OneToMany;
import javax.persistence.Table;

import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Entity @NoArgsConstructor @AllArgsConstructor 
@Table(name="RULE_CONDITION")
public class RuleCondition {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	Integer id;
	@Column (name="id_parent")
	Integer idParent;
	@Column (name="textcondition")
	String textCondition;
	
	@OneToMany (mappedBy="ruleCondition")
	private Set<Rules> rules;

	@OneToMany (mappedBy="ruleCondition")
	private Set<RuleCommand> ruleCommand;
	
	public Integer getId() {
		return id;
	}

	public void setId(Integer id) {
		this.id = id;
	}

	public Integer getIdParent() {
		return idParent;
	}

	public void setIdParent(Integer idParent) {
		this.idParent = idParent;
	}

	public String getTextCondition() {
		return textCondition;
	}

	public void setTextCondition(String textCondition) {
		this.textCondition = textCondition;
	}

	public Set<RuleCommand> getRuleCommand() {
		return ruleCommand;
	}

	public void setRuleCommand(Set<RuleCommand> ruleCommand) {
		this.ruleCommand = ruleCommand;
	}

	

	
	
	
}


