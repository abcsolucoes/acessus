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

        User u = new User(null, "Gabriel da Silva Oliveira", "gabrielverdende@gmail.com", passwordEncoder.encode("gabriel123"), "ADMIN", Department.TI);
        u.setEnabled(true);
        userRepository.save(u);

        User admin = new User();
        admin.setName("Administrador");
        admin.setEmail("admin@acessus.com");
        admin.setPassword(passwordEncoder.encode("Admin@1234"));
        admin.setRole("ADMIN");
        admin.setEnabled(true);

        userRepository.save(admin);

        Candidate c = new Candidate(null, "Fulano", "144.796.916-26", "teste@gmail.com", "31989630619", "Promotor", LocalDate.of(2026, 4, 30), "AOHSDUPBFPUSADFBASPDIUNAPSDUFBHASIUDP", CandidateStatus.PENDING);
        candidateRepository.save(c);

        Ticket t = new Ticket(null, "Ticket teste", "Esse é um ticket de teste", null, LocalDateTime.now(), admin);
        t.setAssignedTo(u);
        t.setStatus(TicketStatus.OPEN);
        ticketRepository.save(t);

        List<Field> fields = List.of(

                // PERSONAL DATA
                new Field(null, "Data de nascimento", true, FieldSize.MEDIUM,
                        FieldType.DATE, Steps.personalData,
                        FieldScope.ADMISSION, c),

                new Field(null, "Estado civil", true, FieldSize.MEDIUM,
                        FieldType.TEXT, Steps.personalData,
                        FieldScope.ADMISSION, c),

                // ADDRESS
                new Field(null, "CEP", true, FieldSize.MEDIUM,
                        FieldType.TEXT, Steps.address,
                        FieldScope.ADMISSION, c),

                new Field(null, "Comprovante de residência", true, FieldSize.BIG,
                        FieldType.DOC, Steps.address,
                        FieldScope.ADMISSION, c),

                // DOCS
                new Field(null, "RG", true, FieldSize.MEDIUM,
                        FieldType.TEXT, Steps.docs,
                        FieldScope.ADMISSION, c),

                new Field(null, "Foto do documento", true, FieldSize.BIG,
                        FieldType.DOC, Steps.docs,
                        FieldScope.ADMISSION, c),

                // DEPENDENTS DOCS
                new Field(null, "Certidão de nascimento dos dependentes", true, FieldSize.BIG,
                        FieldType.DOC, Steps.dependentsDocs,
                        FieldScope.ADMISSION, c),

                new Field(null, "CPF dos dependentes", true, FieldSize.MEDIUM,
                        FieldType.TEXT, Steps.dependentsDocs,
                        FieldScope.ADMISSION, c),

                // BANK DETAILS
                new Field(null, "Banco", true, FieldSize.MEDIUM,
                        FieldType.TEXT, Steps.bankDetails,
                        FieldScope.ADMISSION, c),

                new Field(null, "Comprovante bancário", true, FieldSize.BIG,
                        FieldType.DOC, Steps.bankDetails,
                        FieldScope.ADMISSION, c)
        );

        fieldRepository.saveAll(fields);
    }
}
