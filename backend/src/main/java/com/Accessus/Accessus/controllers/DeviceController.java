package com.Accessus.Accessus.controllers;

import com.Accessus.Accessus.dto.device.ResponseDeviceDto;
import com.Accessus.Accessus.dto.device.VincularDeviceDto;
import com.Accessus.Accessus.enums.DeviceSituacao;
import com.Accessus.Accessus.services.DeviceService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/devices")
public class DeviceController {
    @Autowired
    DeviceService deviceService;

    @GetMapping
    public ResponseEntity<Page<ResponseDeviceDto>> findAll(
            @RequestParam(required = false) DeviceSituacao situacao,
            @PageableDefault(size = 20, sort = "id") Pageable pageable) {
        return ResponseEntity.ok(deviceService.findAll(situacao, pageable));
    }

    @PostMapping("/sync")
    public ResponseEntity<Void> syncDevices() {
        deviceService.syncDevices();
        return ResponseEntity.ok().build();
    }

    @GetMapping("/search")
    public ResponseEntity<Page<ResponseDeviceDto>> search(
            @RequestParam String term,
            @PageableDefault(size = 20, sort = "id") Pageable pageable) {
        return ResponseEntity.ok(deviceService.search(term, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ResponseDeviceDto> findById(@PathVariable Long id) {
        return ResponseEntity.ok(deviceService.findById(id));
    }

    @PatchMapping("/{id}/vincular")
    public ResponseEntity<ResponseDeviceDto> vincular(@PathVariable Long id, @RequestBody @Valid VincularDeviceDto dto) {
        return ResponseEntity.ok(deviceService.vincular(id, dto.employeeId()));
    }
}
