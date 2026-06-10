package com.Accessus.Accessus.services;

import com.Accessus.Accessus.document.ReportGenerator;
import com.Accessus.Accessus.dto.candidate.RegisterCandidateDto;
import com.Accessus.Accessus.dto.candidate.ResponseCandidateDto;
import com.Accessus.Accessus.entities.Candidate;
import com.Accessus.Accessus.entities.FieldValue;
import com.Accessus.Accessus.enums.CandidateStatus;
import com.Accessus.Accessus.repositories.CandidateRepository;
import com.Accessus.Accessus.repositories.FieldValueRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class CandidateService {

    @Autowired
    private CandidateRepository candidateRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private FieldValueRepository fieldValueRepository;

    @Autowired
    private ReportGenerator reportGenerator;

    @Autowired
    private FileStorageService fileStorageService;

    @Autowired
    private LogsService logsService;

    @Value("${app.base-url}")
    private String baseUrl;

    @Transactional(readOnly = true)
    public Page<ResponseCandidateDto> findAll(Pageable pageable) {
        return candidateRepository.findAll(pageable).map(this::toDto);
    }

    @Transactional(readOnly = true)
    public ResponseCandidateDto findById(Long id) {
        Candidate candidate = candidateRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Candidato não encontrado"));

        return toDto(candidate);
    }

    @Transactional
    public void register(RegisterCandidateDto dto) {
        Candidate candidate = new Candidate();

        if (candidateRepository.findByEmail(dto.email()).isPresent() || candidateRepository.findByCpf(dto.cpf()).isPresent()) {
            throw new RuntimeException("Usuário já cadastrado");
        }

        candidate.setName(dto.name());
        candidate.setEmail(dto.email());
        candidate.setCpf(dto.cpf());
        candidate.setPosition(dto.position());
        candidate.setTelephone(dto.telephone());
        candidate.setAdmissionDate(dto.admissionDate());
        candidate.setCandidateStatus(CandidateStatus.PENDING);

        String token = UUID.randomUUID().toString();
        candidate.setActivationToken(token);

        candidateRepository.save(candidate);

        String link = baseUrl + "/form.html?token=" + token;
        emailService.sendCandidateForm(candidate.getEmail(), link);

        logsService.createLog("criou o registro do candidato" + dto.name() + ", cpf " + dto.cpf());
    }

    public String formCandidate(Long id) {
        Candidate candidate = candidateRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Candidato não encontrado"));

        return baseUrl + "/formulario/" + candidate.getActivationToken();
    }

    @Transactional
    public void delete(Long id) {
        Candidate candidate = candidateRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Candidato não encontrado"));

        if (!candidateRepository.existsById(id)) {
            throw new RuntimeException("Candidato não encontrado");
        }

        candidateRepository.deleteById(id);

        logsService.createLog("deletou o candidato" + candidate.getName() + ", cpf " + candidate.getCpf());
    }

    @Transactional
    public ResponseCandidateDto update(Long id, RegisterCandidateDto dto) {
        Candidate candidate = candidateRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Candidato não encontrado"));

        candidate.setName(dto.name());
        candidate.setCpf(dto.cpf());
        candidate.setEmail(dto.email());
        candidate.setTelephone(dto.telephone());
        candidate.setPosition(dto.position());
        candidate.setAdmissionDate(dto.admissionDate());

        candidateRepository.save(candidate);

        return toDto(candidate);
    }

    @Transactional
    public ResponseCandidateDto changeStatus(CandidateStatus status, Long id) {
        Candidate candidate = candidateRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Candidato não encontrado"));

        candidate.setCandidateStatus(status);

        candidateRepository.save(candidate);

        Map<String, String> STATUS_MAP = Map.of(
                "PENDING", "Pendente",
                "UNDER_ANALYSIS", "Em Análise",
                "APPROVED", "Aprovado",
                "REJECTED", "Rejeitado"
        );

        logsService.createLog(
                "alterou o status de "
                        + candidate.getName()
                        + ", cpf " + candidate.getCpf()
                        + ", para "
                        + STATUS_MAP.getOrDefault(status.name(), status.name())
        );

        return toDto(candidate);
    }

    @Transactional(readOnly = true)
    public Page<ResponseCandidateDto> search(String term, Pageable pageable) {
        term = term.trim();

        if (term.matches("\\d+")) {
            return candidateRepository.findByCpfContaining(term, pageable).map(this::toDto);
        }

        if (term.contains("@")) {
            return candidateRepository.findByEmailContainingIgnoreCase(term, pageable).map(this::toDto);
        }

        return candidateRepository.findByNameContainingIgnoreCase(term, pageable).map(this::toDto);
    }

    private ResponseCandidateDto toDto(Candidate candidate) {
        return new ResponseCandidateDto(
                candidate.getId(),
                candidate.getName(),
                candidate.getCpf(),
                candidate.getEmail(),
                candidate.getTelephone(),
                candidate.getPosition(),
                candidate.getAdmissionDate(),
                candidate.getCandidateStatus(),
                candidate.getCandidateStatus() == CandidateStatus.PENDING
        );
    }

    public byte[] generate(Long candidateId) {
        Candidate candidate = candidateRepository.findById(candidateId)
                .orElseThrow(() -> new RuntimeException("Candidato não encontrado"));

        List<FieldValue> values = fieldValueRepository.findByCandidateId(candidateId);

        return reportGenerator.generate(candidateId, values);
    }

    public void upload(Long candidateId, Long fieldId, MultipartFile file) {
        fileStorageService.upload(candidateId, fieldId, file);
    }

    public byte[] zipCandidateFiles(Long candidateId) {
        return fileStorageService.zipCandidateFiles(candidateId);
    }

    public ResponseCandidateDto validateFormAccess(String token) {
        Candidate candidate = candidateRepository.findByActivationToken(token)
                .orElseThrow(() -> new RuntimeException("Token inválido"));

        if (candidate.getCandidateStatus() != CandidateStatus.PENDING) {
            throw new RuntimeException("Formulário bloqueado");
        }

        return toDto(candidate);
    }
}
