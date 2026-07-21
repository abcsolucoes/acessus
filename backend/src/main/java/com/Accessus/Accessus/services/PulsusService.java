package com.Accessus.Accessus.services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class PulsusService {
    private static final String BASE_URL = "https://api.pulsus.mobi/v1";

    @Value("${pulsus.token}")
    private String pulsusToken;

    private final RestTemplate restTemplate = new RestTemplate();

    public List<Map<String, Object>> getDevices() {
        List<Map<String, Object>> todos = new ArrayList<>();
        Long maxId = null;

        while (true) {
            List<Map<String, Object>> pagina = buscarPagina(maxId);
            todos.addAll(pagina);

            if (pagina.size() < 500) {
                break;
            }

            // Ordenado por ID decrescente — a próxima página busca abaixo do último ID recebido
            maxId = ((Number) pagina.get(pagina.size() - 1).get("id")).longValue();
        }

        return todos;
    }

    private List<Map<String, Object>> buscarPagina(Long maxId) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("ApiToken", pulsusToken);

        String url = BASE_URL + "/devices" + (maxId != null ? "?max_id=" + maxId : "");

        ResponseEntity<List<Map<String, Object>>> resp = restTemplate.exchange(
                url,
                HttpMethod.GET,
                new HttpEntity<>(headers),
                new ParameterizedTypeReference<>() {}
        );

        return resp.getBody() != null ? resp.getBody() : List.of();
    }

    public void updateDevice(Long pulsusId, Map<String, Object> body) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("ApiToken", pulsusToken);
        headers.setContentType(MediaType.APPLICATION_JSON);

        restTemplate.exchange(
                BASE_URL + "/devices/update/" + pulsusId,
                HttpMethod.PUT,
                new HttpEntity<>(body, headers),
                Void.class
        );
    }
}
