package com.Accessus.Accessus.services;

import com.Accessus.Accessus.dto.fieldValue.FieldValueResponseDto;
import com.Accessus.Accessus.dto.fieldValue.SaveFieldValuesDto;
import com.Accessus.Accessus.entities.Candidate;
import com.Accessus.Accessus.entities.Field;
import com.Accessus.Accessus.entities.FieldValue;
import com.Accessus.Accessus.repositories.CandidateRepository;
import com.Accessus.Accessus.repositories.FieldRepository;
import com.Accessus.Accessus.repositories.FieldValueRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class FieldValueService {

    private static final Logger log = LoggerFactory.getLogger(FieldValueService.class);

    @Autowired
    private CandidateRepository candidateRepository;

    @Autowired
    private FieldRepository fieldRepository;

    @Autowired
    private FieldValueRepository fieldValueRepository;

    // ── Salvar valores do formulário (upsert em batch) ────────────────────────
    @Transactional
    public void saveFieldValues(Long candidateId, SaveFieldValuesDto dto) {
        Candidate candidate = candidateRepository.findById(candidateId)
                .orElseThrow(() -> new RuntimeException("Candidato não encontrado"));

        List<Long> fieldIds = dto.values().stream()
                .map(SaveFieldValuesDto.FieldValueItem::fieldId)
                .toList();

        // 1 query — todos os Fields de uma vez
        Map<Long, Field> fieldMap = fieldRepository.findAllById(fieldIds)
                .stream()
                .collect(Collectors.toMap(Field::getId, f -> f));

        // 1 query — todos os FieldValues existentes de uma vez
        Map<Long, FieldValue> existingMap = fieldValueRepository
                .findByCandidateIdAndFieldIdIn(candidateId, fieldIds)
                .stream()
                .collect(Collectors.toMap(fv -> fv.getField().getId(), fv -> fv));

        // Montar lista de upserts em memória — sem queries no loop
        List<FieldValue> toSave = new ArrayList<>();
        boolean candidateChanged = false;
        for (SaveFieldValuesDto.FieldValueItem item : dto.values()) {
            Field field = fieldMap.get(item.fieldId());
            if (field == null) continue;

            FieldValue fv = existingMap.getOrDefault(item.fieldId(), new FieldValue());
            fv.setCandidate(candidate);
            fv.setField(field);
            fv.setValue(item.value());
            toSave.add(fv);

            candidateChanged |= syncToCandidate(candidate, field.getFieldName(), item.value());
        }

        // 1 query batch — salva tudo de uma vez
        fieldValueRepository.saveAll(toSave);

        if (candidateChanged) {
            candidateRepository.save(candidate);
        }
    }

    // Alguns fields ADMISSION, além de virarem um FieldValue genérico, também alimentam
    // a coluna fixa correspondente do Candidate — é o que as integrações (ex.: Dysrup)
    // leem. Casado pelo nome exato do field (precisa bater com o que foi cadastrado).
    private static final String FIELD_CEP = "CEP";
    private static final String FIELD_NUMERO = "Número";
    private static final String FIELD_COMPLEMENTO = "Complemento";
    private static final String FIELD_EMAIL = "Email";
    private static final String FIELD_DATA_NASCIMENTO = "Data de Nascimento";

    private boolean syncToCandidate(Candidate candidate, String fieldName, String value) {
        if (fieldName == null || value == null || value.isBlank()) return false;

        switch (fieldName) {
            case FIELD_CEP -> candidate.setZipcode(value.replaceAll("[^0-9]", ""));
            case FIELD_NUMERO -> candidate.setAddressNumber(value);
            case FIELD_COMPLEMENTO -> candidate.setComplement(value);
            case FIELD_EMAIL -> candidate.setEmail(value);
            case FIELD_DATA_NASCIMENTO -> {
                try {
                    candidate.setBirthDate(LocalDate.parse(value));
                } catch (Exception e) {
                    log.warn("Data de nascimento inválida recebida do formulário: '{}'", value);
                    return false;
                }
            }
            default -> {
                return false;
            }
        }
        return true;
    }

    // ── Buscar valores salvos de um candidato ─────────────────────────────────
    @Transactional(readOnly = true)
    public List<FieldValueResponseDto> findValuesByCandidate(Long candidateId) {
        if (!candidateRepository.existsById(candidateId)) {
            throw new RuntimeException("Candidato não encontrado");
        }

        return fieldValueRepository.findByCandidateId(candidateId)
                .stream()
                .map(fv -> new FieldValueResponseDto(
                        fv.getField().getId(),
                        fv.getValue(),
                        fv.getFileName()
                ))
                .toList();
    }
}
