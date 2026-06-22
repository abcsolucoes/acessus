package com.Accessus.Accessus.services;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

@Service
public class ZApiService {

    private static final Logger log = LoggerFactory.getLogger(ZApiService.class);

    @Value("${zapi.instance-id}")
    private String instanceId;

    @Value("${zapi.token}")
    private String token;

    @Value("${zapi.client-token:}")
    private String clientToken;

    private final RestTemplate restTemplate = new RestTemplate();

    @Async
    public void sendCandidateRouteNotification(String candidateName, String routeName, String routePhotoPath) {
        String phone = "553184360210";
        String caption = "Gentileza adicionar o contato do promotor(a) " + candidateName + " (" + routeName + ") aos grupos.";

        try {
            if (routePhotoPath != null && !routePhotoPath.isBlank()) {
                sendImage(phone, routePhotoPath, caption);
            } else {
                sendText(phone, caption);
            }
        } catch (Exception e) {
            log.error("Erro ao enviar notificação WhatsApp para candidato {}: {}", candidateName, e.getMessage(), e);
        }
    }

    private void sendImage(String phone, String imagePath, String caption) throws IOException {
        byte[] imageBytes = Files.readAllBytes(Path.of(imagePath));
        String mimeType = detectMime(imagePath);
        String base64 = "data:" + mimeType + ";base64," + Base64.getEncoder().encodeToString(imageBytes);

        Map<String, Object> body = new HashMap<>();
        body.put("phone", phone);
        body.put("image", base64);
        body.put("caption", caption);

        post("/send-image", body);
        log.info("Imagem WhatsApp enviada para {}", phone);
    }

    private void sendText(String phone, String message) {
        Map<String, Object> body = new HashMap<>();
        body.put("phone", phone);
        body.put("message", message);

        post("/send-text", body);
        log.info("Texto WhatsApp enviado para {}", phone);
    }

    private void post(String endpoint, Map<String, Object> body) {
        String url = "https://api.z-api.io/instances/" + instanceId + "/token/" + token + endpoint;

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        if (clientToken != null && !clientToken.isBlank()) {
            headers.set("Client-Token", clientToken);
        }

        ResponseEntity<Map> resp = restTemplate.exchange(
                url, HttpMethod.POST, new HttpEntity<>(body, headers), Map.class
        );

        if (!resp.getStatusCode().is2xxSuccessful()) {
            throw new RuntimeException("Z-API retornou " + resp.getStatusCode());
        }
    }

    private String detectMime(String path) {
        String lower = path.toLowerCase();
        if (lower.endsWith(".png"))  return "image/png";
        if (lower.endsWith(".webp")) return "image/webp";
        if (lower.endsWith(".heic")) return "image/heic";
        if (lower.endsWith(".heif")) return "image/heif";
        return "image/jpeg";
    }
}
