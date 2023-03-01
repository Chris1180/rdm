package eu.europa.europarl.csio.elegislate.security.domain;

import java.io.Serializable;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;

import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.JoinTable;
import javax.persistence.ManyToMany;
import javax.persistence.OneToMany;
import javax.persistence.Table;
import com.fasterxml.jackson.annotation.JsonBackReference;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Entity
@Data @NoArgsConstructor @AllArgsConstructor  @ToString
@Table(name = "PERS")
public class Person implements Serializable, Comparable<Person> {

	private static final long serialVersionUID = -3850583297384424723L;

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	private String title;

	@Column(name = "login")
	private String username;
	@Column (name="LAST_NAME")
	private String lastName;
	@Column (name="FIRST_NAME")
	private String firstName;
	private String gender;
	private String email;
	

	private String office;
	private String workingplace;
	private String phone;
	
	
	
	@OneToMany(mappedBy = "person")
	@JsonBackReference
	private List<SystemPermission> systemPermissions; // = new LinkedList<>();
		 
	@ManyToMany(fetch = FetchType.EAGER, cascade = CascadeType.PERSIST)
    @JoinTable(
        name = "is_assigned_to", 
        joinColumns = @JoinColumn(name = "Id_pers"), 
        inverseJoinColumns = { @JoinColumn(name = "Id_service") }
    )
    Set<Service> services = new HashSet<>();
	
	
	
	
	@Override
	public int hashCode() {
		return Objects.hash(firstName, gender, id, lastName, office, phone, systemPermissions,
				title, username, workingplace);
	}

	@Override
	public boolean equals(Object obj) {
		if (this == obj)
			return true;
		if (obj == null)
			return false;
		if (getClass() != obj.getClass())
			return false;
		Person other = (Person) obj;
		return Objects.equals(firstName, other.firstName) && Objects.equals(gender, other.gender)
				&& Objects.equals(id, other.id) 
				&& Objects.equals(lastName, other.lastName) && Objects.equals(office, other.office)
				&& Objects.equals(phone, other.phone) 
				&& Objects.equals(systemPermissions, other.systemPermissions) && Objects.equals(title, other.title)
				&& Objects.equals(username, other.username) && Objects.equals(workingplace, other.workingplace);
	}

	@Override
	public int compareTo(Person o) {
		return Comparator.comparing(Person::getId).compare(this, o);
	}

}
