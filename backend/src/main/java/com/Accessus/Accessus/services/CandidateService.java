package com.Accessus.Accessus.services;

import com.Accessus.Accessus.document.ReportGenerator;
import com.Accessus.Accessus.dto.candidate.RegisterCandidateDto;
import com.Accessus.Accessus.dto.candidate.ResponseCandidateDto;
import com.Accessus.Accessus.dto.ticket.CreateTicketDto;
import com.Accessus.Accessus.enums.Department;
import com.Accessus.Accessus.entities.Candidate;
import com.Accessus.Accessus.entities.FieldValue;
import com.Accessus.Accessus.entities.User;
import com.Accessus.Accessus.enums.CandidateStatus;
import com.Accessus.Accessus.repositories.CandidateRepository;
import com.Accessus.Accessus.repositories.FieldValueRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class CandidateService {

    private static final Logger log = LoggerFactory.getLogger(CandidateService.class);

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

    @Autowired
    private ZApiService zApiService;

    @Autowired
    private DysrupService dysrupService;

    @Autowired
    private TicketService ticketService;

    @Value("${app.base-url}")
    private String baseUrl;

    @Transactional(readOnly = true)
    public Page<ResponseCandidateDto> findAll(CandidateStatus status, Pageable pageable) {
        if (status == null) {
            return candidateRepository.findAll(pageable).map(this::toDto);
        }
        return candidateRepository.findByCandidateStatus(status, pageable).map(this::toDto);
    }

    @Transactional(readOnly = true)
    public ResponseCandidateDto findById(Long id) {
        Candidate candidate = candidateRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Candidato não encontrado"));

        return toDto(candidate);
    }

    @Transactional
    public ResponseCandidateDto register(RegisterCandidateDto dto, MultipartFile routePhoto) {
        Candidate candidate = new Candidate();

        boolean emailJaExiste = dto.email() != null && !dto.email().isBlank()
                && candidateRepository.findByEmail(dto.email()).isPresent();
        if (emailJaExiste || candidateRepository.findByCpf(dto.cpf()).isPresent()) {
            throw new RuntimeException("Usuário já cadastrado");
        }

        candidate.setName(dto.name());
        candidate.setEmail(dto.email());
        candidate.setCpf(dto.cpf());
        candidate.setPosition(dto.position());
        candidate.setTelephone(dto.telephone());
        candidate.setAdmissionDate(dto.admissionDate());
        candidate.setBirthDate(dto.birthDate());
        candidate.setZipcode(dto.zipcode() != null ? dto.zipcode().replaceAll("[^0-9]", "") : null);
        candidate.setAddressNumber(dto.addressNumber());
        candidate.setComplement(dto.complement());
        candidate.setRouteName(dto.routeName());
        candidate.setTeamName(dto.teamName());
        candidate.setCandidateStatus(CandidateStatus.PENDING);

        String token = UUID.randomUUID().toString();
        candidate.setActivationToken(token);

        candidateRepository.save(candidate);

        if (routePhoto != null && !routePhoto.isEmpty()) {
            String path = fileStorageService.saveRoutePhoto(candidate.getId(), routePhoto);
            candidate.setRoutePhotoPath(path);
            candidateRepository.save(candidate);
        }

        String link = baseUrl + "/formulario/" + token;
        if (candidate.getEmail() != null && !candidate.getEmail().isBlank()) {
            emailService.sendCandidateForm(candidate.getEmail(), link);
        }

        String message = "Olá, " + candidate.getName().split(" ")[0] + "! Seja bem-vindo(a) à ABC! 🎉\n\n" +
                "Estamos muito felizes em ter você no nosso time. Seu processo de admissão foi iniciado e precisamos que você preencha seus documentos.\n\n" +
                "📋 *Para isso, acesse o link abaixo:*\n" +
                link + "\n\n" +
                "⚠️ *Importante:*\n" +
                "• Preencha todas as informações com atenção\n" +
                "• Tenha seus documentos em mãos (RG, CPF, comprovante de residência, etc.)\n" +
                "• O link é pessoal e intransferível\n\n" +
                "Qualquer dúvida é só me chamar por aqui. Estamos à disposição!\n" +
                "Bem-vindo(a) à equipe! 💼";

        try {
            zApiService.sendText("55" + candidate.getTelephone(), message);
        } catch (Exception e) {
            log.error("Erro ao enviar WhatsApp de boas-vindas para candidato {}: {}", candidate.getName(), e.getMessage(), e);
        }

        logsService.createLog("criou o registro do candidato" + dto.name() + ", cpf " + dto.cpf());

        return toDto(candidate);
    }

    public void sendWelcomeMessage(Long id) {
        Candidate candidate = candidateRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Candidato não encontrado"));

        if (candidate.getEmail() == null || candidate.getEmail().isBlank())
            throw new RuntimeException("Candidato sem e-mail cadastrado");

        if (candidate.getDysrupRegisteredAt() == null)
            throw new RuntimeException("Candidato ainda não foi cadastrado na Dysrup");

        String message = "Olá, " + candidate.getName().split(" ")[0] + "! Tudo bem? 😊\n\n" +
                "Sou da ABC, e vou te passar as informações para acessar o nosso app de promotor, o Dysrup.\n\n" +
                "📱 *Link para download:*\n" +
                "https://play.google.com/store/apps/details?id=com.dysrup.repositor\n\n" +
                "🔑 *Acesso inicial:*\n" +
                "• Código do empregador: *84OCE* (atenção: é a letra \"O\", não o número zero)\n" +
                "• Login: " + candidate.getEmail() + "\n" +
                "• Senha: Você criará no primeiro acesso (anote para não esquecer!)\n\n" +
                "Qualquer dúvida ou se precisar de ajuda, é só me chamar por aqui.\n" +
                "Estou à disposição!";

        zApiService.sendText("55" + candidate.getTelephone(), message);

        candidate.setWelcomeMessageSentAt(LocalDateTime.now());
        candidateRepository.save(candidate);

        logsService.createLog("enviou mensagem de boas-vindas para " + candidate.getName());
    }

    public void sendRouteNotification(Long id) {
        Candidate candidate = candidateRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Candidato não encontrado"));

        if (candidate.getRouteName() == null || candidate.getRouteName().isBlank())
            throw new RuntimeException("Candidato sem nome da rota cadastrado");

        if (candidate.getRoutePhotoPath() == null || candidate.getRoutePhotoPath().isBlank())
            throw new RuntimeException("Candidato sem foto da rota cadastrada");

        zApiService.sendCandidateRouteNotification(candidate.getName(), candidate.getRouteName(), candidate.getRoutePhotoPath());

        candidate.setRouteDataSentAt(LocalDateTime.now());
        candidateRepository.save(candidate);

        logsService.createLog("enviou notificação de rota para " + candidate.getName());
    }

    @Transactional
    public void createTiTicket(Long id) {
        Candidate candidate = candidateRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Candidato não encontrado"));

        CreateTicketDto dto = new CreateTicketDto(
                "Aparelho para " + candidate.getName(),
                "Gentileza providenciar a configuração de um aparelho para o(a) colaborador(a) "
                        + candidate.getName() + ", referente à sua admissão em " + candidate.getAdmissionDate() + ".",
                Department.TI,
                null,
                null
        );
        ticketService.create(dto);

        candidate.setTiTicketCreatedAt(LocalDateTime.now());
        candidateRepository.save(candidate);

        logsService.createLog("abriu chamado de T.I para o candidato " + candidate.getName());
    }

    public String formCandidate(Long id) {
        Candidate candidate = candidateRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Candidato não encontrado"));

        return baseUrl + "/formulario/" + candidate.getActivationToken();
    }

    public void resendForm(Long id) {
        Candidate candidate = candidateRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Candidato não encontrado"));

        String link = baseUrl + "/formulario/" + candidate.getActivationToken();
        if (candidate.getEmail() != null && !candidate.getEmail().isBlank()) {
            emailService.sendCandidateForm(candidate.getEmail(), link);
        }

        String message = "Olá, " + candidate.getName().split(" ")[0] + "! Seja bem-vindo(a) à ABC! 🎉\n\n" +
                "Estamos muito felizes em ter você no nosso time. Seu processo de admissão foi iniciado e precisamos que você preencha seus documentos.\n\n" +
                "📋 *Para isso, acesse o link abaixo:*\n" +
                link + "\n\n" +
                "⚠️ *Importante:*\n" +
                "• Preencha todas as informações com atenção\n" +
                "• Tenha seus documentos em mãos (RG, CPF, comprovante de residência, etc.)\n" +
                "• O link é pessoal e intransferível\n\n" +
                "Qualquer dúvida é só me chamar por aqui. Estamos à disposição!\n" +
                "Bem-vindo(a) à equipe! 💼";

        zApiService.sendText("55" + candidate.getTelephone(), message);

        logsService.createLog("reenviou o formulário para o candidato " + candidate.getName());
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
    public ResponseCandidateDto update(Long id, RegisterCandidateDto dto, MultipartFile routePhoto) {
        Candidate candidate = candidateRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Candidato não encontrado"));

        candidate.setName(dto.name());
        candidate.setCpf(dto.cpf());
        candidate.setEmail(dto.email());
        candidate.setTelephone(dto.telephone());
        candidate.setPosition(dto.position());
        candidate.setAdmissionDate(dto.admissionDate());
        candidate.setBirthDate(dto.birthDate());
        candidate.setZipcode(dto.zipcode() != null ? dto.zipcode().replaceAll("[^0-9]", "") : null);
        candidate.setAddressNumber(dto.addressNumber());
        candidate.setComplement(dto.complement());
        candidate.setRouteName(dto.routeName());
        candidate.setTeamName(dto.teamName());

        if (routePhoto != null && !routePhoto.isEmpty()) {
            String path = fileStorageService.saveRoutePhoto(candidate.getId(), routePhoto);
            candidate.setRoutePhotoPath(path);
        }

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

        // Rota também é chamada, sem autenticação, pelo próprio formulário público do candidato
        // (PENDING -> UNDER_ANALYSIS ao enviar) — nesse caso o principal é o anônimo padrão do
        // Spring Security (não um User), e getAuthenticatedUser() derrubaria a transação com 401.
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated() && authentication.getPrincipal() instanceof User) {
            logsService.createLog(
                    "alterou o status de "
                            + candidate.getName()
                            + ", cpf " + candidate.getCpf()
                            + ", para "
                            + STATUS_MAP.getOrDefault(status.name(), status.name())
            );
        }

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
                candidate.getBirthDate(),
                candidate.getZipcode(),
                candidate.getAddressNumber(),
                candidate.getComplement(),
                candidate.getCandidateStatus(),
                candidate.getCandidateStatus() == CandidateStatus.PENDING,
                candidate.getRouteName(),
                candidate.getTeamName(),
                candidate.getWelcomeMessageSentAt(),
                candidate.getRouteDataSentAt(),
                candidate.getDysrupRegisteredAt(),
                candidate.getTiTicketCreatedAt(),
                candidate.getRoutePhotoPath() != null && !candidate.getRoutePhotoPath().isBlank()
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

    public void deleteFile(Long candidateId, Long valueId) {
        fileStorageService.deleteFieldValueFile(candidateId, valueId);
    }

    public byte[] zipCandidateFiles(Long candidateId) {
        return fileStorageService.zipCandidateFiles(candidateId);
    }

    @Transactional(readOnly = true)
    public FileStorageService.StoredFile getRoutePhoto(Long candidateId) {
        Candidate candidate = candidateRepository.findById(candidateId)
                .orElseThrow(() -> new RuntimeException("Candidato não encontrado"));

        return fileStorageService.readRoutePhoto(candidate.getRoutePhotoPath());
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
