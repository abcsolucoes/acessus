package com.Accessus.Accessus.repositories;

import com.Accessus.Accessus.entities.Field;
import com.Accessus.Accessus.enums.FieldScope;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FieldRepository extends JpaRepository<Field, Long> {
    List<Field> findByScope(FieldScope scope);

    List<Field> findByScopeAndCandidateId(FieldScope scope, Long candidateId);

    Optional<Field> findByIdAndCandidateId(Long fieldId, Long candidateId);
}
