package com.Accessus.Accessus.services;

import jxl.Sheet;
import jxl.Workbook;
import jxl.read.biff.BiffException;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class ExcelService {

    public List<Map<String, String>> converter(MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("Arquivo vazio");
        }

        try (InputStream is = file.getInputStream()) {
            Workbook workbook = Workbook.getWorkbook(is);
            try {
                Sheet sheet = workbook.getSheet(0);
                int cols = sheet.getColumns();
                int rows = sheet.getRows();
                if (cols < 1 || rows < 1) return List.of();

                String[] colunas = new String[cols];
                for (int c = 0; c < cols; c++) {
                    colunas[c] = sheet.getCell(c, 0).getContents().trim();
                }

                List<Map<String, String>> resultado = new ArrayList<>();
                for (int r = 1; r < rows; r++) {
                    Map<String, String> linha = new LinkedHashMap<>();
                    boolean vazia = true;
                    for (int c = 0; c < cols; c++) {
                        String valor = sheet.getCell(c, r).getContents().trim();
                        if (!valor.isEmpty()) vazia = false;
                        linha.put(colunas[c], valor);
                    }
                    if (!vazia) resultado.add(linha);
                }
                return resultado;
            } finally {
                workbook.close();
            }
        } catch (BiffException e) {
            throw new IllegalArgumentException("Não foi possível ler a planilha (.xls)", e);
        }
    }

    public byte[] gerar(String sheetName, List<String> colunas, List<List<String>> linhas) throws IOException {
        try (org.apache.poi.ss.usermodel.Workbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            org.apache.poi.ss.usermodel.Sheet sheet = workbook.createSheet(sheetName);

            Row header = sheet.createRow(0);
            for (int c = 0; c < colunas.size(); c++) {
                header.createCell(c).setCellValue(colunas.get(c));
            }

            int r = 1;
            for (List<String> linha : linhas) {
                Row row = sheet.createRow(r++);
                for (int c = 0; c < linha.size(); c++) {
                    row.createCell(c).setCellValue(linha.get(c));
                }
            }

            workbook.write(out);
            return out.toByteArray();
        }
    }
}
