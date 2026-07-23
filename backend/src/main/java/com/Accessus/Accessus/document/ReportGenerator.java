package com.Accessus.Accessus.document;

import com.Accessus.Accessus.entities.Field;
import com.Accessus.Accessus.entities.FieldValue;
import com.Accessus.Accessus.enums.FieldType;
import com.Accessus.Accessus.enums.Steps;
import org.apache.poi.xwpf.usermodel.*;
import org.springframework.stereotype.Component;

import java.io.ByteArrayOutputStream;
import java.util.*;
import java.util.stream.Collectors;

@Component
public class ReportGenerator {

    public byte[] generate(Long candidateId, List<FieldValue> values) {
        try {
            Map<Steps, List<FieldValue>> grouped = values.stream()
                    .collect(Collectors.groupingBy(
                            fv -> fv.getField().getStep(),
                            LinkedHashMap::new,
                            Collectors.toList()
                    ));

            XWPFDocument doc = new XWPFDocument();

            addHeader(doc, candidateId);

            grouped.entrySet().stream()
                    .sorted(Comparator.comparingInt(e -> stepOrder(e.getKey())))
                    .forEach(entry -> addSection(doc, formatStep(entry.getKey()), entry.getValue()));

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            doc.write(out);
            doc.close();

            return out.toByteArray();

        } catch (Exception e) {
            throw new RuntimeException("Erro ao gerar relatório", e);
        }
    }

    private void addHeader(XWPFDocument doc, Long candidateId) {
        XWPFParagraph title = doc.createParagraph();
        title.setAlignment(ParagraphAlignment.CENTER);

        XWPFRun titleRun = title.createRun();
        titleRun.setText("Relatório do Colaborador");
        titleRun.setBold(true);
        titleRun.setFontSize(20);
        titleRun.setColor("111827");

        XWPFParagraph subtitle = doc.createParagraph();
        subtitle.setAlignment(ParagraphAlignment.CENTER);

        XWPFRun subtitleRun = subtitle.createRun();
        subtitleRun.setText("Resumo das informações admissionais");
        subtitleRun.setFontSize(10);
        subtitleRun.setColor("6B7280");

        XWPFParagraph id = doc.createParagraph();
        id.setAlignment(ParagraphAlignment.CENTER);

        XWPFRun idRun = id.createRun();
        idRun.setText("Candidato ID: " + candidateId);
        idRun.setFontSize(9);
        idRun.setColor("9CA3AF");
    }

    private void addSection(XWPFDocument doc, String sectionTitle, List<FieldValue> values) {
        if (values == null || values.isEmpty()) return;

        // Um campo DOC pode ter várias linhas de FieldValue (até 5 arquivos) — agrupa por
        // field antes de montar os cards, senão cada arquivo gerava um card duplicado.
        List<List<FieldValue>> fieldGroups = new ArrayList<>(
                values.stream()
                        .collect(Collectors.groupingBy(
                                fv -> fv.getField().getId(),
                                LinkedHashMap::new,
                                Collectors.toList()
                        ))
                        .values()
        );

        XWPFParagraph spacer = doc.createParagraph();
        spacer.setSpacingBefore(300);

        XWPFParagraph title = doc.createParagraph();
        title.setSpacingAfter(120);

        XWPFRun titleRun = title.createRun();
        titleRun.setText(sectionTitle);
        titleRun.setBold(true);
        titleRun.setFontSize(14);
        titleRun.setColor("111827");

        XWPFTable table = doc.createTable();
        table.setWidth("100%");
        table.removeRow(0);

        table.setInsideHBorder(XWPFTable.XWPFBorderType.NONE, 0, 0, "FFFFFF");
        table.setInsideVBorder(XWPFTable.XWPFBorderType.NONE, 0, 0, "FFFFFF");
        table.setTopBorder(XWPFTable.XWPFBorderType.NONE, 0, 0, "FFFFFF");
        table.setBottomBorder(XWPFTable.XWPFBorderType.NONE, 0, 0, "FFFFFF");
        table.setLeftBorder(XWPFTable.XWPFBorderType.NONE, 0, 0, "FFFFFF");
        table.setRightBorder(XWPFTable.XWPFBorderType.NONE, 0, 0, "FFFFFF");

        for (int i = 0; i < fieldGroups.size(); i += 2) {
            XWPFTableRow row = table.createRow();

            XWPFTableCell cell1 = getOrCreateCell(row, 0);
            addFieldCard(cell1, fieldGroups.get(i));

            XWPFTableCell spaceCell = row.addNewTableCell();
            spaceCell.setWidth("2%");

            XWPFTableCell cell2 = row.addNewTableCell();

            if (i + 1 < fieldGroups.size()) {
                addFieldCard(cell2, fieldGroups.get(i + 1));
            } else {
                cell2.setColor("FFFFFF");
                cell2.setText("");
            }
        }
    }

    private void addFieldCard(XWPFTableCell cell, List<FieldValue> fieldValues) {
        clearCell(cell);

        cell.setColor("F9FAFB");
        cell.setWidth("49%");
        cell.setVerticalAlignment(XWPFTableCell.XWPFVertAlign.CENTER);

        Field field = fieldValues.get(0).getField();

        XWPFParagraph labelParagraph = cell.addParagraph();
        labelParagraph.setSpacingAfter(40);

        XWPFRun label = labelParagraph.createRun();
        label.setText(field.getFieldName());
        label.setBold(true);
        label.setFontSize(9);
        label.setColor("6B7280");

        XWPFParagraph valueParagraph = cell.addParagraph();
        XWPFRun value = valueParagraph.createRun();

        boolean isDoc = field.getFieldType() == FieldType.DOC;
        String text = isDoc
                ? fieldValues.stream()
                        .map(FieldValue::getFileName)
                        .filter(Objects::nonNull)
                        .collect(Collectors.joining(", "))
                : fieldValues.get(0).getValue();

        if (text == null || text.isBlank()) {
            value.setText(isDoc ? "Nenhum documento enviado" : "Não informado");
            value.setItalic(true);
            value.setColor("9CA3AF");
        } else {
            value.setText(text);
            value.setColor("111827");
        }

        value.setFontSize(11);
    }

    private XWPFTableCell getOrCreateCell(XWPFTableRow row, int index) {
        XWPFTableCell cell = row.getCell(index);
        while (cell == null) {
            row.addNewTableCell();
            cell = row.getCell(index);
        }
        return cell;
    }

    private void clearCell(XWPFTableCell cell) {
        while (cell.getParagraphs().size() > 0) {
            cell.removeParagraph(0);
        }
    }

    private String formatStep(Steps step) {
        if (step == null) return "Outros";
        return switch (step) {
            case personalData -> "Dados Pessoais";
            case address -> "Endereço";
            case docs -> "Documentos";
            case bankDetails -> "Dados Bancários";
            case dependentsDocs -> "Documentos de Dependentes";
            case transport -> "Transporte";
            case emergencyContact -> "Contato de Emergência";
            default -> step.name();
        };
    }

    private int stepOrder(Steps step) {
        if (step == null) return 99;
        return switch (step) {
            case personalData -> 1;
            case address -> 2;
            case docs -> 3;
            case bankDetails -> 4;
            case dependentsDocs -> 5;
            case transport -> 6;
            case emergencyContact -> 7;
            default -> 99;
        };
    }
}
