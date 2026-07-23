package com.Accessus.Accessus.services;

import com.Accessus.Accessus.dto.line.CreateLineDto;
import com.Accessus.Accessus.dto.line.LineImportResultDto;
import com.Accessus.Accessus.dto.line.ResponseLineDto;
import com.Accessus.Accessus.entities.Employee;
import com.Accessus.Accessus.entities.Line;
import com.Accessus.Accessus.enums.LineStatus;
import com.Accessus.Accessus.enums.LineType;
import com.Accessus.Accessus.repositories.EmployeeRepository;
import com.Accessus.Accessus.repositories.LineRepository;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.text.Normalizer;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class LineService {
    @Autowired
    LineRepository lineRepository;

    @Autowired
    EmployeeRepository employeeRepository;

    @Autowired
    LogsService logsService;

    public Page<ResponseLineDto> findAll(LineStatus status, Pageable pageable) {
        Page<Line> page = status != null
                ? lineRepository.findByStatus(status, pageable)
                : lineRepository.findAll(pageable);
        return page.map(this::toDto);
    }

    public Page<ResponseLineDto> search(String term, Pageable pageable) {
        return lineRepository.search(term.trim(), pageable).map(this::toDto);
    }

    public long count(LineStatus status) {
        return status != null ? lineRepository.countByStatus(status) : lineRepository.count();
    }

    public ResponseLineDto findById(Long id) {
        Line line = lineRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Linha não encontrada"));
        return toDto(line);
    }

    @Transactional
    public ResponseLineDto create(CreateLineDto dto) {
        if (lineRepository.findByNumber(dto.number()).isPresent()) {
            throw new RuntimeException("Já existe uma linha cadastrada com esse número");
        }

        if (lineRepository.findByIccid(dto.iccid()).isPresent()) {
            throw new RuntimeException("ICCID já cadastrado");
        }

        Line line = new Line();
        line.setNumber(dto.number());
        line.setIccid(dto.iccid());
        line.setType(dto.type());
        line.setNotes(dto.notes());
        line.setStatus(LineStatus.AVAILABLE);
        lineRepository.save(line);

        logsService.createLog("Cadastrou a linha " + line.getNumber() + ", ICCID " + line.getIccid());

        return toDto(line);
    }

    @Transactional
    public ResponseLineDto link(Long lineId, Long employeeId) {
        Line line = lineRepository.findById(lineId)
                .orElseThrow(() -> new RuntimeException("Linha não encontrada"));

        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Funcionário não encontrado"));

        line.setEmployee(employee);
        line.setStatus(LineStatus.IN_USE);
        lineRepository.save(line);

        logsService.createLog("Vinculou a linha " + line.getNumber() + " ao funcionário " + employee.getName());

        return toDto(line);
    }

    @Transactional
    public ResponseLineDto unlink(Long lineId) {
        Line line = lineRepository.findById(lineId)
                .orElseThrow(() -> new RuntimeException("Linha não encontrada"));

        Employee employee = line.getEmployee();
        if (employee == null) {
            throw new RuntimeException("Operação não permitida — linha não está vinculada a nenhum funcionário");
        }

        line.setEmployee(null);
        line.setStatus(LineStatus.AVAILABLE);
        lineRepository.save(line);

        logsService.createLog("Desvinculou a linha " + line.getNumber() + " do funcionário " + employee.getName());

        return toDto(line);
    }

    // "Em uso" só é alcançável vinculando um funcionário (ver link() acima) — daqui
    // só se muda pra AVAILABLE/REACTIVATE/UNAVAILABLE, e isso sempre solta o
    // funcionário atual, se houver (não faz sentido a linha continuar "com alguém"
    // e o status dizer outra coisa)
    @Transactional
    public ResponseLineDto updateStatus(Long lineId, LineStatus status) {
        Line line = lineRepository.findById(lineId)
                .orElseThrow(() -> new RuntimeException("Linha não encontrada"));

        if (status == LineStatus.IN_USE) {
            throw new RuntimeException("Operação não permitida — o status Em uso só pode ser definido vinculando um funcionário");
        }

        line.setEmployee(null);
        line.setStatus(status);
        lineRepository.save(line);

        logsService.createLog("Alterou o status da linha " + line.getNumber() + " para " + status);

        return toDto(line);
    }

    @Transactional
    public ResponseLineDto updateNotes(Long lineId, String notes) {
        Line line = lineRepository.findById(lineId)
                .orElseThrow(() -> new RuntimeException("Linha não encontrada"));

        line.setNotes(notes);
        lineRepository.save(line);

        logsService.createLog("Alterou as observações da linha " + line.getNumber());

        return toDto(line);
    }

    @Transactional
    public void delete(Long lineId) {
        Line line = lineRepository.findById(lineId)
                .orElseThrow(() -> new RuntimeException("Linha não encontrada"));

        if (line.getEmployee() != null) {
            throw new RuntimeException("Operação não permitida — desvincule a linha do funcionário antes de removê-la");
        }

        lineRepository.delete(line);

        logsService.createLog("Removeu a linha " + line.getNumber());
    }

    private ResponseLineDto toDto(Line line) {
        return new ResponseLineDto(
                line.getId(),
                line.getNumber(),
                line.getIccid(),
                line.getType(),
                line.getStatus(),
                line.getNotes(),
                line.getEmployee() != null ? line.getEmployee().getName() : null,
                line.getEmployee() != null ? line.getEmployee().getId() : null
        );
    }

    // ============================================================================
    // TEMPORÁRIO — bloco inteiro só para a migração única da planilha legada
    // ("Gestão de linhas e aparelhos.xlsx", aba "linhas_vivo"). Depois que a carga
    // inicial for feita e conferida, apagar: este método, os 3 helpers privados
    // logo abaixo dele (cellToString, formatPhoneNumber, normalizeName), o DTO
    // LineImportResultDto e o endpoint POST /lines/import-legacy no controller.
    // ============================================================================
    @Transactional
    public LineImportResultDto importLegacySpreadsheet(MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("Arquivo vazio");
        }

        try (InputStream is = file.getInputStream();
             XSSFWorkbook workbook = new XSSFWorkbook(is)) {

            Sheet sheet = workbook.getSheet("linhas_vivo");
            if (sheet == null) {
                throw new RuntimeException("Aba 'linhas_vivo' não encontrada na planilha enviada");
            }

            Row header = sheet.getRow(0);
            if (header == null || !cellToString(header.getCell(0)).equalsIgnoreCase("CHIP")) {
                throw new RuntimeException("Formato de planilha inesperado — a aba 'linhas_vivo' deveria começar com a coluna CHIP");
            }

            Map<String, List<Employee>> employeesByName = employeeRepository.findAll().stream()
                    .collect(Collectors.groupingBy(e -> normalizeName(e.getName())));

            // Observações que só repetem o que o status/nome já diz — não vale a pena
            // duplicar no campo notes
            Set<String> obsIgnoradas = Set.of("DISPONIVEL", "REATIVAR", "RETIVAR", "DYSRUP");

            int created = 0, updated = 0, inUse = 0, available = 0, reactivate = 0, unavailable = 0;

            for (int r = 1; r <= sheet.getLastRowNum(); r++) {
                Row row = sheet.getRow(r);
                if (row == null) continue;

                String chip = cellToString(row.getCell(0));
                String numeroDigits = cellToString(row.getCell(1));
                String usuarioRaw = cellToString(row.getCell(2));
                String obsRaw = cellToString(row.getCell(5));

                if (numeroDigits.isBlank()) continue;

                String number = formatPhoneNumber(numeroDigits);
                boolean isEsim = chip.equalsIgnoreCase("ESIM");
                String iccid = isEsim ? null : chip;
                LineType type = isEsim ? LineType.ESIM : LineType.CHIP;
                String usuarioNormalizado = normalizeName(usuarioRaw);

                LineStatus status;
                Employee employee = null;
                String notes = null;

                if (usuarioNormalizado.equals("DISPONIVEL")) {
                    status = LineStatus.AVAILABLE;
                } else if (usuarioNormalizado.equals("REATIVAR") || usuarioNormalizado.equals("RETIVAR")) {
                    status = LineStatus.REACTIVATE;
                } else {
                    List<Employee> candidates = employeesByName.getOrDefault(usuarioNormalizado, List.of());
                    if (candidates.size() == 1) {
                        employee = candidates.get(0);
                        status = LineStatus.IN_USE;
                    } else {
                        status = LineStatus.UNAVAILABLE;
                        notes = usuarioRaw;
                    }
                }

                // Só copia a Observação da planilha se ainda não tem nota definida (o caso
                // UNAVAILABLE acima já usou esse espaço pro nome não casado) e se a
                // observação não for só um rótulo redundante (obsIgnoradas)
                if (notes == null && !obsRaw.isBlank() && !obsIgnoradas.contains(normalizeName(obsRaw))) {
                    notes = obsRaw;
                }

                boolean isNew = lineRepository.findByNumber(number).isEmpty();
                Line line = lineRepository.findByNumber(number).orElseGet(Line::new);
                line.setNumber(number);
                line.setIccid(iccid);
                line.setType(type);
                line.setEmployee(employee);
                line.setStatus(status);
                line.setNotes(notes);
                lineRepository.save(line);

                if (isNew) created++; else updated++;
                switch (status) {
                    case IN_USE -> inUse++;
                    case AVAILABLE -> available++;
                    case REACTIVATE -> reactivate++;
                    case UNAVAILABLE -> unavailable++;
                }
            }

            logsService.createLog("Importou a planilha legada de linhas (" + created + " criadas, " + updated
                    + " atualizadas, " + unavailable + " indisponíveis)");

            return new LineImportResultDto(created, updated, inUse, available, reactivate, unavailable);
        }
    }

    // TEMPORÁRIO — helper só usado pelo importLegacySpreadsheet acima
    private String cellToString(Cell cell) {
        if (cell == null) return "";
        return switch (cell.getCellType()) {
            case STRING -> cell.getStringCellValue().trim();
            case NUMERIC -> String.valueOf((long) cell.getNumericCellValue());
            default -> "";
        };
    }

    // TEMPORÁRIO — helper só usado pelo importLegacySpreadsheet acima
    private String formatPhoneNumber(String digits) {
        if (digits.length() != 11) return digits;
        return "(" + digits.substring(0, 2) + ") " + digits.substring(2, 7) + "-" + digits.substring(7);
    }

    // TEMPORÁRIO — helper só usado pelo importLegacySpreadsheet acima
    private String normalizeName(String valor) {
        if (valor == null) return "";
        String semAcento = Normalizer.normalize(valor, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "");
        return semAcento.replace(' ', ' ')
                .trim()
                .toUpperCase()
                .replaceAll("\\s+", " ");
    }
}
