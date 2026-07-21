package com.Accessus.Accessus.entities;

import com.Accessus.Accessus.enums.DeviceSituacao;
import jakarta.persistence.*;

import java.util.Objects;

@Entity
@Table(name = "tb_device")
public class Device {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ID do aparelho na Pulsus — não confundir com o id (PK) acima
    @Column(unique = true, nullable = false)
    private Long pulsusId;

    private String manufacturer;
    private String model;
    private String serialNumber;

    @Column(name = "device_group")
    private String group;

    private String imei1;
    private String imei2;

    // Valor de user.identifier no Pulsus (ex: "A488") — campo livre digitado
    // por quem configura o aparelho, não garantidamente único nem confiável
    private String tagDevice;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id")
    private Employee employee;

    @Enumerated(EnumType.STRING)
    private DeviceSituacao situacao;

    public Device() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getPulsusId() {
        return pulsusId;
    }

    public void setPulsusId(Long pulsusId) {
        this.pulsusId = pulsusId;
    }

    public String getManufacturer() {
        return manufacturer;
    }

    public void setManufacturer(String manufacturer) {
        this.manufacturer = manufacturer;
    }

    public String getModel() {
        return model;
    }

    public void setModel(String model) {
        this.model = model;
    }

    public String getSerialNumber() {
        return serialNumber;
    }

    public void setSerialNumber(String serialNumber) {
        this.serialNumber = serialNumber;
    }

    public String getGroup() {
        return group;
    }

    public void setGroup(String group) {
        this.group = group;
    }

    public String getImei1() {
        return imei1;
    }

    public void setImei1(String imei1) {
        this.imei1 = imei1;
    }

    public String getImei2() {
        return imei2;
    }

    public void setImei2(String imei2) {
        this.imei2 = imei2;
    }

    public String getTagDevice() {
        return tagDevice;
    }

    public void setTagDevice(String tagDevice) {
        this.tagDevice = tagDevice;
    }

    public Employee getEmployee() {
        return employee;
    }

    public void setEmployee(Employee employee) {
        this.employee = employee;
    }

    public DeviceSituacao getSituacao() {
        return situacao;
    }

    public void setSituacao(DeviceSituacao situacao) {
        this.situacao = situacao;
    }

    @Override
    public boolean equals(Object o) {
        if (o == null || getClass() != o.getClass()) return false;
        Device device = (Device) o;
        return Objects.equals(id, device.id);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }
}
