package com.Accessus.Accessus.entities;

import com.Accessus.Accessus.enums.EmployeeProfile;
import com.Accessus.Accessus.enums.EmployeeStatus;
import jakarta.persistence.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Entity
@Table(name = "tb_employee")
public class Employee {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id")
    private Company company;

    private String department;
    private String cpf;
    private String name;
    private String position;
    private String state;
    private String city;
    private LocalDate admissionDate;

    @Enumerated(EnumType.STRING)
    private EmployeeStatus status;

    @Enumerated(EnumType.STRING)
    private EmployeeProfile profile;

    private LocalDate leaveStart;
    private LocalDate leaveEnd;
    private LocalDate vacationStart;
    private LocalDate vacationEnd;

    // Carimbado a cada importação em que o CPF aparece na planilha — usado para
    // detectar quem sumiu da base de origem e precisa de revisão manual.
    private LocalDateTime lastImportedAt;

    private boolean importManaged;

    // Lado inverso do relacionamento — o dono é Device.employee (FK employee_id em tb_device)
    @OneToMany(mappedBy = "employee")
    private List<Device> devices = new ArrayList<>();

    public Employee() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Company getCompany() {
        return company;
    }

    public void setCompany(Company company) {
        this.company = company;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public String getCpf() {
        return cpf;
    }

    public void setCpf(String cpf) {
        this.cpf = cpf;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getPosition() {
        return position;
    }

    public void setPosition(String position) {
        this.position = position;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public LocalDate getAdmissionDate() {
        return admissionDate;
    }

    public void setAdmissionDate(LocalDate admissionDate) {
        this.admissionDate = admissionDate;
    }

    public EmployeeStatus getStatus() {
        return status;
    }

    public void setStatus(EmployeeStatus status) {
        this.status = status;
    }

    public EmployeeProfile getProfile() {
        return profile;
    }

    public void setProfile(EmployeeProfile profile) {
        this.profile = profile;
    }

    public LocalDate getLeaveStart() {
        return leaveStart;
    }

    public void setLeaveStart(LocalDate leaveStart) {
        this.leaveStart = leaveStart;
    }

    public LocalDate getLeaveEnd() {
        return leaveEnd;
    }

    public void setLeaveEnd(LocalDate leaveEnd) {
        this.leaveEnd = leaveEnd;
    }

    public LocalDate getVacationStart() {
        return vacationStart;
    }

    public void setVacationStart(LocalDate vacationStart) {
        this.vacationStart = vacationStart;
    }

    public LocalDate getVacationEnd() {
        return vacationEnd;
    }

    public void setVacationEnd(LocalDate vacationEnd) {
        this.vacationEnd = vacationEnd;
    }

    public LocalDateTime getLastImportedAt() {
        return lastImportedAt;
    }

    public void setLastImportedAt(LocalDateTime lastImportedAt) {
        this.lastImportedAt = lastImportedAt;
    }

    public boolean isImportManaged() {
        return importManaged;
    }

    public void setImportManaged(boolean importManaged) {
        this.importManaged = importManaged;
    }

    public List<Device> getDevices() {
        return devices;
    }

    @Override
    public boolean equals(Object o) {
        if (o == null || getClass() != o.getClass()) return false;
        Employee employee = (Employee) o;
        return Objects.equals(id, employee.id);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }
}
