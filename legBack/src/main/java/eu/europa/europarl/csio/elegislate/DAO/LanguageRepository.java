package eu.europa.europarl.csio.elegislate.DAO;


import org.springframework.data.jpa.repository.JpaRepository;
import eu.europa.europarl.csio.elegislate.domain.Language;


//@Repository
public interface LanguageRepository extends JpaRepository<Language, Integer> {

	//List<Language> findAll();
	
}
