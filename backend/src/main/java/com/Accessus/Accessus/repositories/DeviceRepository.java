package com.Accessus.Accessus.repositories;

import com.Accessus.Accessus.entities.Device;
import com.Accessus.Accessus.enums.DeviceSituacao;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface DeviceRepository extends JpaRepository<Device, Long> {
    Optional<Device> findByPulsusId(Long pulsusId);
    Page<Device> findBySituacao(DeviceSituacao situacao, Pageable pageable);

    @Query("SELECT d FROM Device d WHERE " +
            "LOWER(d.serialNumber) LIKE LOWER(CONCAT('%', :term, '%')) OR " +
            "LOWER(d.tagDevice) LIKE LOWER(CONCAT('%', :term, '%')) OR " +
            "CAST(d.pulsusId AS string) LIKE CONCAT('%', :term, '%')")
    Page<Device> search(@Param("term") String term, Pageable pageable);
}
