package com.Accessus.Accessus.repositories;

import com.Accessus.Accessus.entities.Employee;
import com.Accessus.Accessus.enums.EmployeeStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EmployeeRepository extends JpaRepository<Employee, Long> {
    Page<Employee> findByStatus(EmployeeStatus status, Pageable pageable);
    Page<Employee> findByStatusIn(List<EmployeeStatus> statuses, Pageable pageable);
    Optional<Employee> findByCpf(String cpf);
    Page<Employee> findByNameContainingIgnoreCase(String name, Pageable pageable);
    Page<Employee> findByCpfContaining(String cpf, Pageable pageable);
    Page<Employee> findByDevicesIsNotEmpty(Pageable pageable);
    Page<Employee> findByDevicesIsEmpty(Pageable pageable);

    long countByStatus(EmployeeStatus status);
    long countByStatusIn(List<EmployeeStatus> statuses);
}
