package com.Accessus.Accessus.dto.fieldValue;

import java.util.List;

public record SaveFieldValuesDto(
        List<FieldValueItem> values
) {
    public record FieldValueItem(
            Long fieldId,
            String value
    ) {}
}