package com.Accessus.Accessus.config;

import com.Accessus.Accessus.entities.User;
import com.Accessus.Accessus.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Cria o primeiro usuário ADMIN automaticamente se o banco estiver vazio.
 * Após o primeiro login, crie seu usuário real e remova ou desative este seed.
 */
@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        /*if (userRepository.count() == 0) {
            User admin = new User();
            admin.setName("Administrador");
            admin.setEmail("admin@acessus.com");
            admin.setPassword(passwordEncoder.encode("Admin@1234"));
            admin.setRole("ADMIN");
            admin.setEnabled(true);

            userRepository.save(admin);

            System.out.println("========================================");
            System.out.println("  USUÁRIO INICIAL CRIADO:");
            System.out.println("  E-mail: admin@acessus.com");
            System.out.println("  Senha:  Admin@1234");
            System.out.println("  Troque a senha após o primeiro acesso!");
            System.out.println("========================================");
        }*/
    }
}
