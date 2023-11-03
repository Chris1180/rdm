package eu.europa.europarl.csio.elegislate.DAO;

import org.springframework.data.jpa.repository.JpaRepository;

import eu.europa.europarl.csio.elegislate.domain.Command;

public interface CommandRepository extends JpaRepository<Command, Integer> {

}
