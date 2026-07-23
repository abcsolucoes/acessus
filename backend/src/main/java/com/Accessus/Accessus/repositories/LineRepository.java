package com.Accessus.Accessus.repositories;

import com.Accessus.Accessus.entities.Line;
import com.Accessus.Accessus.enums.LineStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface LineRepository extends JpaRepository<Line, Long> {
    Optional<Line> findByNumber(String number);
    Optional<Line> findByIccid(String number);
    Page<Line> findByStatus(LineStatus status, Pageable pageable);
    long countByStatus(LineStatus status);

    @Query("SELECT l FROM Line l WHERE " +
            "LOWER(l.number) LIKE LOWER(CONCAT('%', :term, '%')) OR " +
            "LOWER(l.iccid) LIKE LOWER(CONCAT('%', :term, '%'))")
    Page<Line> search(@Param("term") String term, Pageable pageable);
}