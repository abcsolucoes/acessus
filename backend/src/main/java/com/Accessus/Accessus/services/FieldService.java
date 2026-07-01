package com.Accessus.Accessus.services;

import com.Accessus.Accessus.dto.field.CreateFieldDto;
import com.Accessus.Accessus.entities.Candidate;
import com.Accessus.Accessus.entities.Field;
import com.Accessus.Accessus.enums.FieldScope;
import com.Accessus.Accessus.repositories.CandidateRepository;
import com.Accessus.Accessus.repositories.FieldRepository;
import com.Accessus.Accessus.repositories.FieldValueRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class FieldService {
    @Autowired
    FieldRepository fieldRepository;

    @Autowired
    private CandidateRepository candidateRepository;

    @Autowired
    private FieldValueRepository fieldValueRepository;

    @Autowired
    private UserService userService;

    // Lista separada por vírgula — quem tiver um desses e-mails pode gerenciar fields ADMISSION.
    @Value("${app.dev-email:}")
    private String devEmails;

    // Fields ADMISSION são padrão do sistema (usados por todo mundo, e alguns sincronizam
    // com colunas fixas do Candidate) — só o(s) dev(s) podem criar/excluir, pra evitar risco
    // de alguém do RH renomear/apagar um campo do qual a aplicação depende.
    private void checkDevOnly() {
        Set<String> allowed = Arrays.stream(devEmails.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .map(String::toLowerCase)
                .collect(Collectors.toSet());

        String callerEmail = userService.getAuthenticatedUser().getEmail();
        if (callerEmail == null || !allowed.contains(callerEmail.toLowerCase())) {
            throw new RuntimeException("Apenas o desenvolvedor pode gerenciar campos padrão (ADMISSION)");
        }
    }

    @Transactional
    public Field createField(CreateFieldDto dto) {
        Field field = new Field();

        field.setFieldName(dto.fieldName());
        field.setEnabled(dto.enabled());
        field.setFieldSize(dto.fieldSize());
        field.setFieldType(dto.fieldType());
        field.setStep(dto.step());

        if (dto.candidateId() == null) {
            checkDevOnly();
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

    // TODO-TEMP: usado só pra semear os fields ADMISSION iniciais em produção via JSON em lote.
    // Remover esse método e o endpoint /field/create-batch depois que a carga inicial acabar.
    @Transactional
    public List<Field> createFields(List<CreateFieldDto> dtos) {
        List<Field> created = new ArrayList<>();
        for (CreateFieldDto dto : dtos) {
            created.add(createField(dto));
        }
        return created;
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
        } else {
            checkDevOnly();
        }

        if (fieldValueRepository.existsByFieldId(fieldId)) {
            throw new RuntimeException("Campo já respondido por ao menos um candidato — não pode ser excluído");
        }

        fieldRepository.delete(field);
    }

    @Transactional(readOnly = true)
    public List<Field> findAll() {
        return fieldRepository.findAll();
    }
}
