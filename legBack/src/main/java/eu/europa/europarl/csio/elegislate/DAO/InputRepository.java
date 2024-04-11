package eu.europa.europarl.csio.elegislate.DAO;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import eu.europa.europarl.csio.elegislate.domain.Input;

public interface InputRepository extends JpaRepository<Input, Integer> {
	List<Input> findAllByOrderByOrderAsc();
	List<Input> findAllByOrderByLabelAscOrderAsc();
}
