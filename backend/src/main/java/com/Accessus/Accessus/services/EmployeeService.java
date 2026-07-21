package com.Accessus.Accessus.services;

import com.Accessus.Accessus.dto.device.ResponseDeviceDto;
import com.Accessus.Accessus.dto.employee.CreateEmployeeDto;
import com.Accessus.Accessus.dto.employee.ResponseEmployeeDto;
import com.Accessus.Accessus.dto.employee.SummarySaveDto;
import com.Accessus.Accessus.entities.Company;
import com.Accessus.Accessus.entities.Device;
import com.Accessus.Accessus.entities.Employee;
import com.Accessus.Accessus.enums.EmployeeProfile;
import com.Accessus.Accessus.enums.EmployeeStatus;
import com.Accessus.Accessus.repositories.CompanyRepository;
import com.Accessus.Accessus.repositories.EmployeeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class EmployeeService {

    private static final Map<String, EmployeeStatus> STATUS_POR_TEXTO = Map.of(
            "Ativo", EmployeeStatus.ATIVO,
            "Em Contrato de Experiência", EmployeeStatus.ATIVO,
            "Férias", EmployeeStatus.FERIAS,
            "Férias Vencidas", EmployeeStatus.ATIVO,
            "Afastado", EmployeeStatus.AFASTADO,
            "Atestado Médico Vencido", EmployeeStatus.ATIVO,
            "Aviso Prévio", EmployeeStatus.ATIVO,
            "Demitido", EmployeeStatus.DEMITIDO
    );

    private static final String CODIGO_PRESTADOR_SERVICO = "00009";
    private static final String PREFIXO_EQUIPE_EXCLUSIVOS = "Z - Exclusivos";

    @Autowired
    EmployeeRepository employeeRepository;

    @Autowired
    CompanyRepository companyRepository;

    @Autowired
    ExcelService excelService;

    public Page<ResponseEmployeeDto> findAll(EmployeeStatus status, Boolean ativos, Boolean hasDevice, Pageable pageable) {
        if (Boolean.TRUE.equals(ativos)) {
            List<EmployeeStatus> statusAtivos = Arrays.stream(EmployeeStatus.values())
                    .filter(EmployeeStatus::isActive)
                    .toList();
            return employeeRepository.findByStatusIn(statusAtivos, pageable).map(this::toDto);
        }

        if (status != null) {
            return employeeRepository.findByStatus(status, pageable).map(this::toDto);
        }

        if (Boolean.TRUE.equals(hasDevice)) {
            return employeeRepository.findByDevicesIsNotEmpty(pageable).map(this::toDto);
        }

        if (Boolean.FALSE.equals(hasDevice)) {
            return employeeRepository.findByDevicesIsEmpty(pageable).map(this::toDto);
        }

        return employeeRepository.findAll(pageable).map(this::toDto);
    }

    public ResponseEmployeeDto findById(Long id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Funcionário não encontrado"));

        return toDto(employee);
    }

    public long count(EmployeeStatus status, Boolean ativos) {
        if (Boolean.TRUE.equals(ativos)) {
            List<EmployeeStatus> statusAtivos = Arrays.stream(EmployeeStatus.values())
                    .filter(EmployeeStatus::isActive)
                    .toList();
            return employeeRepository.countByStatusIn(statusAtivos);
        }

        if (status != null) {
            return employeeRepository.countByStatus(status);
        }

        return employeeRepository.count();
    }

    @Transactional
    public SummarySaveDto importSave(MultipartFile file) throws IOException {
        List<Map<String, String>> data = excelService.converter(file);

        Map<String, Employee> existentesPorCpf = employeeRepository.findAll().stream()
                .collect(Collectors.toMap(Employee::getCpf, e -> e));

        Map<String, Company> empresasPorCodigo = companyRepository.findAll().stream()
                .collect(Collectors.toMap(Company::getCode, c -> c));

        List<Employee> forSave = new ArrayList<>();

        int updated = 0;
        int created = 0;

        for (Map<String, String> linha : data) {
            String cpf = linha.get("CPF");
            if (cpf == null || cpf.isBlank()) {
                throw new IllegalArgumentException("CPF vazio ou ausente na planilha (linha: " + linha.get("Nome do Funcionário") + ")");
            }

            Employee employee = existentesPorCpf.get(cpf);

            if (employee == null) {
                employee = new Employee();
                employee.setCpf(cpf);
                created++;
            } else {
                updated++;
            }

            String situacao = linha.get("Situação Funcionário");
            EmployeeStatus status = STATUS_POR_TEXTO.get(situacao);
            if (status == null) {
                throw new IllegalArgumentException("Situação de funcionário desconhecida: " + situacao);
            }

            String codigoEmpresa = linha.get("Empresa");
            String departamento = linha.get("Departamento");
            boolean equipeExclusivos = departamento != null && departamento.startsWith(PREFIXO_EQUIPE_EXCLUSIVOS);

            employee.setCompany(empresasPorCodigo.get(codigoEmpresa));
            employee.setProfile(CODIGO_PRESTADOR_SERVICO.equals(codigoEmpresa) || equipeExclusivos
                    ? EmployeeProfile.SERVICE_PROVIDER
                    : EmployeeProfile.EMPLOYEE);
            employee.setDepartment(departamento);
            employee.setName(linha.get("Nome do Funcionário"));
            employee.setPosition(linha.get("Função"));
            employee.setState(linha.get("UF"));
            employee.setCity(linha.get("Cidade"));
            employee.setAdmissionDate(parseData(linha.get("Admissão")));
            employee.setStatus(status);
            employee.setLeaveStart(parseData(linha.get("Início Afastamento")));
            employee.setLeaveEnd(parseData(linha.get("Fim Afastamento")));
            employee.setVacationStart(parseData(linha.get("Início Férias")));
            employee.setVacationEnd(parseData(linha.get("Fim Férias")));
            employee.setLastImportedAt(LocalDateTime.now());
            employee.setImportManaged(true);

            forSave.add(employee);
        }

        Set<String> cpfsNaPlanilha = data.stream()
                .map(linha -> linha.get("CPF"))
                .collect(Collectors.toSet());

        int flaggedForReview = 0;

        for (Employee existente : existentesPorCpf.values()) {
            if (!existente.isImportManaged()) {
                continue;
            }

            boolean sumiuDaPlanilha = !cpfsNaPlanilha.contains(existente.getCpf());
            boolean precisaRevisao = existente.getStatus() != EmployeeStatus.DEMITIDO
                    && existente.getStatus() != EmployeeStatus.PENDENTE_REVISAO;

            if (sumiuDaPlanilha && precisaRevisao) {
                existente.setStatus(EmployeeStatus.PENDENTE_REVISAO);
                forSave.add(existente);
                flaggedForReview++;
            }

        }

        employeeRepository.saveAll(forSave);

        return new SummarySaveDto(updated, created, flaggedForReview);
    }

    private LocalDate parseData(String valor) {
        return valor.isBlank() ? null : LocalDate.parse(valor, DateTimeFormatter.ofPattern("dd/MM/yyyy"));
    }

    public ResponseEmployeeDto changeStatus(Long id, EmployeeStatus status) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Funcionário não encontrado"));

        employee.setStatus(status);
        employeeRepository.save(employee);

        return toDto(employee);
    }

    @Transactional
    public ResponseEmployeeDto create(CreateEmployeeDto dto) {
        if (employeeRepository.findByCpf(dto.cpf()).isPresent()) {
            throw new IllegalArgumentException("Já existe funcionário com esse CPF");
        }

        // Cadastro manual nunca escolhe empresa — sócio e prestador de serviço
        // manual caem sempre no mesmo código (00009), o mesmo usado pra marcar
        // freelancer na importação.
        Company company = companyRepository.findByCode(CODIGO_PRESTADOR_SERVICO)
                .orElseThrow(() -> new RuntimeException("Empresa padrão (00009) não encontrada"));

        Employee employee = new Employee();
        employee.setCompany(company);
        employee.setCpf(dto.cpf());
        employee.setName(dto.name());
        employee.setProfile(dto.profile());
        employee.setDepartment(dto.department());
        employee.setPosition(dto.position());
        employee.setState(dto.state());
        employee.setCity(dto.city());
        employee.setAdmissionDate(dto.admissionDate());
        employee.setStatus(dto.status() != null ? dto.status() : EmployeeStatus.ATIVO);
        employee.setImportManaged(false);

        employeeRepository.save(employee);

        return toDto(employee);
    }

    public List<Company> listCompanies() {
        return companyRepository.findAll();
    }

    public void delete(Long id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Funcionário não encontrado"));

        if (employee.isImportManaged())
            throw new IllegalArgumentException("Funcionários importados não podem ser deletados.");

        employeeRepository.delete(employee);
    }

    public Page<ResponseEmployeeDto> search(String term, Pageable pageable) {
        term = term.trim();

        if (term.matches("\\d+")) {
            return employeeRepository.findByCpfContaining(term, pageable).map(this::toDto);
        }

        return employeeRepository.findByNameContainingIgnoreCase(term, pageable).map(this::toDto);
    }

    public byte[] export() throws IOException {
        List<Employee> employees = employeeRepository.findAll();

        List<String> colunas = List.of("Nome", "CPF", "Empresa", "Departamento", "Cargo", "Cidade", "UF", "Status", "Admissão");

        List<List<String>> linhas = employees.stream()
                .map(e -> Arrays.asList(
                        e.getName(),
                        e.getCpf(),
                        e.getCompany() != null ? e.getCompany().getName() : "",
                        e.getDepartment(),
                        e.getPosition(),
                        e.getCity(),
                        e.getState(),
                        e.getStatus().name(),
                        e.getAdmissionDate() != null ? e.getAdmissionDate().toString() : ""
                ))
                .toList();

        return excelService.gerar("Funcionários", colunas, linhas);
    }

    public ResponseEmployeeDto toDto(Employee employee) {
        return new ResponseEmployeeDto(
                employee.getId(),
                employee.getCompany(),
                employee.getDepartment(),
                employee.getCpf(),
                employee.getName(),
                employee.getPosition(),
                employee.getState(),
                employee.getCity(),
                employee.getAdmissionDate(),
                employee.getStatus(),
                employee.getProfile(),
                employee.getLeaveStart(),
                employee.getLeaveEnd(),
                employee.getVacationStart(),
                employee.getVacationEnd(),
                employee.isImportManaged(),
                employee.getDevices().stream().map(this::toDeviceDto).toList()
        );
    }

    private ResponseDeviceDto toDeviceDto(Device device) {
        return new ResponseDeviceDto(
                device.getId(),
                device.getPulsusId(),
                device.getManufacturer(),
                device.getModel(),
                device.getSerialNumber(),
                device.getGroup(),
                device.getImei1(),
                device.getImei2(),
                device.getTagDevice(),
                device.getSituacao(),
                device.getEmployee() != null ? device.getEmployee().getName() : null,
                device.getEmployee() != null ? device.getEmployee().getId() : null
        );
    }
}
