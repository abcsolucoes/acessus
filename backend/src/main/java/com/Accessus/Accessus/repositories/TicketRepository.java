package com.Accessus.Accessus.repositories;

import com.Accessus.Accessus.entities.Ticket;
import com.Accessus.Accessus.entities.User;
import com.Accessus.Accessus.enums.Department;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface TicketRepository extends JpaRepository<Ticket, Long> {

    // "Para mim" — atribuídos diretamente ao usuário
    Page<Ticket> findByAssignedTo(User assignedTo, Pageable pageable);

    // "Meu setor" — destinados ao departamento
    Page<Ticket> findByDepartment(Department department, Pageable pageable);

    // "Abertos por mim" — criados pelo usuário
    Page<Ticket> findByCreatedBy(User createdBy, Pageable pageable);

    // "Todos" (ADMIN) — sem filtro, usa findAll() do JpaRepository

    // Query legada mantida caso seja usada em outro lugar
    @Query("SELECT t FROM Ticket t WHERE t.department = :dept OR t.assignedTo = :user")
    Page<Ticket> findByDepartmentOrAssignedTo(@Param("dept") Department dept, @Param("user") User user, Pageable pageable);
}
