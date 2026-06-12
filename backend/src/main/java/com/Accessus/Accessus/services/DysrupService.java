package com.Accessus.Accessus.services;

import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.*;

@Service
public class DysrupService {

    private static final Logger log = LoggerFactory.getLogger(DysrupService.class);
    private static final String BASE_URL = "https://app.dysrup.com.br/api/v1";

    @Value("${dysrup.token}")
    private String token;

    @Autowired
    private EmailService emailService;

    private final RestTemplate restTemplate = new RestTemplate();

    // Equipes normais — B_FIXO (152) é tratado separadamente e mergeado com B (29)
    private static final List<Map.Entry<String, Integer>> EQUIPES = List.of(
            Map.entry("A",       1),
            Map.entry("B",       29),
            Map.entry("C",       83),
            Map.entry("D",       4),
            Map.entry("E",       13),
            Map.entry("F",       6),
            Map.entry("H",       149),
            Map.entry("J_FIXO1", 9),
            Map.entry("J_FIXO2", 8),
            Map.entry("J_FIXO3", 12),
            Map.entry("L",       31),
            Map.entry("M",       207),
            Map.entry("N",       23),
            Map.entry("O",       17),
            Map.entry("P",       53),
            Map.entry("Q",       19),
            Map.entry("R",       24),
            Map.entry("S",       192),
            Map.entry("V",       287),
            Map.entry("W",       371),
            Map.entry("X",       532)
    );

    // ── Chamado pelo controller — roda em background ──────────────────────────

    @Async
    public void gerarJuncaoAsync() {
        Path destino = null;
        try {
            destino = Files.createTempDirectory("dysrup-juncao");
            baixarRoteiros(destino);
        } catch (Exception e) {
            log.error("Erro ao gerar junção Dysrup: {}", e.getMessage(), e);
        } finally {
            if (destino != null) {
                try (var walk = java.nio.file.Files.walk(destino)) {
                    walk.sorted(Comparator.reverseOrder()).forEach(p -> { try { Files.delete(p); } catch (Exception ignored) {} });
                } catch (Exception ignored) {}
                log.info("Diretório temporário removido: {}", destino);
            }
        }
    }

    // ── Ponto de entrada ─────────────────────────────────────────────────────

    public void baixarRoteiros(Path destino) throws Exception {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);
        headers.setContentType(MediaType.APPLICATION_JSON);

        byte[] bytesB = null;
        String nomeArquivoB = null;
        List<RoteiroParsed> todosRoteiros = new ArrayList<>();

        for (var equipe : EQUIPES) {
            String nome = equipe.getKey();
            int itineraryId = equipe.getValue();
            log.info("[{}] Gerando relatório...", nome);

            try {
                ResultadoDownload resultado = gerarEBaixar(itineraryId, headers);

                if (nome.equals("B")) {
                    bytesB = resultado.conteudo();
                    nomeArquivoB = resultado.nomeArquivo();
                    log.info("[B] Baixado — aguardando merge com B_FIXO");
                } else {
                    RoteiroParsed parsed = parseRoteiro(resultado.conteudo());
                    byte[] flat = toFlat(parsed);
                    Path arquivo = destino.resolve(resultado.nomeArquivo());
                    Files.write(arquivo, flat);
                    todosRoteiros.add(parsed);
                    log.info("[{}] Salvo: {}", nome, arquivo);
                }

            } catch (Exception e) {
                log.error("[{}] ERRO: {}", nome, e.getMessage());
            }

            Thread.sleep(2000);
        }

