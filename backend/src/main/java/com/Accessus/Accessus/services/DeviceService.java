package com.Accessus.Accessus.services;

import com.Accessus.Accessus.dto.device.ResponseDeviceDto;
import com.Accessus.Accessus.dto.employee.ResponseEmployeeDto;
import com.Accessus.Accessus.entities.Device;
import com.Accessus.Accessus.entities.Employee;
import com.Accessus.Accessus.enums.DeviceSituacao;
import com.Accessus.Accessus.enums.HistoryAction;
import com.Accessus.Accessus.repositories.DeviceRepository;
import com.Accessus.Accessus.repositories.EmployeeRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.Normalizer;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class DeviceService {
    private static final Logger log = LoggerFactory.getLogger(DeviceService.class);

    @Autowired
    PulsusService pulsusService;

    @Autowired
    DeviceRepository deviceRepository;

    @Autowired
    EmployeeRepository employeeRepository;

    @Autowired
    LogsService logsService;

    @Autowired
    DeviceHistoryService deviceHistoryService;

    public Page<ResponseDeviceDto> findAll(DeviceSituacao situacao, Pageable pageable) {
        Page<Device> page = situacao != null
                ? deviceRepository.findBySituacao(situacao, pageable)
                : deviceRepository.findAll(pageable);
        return page.map(this::toDto);
    }

    @Transactional
    public void syncDevices() {
        List<Map<String, Object>> pulsusDevices = pulsusService.getDevices();

        Map<Long, Device> existentesPorPulsusId = deviceRepository.findAll().stream()
                .collect(Collectors.toMap(Device::getPulsusId, d -> d));

        Map<String, List<Employee>> employeesByName = employeeRepository.findAll().stream()
                .collect(Collectors.groupingBy(e -> normalizarNome(e.getName())));

        List<Device> forSave = new ArrayList<>();

        for (Map<String, Object> raw : pulsusDevices) {
            Long pulsusId = ((Number) raw.get("id")).longValue();

            Device device = existentesPorPulsusId.get(pulsusId);
            if (device == null) {
                device = new Device();
                device.setPulsusId(pulsusId);
            }

            device.setManufacturer((String) raw.get("manufacturer"));
            device.setModel((String) raw.get("model"));
            device.setSerialNumber((String) raw.get("serial_number"));
            device.setGroup((String) raw.get("group_name"));

            @SuppressWarnings("unchecked")
            List<String> imeis = (List<String>) raw.get("imeis");
            device.setImei1(imeis != null && imeis.size() > 0 ? imeis.get(0) : null);
            device.setImei2(imeis != null && imeis.size() > 1 ? imeis.get(1) : null);

            String nomeCompleto = extrairNomeCompleto(raw);

            // Marcador de texto no nome (ex: "A12 MANUTENCAO", "A15 DISPONIVEL") — quando
            // presente, não tenta casar com funcionário, o aparelho não está com ninguém
            DeviceSituacao situacao;
            Employee employee = null;

            if (nomeCompleto.contains("MANUTENCAO")) {
                situacao = DeviceSituacao.MANUTENCAO;
            } else if (nomeCompleto.contains("DISPONIVEL")) {
                situacao = DeviceSituacao.DISPONIVEL;
            } else {
                employee = matchEmployee(nomeCompleto, pulsusId, employeesByName);
                situacao = employee != null ? DeviceSituacao.EM_USO : DeviceSituacao.SEM_USUARIO_IDENTIFICADO;
            }

            device.setSituacao(situacao);
            device.setEmployee(employee);
            device.setTagDevice(extrairTag(raw));

            forSave.add(device);
        }

        deviceRepository.saveAll(forSave);
    }

    public Page<ResponseDeviceDto> search(String term, Pageable pageable) {
        return deviceRepository.search(term.trim(), pageable).map(this::toDto);
    }

    // DeviceService.java
    @Transactional
    public ResponseDeviceDto vincular(Long deviceId, Long employeeId) {
        Device device = deviceRepository.findById(deviceId)
                .orElseThrow(() -> new RuntimeException("Aparelho não encontrado"));
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Funcionário não encontrado"));

        String[] partes = employee.getName().trim().split(" ", 2);
        Map<String, Object> body = Map.of(
                "user_attributes", Map.of(
                        "first_name", partes[0],
                        "last_name", partes.length > 1 ? partes[1] : "",
                        "identifier", device.getTagDevice()
                )
        );
        pulsusService.updateDevice(device.getPulsusId(), body);

        device.setEmployee(employee);
        device.setSituacao(DeviceSituacao.EM_USO);
        deviceRepository.save(device);

        logsService.createLog("Vinculou aparelho " + device.getTagDevice() + " (" + device.getModel() + ") ao funcionário " + employee.getName());

        deviceHistoryService.createNewHistory(employee, device, HistoryAction.ALLOCATION);

        return toDto(device);
    }

    public ResponseDeviceDto toDto(Device device) {
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

    public ResponseDeviceDto findById(Long id) {
        Device device = deviceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Aparelho não encontrado"));

        return toDto(device);
    }

    @SuppressWarnings("unchecked")
    private String extrairNomeCompleto(Map<String, Object> raw) {
        Map<String, Object> user = (Map<String, Object>) raw.get("user");
        if (user == null) return "";

        String firstName = (String) user.get("first_name");
        String lastName = (String) user.get("last_name");
        return normalizarNome(
                (firstName != null ? firstName : "") + " " + (lastName != null ? lastName : "")
        );
    }

    @SuppressWarnings("unchecked")
    private String extrairTag(Map<String, Object> raw) {
        Map<String, Object> user = (Map<String, Object>) raw.get("user");
        return user != null ? (String) user.get("identifier") : null;
    }

    private Employee matchEmployee(String nomeCompleto, Long pulsusId, Map<String, List<Employee>> employeesByName) {
        if (nomeCompleto.isBlank()) return null;

        List<Employee> candidatos = employeesByName.getOrDefault(nomeCompleto, List.of());

        if (candidatos.size() == 1) {
            return candidatos.get(0);
        }
        if (candidatos.size() > 1) {
            log.warn("Mais de um funcionário com o nome '{}' — associação do device {} precisa ser manual", nomeCompleto, pulsusId);
        }
        return null;
    }

    private String normalizarNome(String valor) {
        if (valor == null) return "";
        String semAcento = Normalizer.normalize(valor, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "");
        //   (espaço nao separavel) nao e reconhecido por trim()/\s do Java —
        // sobrevive a normalizacao e quebra o match se vier de um copy/paste da planilha
        return semAcento.replace(' ', ' ')
                .trim()
                .toUpperCase()
                .replaceAll("\\s+", " ");
    }
}
