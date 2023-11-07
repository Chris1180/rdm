package eu.europa.europarl.csio.elegislate.DAO;

import org.springframework.data.jpa.repository.JpaRepository;

import eu.europa.europarl.csio.elegislate.domain.RuleCondition;

public interface RuleConditionRepository extends JpaRepository<RuleCondition, Integer>{

}
