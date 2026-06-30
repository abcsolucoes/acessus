package com.Accessus.Accessus.services;

import com.Accessus.Accessus.dto.logs.LogsFilterDto;
import com.Accessus.Accessus.dto.logs.ResponseLogsDto;
import com.Accessus.Accessus.entities.Logs;
import com.Accessus.Accessus.entities.User;
import com.Accessus.Accessus.repositories.LogsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.ZoneId;

@Service
public class LogsService {

    @Autowired
    LogsRepository logsRepository;

    @Autowired
    UserService userService;

    @Transactional
    public void createLog(String description) {
        User user = userService.getAuthenticatedUser();

        Logs log = new Logs();
        log.setUser(user);
        log.setDescription(description);
        log.setCreatedAt(LocalDateTime.now(ZoneId.of("America/Sao_Paulo")));

        logsRepository.save(log);
    }

    @Transactional(readOnly = true)
    public Page<ResponseLogsDto> findAll(LogsFilterDto filter, Pageable pageable) {
        boolean hasName = filter.userName() != null && !filter.userName().isBlank();
        boolean hasDate = filter.startDate() != null && filter.endDate() != null;

        if (hasName && hasDate) {
            LocalDateTime start = filter.startDate().atStartOfDay();
            LocalDateTime end   = filter.endDate().atTime(23, 59, 59);
            return logsRepository
                    .findByUserNameContainingAndCreatedAtBetween(filter.userName(), start, end, pageable)
                    .map(this::toDto);
        }

        if (hasName) {
            return logsRepository
                    .findByUserNameContaining(filter.userName(), pageable)
                    .map(this::toDto);
        }

        if (hasDate) {
            LocalDateTime start = filter.startDate().atStartOfDay();
            LocalDateTime end   = filter.endDate().atTime(23, 59, 59);
            return logsRepository
                    .findByCreatedAtBetween(start, end, pageable)
                    .map(this::toDto);
        }

        return logsRepository.findAll(pageable).map(this::toDto);
    }

    @Transactional(readOnly = true)
    public Page<ResponseLogsDto> findMyLogs(Pageable pageable) {
        User user = userService.getAuthenticatedUser();
        return logsRepository.findByUserId(user.getId(), pageable).map(this::toDto);
    }

    private ResponseLogsDto toDto(Logs log) {
        return new ResponseLogsDto(
                log.getId(),
                log.getUser().getName(),
                log.getDescription(),
                log.getCreatedAt()
        );
    }
}
