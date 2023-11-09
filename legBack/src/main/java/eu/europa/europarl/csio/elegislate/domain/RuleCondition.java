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
import lombok.ToString;

@Entity @NoArgsConstructor @AllArgsConstructor  @ToString
@Table(name="RULE_CONDITION")
public class RuleCondition {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	Integer id;
	@Column (name="id_precondition")
	Integer idPreCondition;
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

	public Integer getIdPreCondition() {
		return idPreCondition;
	}

	public void setIdPreCondition(Integer idPreCondition) {
		this.idPreCondition = idPreCondition;
	}

	
}


