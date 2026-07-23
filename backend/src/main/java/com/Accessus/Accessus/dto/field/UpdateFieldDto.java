package com.Accessus.Accessus.dto.field;

import com.Accessus.Accessus.enums.FieldSize;
import com.Accessus.Accessus.enums.Steps;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

// Sem fieldType de propósito — trocar o tipo de um campo que já tem valores salvos
// não faz sentido semântico (ex: virar DOC não tem fluxo de upload associado aos
// valores antigos). Tipo é fixo desde a criação.
public record UpdateFieldDto(
        @NotBlank @Size(max = 100)
        String fieldName,

        boolean enabled,

        @NotNull
        FieldSize fieldSize,

        @NotNull
        Steps step,

        String fieldOptions
) {
}
