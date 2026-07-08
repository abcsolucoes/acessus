package com.Accessus.Accessus.config;

import com.Accessus.Accessus.entities.Company;
import com.Accessus.Accessus.entities.User;
import com.Accessus.Accessus.repositories.CompanyRepository;
import com.Accessus.Accessus.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

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

    @Autowired
    private CompanyRepository companyRepository;

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

        seedCompanies();
    }

    /**
     * Empresas do grupo ABC Soluções. Dado de referência estável (CNPJ/endereço),
     * diferente do Employee que é populado por importação recorrente de planilha.
     */
    private void seedCompanies() {
        if (companyRepository.count() > 0) {
            return;
        }

        // CNPJ guardado só com dígitos (sem pontuação) — a planilha de origem
        // formata o mesmo CNPJ de jeitos diferentes entre linhas, então a
        // importação sempre normaliza (remove não-dígitos) antes de comparar.
        List<Company> companies = List.of(
                new Company(null, "ABC SOLUCOES EM VENDAS LTDA", "13676274000147",
                        "RUA ARAGUARI", "511", "SALA 05", "BARRO PRETO", "BELO HORIZONTE", "MG", "30190114"),
                new Company(null, "IMPACTO SERVICOS LTDA", "50685192000195",
                        "RUA DOS GUAJAJARAS", "40", "SALA 404", "CENTRO", "BELO HORIZONTE", "MG", "30180910"),
                new Company(null, "AREADO SERVICOS LTDA", "32531307000105",
                        "RUA DOS GUAJAJARAS", "40", "SALA 404", "CENTRO", "BELO HORIZONTE", "MG", "30180910"),
                new Company(null, "PDV ATIVO PRESTACAO DE SERVICOS LTDA", "41213121000107",
                        "RUA ARAGUARI", "358", "LOJA 3", "BARRO PRETO", "BELO HORIZONTE", "MG", "30190110"),
                new Company(null, "NOVA PRIME SERVICOS LTDA", "65563987000106",
                        "AV PRESIDENTE ANTONIO CARLOS", "8100", null, "SAO LUIZ", "BELO HORIZONTE", "MG", "31270672"),
                new Company(null, "NOVA BASE SERVICOS LTDA", "64887499000183",
                        "RUA SANTA RITA DURAO", "444", "SALA 01", "SAVASSI", "BELO HORIZONTE", "MG", "30140111")
        );

        companyRepository.saveAll(companies);

        System.out.println("========================================");
        System.out.println("  " + companies.size() + " EMPRESAS CADASTRADAS (seed inicial)");
        System.out.println("========================================");
    }
}
