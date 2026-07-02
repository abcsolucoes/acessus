package com.Accessus.Accessus.repositories;

import com.Accessus.Accessus.entities.FieldValue;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FieldValueRepository extends JpaRepository<FieldValue, Long> {
    List<FieldValue> findByCandidateId(Long candidateId);
    List<FieldValue> findByCandidateIdAndFieldIdIn(Long candidateId, List<Long> fieldIds);
    List<FieldValue> findByCandidateIdAndFieldId(Long candidateId, Long fieldId);
    boolean existsByFieldId(Long fieldId);
}
