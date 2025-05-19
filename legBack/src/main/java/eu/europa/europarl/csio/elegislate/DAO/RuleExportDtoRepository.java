package eu.europa.europarl.csio.elegislate.DAO;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import eu.europa.europarl.csio.elegislate.domain.RuleExportDto;

public interface RuleExportDtoRepository extends JpaRepository<RuleExportDto, Long> {

	 @Query(value = "SELECT * FROM view_rule_conditions_export ORDER BY rule_id, condition_id", nativeQuery = true)
	    List<RuleExportDto> findAllOrdered();
	 
}
