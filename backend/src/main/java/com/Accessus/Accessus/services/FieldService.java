package com.Accessus.Accessus.services;

import com.Accessus.Accessus.dto.field.CreateFieldDto;
import com.Accessus.Accessus.entities.Candidate;
import com.Accessus.Accessus.entities.Field;
import com.Accessus.Accessus.enums.FieldScope;
import com.Accessus.Accessus.repositories.CandidateRepository;
import com.Accessus.Accessus.repositories.FieldRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class FieldService {
    @Autowired
    FieldRepository fieldRepository;

    @Autowired
    private CandidateRepository candidateRepository;

    @Transactional
    public Field createField(CreateFieldDto dto) {
        Field field = new Field();

        field.setFieldName(dto.fieldName());
        field.setEnabled(dto.enabled());
        field.setFieldSize(dto.fieldSize());
        field.setFieldType(dto.fieldType());
        field.setStep(dto.step());

        if (dto.candidateId() == null) {
            field.setScope(FieldScope.ADMISSION);
            field.setCandidate(null);
        } else {
            Candidate candidate = candidateRepository.findById(dto.candidateId())
                    .orElseThrow(() -> new RuntimeException("Candidato não encontrado"));

            field.setScope(FieldScope.CANDIDATE);
            field.setCandidate(candidate);
        }

        return fieldRepository.save(field);
    }

    // Valida se o token pertence ao candidato antes de retornar os campos
    public void validateCandidateToken(Long candidateId, String token) {
        Candidate candidate = candidateRepository.findByActivationToken(token)
                .orElseThrow(() -> new RuntimeException("Token inválido"));

        if (!candidate.getId().equals(candidateId)) {
            throw new RuntimeException("Token não corresponde ao candidato");
        }
    }

    @Transactional(readOnly = true)
    public List<Field> loadFields(Long candidateId) {
        List<Field> admissionFields = fieldRepository.findByScope(FieldScope.ADMISSION);

        List<Field> candidateFields = fieldRepository.findByScopeAndCandidateId(
                FieldScope.CANDIDATE,
                candidateId
        );

        List<Field> allFields = new ArrayList<>();
        allFields.addAll(admissionFields);
        allFields.addAll(candidateFields);

        return allFields;
    }

    @Transactional
    public void delete(Long fieldId, Long candidateId) {
        Field field = fieldRepository.findById(fieldId)
                .orElseThrow(() -> new RuntimeException("Campo não encontrado"));

        if (field.getScope() == FieldScope.CANDIDATE) {
            if (candidateId == null ||
                    field.getCandidate() == null ||
                    !field.getCandidate().getId().equals(candidateId)) {
                throw new RuntimeException("Sem permissão");
            }
        }

        fieldRepository.delete(field);
    }

    @Transactional(readOnly = true)
    public List<Field> findAll() {
        return fieldRepository.findAll();
    }
}
