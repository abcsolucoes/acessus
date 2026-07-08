package com.Accessus.Accessus.entities;

import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.Objects;

@Entity
@Table(name = "tb_employee_import_log")
public class EmployeeImportLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDateTime importedAt;
    private int created;
    private int updated;
    private int errors;
    private int flaggedForReview;

    public EmployeeImportLog() {
    }

    public EmployeeImportLog(Long id, LocalDateTime importedAt, int created, int updated, int errors, int flaggedForReview) {
        this.id = id;
        this.importedAt = importedAt;
        this.created = created;
        this.updated = updated;
        this.errors = errors;
        this.flaggedForReview = flaggedForReview;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDateTime getImportedAt() {
        return importedAt;
    }

    public void setImportedAt(LocalDateTime importedAt) {
        this.importedAt = importedAt;
    }

    public int getCreated() {
        return created;
    }

    public void setCreated(int created) {
        this.created = created;
    }

    public int getUpdated() {
        return updated;
    }

    public void setUpdated(int updated) {
        this.updated = updated;
    }

    public int getErrors() {
        return errors;
    }

    public void setErrors(int errors) {
        this.errors = errors;
    }

    public int getFlaggedForReview() {
        return flaggedForReview;
    }

    public void setFlaggedForReview(int flaggedForReview) {
        this.flaggedForReview = flaggedForReview;
    }

    @Override
    public boolean equals(Object o) {
        if (o == null || getClass() != o.getClass()) return false;
        EmployeeImportLog that = (EmployeeImportLog) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }
}
