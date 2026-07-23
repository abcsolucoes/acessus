package com.Accessus.Accessus.dto.line;

// TEMPORÁRIO — usado só pela migração única da planilha legada (LineService.importLegacySpreadsheet).
// Apagar junto quando o import de uma vez só deixar de ser necessário.
public record LineImportResultDto(
        int created,
        int updated,
        int inUse,
        int available,
        int reactivate,
        int unavailable
) {}
