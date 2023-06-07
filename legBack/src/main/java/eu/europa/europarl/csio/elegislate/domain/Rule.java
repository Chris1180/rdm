package eu.europa.europarl.csio.elegislate.domain;

import java.util.Set;

import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.OneToMany;

import com.fasterxml.jackson.annotation.JsonIgnore;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;



@Entity
@NoArgsConstructor @AllArgsConstructor @Data
public class Rule {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	Integer id;
	@Column (name="priority_order")
	Integer order;
	String part;
	String label;
	@Column (name="conditionrule")
	String condition;
	String command;
	Boolean mandatory;
	@Column (name="initialvalue")
	String initialValue;
	String example;
	String position;
	String format;
	String comment;
	String application;
	
	
	@OneToMany (mappedBy="rule")
	//@JoinColumn(name = "id_rule", referencedColumnName = "id") 
	private Set<Language> languages;

	@ManyToOne
    @JoinColumn(name="id_style", nullable=false)
    private Style style;
	
	
	
}


