package com.Accessus.Accessus.dto.field;

import com.Accessus.Accessus.enums.FieldSize;
import com.Accessus.Accessus.enums.FieldType;
import com.Accessus.Accessus.enums.Steps;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateFieldDto(
        @NotBlank @Size(max = 100)
        String fieldName,

        boolean enabled,

        @NotNull
        FieldSize fieldSize,

        @NotNull
        FieldType fieldType,

        @NotNull
        Steps step,

        Long candidateId,

        // Só usado quando fieldType == SELECT — lista de opções separada por vírgula.
        String fieldOptions
) {
}
