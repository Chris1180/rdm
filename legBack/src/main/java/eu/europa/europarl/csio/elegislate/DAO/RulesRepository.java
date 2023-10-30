package eu.europa.europarl.csio.elegislate.DAO;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import eu.europa.europarl.csio.elegislate.domain.Rules;

public interface RulesRepository extends JpaRepository<Rules, Integer> {

	
	List<Rules> findAllByOrderByOrderAsc();
}
