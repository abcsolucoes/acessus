package com.Accessus.Accessus.repositories;

import com.Accessus.Accessus.entities.Candidate;
import com.Accessus.Accessus.entities.User;
import com.Accessus.Accessus.enums.CandidateStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CandidateRepository extends JpaRepository<Candidate, Long> {
    Optional<Candidate> findByEmail(String email);
    Optional<Candidate> findByCpf(String cpf);
    Optional<Candidate> findByActivationToken(String activationToken);
    Page<Candidate> findByCpfContaining(String cpf, Pageable pageable);
    Page<Candidate> findByEmailContainingIgnoreCase(String email, Pageable pageable);
    Page<Candidate> findByNameContainingIgnoreCase(String name, Pageable pageable);
    Page<Candidate> findByCandidateStatus(CandidateStatus status, Pageable pageable);
}
