package eu.europa.europarl.csio.elegislate.DAO;

import org.springframework.data.jpa.repository.JpaRepository;

import eu.europa.europarl.csio.elegislate.domain.Condition;

public interface ConditionRepository extends JpaRepository<Condition, Integer> {

}
