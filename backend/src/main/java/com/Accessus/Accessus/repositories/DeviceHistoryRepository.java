package com.Accessus.Accessus.repositories;

import com.Accessus.Accessus.entities.DeviceHistory;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.data.domain.Pageable;

public interface DeviceHistoryRepository extends JpaRepository<DeviceHistory, Long> {
    Page<DeviceHistory> findByDeviceIdOrderByCreatedAtDesc(Long deviceId, Pageable pageable);
    Page<DeviceHistory> findByEmployeeIdOrderByCreatedAtDesc(Long employeeId, Pageable pageable);
}