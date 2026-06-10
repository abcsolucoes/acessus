package com.Accessus.Accessus.dto.fieldValue;

public record FieldValueResponseDto(
        Long fieldId,
        String value,
        String fileName   // preenchido para campos DOC, null para TEXT/DATE
) {}
