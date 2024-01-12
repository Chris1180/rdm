package eu.europa.europarl.csio.elegislate.DAO;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import eu.europa.europarl.csio.elegislate.domain.RuleCondition;

public interface RuleConditionRepository extends JpaRepository<RuleCondition, Integer>{

//	@Transactional
//	@Modifying
//	@Query("SELECT * FROM RuleCondition rc WHERE rc.id_precondition=?1")
	List<RuleCondition> findByIdPreCondition(Integer idPreCondition);
	
	List<RuleCondition> findByIdPreConditionOrderByIdAsc(Integer idPreCondition);
	
	@Query("SELECT rc FROM RuleCondition rc WHERE rc.idPreCondition <> 0")
	List<RuleCondition> findAllSubConditions();
}
