package com.Accessus.Accessus.services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
public class SharePointService {

    @Value("${microsoft.tenant-id}")
    private String tenantId;

    @Value("${microsoft.client-id}")
    private String clientId;

    @Value("${microsoft.client-secret}")
    private String clientSecret;

    private final RestTemplate restTemplate = new RestTemplate();

    @SuppressWarnings("unchecked")
    private String getAccessToken() {
        String url = "https://login.microsoftonline.com/" + tenantId + "/oauth2/v2.0/token";

        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
        body.add("client_id", clientId);
        body.add("client_secret", clientSecret);
        body.add("grant_type", "client_credentials");
        body.add("scope", "https://graph.microsoft.com/.default");

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        ResponseEntity<Map> response = restTemplate.postForEntity(
                url, new HttpEntity<>(body, headers), Map.class);

        return (String) response.getBody().get("access_token");
    }

    @SuppressWarnings("unchecked")
    public byte[] downloadLinhasVivo() {
        String token = getAccessToken();

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);
        HttpEntity<Void> req = new HttpEntity<>(headers);

        // Resolve o site
        String siteUrl = "https://graph.microsoft.com/v1.0/sites/solucoesabc.sharepoint.com:/sites/Documentos";
        Map siteBody = restTemplate.exchange(siteUrl, HttpMethod.GET, req, Map.class).getBody();
        String siteId = (String) siteBody.get("id");

        // Lista os drives e acha "Dados ABC"
        String drivesUrl = "https://graph.microsoft.com/v1.0/sites/" + siteId + "/drives";
        Map drivesBody = restTemplate.exchange(drivesUrl, HttpMethod.GET, req, Map.class).getBody();
        List<Map> drives = (List<Map>) drivesBody.get("value");

        String driveId = drives.stream()
                .filter(d -> "Dados ABC".equals(d.get("name")))
                .map(d -> (String) d.get("id"))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Drive 'Dados ABC' não encontrado no SharePoint"));

        // Baixa o conteúdo do arquivo
        String filePath = "TI-Suporte/Gestão de linhas e aparelhos/Gestão de linhas e aparelhos.xlsx";
        String fileUrl = "https://graph.microsoft.com/v1.0/drives/" + driveId
                + "/root:/" + filePath + ":/content";

        ResponseEntity<byte[]> fileResp = restTemplate.exchange(fileUrl, HttpMethod.GET, req, byte[].class);
        return fileResp.getBody();
    }
}
