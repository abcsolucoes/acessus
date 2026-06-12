package com.Accessus.Accessus.services;

import com.Accessus.Accessus.dto.ticket.CreateTicketDto;
import com.Accessus.Accessus.dto.ticket.ResponseTicketDto;
import com.Accessus.Accessus.dto.ticket.TicketAttachmentDto;
import com.Accessus.Accessus.entities.Ticket;
import com.Accessus.Accessus.entities.User;
import com.Accessus.Accessus.enums.TicketStatus;
import com.Accessus.Accessus.repositories.TicketRepository;
import com.Accessus.Accessus.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.Map;

@Service
public class TicketService {

    @Autowired
    private TicketRepository ticketRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TicketAttachmentService attachmentService;

    @Autowired
    private LogsService logsService;

    @Autowired
    private EmailService emailService;

    @Value("${app.base-url}")
    private String baseUrl;

    // Emails fixos por setor para notificação de novos tickets
    private static final Map<String, List<String>> EMAILS_FOR_AREA = Map.of(
            "TI", List.of(
                    "gabriel.oliveira@solucoesabc.com.br",
                    "guilherme.lima@solucoesabc.com.br"
            ),
            "RH", List.of(
                    "carla.araujo@solucoesabc.com.br",
                    "andreza.resende@solucoesabc.com.br",
                    "maria.carvalho@solucoesabc.com.br",
                    "italo.goncalves@solucoesabc.com.br",
                    "naylla.rodrigues@solucoesabc.com.br"
            ),
            "DP", List.of(
                    "jessica.pinheiro@solucoesabc.com.br",
                    "lais.silva@solucoesabc.com.br",
                    "alessandra.barbosa@solucoesabc.com.br",
                    "mirelli.cendret@solucoesabc.com.br",
                    "ana.azevedo@solucoesabc.com.br"
            )
    );

    @Transactional(readOnly = true)
    public Page<ResponseTicketDto> findForCurrentUser(String filter, Pageable pageable) {
        User user = userService.getAuthenticatedUser();

        return switch (filter) {
            case "mine" -> ticketRepository.findByAssignedTo(user, pageable).map(this::toDto);
            case "sector" -> ticketRepository.findByDepartment(user.getDepartment(), pageable).map(this::toDto);
            case "created" -> ticketRepository.findByCreatedBy(user, pageable).map(this::toDto);
            case "all" -> {
                if (!"ADMIN".equals(user.getRole()))
                    throw new org.springframework.security.access.AccessDeniedException("Acesso negado.");
                yield ticketRepository.findAll(pageable).map(this::toDto);
            }
            default -> ticketRepository.findByAssignedTo(user, pageable).map(this::toDto);
        };
    }

    @Transactional
    public ResponseTicketDto create(CreateTicketDto dto) {
        if (dto.department() == null && dto.assignedToId() == null) {
            throw new IllegalArgumentException("Informe um departamento ou uma pessoa para o ticket");
        }

        User caller = userService.getAuthenticatedUser();

        Ticket ticket = new Ticket();

        // Se applicantId foi informado, apenas ADMIN pode criar em nome de outro usuário
        User createdBy;
        if (dto.applicantId() != null) {
            if (!"ADMIN".equals(caller.getRole())) {
                throw new IllegalArgumentException("Sem permissão para associar outro usuário");
            }
            createdBy = userRepository.findById(dto.applicantId())
                    .orElseThrow(() -> new RuntimeException("Solicitante não encontrado"));
        } else {
            createdBy = caller;
        }

        ticket.setTitle(dto.title());
        ticket.setDescription(dto.description());
        ticket.setStatus(TicketStatus.OPEN);
        ticket.setCreatedAt(LocalDateTime.now(ZoneId.of("America/Sao_Paulo")));
        ticket.setCreatedBy(createdBy);

        if (dto.department() != null) {
            ticket.setDepartment(dto.department());
        }

        if (dto.assignedToId() != null) {
            User assignedTo = userRepository.findById(dto.assignedToId())
                    .orElseThrow(() -> new RuntimeException("Usuário destinatário não encontrado"));
            ticket.setAssignedTo(assignedTo);
        }

        ticketRepository.save(ticket);

        // Monta o link com o ID real gerado após o save
        String ticketLink = baseUrl + "/tickets/ticketDetail/" + ticket.getId();

        // Notifica o solicitante se o ticket foi criado em nome de outro usuário
        if (dto.applicantId() != null) {
            emailService.sendTicketCreatedForApplicant(caller, createdBy.getEmail(), ticketLink);
        }

        // Notifica a pessoa atribuída (quando não há departamento — senão o destino já é o setor)
        if (dto.assignedToId() != null && dto.department() == null) {
            emailService.sendTicketCreatedForAssigned(caller, ticket.getAssignedTo().getEmail(), ticketLink);
        }

        // Notifica os emails do setor quando o ticket é direcionado por departamento
        if (dto.department() != null) {
            List<String> emails = EMAILS_FOR_AREA.getOrDefault(dto.department().name(), List.of());
            if (!emails.isEmpty()) {
                emailService.sendTicketCreatedForDepartment(caller, emails, ticketLink);
            }
        }

        logsService.createLog("criou o ticket " + dto.title());

        return toDto(ticket);
    }

