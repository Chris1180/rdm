package eu.europa.europarl.csio.elegislate.domain;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Entity
@NoArgsConstructor @AllArgsConstructor
@Table(name="RULE_COMMAND")
public class RuleCommand {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	Integer id;
	String lang;
	String command;
	@ManyToOne
    @JoinColumn(name="id_condition")
    private RuleCondition ruleCondition;
	
	
	public Integer getId() {
		return id;
	}
	public void setId(Integer id) {
		this.id = id;
	}
	public String getLang() {
		return lang;
	}
	public void setLang(String lang) {
		this.lang = lang;
	}
	public String getCommand() {
		return command;
	}
	public void setCommand(String command) {
		this.command = command;
	}
	
	public void setRuleCondition(RuleCondition ruleCondition) {
		this.ruleCondition = ruleCondition;
	}
	
	
}
