package eu.europa.europarl.csio.elegislate.DAO;

import org.springframework.data.jpa.repository.JpaRepository;

import eu.europa.europarl.csio.elegislate.domain.RuleCommand;

public interface RuleCommandRepository extends JpaRepository<RuleCommand, Integer>{

}
