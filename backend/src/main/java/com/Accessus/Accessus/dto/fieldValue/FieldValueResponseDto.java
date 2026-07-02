package com.Accessus.Accessus.dto.fieldValue;

public record FieldValueResponseDto(
        Long valueId,     // id da própria FieldValue — usado pra excluir um arquivo específico
        Long fieldId,
        String value,
        String fileName   // preenchido para campos DOC, null para TEXT/DATE
) {}