        // ── Baixa B_FIXO, mergea com B e adiciona ao consolidado ─────────────
        if (bytesB != null) {
            log.info("[B_FIXO] Gerando relatório para merge...");
            try {
                ResultadoDownload fixo = gerarEBaixar(152, headers);
                byte[] mergeado = mergeExcel(bytesB, fixo.conteudo());
                RoteiroParsed parsedB = parseRoteiro(mergeado);
                Files.write(destino.resolve(nomeArquivoB), toFlat(parsedB));
                todosRoteiros.add(parsedB);
                log.info("[B] Salvo com merge B_FIXO: {}", nomeArquivoB);
            } catch (Exception e) {
                log.error("[B_FIXO] ERRO no merge: {} — salvando B sem merge", e.getMessage());
                RoteiroParsed parsedB = parseRoteiro(bytesB);
                Files.write(destino.resolve(nomeArquivoB), toFlat(parsedB));
                todosRoteiros.add(parsedB);
            }
        }

        // ── Gera o consolidado com todas as equipes ───────────────────────────
        byte[] consolidado = consolidar(todosRoteiros);
        String nomeConsolidado = "consolidado.xlsx";
        Files.write(destino.resolve(nomeConsolidado), consolidado);
        log.info("Consolidado gerado: {} equipes, {} lojas no total",
                todosRoteiros.size(),
                todosRoteiros.stream().mapToInt(r -> r.lojas().size()).sum());

