package com.Accessus.Accessus.repositories;

import com.Accessus.Accessus.entities.EmployeeImportLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface EmployeeImportLogRepository extends JpaRepository<EmployeeImportLog, Long> {
    Optional<EmployeeImportLog> findTopByOrderByImportedAtDesc();
}
