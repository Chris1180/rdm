package eu.europa.europarl.csio.elegislate.security.domain;

import java.util.Collection;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.User;

/** Class used to extends a Srping Security User.
 * It allows to add extra information coming from Database layer 
 * 
 * @author eacthergal
 *
 */
public class UserDetails extends User {
	
	private static final long serialVersionUID = -3991150878877517666L;	
	
	private String firstName;
	private String lastName;
	private String email;

	public UserDetails(String username, String password, Collection<? extends GrantedAuthority> authorities) {
		super(username, password, authorities);
		
	}

	public UserDetails(String username, String password, String firstName, String lastName, String email, Collection<? extends GrantedAuthority> authorities) {
		this(username, password, authorities);
		this.firstName = firstName;
		this.lastName = lastName;
		this.email = email;
	}
	

	public String getFirstName() {
		return firstName;
	}

	public String getLastName() {
		return lastName;
	}
	
	public String getEmail() {
		return email;
	}

	@Override
	public String toString() {
		return this.getUsername();
	}
}
