package com.Accessus.Accessus.services;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

// Conversão .docx -> .pdf via LibreOffice headless (processo externo `soffice`).
// Rodar duas conversões em paralelo no mesmo host costuma travar por disputa do
// profile do LibreOffice, então tudo passa por um único worker thread, que
// funciona como fila: cada chamada só começa depois que a anterior terminou.
@Service
public class PdfConversionService {
    private static final Logger log = LoggerFactory.getLogger(PdfConversionService.class);

    private final ExecutorService fila = Executors.newSingleThreadExecutor();

    // Padrão "soffice" funciona em produção (Linux, depois do apt install, fica no PATH
    // do sistema). No Windows local, o PATH só é atualizado pra processos novos após a
    // instalação — mais confiável apontar direto pro executável via env var.
    @Value("${app.soffice.path}")
    private String sofficePath;

    public byte[] convertToPdf(byte[] docxBytes) {
        try {
            return fila.submit(() -> convertBlocking(docxBytes)).get();
        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException("Erro ao converter documento para PDF", e);
        }
    }

    private byte[] convertBlocking(byte[] docxBytes) throws IOException, InterruptedException {
        Path tempDir = Files.createTempDirectory("accessus-pdf-");
        Path docxPath = tempDir.resolve("documento.docx");

        try {
            Files.write(docxPath, docxBytes);

            Process process = new ProcessBuilder(
                    sofficePath, "--headless", "--convert-to", "pdf",
                    "--outdir", tempDir.toString(), docxPath.toString())
                    .redirectErrorStream(true)
                    .start();

            boolean finalizou = process.waitFor(60, TimeUnit.SECONDS);
            if (!finalizou) {
                process.destroyForcibly();
                throw new RuntimeException("Conversão para PDF excedeu o tempo limite");
            }
            if (process.exitValue() != 0) {
                throw new RuntimeException("LibreOffice retornou erro na conversão para PDF (exit " + process.exitValue() + ")");
            }

            Path pdfPath = tempDir.resolve("documento.pdf");
            return Files.readAllBytes(pdfPath);

        } finally {
            limparDiretorio(tempDir);
        }
    }

    private void limparDiretorio(Path tempDir) {
        try (var stream = Files.list(tempDir)) {
            stream.forEach(this::deletarSilenciosamente);
        } catch (IOException e) {
            log.warn("Não foi possível listar arquivos temporários em {}", tempDir, e);
        }
        deletarSilenciosamente(tempDir);
    }

    private void deletarSilenciosamente(Path path) {
        try {
            Files.deleteIfExists(path);
        } catch (IOException e) {
            log.warn("Não foi possível remover arquivo temporário {}", path, e);
        }
    }
}
