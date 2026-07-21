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
     * Empresas do grupo ABC Soluções. Dado de referência estável (código/CNPJ/endereço),
     * diferente do Funcionario que é populado por importação recorrente de planilha.
     * O código (coluna "Empresa" da planilha de funcionários) é a chave usada na
     * importação a partir de agora — o CNPJ fica só como dado de referência/endereço.
     * ABC SOLUCOES EM VENDAS (00004) e ABC SOLUÇÕES (00009) são a mesma empresa
     * legal (mesmo CNPJ) mas o sistema de origem já trata como códigos separados —
     * 00009 é usado especificamente para marcar prestadores de serviço/freelancers,
     * então mantemos as duas linhas separadas aqui também.
     */
    private void seedCompanies() {
        if (companyRepository.count() > 0) {
            return;
        }

        List<Company> companies = List.of(
                new Company(null, "00004", "ABC SOLUCOES EM VENDAS LTDA", "13676274000147",
                        "RUA ARAGUARI", "511", "BARRO PRETO", "30190114", "BELO HORIZONTE", "MG", "SALA 05"),
                new Company(null, "00009", "ABC SOLUÇÕES", "13676274000147",
                        "RUA ARAGUARI", "511", "BARRO PRETO", "30190114", "BELO HORIZONTE", "MG", "SALA 05"),
                new Company(null, "00008", "IMPACTO SERVICOS LTDA", "50685192000195",
                        "RUA DOS GUAJAJARAS", "40", "CENTRO", "30180910", "BELO HORIZONTE", "MG", "SALA 404"),
                new Company(null, "00006", "AREADO SERVICOS LTDA", "32531307000105",
                        "RUA DOS GUAJAJARAS", "40", "CENTRO", "30180910", "BELO HORIZONTE", "MG", "SALA 404"),
                new Company(null, "00005", "PDV ATIVO PRESTACAO DE SERVICOS LTDA", "41213121000107",
                        "RUA ARAGUARI", "358", "BARRO PRETO", "30190110", "BELO HORIZONTE", "MG", "LOJA 3"),
                new Company(null, "00012", "NOVA PRIME SERVICOS LTDA", "65563987000106",
                        "AV PRESIDENTE ANTONIO CARLOS", "8100", "SAO LUIZ", "31270672", "BELO HORIZONTE", "MG", null),
                new Company(null, "00011", "NOVA BASE SERVICOS LTDA", "64887499000183",
                        "RUA SANTA RITA DURAO", "444", "SAVASSI", "30140111", "BELO HORIZONTE", "MG", "SALA 01")
        );

        companyRepository.saveAll(companies);

        System.out.println("========================================");
        System.out.println("  " + companies.size() + " EMPRESAS CADASTRADAS (seed inicial)");
        System.out.println("========================================");
    }
}
