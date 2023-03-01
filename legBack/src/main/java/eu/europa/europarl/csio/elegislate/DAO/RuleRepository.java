package eu.europa.europarl.csio.elegislate.DAO;

import org.springframework.data.jpa.repository.JpaRepository;

import eu.europa.europarl.csio.elegislate.domain.Rule;

public interface RuleRepository extends JpaRepository<Rule, Integer>{

}
