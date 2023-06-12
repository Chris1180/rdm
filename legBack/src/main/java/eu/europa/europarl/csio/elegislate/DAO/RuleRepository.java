package eu.europa.europarl.csio.elegislate.DAO;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import eu.europa.europarl.csio.elegislate.domain.Rule;

//@Repository
public interface RuleRepository extends JpaRepository<Rule, Integer>{

	List<Rule> findAllByOrderByOrderAsc();

}
