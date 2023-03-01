package eu.europa.europarl.csio.elegislate.security.domain;


import javax.persistence.Column;
import javax.persistence.Entity;

import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Entity
@Data @NoArgsConstructor @AllArgsConstructor  @ToString
public class Service {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	@Column(name="Id_parent")
	private Long idParent;
	@Column(name="Id_type")
	private String idType;
	@Column(name="Name_short")
	private String nameShort;
	@Column(name="Name")
	private String name;
	
}
