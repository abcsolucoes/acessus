package com.Accessus.Accessus.controllers;

import com.Accessus.Accessus.dto.logs.LogsFilterDto;
import com.Accessus.Accessus.dto.logs.ResponseLogsDto;
import com.Accessus.Accessus.services.LogsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/logs")
public class LogsController {

    @Autowired
    LogsService logsService;

    @GetMapping
    public ResponseEntity<Page<ResponseLogsDto>> findAll(
            @RequestParam(required = false) String userName,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            Pageable pageable
    ) {
        LogsFilterDto filter = new LogsFilterDto(userName, startDate, endDate);
        return ResponseEntity.ok(logsService.findAll(filter, pageable));
    }
}
