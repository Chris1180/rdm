package eu.europa.europarl.csio.elegislate.security.domain;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;





//public interface PersonDAO extends JpaRepository<Person, Long>, JpaSpecificationExecutor<Person> {
//@Repository
public interface PersonDAO extends JpaRepository<Person, Long> {
	
	public Optional<Person> findByUsername(String username);
	
	@Query("SELECT p FROM Person p WHERE p.username = :username")
	Optional<Person> findUser(@Param("username")String username);
	
	//@Query("SELECT p FROM Person p WHERE p.username like %:username%")
	//List<Person> findUser(@Param("username")String username);
}
