package com.Accessus.Accessus.entities;

import com.Accessus.Accessus.enums.FieldScope;
import com.Accessus.Accessus.enums.FieldSize;
import com.Accessus.Accessus.enums.FieldType;
import com.Accessus.Accessus.enums.Steps;
import jakarta.persistence.*;

@Entity
@Table(name = "field_tb")
public class Field {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String fieldName;
    private boolean enabled;

    @Enumerated(EnumType.STRING)
    private FieldSize fieldSize;

    @Enumerated(EnumType.STRING)
    private FieldType fieldType;

    @Enumerated(EnumType.STRING)
    private Steps step;

    @Enumerated(EnumType.STRING)
    private FieldScope scope;

    @ManyToOne
    @JoinColumn(name = "candidate_id")
    private Candidate candidate;

    public Field() {
    }

    public Field(Long id, String fieldName, boolean enabled, FieldSize fieldSize, FieldType fieldType, Steps step, FieldScope scope, Candidate candidate) {
        this.id = id;
        this.fieldName = fieldName;
        this.enabled = enabled;
        this.fieldSize = fieldSize;
        this.fieldType = fieldType;
        this.step = step;
        this.scope = scope;
        this.candidate = candidate;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFieldName() {
        return fieldName;
    }

    public void setFieldName(String fieldName) {
        this.fieldName = fieldName;
    }

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public FieldSize getFieldSize() {
        return fieldSize;
    }

    public void setFieldSize(FieldSize fieldSize) {
        this.fieldSize = fieldSize;
    }

    public FieldType getFieldType() {
        return fieldType;
    }

    public void setFieldType(FieldType fieldType) {
        this.fieldType = fieldType;
    }

    public Steps getStep() {
        return step;
    }

    public void setStep(Steps step) {
        this.step = step;
    }

    public FieldScope getScope() {
        return scope;
    }

    public void setScope(FieldScope scope) {
        this.scope = scope;
    }

    public Candidate getCandidate() {
        return candidate;
    }

    public void setCandidate(Candidate candidate) {
        this.candidate = candidate;
    }
}