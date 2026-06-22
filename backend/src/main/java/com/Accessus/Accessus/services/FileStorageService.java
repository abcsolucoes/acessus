package com.Accessus.Accessus.services;

import com.Accessus.Accessus.entities.Candidate;
import com.Accessus.Accessus.entities.Field;
import com.Accessus.Accessus.entities.FieldValue;
import com.Accessus.Accessus.enums.FieldType;
import com.Accessus.Accessus.repositories.CandidateRepository;
import com.Accessus.Accessus.repositories.FieldRepository;
import com.Accessus.Accessus.repositories.FieldValueRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Stream;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

@Service
public class FileStorageService {

    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024;
    private static final Set<String> ALLOWED_EXTENSIONS = Set.of(".pdf", ".jpg", ".jpeg", ".png", ".heic", ".heif", ".webp");
    private static final Set<String> ALLOWED_MIME_TYPES = Set.of("application/pdf", "image/jpeg", "image/png", "image/heic", "image/heif", "image/webp");

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

        String fileName = safeBaseName + extension;

        Path uploadDirPath = Paths.get(uploadDir).toAbsolutePath();
        Path filePath = uploadDirPath.resolve(fileName).normalize();

        if (!filePath.startsWith(uploadDirPath)) {
            throw new RuntimeException("Caminho de arquivo inválido");
        }

        Optional<FieldValue> existing = fieldValueRepository
                .findByCandidateIdAndFieldId(candidate.getId(), field.getId());

        FieldValue fv;

        if (existing.isPresent()) {
            fv = existing.get();
            if (fv.getFilePath() != null) {
                File oldFile = new File(fv.getFilePath());
                if (oldFile.exists()) oldFile.delete();
            }
        } else {
            fv = new FieldValue();
            fv.setCandidate(candidate);
            fv.setField(field);
        }

        try {
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new RuntimeException("Erro ao salvar arquivo: " + e.getMessage(), e);
        }

        fv.setFileName(originalName);
        fv.setFilePath(filePath.toString());
        fv.setContentType(file.getContentType());

        fieldValueRepository.save(fv);
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
                default -> mime.startsWith("image/") ? ".jpg" : "";
            };
        }

        if (!ALLOWED_EXTENSIONS.contains(extension) || mime.equals("application/pdf")) {
            throw new RuntimeException("Tipo de arquivo não permitido. Use JPG ou PNG");
        }

        if (!mime.startsWith("image/")) {
            throw new RuntimeException("Tipo de arquivo não permitido. Use uma imagem");
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

        try {
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new RuntimeException("Erro ao salvar foto da rota: " + e.getMessage(), e);
        }

        return filePath.toString();
    }

    public byte[] zipCandidateFiles(Long candidateId) {
        Path candidateDir = Paths.get(uploadBaseDir, "candidates", candidateId.toString());

        if (!Files.exists(candidateDir) || !Files.isDirectory(candidateDir)) {
            throw new RuntimeException("Pasta do candidato não encontrada");
        }

        ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
        ZipOutputStream zipOutputStream = new ZipOutputStream(byteArrayOutputStream);

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

        try {
            zipOutputStream.close();
        } catch (IOException e) {
            throw new RuntimeException("Erro ao fechar ZIP", e);
        }

        return byteArrayOutputStream.toByteArray();
    }
}
