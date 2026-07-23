package com.Accessus.Accessus.services;

import com.Accessus.Accessus.entities.Candidate;
import com.Accessus.Accessus.entities.Field;
import com.Accessus.Accessus.entities.FieldValue;
import com.Accessus.Accessus.enums.FieldType;
import com.Accessus.Accessus.repositories.CandidateRepository;
import com.Accessus.Accessus.repositories.FieldRepository;
import com.Accessus.Accessus.repositories.FieldValueRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.IIOImage;
import javax.imageio.ImageIO;
import javax.imageio.ImageWriteParam;
import javax.imageio.ImageWriter;
import javax.imageio.stream.MemoryCacheImageOutputStream;
import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;
import java.io.OutputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Iterator;
import java.util.List;
import java.util.Set;
import java.util.stream.Stream;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

@Service
public class FileStorageService {

    private static final Logger log = LoggerFactory.getLogger(FileStorageService.class);

    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024;
    private static final int MAX_FILES_PER_FIELD = 5;
    private static final Set<String> ALLOWED_EXTENSIONS = Set.of(".pdf", ".jpg", ".jpeg", ".png", ".heic", ".heif", ".webp");
    private static final Set<String> ALLOWED_MIME_TYPES = Set.of("application/pdf", "image/jpeg", "image/png", "image/heic", "image/heif", "image/webp");

    // Fotos de documento tiradas direto da câmera do celular costumam vir com vários MB
    // (câmeras de 12-48MP), sem necessidade real — dificultava o download do ZIP completo
    // (README/análise de performance). javax.imageio já suporta JPG/PNG nativamente (sem
    // dependência nova); HEIC/WEBP ficam de fora (Java não decodifica sem plugin externo).
    private static final int MAX_IMAGE_DIMENSION = 1600;
    private static final float JPEG_QUALITY = 0.82f;
    private static final Set<String> RESIZABLE_EXTENSIONS = Set.of(".jpg", ".jpeg", ".png");

    @Value("${app.upload-dir:uploads}")
    private String uploadBaseDir;

    @Autowired
    private CandidateRepository candidateRepository;

    @Autowired
    private FieldRepository fieldRepository;

    @Autowired
    private FieldValueRepository fieldValueRepository;

    @Transactional
    public void upload(Long candidateId, Long fieldId, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new RuntimeException("Arquivo vazio");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new RuntimeException("Arquivo muito grande. Máximo permitido: 10MB");
        }

        Candidate candidate = candidateRepository.findById(candidateId)
                .orElseThrow(() -> new RuntimeException("Candidato não encontrado"));

        Field field = fieldRepository.findById(fieldId)
                .orElseThrow(() -> new RuntimeException("Campo não encontrado"));

        if (field.getFieldType() != FieldType.DOC) {
            throw new RuntimeException("Campo não aceita arquivo");
        }

        List<FieldValue> existingFiles = fieldValueRepository
                .findByCandidateIdAndFieldId(candidate.getId(), field.getId());
        if (existingFiles.size() >= MAX_FILES_PER_FIELD) {
            throw new RuntimeException("Limite de " + MAX_FILES_PER_FIELD + " arquivos atingido para este campo");
        }

        String original = file.getOriginalFilename();
        String mime = file.getContentType() != null ? file.getContentType().toLowerCase() : "";

        // Tenta extrair extensão do nome do arquivo
        String extension = "";
        if (original != null && original.contains(".")) {
            extension = original.substring(original.lastIndexOf(".")).toLowerCase();
        }

