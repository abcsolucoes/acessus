package com.Accessus.Accessus.controllers;

import com.Accessus.Accessus.dto.history.ResponseHistoryDto;
import com.Accessus.Accessus.services.DeviceHistoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/deviceHistory")
public class DeviceHistoryController {

    @Autowired
    DeviceHistoryService deviceHistoryService;

    @GetMapping
    public ResponseEntity<Page<ResponseHistoryDto>> findAll(@PageableDefault(size = 20) Pageable pageable) {
        Page<ResponseHistoryDto> deviceHistoryPage = deviceHistoryService.findAll(pageable);
        return ResponseEntity.ok(deviceHistoryPage);
    }

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<Page<ResponseHistoryDto>> findByEmployee(
            @PathVariable Long employeeId,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return ResponseEntity.ok(deviceHistoryService.findByEmployee(employeeId, pageable));
    }

    @GetMapping("/device/{deviceId}")
    public ResponseEntity<Page<ResponseHistoryDto>> findByDevice(
            @PathVariable Long deviceId,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return ResponseEntity.ok(deviceHistoryService.findByDevice(deviceId, pageable));
    }
}
