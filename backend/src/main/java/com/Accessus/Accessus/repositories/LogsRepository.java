package com.Accessus.Accessus.repositories;

import com.Accessus.Accessus.entities.Logs;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;

public interface LogsRepository extends JpaRepository<Logs, Long> {

    @Query("SELECT l FROM Logs l WHERE LOWER(l.user.name) LIKE LOWER(CONCAT('%', :name, '%'))")
    Page<Logs> findByUserNameContaining(@Param("name") String name, Pageable pageable);

    Page<Logs> findByCreatedAtBetween(
            LocalDateTime start,
            LocalDateTime end,
            Pageable pageable
    );

    @Query("SELECT l FROM Logs l WHERE LOWER(l.user.name) LIKE LOWER(CONCAT('%', :name, '%')) AND l.createdAt BETWEEN :start AND :end")
    Page<Logs> findByUserNameContainingAndCreatedAtBetween(
            @Param("name") String name,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end,
            Pageable pageable
    );
}
