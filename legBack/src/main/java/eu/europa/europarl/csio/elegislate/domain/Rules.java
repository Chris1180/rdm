package eu.europa.europarl.csio.elegislate.domain;

import java.util.Set;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@NoArgsConstructor @AllArgsConstructor @Data
public class Rules {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	Integer id;
	@Column (name="priority_order")
	Integer order;
	String part;
	String label;
	String comment;

	
	@ManyToOne
    @JoinColumn(name="id_condition", nullable=false)
    private RuleCondition ruleCondition;

	@ManyToOne
    @JoinColumn(name="id_style", nullable=false)
    private Style style;
}
