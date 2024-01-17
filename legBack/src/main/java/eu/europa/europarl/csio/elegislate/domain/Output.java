package eu.europa.europarl.csio.elegislate.domain;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name="OUTPUTS")
@NoArgsConstructor @AllArgsConstructor @Data
public class Output {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	Integer id;
	String name;
	String description;
	String question;
	//Boolean mandatory;
	@Column (name="initvalue")
	String initValue;
	String application;
	String example;
}
