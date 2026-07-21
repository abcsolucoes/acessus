package com.Accessus.Accessus.services;

import com.Accessus.Accessus.dto.device.ResponseDeviceDto;
import com.Accessus.Accessus.dto.history.ResponseHistoryDto;
import com.Accessus.Accessus.entities.Device;
import com.Accessus.Accessus.entities.DeviceHistory;
import com.Accessus.Accessus.entities.Employee;
import com.Accessus.Accessus.enums.HistoryAction;
import com.Accessus.Accessus.repositories.DeviceHistoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class DeviceHistoryService {
    @Autowired
    DeviceHistoryRepository deviceHistoryRepository;

    @Autowired
    EmployeeService employeeService;

    public Page<ResponseHistoryDto> findAll(Pageable pageable) {
        return deviceHistoryRepository.findAll(pageable).map(this::toDto);
    }

    public void createNewHistory(Employee employee, Device device, HistoryAction historyAction) {
        DeviceHistory history = new DeviceHistory();

        history.setDevice(device);
        history.setEmployee(employee);
        history.setActionType(historyAction);
        history.setCreatedAt(LocalDateTime.now());

        deviceHistoryRepository.save(history);
    }

    public Page<ResponseHistoryDto> findByEmployee(Long employeeId, Pageable pageable) {
        return deviceHistoryRepository.findByEmployeeIdOrderByCreatedAtDesc(employeeId, pageable).map(this::toDto);
    }

    public Page<ResponseHistoryDto> findByDevice(Long deviceId, Pageable pageable) {
        return deviceHistoryRepository.findByDeviceIdOrderByCreatedAtDesc(deviceId, pageable).map(this::toDto);
    }

    public ResponseHistoryDto toDto(DeviceHistory deviceHistory) {
        Device device = deviceHistory.getDevice();
        return new ResponseHistoryDto(
                deviceHistory.getId(),
                toDeviceDto(device),
                employeeService.toDto(deviceHistory.getEmployee()),
                deviceHistory.getActionType(),
                deviceHistory.getCreatedAt()
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
