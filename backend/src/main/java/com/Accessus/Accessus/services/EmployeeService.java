package com.Accessus.Accessus.services;

import com.Accessus.Accessus.dto.employee.*;
import com.Accessus.Accessus.entities.Company;
import com.Accessus.Accessus.entities.Employee;
import com.Accessus.Accessus.entities.EmployeeImportLog;
import com.Accessus.Accessus.enums.EmployeeStatus;
import com.Accessus.Accessus.repositories.CompanyRepository;
import com.Accessus.Accessus.repositories.EmployeeImportLogRepository;
import com.Accessus.Accessus.repositories.EmployeeRepository;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.*;

@Service
public class EmployeeService {

    // Situação Funcionário da planilha de origem -> status interno. Tudo que não é
    // Demitido conta como vínculo ativo pro negócio (ver EmployeeStatus.isActive).
    private static final Map<String, EmployeeStatus> STATUS_MAP = Map.of(
            "Ativo", EmployeeStatus.ATIVO,
            "Em Contrato de Experiência", EmployeeStatus.EXPERIENCIA,
            "Férias", EmployeeStatus.FERIAS,
            "Férias Vencidas", EmployeeStatus.FERIAS_VENCIDAS,
            "Afastado", EmployeeStatus.AFASTADO,
            "Atestado Médico Vencido", EmployeeStatus.ATESTADO_MEDICO_VENCIDO,
            "Aviso Prévio", EmployeeStatus.AVISO_PREVIO,
            "Demitido", EmployeeStatus.DEMITIDO
    );

    @Autowired
    private CompanyRepository companyRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private EmployeeImportLogRepository employeeImportLogRepository;

    @Transactional
    public ImportEmployeeSummaryDto importEmployees(MultipartFile file) throws Exception {
        List<ImportEmployeeDto> rows = parse(file);
        ImportEmployeeResultDto treated = treat(rows);
        ImportEmployeeSummaryDto summary = persist(treated.valid(), treated.errors().size());

        EmployeeImportLog log = new EmployeeImportLog();
        log.setImportedAt(LocalDateTime.now());
        log.setCreated(summary.created());
        log.setUpdated(summary.updated());
        log.setErrors(summary.errors());
        log.setFlaggedForReview(summary.flaggedForReview());
        employeeImportLogRepository.save(log);

        return summary;
    }

    @Transactional(readOnly = true)
    public Page<EmployeeDto> findAll(EmployeeStatus status, Pageable pageable) {
        Page<Employee> page = status == null
                ? employeeRepository.findAll(pageable)
                : employeeRepository.findByStatus(status, pageable);

        return page.map(this::toDto);
    }

    // Ajuste manual de status: cobre os casos que a importação sozinha não resolve —
    // confirmar um PENDENTE_REVISAO como DEMITIDO, reverter um PENDENTE_REVISAO que na
    // verdade segue ativo (sumiu da planilha por engano), ou reativar um DEMITIDO que
    // foi recontratado antes de ele reaparecer numa importação futura.
    @Transactional
    public EmployeeDto updateStatus(Long id, String rawStatus) {
        EmployeeStatus status = parseStatus(rawStatus);

        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Funcionário não encontrado"));

        employee.setStatus(status);
        employeeRepository.save(employee);

        return toDto(employee);
    }

    private EmployeeStatus parseStatus(String rawStatus) {
        try {
            return EmployeeStatus.valueOf(rawStatus.trim().toUpperCase());
        } catch (IllegalArgumentException | NullPointerException e) {
            throw new IllegalArgumentException("Status inválido: " + rawStatus);
        }
    }

    private EmployeeDto toDto(Employee employee) {
        return new EmployeeDto(
                employee.getId(),
                employee.getCpf(),
                employee.getName(),
                employee.getDepartment(),
                employee.getPosition(),
                employee.getState(),
                employee.getCity(),
                employee.getAdmissionDate(),
                employee.getStatus().name(),
                employee.getCompany().getName()
        );
    }

