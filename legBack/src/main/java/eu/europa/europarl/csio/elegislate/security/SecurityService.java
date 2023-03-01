package eu.europa.europarl.csio.elegislate.security;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import eu.europa.europarl.csio.elegislate.security.domain.Person;
import eu.europa.europarl.csio.elegislate.security.domain.PersonDAO;

@Service
public class SecurityService {

	@Autowired
	private PersonDAO personDAO;
	
	public Optional<Person> findPersonByUsername(String username){
		
			return personDAO.findByUsername(username); // retourne un Optional<Person>
		
	}
	
}
