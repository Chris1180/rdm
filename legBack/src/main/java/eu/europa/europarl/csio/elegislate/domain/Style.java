package eu.europa.europarl.csio.elegislate.domain;

import java.util.Set;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.OneToMany;



import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Entity @NoArgsConstructor @AllArgsConstructor
public class Style {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	Integer id;
	String name;
	Integer margintop;
	Integer marginleft;
	Boolean relatif;
	String font;
	Integer size;
	Boolean bold;
	Boolean italic;
	
	@OneToMany (mappedBy="style")
	private Set<Rule> rules;

	public Integer getId() {
		return id;
	}

	public void setId(Integer id) {
		this.id = id;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public Integer getMargintop() {
		return margintop;
	}

	public void setMargintop(Integer margintop) {
		this.margintop = margintop;
	}

	public Integer getMarginleft() {
		return marginleft;
	}

	public void setMarginleft(Integer marginleft) {
		this.marginleft = marginleft;
	}

	public Boolean getRelatif() {
		return relatif;
	}

	public void setRelatif(Boolean relatif) {
		this.relatif = relatif;
	}

	public String getFont() {
		return font;
	}

	public void setFont(String font) {
		this.font = font;
	}

	public Integer getSize() {
		return size;
	}

	public void setSize(Integer size) {
		this.size = size;
	}

	public Boolean getBold() {
		return bold;
	}

	public void setBold(Boolean bold) {
		this.bold = bold;
	}

	public Boolean getItalic() {
		return italic;
	}

	public void setItalic(Boolean italic) {
		this.italic = italic;
	}
	
	
}
