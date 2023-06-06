package eu.europa.europarl.csio.elegislate.DAO;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import eu.europa.europarl.csio.elegislate.domain.Style;

public interface StyleRepository extends JpaRepository<Style, Integer>{

	List<Style> findAllByOrderByNameAsc();
}