        // ── Envia por email ───────────────────────────────────────────────────
        emailService.sendConsolidadoDysrup("gabriel.silva@solucoesabc.com.br", consolidado, nomeConsolidado);
        log.info("Consolidado enviado por email para gabriel.silva@solucoesabc.com.br");
    }

    // ── Gera o relatório na API e baixa o arquivo ─────────────────────────────
    // Retorna os bytes do Excel e o nome do arquivo original

    private ResultadoDownload gerarEBaixar(int itineraryId, HttpHeaders headers) throws Exception {
        // 1. Pede para a API gerar o relatório
        Map<String, Object> payload = Map.of(
                "report_entity", "itinerary",
                "itinerary_id", itineraryId,
                "print_form_id", 2,
                "header_fields_id", List.of()
        );
        ResponseEntity<Map> resp = restTemplate.exchange(
                BASE_URL + "/admin/report/generate",
                HttpMethod.POST,
                new HttpEntity<>(payload, headers),
                Map.class
        );

        // 2. Extrai o caminho do arquivo da resposta
        String filePath = extrairFilePath(resp.getBody());
        if (filePath == null) throw new Exception("Caminho não encontrado: " + resp.getBody());

        // Nome original do arquivo (ex: "report_5166_B - Metropolitana BH - 12-06-2026.xlsx")
        String nomeArquivo = filePath.contains("/")
                ? filePath.substring(filePath.lastIndexOf('/') + 1)
                : filePath.substring(filePath.lastIndexOf('\\') + 1);

        // 3. Baixa o arquivo com retry usando HttpClient nativo (lida melhor com chunked/streaming)
        String url = UriComponentsBuilder
                .fromUriString(BASE_URL + "/download")
                .queryParam("download_type", "itinerary-report")
                .queryParam("file", filePath)
                .encode()
                .toUriString();

        log.info("URL download: {}", url);
        HttpClient httpClient = HttpClient.newBuilder().followRedirects(HttpClient.Redirect.ALWAYS).build();
        HttpRequest dlRequest = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .header("Authorization", headers.getFirst("Authorization"))
                .header("Accept", "*/*")
                .GET()
                .build();

        byte[] conteudo = null;
        for (int tentativa = 1; tentativa <= 10; tentativa++) {
            Thread.sleep(5000);
            HttpResponse<byte[]> dl = httpClient.send(dlRequest, HttpResponse.BodyHandlers.ofByteArray());
            byte[] body = dl.body();
            log.info("[retry {}/10] status={} size={} para {}", tentativa, dl.statusCode(), body != null ? body.length : -1, nomeArquivo);
            if (body != null && body.length > 100) {
                conteudo = body;
                break;
            }
        }

        if (conteudo == null) throw new Exception("Download falhou após 10 tentativas: " + nomeArquivo);

        return new ResultadoDownload(conteudo, nomeArquivo);
    }

    // ── Mergea dois arquivos Excel no formato do roteiro Dysrup ──────────────
    // Estrutura esperada:
    //   Linha 0: "Roteiro:"
    //   Linha 1: nome do roteiro
    //   Linha 2: vazia
    //   Linha 3: "Contrato(s):"
    //   Linhas 4..N: contratos
    //   Linha vazia
    //   "Supervisor(es):"
    //   Linhas: supervisores
    //   Linha vazia
    //   "Loja" | "Promotor" | "Segunda-feira" | ... (header)
    //   Linhas: lojas

    private byte[] mergeExcel(byte[] base, byte[] extra) throws Exception {
        RoteiroParsed r1 = parseRoteiro(base);
        RoteiroParsed r2 = parseRoteiro(extra);

        // União deduplicada preservando ordem
        List<String> contratos   = union(r1.contratos(),   r2.contratos());
        List<String> supervisores = union(r1.supervisores(), r2.supervisores());
        // Lojas deduplicadas pelo nome da loja (primeira coluna)
        List<List<String>> lojas = unionLojas(r1.lojas(), r2.lojas());

        // Monta o novo arquivo
        try (XSSFWorkbook wb = new XSSFWorkbook();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            Sheet sheet = wb.createSheet("Worksheet");

            CellStyle boldStyle = wb.createCellStyle();
            Font bold = wb.createFont();
            bold.setBold(true);
            boldStyle.setFont(bold);

            int rowIdx = 0;

            rowIdx = escreverLinha(sheet, rowIdx, boldStyle, "Roteiro:");
            rowIdx = escreverLinha(sheet, rowIdx, null, r1.nomeRoteiro());
            rowIdx = escreverLinha(sheet, rowIdx, null);             // vazia
            rowIdx = escreverLinha(sheet, rowIdx, boldStyle, "Contrato(s):");
            for (String c : contratos) rowIdx = escreverLinha(sheet, rowIdx, null, c);

            rowIdx = escreverLinha(sheet, rowIdx, null);             // vazia
            rowIdx = escreverLinha(sheet, rowIdx, boldStyle, "Supervisor(es):");
            for (String s : supervisores) rowIdx = escreverLinha(sheet, rowIdx, null, s);

            rowIdx = escreverLinha(sheet, rowIdx, null);             // vazia
            rowIdx = escreverLinha(sheet, rowIdx, boldStyle,
                    "Loja", "Promotor", "Segunda-feira", "Terça-feira",
                    "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado");

            for (List<String> loja : lojas) {
                Row row = sheet.createRow(rowIdx++);
                for (int col = 0; col < loja.size(); col++) {
                    String val = loja.get(col);
                    if (val != null && !val.isBlank()) row.createCell(col).setCellValue(val);
                }
            }

            sheet.setColumnWidth(0, 55 * 256);
            sheet.setColumnWidth(1, 35 * 256);

            wb.write(out);
            return out.toByteArray();
        }
    }

    // ── Lê um arquivo Excel e extrai contratos, supervisores e lojas ─────────

    private RoteiroParsed parseRoteiro(byte[] bytes) throws Exception {
        try (XSSFWorkbook wb = new XSSFWorkbook(new ByteArrayInputStream(bytes))) {
            Sheet sheet = wb.getSheetAt(0);

            String nomeRoteiro = "";
            List<String> contratos = new ArrayList<>();
            List<String> supervisores = new ArrayList<>();
            List<List<String>> lojas = new ArrayList<>();

            int totalRows = sheet.getLastRowNum() + 1;
            int i = 0;

            // Linha 1 (índice 1) tem o nome do roteiro
            if (totalRows > 1) nomeRoteiro = cellStr(sheet.getRow(1), 0);

            // Avança até "Contrato(s):"
            while (i < totalRows && !cellStr(sheet.getRow(i), 0).equals("Contrato(s):")) i++;
            i++;
            while (i < totalRows) {
                String v = cellStr(sheet.getRow(i), 0);
                if (v.equals("Supervisor(es):") || v.equals("Loja")) break;
                if (!v.isBlank()) contratos.add(v);
                i++;
            }

            // Avança até "Supervisor(es):"
            while (i < totalRows && !cellStr(sheet.getRow(i), 0).equals("Supervisor(es):")) i++;
            i++;
            while (i < totalRows) {
                String v = cellStr(sheet.getRow(i), 0);
                if (v.equals("Loja")) break;
                if (!v.isBlank()) supervisores.add(v);
                i++;
            }

            // Avança até "Loja" (header das lojas)
            while (i < totalRows && !cellStr(sheet.getRow(i), 0).equals("Loja")) i++;
            i++; // pula o header

            // Lê as lojas
            while (i < totalRows) {
                Row row = sheet.getRow(i++);
                if (row == null) continue;
                String nomeLoja = cellStr(row, 0);
                if (nomeLoja.isBlank()) continue;

                List<String> cols = new ArrayList<>();
                for (int col = 0; col < 8; col++) cols.add(cellStr(row, col));
                lojas.add(cols);
            }

            return new RoteiroParsed(nomeRoteiro, contratos, supervisores, lojas);
        }
    }

    // ── Transforma um roteiro individual no formato flat ─────────────────────
    // Mesmo formato do consolidado: Loja+Equipe | Equipe | Supervisor | Loja | Promotor | dias

    private byte[] toFlat(RoteiroParsed roteiro) throws Exception {
        try (XSSFWorkbook wb = new XSSFWorkbook();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            Sheet sheet = wb.createSheet("Worksheet");

            CellStyle boldStyle = wb.createCellStyle();
            Font bold = wb.createFont();
            bold.setBold(true);
            boldStyle.setFont(bold);

            int rowIdx = 0;
            rowIdx = escreverLinha(sheet, rowIdx, boldStyle,
                    "Loja+Equipe", "Equipe", "Supervisor", "Loja", "Promotor",
                    "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado");

            String equipe = roteiro.nomeRoteiro();
            String supervisor = roteiro.supervisores().isEmpty() ? "" : roteiro.supervisores().get(0);

            for (List<String> loja : roteiro.lojas()) {
                String nomeLoja = loja.get(0);
                String promotor = loja.size() > 1 ? loja.get(1) : "";

                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(nomeLoja + equipe);
                row.createCell(1).setCellValue(equipe);
                row.createCell(2).setCellValue(supervisor);
                row.createCell(3).setCellValue(nomeLoja);
                row.createCell(4).setCellValue(promotor);

                for (int dia = 0; dia < 6; dia++) {
                    String val = loja.size() > dia + 2 ? loja.get(dia + 2) : "";
                    if (val != null && !val.isBlank()) row.createCell(5 + dia).setCellValue(val);
                }
            }

            sheet.setColumnWidth(0, 60 * 256);
            sheet.setColumnWidth(1, 25 * 256);
            sheet.setColumnWidth(2, 30 * 256);
            sheet.setColumnWidth(3, 45 * 256);
            sheet.setColumnWidth(4, 35 * 256);

            wb.write(out);
            return out.toByteArray();
        }
    }

    // ── Consolida todos os roteiros em uma planilha única ────────────────────
    // Colunas: Loja+Equipe | Equipe | Supervisor | Loja | Promotor | Seg | Ter | Qua | Qui | Sex | Sab

    private byte[] consolidar(List<RoteiroParsed> roteiros) throws Exception {
        try (XSSFWorkbook wb = new XSSFWorkbook();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            Sheet sheet = wb.createSheet("Consolidado");

            CellStyle boldStyle = wb.createCellStyle();
            Font bold = wb.createFont();
            bold.setBold(true);
            boldStyle.setFont(bold);

            // Header
            int rowIdx = 0;
            rowIdx = escreverLinha(sheet, rowIdx, boldStyle,
                    "Loja+Equipe", "Equipe", "Supervisor", "Loja", "Promotor",
                    "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado");

            for (RoteiroParsed roteiro : roteiros) {
                String equipe = roteiro.nomeRoteiro();
                // Usa o primeiro supervisor — cada roteiro tem um
                String supervisor = roteiro.supervisores().isEmpty() ? "" : roteiro.supervisores().get(0);

                for (List<String> loja : roteiro.lojas()) {
                    String nomeLoja = loja.get(0);
                    String promotor = loja.size() > 1 ? loja.get(1) : "";

                    Row row = sheet.createRow(rowIdx++);

                    // Col A: Loja + Equipe (concatenado sem separador, igual ao consolidado de referência)
                    row.createCell(0).setCellValue(nomeLoja + equipe);
                    row.createCell(1).setCellValue(equipe);
                    row.createCell(2).setCellValue(supervisor);
                    row.createCell(3).setCellValue(nomeLoja);
                    row.createCell(4).setCellValue(promotor);

                    // Dias da semana: colunas 2 a 7 na lista de lojas → colunas 5 a 10 no consolidado
                    for (int dia = 0; dia < 6; dia++) {
                        String val = loja.size() > dia + 2 ? loja.get(dia + 2) : "";
                        if (val != null && !val.isBlank()) {
                            row.createCell(5 + dia).setCellValue(val);
                        }
                    }
                }
            }

            sheet.setColumnWidth(0, 60 * 256);
            sheet.setColumnWidth(1, 25 * 256);
            sheet.setColumnWidth(2, 30 * 256);
            sheet.setColumnWidth(3, 45 * 256);
            sheet.setColumnWidth(4, 35 * 256);

            wb.write(out);
            return out.toByteArray();
        }
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private String cellStr(Row row, int col) {
        if (row == null) return "";
        Cell cell = row.getCell(col);
        if (cell == null) return "";
        return switch (cell.getCellType()) {
            case STRING  -> cell.getStringCellValue().trim();
            case NUMERIC -> String.valueOf((long) cell.getNumericCellValue());
            case BOOLEAN -> String.valueOf(cell.getBooleanCellValue());
            default      -> "";
        };
    }

    private int escreverLinha(Sheet sheet, int rowIdx, CellStyle style, String... valores) {
        Row row = sheet.createRow(rowIdx);
        for (int col = 0; col < valores.length; col++) {
            Cell cell = row.createCell(col);
            cell.setCellValue(valores[col]);
            if (style != null) cell.setCellStyle(style);
        }
        return rowIdx + 1;
    }

    private List<String> union(List<String> a, List<String> b) {
        LinkedHashSet<String> seen = new LinkedHashSet<>(a);
        seen.addAll(b);
        return new ArrayList<>(seen);
    }

    private List<List<String>> unionLojas(List<List<String>> a, List<List<String>> b) {
        LinkedHashMap<String, List<String>> map = new LinkedHashMap<>();
        for (List<String> l : a) map.put(l.get(0), l);
        for (List<String> l : b) map.putIfAbsent(l.get(0), l);
        return new ArrayList<>(map.values());
    }

    @SuppressWarnings("unchecked")
    private String extrairFilePath(Map data) {
        if (data == null) return null;
        Object d = data.get("data");
        if (d instanceof String s) return s;
        if (d instanceof Map m) {
            for (String key : List.of("file", "path", "filename", "download"))
                if (m.get(key) instanceof String s) return s;
        }
        for (String key : List.of("file", "path", "filename", "download"))
            if (data.get(key) instanceof String s) return s;
        return null;
    }

    // ── Records internos ─────────────────────────────────────────────────────

    private record ResultadoDownload(byte[] conteudo, String nomeArquivo) {}

    private record RoteiroParsed(
            String nomeRoteiro,
            List<String> contratos,
            List<String> supervisores,
            List<List<String>> lojas
    ) {}
}
