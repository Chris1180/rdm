package eu.europa.europarl.csio.elegislate.security.domain;

import java.io.Serializable;
import java.util.Objects;

import javax.persistence.Inheritance;
import javax.persistence.InheritanceType;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.MappedSuperclass;





@MappedSuperclass
@Inheritance(strategy = InheritanceType.TABLE_PER_CLASS)
public abstract class Permission implements Serializable {

	private static final long serialVersionUID = 7874032709787162037L;

	@ManyToOne
	@JoinColumn(name = "ID_ROLES")
	protected Role role;

	@ManyToOne
	@JoinColumn(name = "ID_PERS")
	protected Person person;

	public Permission() {
		super();
	}

	public Role getRole() {
		return role;
	}

	public void setRole(Role role) {
		this.role = role;
	}

	public String getRoleType() {
		return role.getType().name();
	}
	
	public Person getPerson() {
		return person;
	}

	public void setPerson(Person person) {
		this.person = person;
	}
	
	@Override
	public int hashCode() {
		return Objects.hash(person, role);
	}

	@Override
	public boolean equals(Object obj) {
		if (this == obj)
			return true;
		if (obj == null)
			return false;
		if (getClass() != obj.getClass())
			return false;
		Permission other = (Permission) obj;
		return Objects.equals(person, other.person) && Objects.equals(role, other.role);
	}
}
