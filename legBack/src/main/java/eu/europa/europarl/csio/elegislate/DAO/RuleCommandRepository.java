package eu.europa.europarl.csio.elegislate.DAO;

import javax.transaction.Transactional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import eu.europa.europarl.csio.elegislate.domain.RuleCommand;

public interface RuleCommandRepository extends JpaRepository<RuleCommand, Integer>{
	@Transactional
	@Modifying
	@Query("DELETE FROM RuleCommand r WHERE r.ruleCondition.id = ?1")
	Integer deleteByIdCondition(Integer idCondition);
	
}
