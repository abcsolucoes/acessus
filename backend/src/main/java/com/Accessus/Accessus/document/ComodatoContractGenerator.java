package com.Accessus.Accessus.document;

import com.Accessus.Accessus.entities.Company;
import com.Accessus.Accessus.entities.Device;
import com.Accessus.Accessus.entities.Employee;
import com.Accessus.Accessus.services.DeviceModelCatalog;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.apache.poi.xwpf.usermodel.XWPFParagraph;
import org.apache.poi.xwpf.usermodel.XWPFRun;
import org.springframework.stereotype.Component;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@Component
public class ComodatoContractGenerator {

    private static final String TEMPLATE_PATH = "/templates/CONTRATO_DE_COMODATO_DE_APARELHO_CELULAR.docx";
    private static final DateTimeFormatter DATA_BR = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    public byte[] generate(Device device) {
        Employee employee = device.getEmployee();
        Company company = employee.getCompany();

        try (InputStream is = getClass().getResourceAsStream(TEMPLATE_PATH)) {
            if (is == null) {
                throw new IllegalStateException("Template de comodato não encontrado em " + TEMPLATE_PATH);
            }

            XWPFDocument doc = new XWPFDocument(is);
            substituirMarcadores(doc, montarDados(employee, company, device));

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            doc.write(out);
            doc.close();
            return out.toByteArray();

        } catch (IOException e) {
            throw new RuntimeException("Erro ao gerar contrato de comodato", e);
        }
    }

    private Map<String, String> montarDados(Employee employee, Company company, Device device) {
        Map<String, String> dados = new HashMap<>();

        dados.put("RAZAO_SOCIAL", company.getName());
        dados.put("CNPJ", company.getCnpj());
        dados.put("RuaSede", company.getAddress());
        dados.put("NumeroSede", company.getNumber());
        dados.put("ComplementoSede", company.getComplement());
        dados.put("BairroSede", company.getNeighborhood());
        dados.put("CEPSede", company.getCep());

        dados.put("NOME", employee.getName());
        dados.put("CPF", formatarCpf(employee.getCpf()));
        dados.put("DATA_ADMISSAO", employee.getAdmissionDate() != null
                ? employee.getAdmissionDate().format(DATA_BR)
                : "");

        dados.put("MARCA", device.getManufacturer());
        dados.put("MODELO", device.getModel());
        dados.put("NUMERO_SERIE", device.getSerialNumber());
        dados.put("VALOR", String.valueOf(DeviceModelCatalog.valor(device.getModel())));

        return dados;
    }

    private String formatarCpf(String cpf) {
        if (cpf == null) return "";
        String digitos = cpf.replaceAll("\\D", "");
        if (digitos.length() != 11) return "";
        return digitos.substring(0, 3) + "." + digitos.substring(3, 6) + "."
                + digitos.substring(6, 9) + "-" + digitos.substring(9);
    }

    private void substituirMarcadores(XWPFDocument doc, Map<String, String> dados) {
        doc.getParagraphs().forEach(p -> substituirNoParagrafo(p, dados));

        doc.getTables().forEach(tabela ->
                tabela.getRows().forEach(linha ->
                        linha.getTableCells().forEach(celula ->
                                celula.getParagraphs().forEach(p -> substituirNoParagrafo(p, dados)))));

        doc.getHeaderList().forEach(header ->
                header.getParagraphs().forEach(p -> substituirNoParagrafo(p, dados)));
        doc.getFooterList().forEach(footer ->
                footer.getParagraphs().forEach(p -> substituirNoParagrafo(p, dados)));
    }

    // Junta o texto de todos os runs do parágrafo antes de substituir, porque o Word
    // costuma quebrar um único "${MARCADOR}" em vários runs (ex: "${" / "MODELO" / "}")
    // sem nenhuma razão visível — substituir run a run perderia esses marcadores.
    private void substituirNoParagrafo(XWPFParagraph paragrafo, Map<String, String> dados) {
        String textoOriginal = paragrafo.getRuns().stream()
                .map(run -> run.getText(0))
                .filter(Objects::nonNull)
                .collect(Collectors.joining());

        if (textoOriginal.isEmpty()) return;

        String textoSubstituido = textoOriginal;
        for (Map.Entry<String, String> entry : dados.entrySet()) {
            String marcador = "${" + entry.getKey() + "}";
            textoSubstituido = textoSubstituido.replace(marcador, entry.getValue() == null ? "" : entry.getValue());
        }

        if (!textoSubstituido.equals(textoOriginal)) {
            for (int i = paragrafo.getRuns().size() - 1; i > 0; i--) {
                paragrafo.removeRun(i);
            }
            XWPFRun run = paragrafo.getRuns().isEmpty() ? paragrafo.createRun() : paragrafo.getRuns().get(0);
            run.setText(textoSubstituido, 0);
        }
    }
}
