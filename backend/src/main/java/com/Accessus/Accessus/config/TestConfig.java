package com.Accessus.Accessus.config;

import com.Accessus.Accessus.entities.Candidate;
import com.Accessus.Accessus.entities.Field;
import com.Accessus.Accessus.entities.Ticket;
import com.Accessus.Accessus.entities.User;
import com.Accessus.Accessus.enums.*;
import com.Accessus.Accessus.repositories.CandidateRepository;
import com.Accessus.Accessus.repositories.FieldRepository;
import com.Accessus.Accessus.repositories.TicketRepository;
import com.Accessus.Accessus.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Configuration
@Profile("test")
public class TestConfig implements CommandLineRunner {
    @Autowired
    UserRepository userRepository;

    @Autowired
    CandidateRepository candidateRepository;

    @Autowired
    FieldRepository fieldRepository;

    @Autowired
    TicketRepository ticketRepository;

    @Autowired
    PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {

        if (userRepository.count() > 0) return;

        // =====================================================
        // USUÁRIOS
        // =====================================================

        User gabriel = new User(
                null,
                "Gabriel da Silva Oliveira",
                "gabrielverdende@gmail.com",
                passwordEncoder.encode("gabriel123"),
                "ADMIN",
                Department.TI
        );
        gabriel.setEnabled(true);

        User admin = new User(
                null,
                "Administrador",
                "admin@acessus.com",
                passwordEncoder.encode("Admin@1234"),
                "ADMIN",
                Department.TI
        );
        admin.setEnabled(true);

        User joao = new User(
                null,
                "João Pedro Martins",
                "joao.martins@acessus.com",
                passwordEncoder.encode("Joao@123"),
                "USER",
                Department.RH
        );
        joao.setEnabled(true);

        User maria = new User(
                null,
                "Maria Fernanda Souza",
                "maria.souza@acessus.com",
                passwordEncoder.encode("Maria@123"),
                "USER",
                Department.RH
        );
        maria.setEnabled(true);

        User lucas = new User(
                null,
                "Lucas Henrique Costa",
                "lucas.costa@acessus.com",
                passwordEncoder.encode("Lucas@123"),
                "USER",
                Department.DP
        );
        lucas.setEnabled(true);

        User ana = new User(
                null,
                "Ana Paula Ribeiro",
                "ana.ribeiro@acessus.com",
                passwordEncoder.encode("Ana@123"),
                "USER",
                Department.OPERACAO
        );
        ana.setEnabled(true);

        userRepository.saveAll(List.of(
                gabriel,
                admin,
                joao,
                maria,
                lucas,
                ana
        ));

        // =====================================================
        // CANDIDATOS
        // =====================================================

        Candidate candidato1 = new Candidate(
                null,
                "Fulano da Silva",
                "144.796.916-26",
                "fulano@gmail.com",
                "31989630619",
                "Promotor",
                LocalDate.of(2026, 4, 30),
                "TOKEN_001",
                CandidateStatus.PENDING
        );

        Candidate candidato2 = new Candidate(
                null,
                "João Pedro Martins",
                "529.982.247-25",
                "joaocandidato@gmail.com",
                "31999999999",
                "Analista de Sistemas",
                LocalDate.of(2026, 5, 10),
                "TOKEN_002",
                CandidateStatus.PENDING
        );

        Candidate candidato3 = new Candidate(
                null,
                "Maria Fernanda Souza",
                "111.444.777-35",
                "mariacandidata@gmail.com",
                "31888888888",
                "Assistente Financeiro",
                LocalDate.of(2026, 5, 15),
                "TOKEN_003",
                CandidateStatus.APPROVED
        );

        Candidate candidato4 = new Candidate(
                null,
                "Lucas Henrique Costa",
                "935.411.347-80",
                "lucascandidato@gmail.com",
                "31777777777",
                "Vendedor",
                LocalDate.of(2026, 5, 20),
                "TOKEN_004",
                CandidateStatus.PENDING
        );

        candidateRepository.saveAll(List.of(
                candidato1,
                candidato2,
                candidato3,
                candidato4
        ));

        // =====================================================
        // TICKETS
        // =====================================================

        Ticket ticket1 = new Ticket(
                null,
                "Erro ao anexar documentos",
                "O candidato não consegue enviar arquivos PDF.",
                null,
                LocalDateTime.now().minusDays(5),
                admin
        );
        ticket1.setAssignedTo(gabriel);
        ticket1.setStatus(TicketStatus.OPEN);

        Ticket ticket2 = new Ticket(
                null,
                "Problema no login",
                "Usuário relata erro de credenciais inválidas.",
                null,
                LocalDateTime.now().minusDays(4),
                joao
        );
        ticket2.setAssignedTo(gabriel);
        ticket2.setStatus(TicketStatus.IN_PROGRESS);

        Ticket ticket3 = new Ticket(
                null,
                "Ajuste no formulário de admissão",
                "Adicionar campo para CNH.",
                null,
                LocalDateTime.now().minusDays(3),
                maria
        );
        ticket3.setAssignedTo(gabriel);
        ticket3.setStatus(TicketStatus.OPEN);

        Ticket ticket4 = new Ticket(
                null,
                "Erro na geração de relatório",
                "Relatório de candidatos não está carregando.",
                null,
                LocalDateTime.now().minusDays(2),
                admin
        );
        ticket4.setAssignedTo(gabriel);
        ticket4.setStatus(TicketStatus.RESOLVED);

        Ticket ticket5 = new Ticket(
                null,
                "Validação de CPF",
                "Alguns CPFs válidos estão sendo rejeitados.",
                null,
                LocalDateTime.now().minusDays(2),
                lucas
        );
        ticket5.setAssignedTo(gabriel);
        ticket5.setStatus(TicketStatus.OPEN);

        Ticket ticket6 = new Ticket(
                null,
                "Upload de foto",
                "Imagem de perfil não está sendo salva.",
                null,
                LocalDateTime.now().minusDays(1),
                ana
        );
        ticket6.setAssignedTo(gabriel);
        ticket6.setStatus(TicketStatus.IN_PROGRESS);

        Ticket ticket7 = new Ticket(
                null,
                "Integração com e-mail",
                "Convites não estão sendo enviados.",
                null,
                LocalDateTime.now(),
                admin
        );
        ticket7.setAssignedTo(gabriel);
        ticket7.setStatus(TicketStatus.CLOSED);

        Ticket ticket8 = new Ticket(
                null,
                "Tela de candidatos lenta",
                "A listagem demora mais de 10 segundos.",
                null,
                LocalDateTime.now(),
                joao
        );
        ticket8.setAssignedTo(gabriel);
        ticket8.setStatus(TicketStatus.OPEN);

        ticketRepository.saveAll(List.of(
                ticket1,
                ticket2,
                ticket3,
                ticket4,
                ticket5,
                ticket6,
                ticket7,
                ticket8
        ));

        // =====================================================
        // CAMPOS DO PRIMEIRO CANDIDATO
        // =====================================================

        List<Field> fields = List.of(

                new Field(
                        null,
                        "Data de nascimento",
                        true,
                        FieldSize.MEDIUM,
                        FieldType.DATE,
                        Steps.personalData,
                        FieldScope.ADMISSION,
                        candidato1
                ),

                new Field(
                        null,
                        "Estado civil",
                        true,
                        FieldSize.MEDIUM,
                        FieldType.TEXT,
                        Steps.personalData,
                        FieldScope.ADMISSION,
                        candidato1
                ),

                new Field(
                        null,
                        "CEP",
                        true,
                        FieldSize.MEDIUM,
                        FieldType.TEXT,
                        Steps.address,
                        FieldScope.ADMISSION,
                        candidato1
                ),

                new Field(
                        null,
                        "Comprovante de residência",
                        true,
                        FieldSize.BIG,
                        FieldType.DOC,
                        Steps.address,
                        FieldScope.ADMISSION,
                        candidato1
                ),

                new Field(
                        null,
                        "RG",
                        true,
                        FieldSize.MEDIUM,
                        FieldType.TEXT,
                        Steps.docs,
                        FieldScope.ADMISSION,
                        candidato1
                ),

                new Field(
                        null,
                        "Foto do documento",
                        true,
                        FieldSize.BIG,
                        FieldType.DOC,
                        Steps.docs,
                        FieldScope.ADMISSION,
                        candidato1
                ),

                new Field(
                        null,
                        "Certidão de nascimento dos dependentes",
                        true,
                        FieldSize.BIG,
                        FieldType.DOC,
                        Steps.dependentsDocs,
                        FieldScope.ADMISSION,
                        candidato1
                ),

                new Field(
                        null,
                        "CPF dos dependentes",
                        true,
                        FieldSize.MEDIUM,
                        FieldType.TEXT,
                        Steps.dependentsDocs,
                        FieldScope.ADMISSION,
                        candidato1
                ),

                new Field(
                        null,
                        "Banco",
                        true,
                        FieldSize.MEDIUM,
                        FieldType.TEXT,
                        Steps.bankDetails,
                        FieldScope.ADMISSION,
                        candidato1
                ),

                new Field(
                        null,
                        "Comprovante bancário",
                        true,
                        FieldSize.BIG,
                        FieldType.DOC,
                        Steps.bankDetails,
                        FieldScope.ADMISSION,
                        candidato1
                )
        );

        fieldRepository.saveAll(fields);
    }
}