    @Transactional
    public ResponseTicketDto changeStatus(Long id, TicketStatus newStatus) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket não encontrado"));

        User user = userService.getAuthenticatedUser();

        boolean isAdmin = "ADMIN".equals(user.getRole());
        boolean isAssignee = ticket.getAssignedTo() != null && ticket.getAssignedTo().getId().equals(user.getId());
        boolean isSameDept = ticket.getDepartment() != null && ticket.getDepartment().equals(user.getDepartment());

        if (!isAdmin && !isAssignee && !isSameDept) {
            throw new IllegalArgumentException("Sem permissão para alterar este ticket");
        }

        ticket.setStatus(newStatus);
        ticketRepository.save(ticket);

        Map<String, String> STATUS_MAP = Map.of(
                "OPEN", "Aberto",
                "IN_PROGRESS", "Em Andamento",
                "RESOLVED", "Resolvido",
                "CLOSED", "Encerrado"
        );

        String statusLabel = STATUS_MAP.getOrDefault(newStatus.name(), newStatus.name());

        logsService.createLog("Alterou o status do ticket " + ticket.getTitle() + " para " + statusLabel);

        // Notifica o criador do ticket — exceto se ele mesmo alterou o status
        if (!ticket.getCreatedBy().getId().equals(user.getId())) {
            String ticketLink = baseUrl + "/tickets/ticketDetail/" + ticket.getId();
            emailService.sendTicketStatusChanged(
                    ticket.getCreatedBy().getEmail(),
                    ticket.getTitle(),
                    statusLabel,
                    ticketLink
            );
        }

        return toDto(ticket);
    }

    public ResponseTicketDto findById(Long id) {
        User user = userService.getAuthenticatedUser();
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket não encontrado"));

        boolean isAdmin = "ADMIN".equals(user.getRole());
        boolean isAssignee = ticket.getAssignedTo() != null && ticket.getAssignedTo().getId().equals(user.getId());
        boolean isSameDept = ticket.getDepartment() != null && ticket.getDepartment().equals(user.getDepartment());
        boolean isCreator = ticket.getCreatedBy().getId().equals(user.getId());

        if (!isAdmin && !isAssignee && !isSameDept && !isCreator) {
            throw new IllegalArgumentException("Acesso negado");
        }

        return toDto(ticket);
    }

    private ResponseTicketDto toDto(Ticket ticket) {
        List<TicketAttachmentDto> attachments = ticket.getAttachments().stream()
                .map(attachmentService::toDto)
                .toList();

        return new ResponseTicketDto(
                ticket.getId(),
                ticket.getTitle(),
                ticket.getDescription(),
                ticket.getStatus(),
                ticket.getCreatedAt(),
                userService.toDto(ticket.getCreatedBy()),
                ticket.getDepartment(),
                ticket.getAssignedTo() != null ? userService.toDto(ticket.getAssignedTo()) : null,
                attachments
        );
    }
}
