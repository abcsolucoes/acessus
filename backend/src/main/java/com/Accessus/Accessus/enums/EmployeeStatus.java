package com.Accessus.Accessus.enums;

public enum EmployeeStatus {
    ATIVO,
    EXPERIENCIA,
    FERIAS,
    FERIAS_VENCIDAS,
    AFASTADO,
    ATESTADO_MEDICO_VENCIDO,
    AVISO_PREVIO,
    DEMITIDO,
    PENDENTE_REVISAO;

    // Situações em que a empresa ainda considera o vínculo ativo — só DEMITIDO e
    // PENDENTE_REVISAO tiram o funcionário da contagem de ativos do Inventário.
    public boolean isActive() {
        return this != DEMITIDO && this != PENDENTE_REVISAO;
    }
}
