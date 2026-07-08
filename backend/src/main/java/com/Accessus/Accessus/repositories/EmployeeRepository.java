package com.Accessus.Accessus.repositories;

import com.Accessus.Accessus.entities.Employee;
import com.Accessus.Accessus.enums.EmployeeStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface EmployeeRepository extends JpaRepository<Employee, Long> {
    Optional<Employee> findByCpf(String cpf);

    Page<Employee> findByStatus(EmployeeStatus status, Pageable pageable);

    // Filtro de status != DEMITIDO fica no Java (EmployeeService) para não cair
    // na armadilha do SQL: "status <> 'DEMITIDO'" exclui linhas com status NULL.
    List<Employee> findByCpfNotIn(Collection<String> cpfs);

    long countByStatus(EmployeeStatus status);
}
