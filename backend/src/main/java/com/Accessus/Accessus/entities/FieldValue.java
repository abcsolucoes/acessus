package com.Accessus.Accessus.entities;

import jakarta.persistence.*;

import java.util.Objects;

// Sem unique (candidate_id, field_id): campos de Documento podem ter até 5 arquivos,
// cada um sua própria linha. Campos de Texto/Data continuam com um valor só, mas isso
// é garantido pela aplicação (FieldValueService), não mais pelo banco.
@Entity
@Table(name = "field_value_tb")
public class FieldValue {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "field_value", columnDefinition = "TEXT")
    private String value;

    @ManyToOne
    @JoinColumn(name = "candidate_id", nullable = false)
    private Candidate candidate;

    @ManyToOne
    @JoinColumn(name = "field_id", nullable = false)
    private Field field;

    private String fileName;
    private String filePath;
    private String contentType;

    public FieldValue() {
    }

    public FieldValue(Long id, String value, Candidate candidate, Field field) {
        this.id = id;
        this.value = value;
        this.candidate = candidate;
        this.field = field;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getValue() {
        return value;
    }

    public void setValue(String value) {
        this.value = value;
    }

    public Candidate getCandidate() {
        return candidate;
    }

    public void setCandidate(Candidate candidate) {
        this.candidate = candidate;
    }

    public Field getField() {
        return field;
    }

    public void setField(Field field) {
        this.field = field;
    }

    public String getFilePath() {
        return filePath;
    }

    public void setFilePath(String filePath) {
        this.filePath = filePath;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public String getContentType() {
        return contentType;
    }

    public void setContentType(String contentType) {
        this.contentType = contentType;
    }

    @Override
    public boolean equals(Object o) {
        if (o == null || getClass() != o.getClass()) return false;
        FieldValue that = (FieldValue) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }
}