    public List<ImportEmployeeDto> parse(MultipartFile file) throws Exception {
        List<ImportEmployeeDto> rows = new ArrayList<>();

        try (Workbook workbook = openAsPoiWorkbook(file)) {
            Sheet sheet = workbook.getSheetAt(0);

            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null) continue;

                rows.add(new ImportEmployeeDto(
                        readString(row.getCell(0)),
                        readString(row.getCell(1)),
                        readString(row.getCell(2)),
                        readString(row.getCell(3)),
                        readString(row.getCell(4)),
                        readString(row.getCell(5)),
                        readString(row.getCell(6)),
                        readDate(row.getCell(7)),
                        readString(row.getCell(8)),
                        readDate(row.getCell(9)),
                        readDate(row.getCell(10)),
                        readDate(row.getCell(11)),
                        readDate(row.getCell(12))
                ));
            }
        }

        return rows;
    }

    // Único ponto de decisão: .xls "torto" passa pelo conversor; o resto o POI lê direto.
    private Workbook openAsPoiWorkbook(MultipartFile file) throws Exception {
        String filename = file.getOriginalFilename();
        if (filename != null && filename.toLowerCase().endsWith(".xls")) {
            return convertXlsToPoiWorkbook(file);
        }
        return WorkbookFactory.create(file.getInputStream());
    }

    // Único lugar que toca jxl: lê o .xls legado e devolve um Workbook do POI
    // já preenchido (tudo como texto), pra reaproveitar o resto do código sem mudar nada.
    private Workbook convertXlsToPoiWorkbook(MultipartFile file) throws Exception {
        jxl.Workbook source = jxl.Workbook.getWorkbook(file.getInputStream());
        try {
            jxl.Sheet sourceSheet = source.getSheet(0);
            Workbook target = new XSSFWorkbook();
            Sheet targetSheet = target.createSheet();

            for (int r = 0; r < sourceSheet.getRows(); r++) {
                Row targetRow = targetSheet.createRow(r);
                for (int c = 0; c < sourceSheet.getColumns(); c++) {
                    jxl.Cell sourceCell = sourceSheet.getCell(c, r);
                    String value;

                    if (sourceCell.getType() == jxl.CellType.DATE) {
                        // jxl guarda a data como GMT internamente — usar UTC aqui,
                        // não systemDefault(), senão a data volta 1 dia.
                        value = ((jxl.DateCell) sourceCell).getDate()
                                .toInstant()
                                .atZone(ZoneOffset.UTC)
                                .toLocalDate()
                                .toString(); // já sai em "yyyy-MM-dd"
                    } else {
                        value = sourceCell.getContents();
                    }

                    targetRow.createCell(c).setCellValue(value);
                }
            }

            return target;
        } finally {
            source.close();
        }
    }

    private String readString(Cell cell) {
        if (cell == null) return null;

        return switch (cell.getCellType()) {
            case STRING -> cell.getStringCellValue();
            case NUMERIC -> String.valueOf((long) cell.getNumericCellValue());
            case BLANK -> null;
            default -> cell.toString();
        };
    }

    private LocalDate readDate(Cell cell) {
        if (cell == null || cell.getCellType() == CellType.BLANK) return null;

        if (cell.getCellType() == CellType.STRING) {
            String raw = cell.getStringCellValue().trim();
            if (raw.isEmpty()) return null;
            return LocalDate.parse(raw.substring(0, 10));
        }

        return cell.getLocalDateTimeCellValue().toLocalDate();
    }

    public ImportEmployeeResultDto treat(List<ImportEmployeeDto> rows) {
        List<Employee> valid = new ArrayList<>();
        List<ImportEmployeeErrorDto> errors = new ArrayList<>();
        Set<String> seenCpfs = new HashSet<>();

        for (int i = 0; i < rows.size(); i++) {
            ImportEmployeeDto row = rows.get(i);
            int rowNumber = i + 2; // linha 1 da planilha é o header

            String cnpj = normalizeDigits(row.companyCnpj());
            Optional<Company> company = companyRepository.findByCnpj(cnpj);
            if (company.isEmpty()) {
                errors.add(new ImportEmployeeErrorDto(rowNumber, row.cpf(),
                        "Empresa não encontrada para o CNPJ " + row.companyCnpj()));
                continue;
            }

            String cpf = normalizeDigits(row.cpf());
            if (cpf.length() != 11) {
                errors.add(new ImportEmployeeErrorDto(rowNumber, row.cpf(),
                        "CPF inválido: " + row.cpf()));
                continue;
            }

            if (!seenCpfs.add(cpf)) {
                errors.add(new ImportEmployeeErrorDto(rowNumber, cpf,
                        "CPF duplicado dentro da planilha"));
                continue;
            }

            EmployeeStatus status = STATUS_MAP.get(normalizeText(row.status()));
            if (status == null) {
                errors.add(new ImportEmployeeErrorDto(rowNumber, cpf,
                        "Situação de funcionário desconhecida: " + row.status()));
                continue;
            }

            Employee employee = new Employee();
            employee.setCompany(company.get());
            employee.setCpf(cpf);
            employee.setName(row.name());
            employee.setPosition(normalizeText(row.position()));
            employee.setDepartment(normalizeText(row.department()));
            employee.setState(row.state());
            employee.setCity(row.city());
            employee.setAdmissionDate(row.admissionDate());
            employee.setStatus(status);
            employee.setLeaveStart(row.leaveStart());
            employee.setLeaveEnd(row.leaveEnd());
            employee.setVacationStart(row.vacationStart());
            employee.setVacationEnd(row.vacationEnd());

            valid.add(employee);
        }

        return new ImportEmployeeResultDto(valid, errors);
    }

    private String normalizeDigits(String raw) {
        return raw == null ? "" : raw.replaceAll("\\D", "");
    }

    private String normalizeText(String raw) {
        return raw == null ? null : raw.trim().replaceAll("\\s+", " ");
    }

    private ImportEmployeeSummaryDto persist(List<Employee> employees, int errorCount) {
        int created = 0;
        int updated = 0;
        LocalDateTime now = LocalDateTime.now();

        for (Employee incoming : employees) {
            Employee employee = employeeRepository.findByCpf(incoming.getCpf())
                    .orElseGet(Employee::new);

            boolean isNew = employee.getId() == null;

            employee.setCompany(incoming.getCompany());
            employee.setCpf(incoming.getCpf());
            employee.setName(incoming.getName());
            employee.setPosition(incoming.getPosition());
            employee.setDepartment(incoming.getDepartment());
            employee.setState(incoming.getState());
            employee.setCity(incoming.getCity());
            employee.setAdmissionDate(incoming.getAdmissionDate());
            employee.setStatus(incoming.getStatus());
            employee.setLeaveStart(incoming.getLeaveStart());
            employee.setLeaveEnd(incoming.getLeaveEnd());
            employee.setVacationStart(incoming.getVacationStart());
            employee.setVacationEnd(incoming.getVacationEnd());
            employee.setLastImportedAt(now);

            employeeRepository.save(employee);

            if (isNew) created++;
            else updated++;
        }

        int flaggedForReview = flagMissingEmployees(employees);

        return new ImportEmployeeSummaryDto(created, updated, errorCount, flaggedForReview);
    }

    // A planilha de origem sempre traz todo o quadro ativo — só a lista de
    // demitidos é limitada a 1 mês. Então quem estava cadastrado e não veio
    // nesta importação (e ainda não está DEMITIDO) precisa de revisão manual:
    // pode ser desligamento fora da janela, mudança de empresa/CNPJ ou falha
    // pontual na exportação. Se reaparecer numa importação futura, o status
    // é reclassificado normalmente e a pendência se resolve sozinha.
    private int flagMissingEmployees(List<Employee> importedEmployees) {
        Set<String> importedCpfs = importedEmployees.stream()
                .map(Employee::getCpf)
                .collect(java.util.stream.Collectors.toSet());

        if (importedCpfs.isEmpty()) return 0;

        List<Employee> missing = employeeRepository.findByCpfNotIn(importedCpfs);
        int flagged = 0;

        for (Employee employee : missing) {
            if (employee.getStatus() == EmployeeStatus.DEMITIDO
                    || employee.getStatus() == EmployeeStatus.PENDENTE_REVISAO) {
                continue;
            }
            employee.setStatus(EmployeeStatus.PENDENTE_REVISAO);
            employeeRepository.save(employee);
            flagged++;
        }

        return flagged;
    }

    @Transactional(readOnly = true)
    public EmployeeSummaryDto summary() {
        Map<String, Long> byStatus = new LinkedHashMap<>();
        long total = 0;
        long active = 0;

        for (EmployeeStatus status : EmployeeStatus.values()) {
            long count = employeeRepository.countByStatus(status);
            byStatus.put(status.name(), count);
            total += count;
            if (status.isActive()) active += count;
        }

        return new EmployeeSummaryDto(total, active, byStatus);
    }
}
