package com.Accessus.Accessus.entities;

import com.Accessus.Accessus.enums.CandidateStatus;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Entity
@Table(name = "tb_promoter")
public class Candidate {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private String cpf;
    private String email;
    private String telephone;
    private String position;
    private LocalDate admissionDate;
    private String activationToken;
    @Enumerated(EnumType.STRING)
    private CandidateStatus candidateStatus;
    private String zipcode;
    private java.time.LocalDate birthDate;
    private String addressNumber;
    private String complement;
    private String routeName;
    private String teamName;
    private String routePhotoPath;

    public Candidate() {
    }

    public Candidate(Long id, String name, String cpf, String email, String telephone, String position, LocalDate admissionDate, String activationToken, CandidateStatus candidateStatus) {
        this.id = id;
        this.name = name;
        this.cpf = cpf;
        this.email = email;
        this.telephone = telephone;
        this.position = position;
        this.admissionDate = admissionDate;
        this.activationToken = activationToken;
        this.candidateStatus = candidateStatus;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCpf() {
        return cpf;
    }

    public void setCpf(String cpf) {
        this.cpf = cpf;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getTelephone() {
        return telephone;
    }

    public void setTelephone(String telephone) {
        this.telephone = telephone;
    }

    public String getPosition() {
        return position;
    }

    public void setPosition(String position) {
        this.position = position;
    }

    public LocalDate getAdmissionDate() {
        return admissionDate;
    }

    public void setAdmissionDate(LocalDate admissionDate) {
        this.admissionDate = admissionDate;
    }

    public String getActivationToken() {
        return activationToken;
    }

    public void setActivationToken(String activationToken) {
        this.activationToken = activationToken;
    }

    public CandidateStatus getCandidateStatus() {
        return candidateStatus;
    }

    public void setCandidateStatus(CandidateStatus candidateStatus) {
        this.candidateStatus = candidateStatus;
    }

    public String getZipcode() {
        return zipcode;
    }

    public void setZipcode(String zipcode) {
        this.zipcode = zipcode;
    }

    public java.time.LocalDate getBirthDate() { return birthDate; }
    public void setBirthDate(java.time.LocalDate birthDate) { this.birthDate = birthDate; }

    public String getAddressNumber() { return addressNumber; }
    public void setAddressNumber(String addressNumber) { this.addressNumber = addressNumber; }

    public String getComplement() { return complement; }
    public void setComplement(String complement) { this.complement = complement; }

    public String getRouteName() {
        return routeName;
    }

    public void setRouteName(String routeName) {
        this.routeName = routeName;
    }

    public String getTeamName() {
        return teamName;
    }

    public void setTeamName(String teamName) {
        this.teamName = teamName;
    }

    public String getRoutePhotoPath() {
        return routePhotoPath;
    }

    public void setRoutePhotoPath(String routePhotoPath) {
        this.routePhotoPath = routePhotoPath;
    }

    @Override
    public boolean equals(Object o) {
        if (o == null || getClass() != o.getClass()) return false;
        Candidate candidate = (Candidate) o;
        return Objects.equals(id, candidate.id);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }
}
