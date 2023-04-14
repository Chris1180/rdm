package eu.europa.europarl.csio.elegislate.domain;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;



@Entity
@Data @NoArgsConstructor @AllArgsConstructor
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
}