        // Câmeras Android/iOS podem enviar arquivo sem extensão no nome —
        // nesse caso deriva a extensão do MIME type
        if (extension.isEmpty()) {
            extension = switch (mime) {
                case "image/jpeg", "image/jpg", "image/pjpeg" -> ".jpg";
                case "image/png"  -> ".png";
                case "image/heic" -> ".heic";
                case "image/heif" -> ".heif";
                case "image/webp" -> ".webp";
                case "application/pdf" -> ".pdf";
                default -> mime.startsWith("image/") ? ".jpg" : "";
            };
        }

        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new RuntimeException("Tipo de arquivo não permitido. Use PDF, JPG ou PNG");
        }

        // Valida MIME: aceita qualquer image/* ou PDF
        boolean validMime = mime.startsWith("image/") || mime.equals("application/pdf");
        if (!validMime) {
            throw new RuntimeException("Tipo de arquivo não permitido");
        }

        String uploadDir = uploadBaseDir + "/candidates/" + candidateId;
        File dir = new File(uploadDir);
        if (!dir.exists()) dir.mkdirs();

        String originalName = Paths.get(original != null ? original : "arquivo")
                .getFileName()
                .toString();

        // Formato: nomedocampo_primeironome  (ex: comprovante_de_residencia_joao)
        String firstName = candidate.getName().trim().split("\\s+")[0];
        String fieldNameNorm = field.getFieldName()
                .toLowerCase()
                .replaceAll("[^a-z0-9\\s]", "")
                .trim()
                .replaceAll("\\s+", "_");
        String firstNameNorm = firstName
                .toLowerCase()
                .replaceAll("[^a-z0-9]", "");
        String safeBaseName = fieldNameNorm + "_" + firstNameNorm;

        Path uploadDirPath = Paths.get(uploadDir).toAbsolutePath();

        // Sempre uma linha nova (até 5 por campo) — salva primeiro pra ter o id gerado
        // e usar ele no nome do arquivo, garantindo que nunca colide em disco mesmo se
        // um arquivo do meio for excluído depois (numeração sequencial quebraria nisso).
        FieldValue fv = new FieldValue();
        fv.setCandidate(candidate);
        fv.setField(field);
        fv.setFileName(originalName);
        fv.setContentType(file.getContentType());
        fv = fieldValueRepository.save(fv);

        String fileName = safeBaseName + "_" + fv.getId() + extension;
        Path filePath = uploadDirPath.resolve(fileName).normalize();

        if (!filePath.startsWith(uploadDirPath)) {
            throw new RuntimeException("Caminho de arquivo inválido");
        }

        try {
            byte[] originalBytes = file.getBytes();
            byte[] toStore = resizeIfLarge(originalBytes, extension);
            Files.write(filePath, toStore);
        } catch (IOException e) {
            throw new RuntimeException("Erro ao salvar arquivo: " + e.getMessage(), e);
        }

        fv.setFilePath(filePath.toString());
        fieldValueRepository.save(fv);
    }

    // Só reduz se a imagem for de fato grande — evita reprocessar (e reduzir qualidade
    // à toa) uma foto que já veio pequena. Qualquer falha na leitura/decodificação cai
    // no catch e mantém o arquivo original — resize é otimização, nunca deve bloquear
    // o upload em si.
    private byte[] resizeIfLarge(byte[] original, String extension) {
        if (!RESIZABLE_EXTENSIONS.contains(extension)) {
            return original;
        }

        try {
            BufferedImage image = ImageIO.read(new ByteArrayInputStream(original));
            if (image == null) {
                return original;
            }

            int width = image.getWidth();
            int height = image.getHeight();
            if (Math.max(width, height) <= MAX_IMAGE_DIMENSION) {
                return original;
            }

            double scale = (double) MAX_IMAGE_DIMENSION / Math.max(width, height);
            int newWidth = Math.max(1, Math.round((float) (width * scale)));
            int newHeight = Math.max(1, Math.round((float) (height * scale)));

            boolean isPng = extension.equals(".png");
            BufferedImage resized = new BufferedImage(
                    newWidth, newHeight, isPng ? BufferedImage.TYPE_INT_ARGB : BufferedImage.TYPE_INT_RGB
            );

            Graphics2D g = resized.createGraphics();
            g.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BILINEAR);
            g.setRenderingHint(RenderingHints.KEY_RENDERING, RenderingHints.VALUE_RENDER_QUALITY);
            g.drawImage(image, 0, 0, newWidth, newHeight, null);
            g.dispose();

            ByteArrayOutputStream out = new ByteArrayOutputStream();

            if (isPng) {
                ImageIO.write(resized, "png", out);
            } else {
                Iterator<ImageWriter> writers = ImageIO.getImageWritersByFormatName("jpg");
                if (!writers.hasNext()) {
                    return original;
                }
                ImageWriter writer = writers.next();
                ImageWriteParam param = writer.getDefaultWriteParam();
                param.setCompressionMode(ImageWriteParam.MODE_EXPLICIT);
                param.setCompressionQuality(JPEG_QUALITY);

                try (MemoryCacheImageOutputStream imageOut = new MemoryCacheImageOutputStream(out)) {
                    writer.setOutput(imageOut);
                    writer.write(null, new IIOImage(resized, null, null), param);
                } finally {
                    writer.dispose();
                }
            }

            byte[] result = out.toByteArray();
            log.info("Imagem redimensionada: {}x{} -> {}x{} ({} KB -> {} KB)",
                    width, height, newWidth, newHeight, original.length / 1024, result.length / 1024);
            return result;
        } catch (Exception e) {
            log.warn("Falha ao redimensionar imagem, mantendo arquivo original: {}", e.getMessage());
            return original;
        }
    }

    @Transactional
    public void deleteFieldValueFile(Long candidateId, Long valueId) {
        FieldValue fv = fieldValueRepository.findById(valueId)
                .orElseThrow(() -> new RuntimeException("Arquivo não encontrado"));

        if (!fv.getCandidate().getId().equals(candidateId)) {
            throw new RuntimeException("Arquivo não pertence a este candidato");
        }

        if (fv.getFilePath() != null) {
            File file = new File(fv.getFilePath());
            if (file.exists()) file.delete();
        }

        fieldValueRepository.delete(fv);
    }

    public String saveRoutePhoto(Long candidateId, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new RuntimeException("Arquivo vazio");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new RuntimeException("Arquivo muito grande. Máximo permitido: 10MB");
        }

        String original = file.getOriginalFilename();
        String mime = file.getContentType() != null ? file.getContentType().toLowerCase() : "";

        String extension = "";
        if (original != null && original.contains(".")) {
            extension = original.substring(original.lastIndexOf(".")).toLowerCase();
        }

        if (extension.isEmpty()) {
            extension = switch (mime) {
                case "image/jpeg", "image/jpg", "image/pjpeg" -> ".jpg";
                case "image/png"  -> ".png";
                case "image/heic" -> ".heic";
                case "image/heif" -> ".heif";
                case "image/webp" -> ".webp";
                case "application/pdf" -> ".pdf";
                default -> mime.startsWith("image/") ? ".jpg" : "";
            };
        }

        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new RuntimeException("Tipo de arquivo não permitido. Use PDF, JPG ou PNG");
        }

        boolean validMime = mime.startsWith("image/") || mime.equals("application/pdf");
        if (!validMime) {
            throw new RuntimeException("Tipo de arquivo não permitido. Use PDF ou uma imagem");
        }

        String uploadDir = uploadBaseDir + "/candidates/" + candidateId;
        File dir = new File(uploadDir);
        if (!dir.exists()) dir.mkdirs();

        String fileName = "rota_candidato" + extension;

        Path uploadDirPath = Paths.get(uploadDir).toAbsolutePath();
        Path filePath = uploadDirPath.resolve(fileName).normalize();

        if (!filePath.startsWith(uploadDirPath)) {
            throw new RuntimeException("Caminho de arquivo inválido");
        }

        try (Stream<Path> existing = Files.list(uploadDirPath)) {
            existing.filter(p -> p.getFileName().toString().startsWith("rota_candidato"))
                    .forEach(p -> { try { Files.deleteIfExists(p); } catch (IOException ignored) {} });
        } catch (IOException ignored) {}

        try {
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new RuntimeException("Erro ao salvar foto da rota: " + e.getMessage(), e);
        }

        return filePath.toString();
    }

    public record StoredFile(byte[] content, String contentType) {}

    public StoredFile readRoutePhoto(String path) {
        if (path == null || path.isBlank()) {
            throw new RuntimeException("Candidato sem foto de rota");
        }

        Path filePath = Paths.get(path);
        if (!Files.exists(filePath)) {
            throw new RuntimeException("Arquivo da foto de rota não encontrado");
        }

        try {
            byte[] bytes = Files.readAllBytes(filePath);
            String contentType = Files.probeContentType(filePath);
            return new StoredFile(bytes, contentType != null ? contentType : "application/octet-stream");
        } catch (IOException e) {
            throw new RuntimeException("Erro ao ler foto da rota: " + e.getMessage(), e);
        }
    }

    // Escreve direto na resposta HTTP (ver StreamingResponseBody no CandidateController) em vez
    // de montar o ZIP inteiro num ByteArrayOutputStream primeiro — o navegador começa a receber
    // bytes assim que o primeiro arquivo é lido, em vez de esperar tudo pronto pra começar.
    public void zipCandidateFiles(Long candidateId, OutputStream outputStream) {
        Path candidateDir = Paths.get(uploadBaseDir, "candidates", candidateId.toString());

        if (!Files.exists(candidateDir) || !Files.isDirectory(candidateDir)) {
            throw new RuntimeException("Pasta do candidato não encontrada");
        }

        try (ZipOutputStream zipOutputStream = new ZipOutputStream(outputStream)) {
            try (Stream<Path> files = Files.walk(candidateDir)) {
                files.filter(Files::isRegularFile).forEach(file -> {
                    try {
                        String zipEntryName = candidateDir.relativize(file).toString();
                        zipOutputStream.putNextEntry(new ZipEntry(zipEntryName));
                        Files.copy(file, zipOutputStream);
                        zipOutputStream.closeEntry();
                    } catch (IOException e) {
                        throw new RuntimeException("Erro ao adicionar arquivo ao ZIP", e);
                    }
                });
            } catch (IOException e) {
                throw new RuntimeException("Erro ao percorrer arquivos", e);
            }
        } catch (IOException e) {
            throw new RuntimeException("Erro ao gerar ZIP", e);
        }
    }

    // Download individual de um documento — pra RH não precisar do ZIP completo só pra
    // conferir/baixar 1 arquivo específico.
    public StoredFile readFieldValueFile(Long candidateId, Long valueId) {
        FieldValue fv = fieldValueRepository.findById(valueId)
                .orElseThrow(() -> new RuntimeException("Arquivo não encontrado"));

        if (!fv.getCandidate().getId().equals(candidateId)) {
            throw new RuntimeException("Arquivo não pertence a este candidato");
        }

        if (fv.getFilePath() == null) {
            throw new RuntimeException("Arquivo não encontrado");
        }

        Path filePath = Paths.get(fv.getFilePath());
        if (!Files.exists(filePath)) {
            throw new RuntimeException("Arquivo não encontrado em disco");
        }

        try {
            byte[] bytes = Files.readAllBytes(filePath);
            String contentType = fv.getContentType() != null ? fv.getContentType() : "application/octet-stream";
            return new StoredFile(bytes, contentType);
        } catch (IOException e) {
            throw new RuntimeException("Erro ao ler arquivo: " + e.getMessage(), e);
        }
    }
}
