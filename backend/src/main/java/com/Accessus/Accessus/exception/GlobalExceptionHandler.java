package com.Accessus.Accessus.exception;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import java.io.IOException;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<Map<String, String>> handleMaxUpload(MaxUploadSizeExceededException ex) {
        return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE)
                .body(Map.of("error", "Arquivo muito grande. Máximo permitido: 15MB"));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidation(MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult().getFieldErrors().stream()
                .map(err -> err.getField() + ": " + err.getDefaultMessage())
                .findFirst()
                .orElse("Dados inválidos");
        return ResponseEntity.badRequest().body(Map.of("error", message));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleIllegalArgument(IllegalArgumentException ex) {
        return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
    }

    @ExceptionHandler(IOException.class)
    public ResponseEntity<Map<String, String>> handleIO(IOException ex) {
        log.error("IOException ao chamar serviço externo: {}", ex.getMessage(), ex);
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(Map.of("error", "Serviço indisponível. Tente novamente em instantes."));
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, String>> handleRuntime(RuntimeException ex) {
        String message = ex.getMessage();

        if (message != null && (
                message.contains("não encontrado") ||
                message.contains("não encontrada") ||
                message.contains("Token inválido")
        )) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", message));
        }

        if (message != null && (
                message.contains("Credenciais inválidas") ||
                message.contains("não autenticado") ||
                message.contains("Principal inválido")
        )) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Credenciais inválidas"));
        }

        if (message != null && (
                message.contains("já existe") ||
                message.contains("já cadastrado") ||
                message.contains("não aceita") ||
                message.contains("não permitido") ||
                message.contains("muito grande") ||
                message.contains("Arquivo vazio") ||
                message.contains("Formulário bloqueado") ||
                message.contains("Tentativas excedidas") ||
                message.contains("Código expirado") ||
                message.contains("Código inválido") ||
                message.contains("Senha inválida") ||
                message.contains("Nenhum código solicitado")
        )) {
            return ResponseEntity.badRequest().body(Map.of("error", message));
        }

        // Loga com stack trace completo para diagnóstico
        log.error("Erro interno não tratado: {}", message, ex);

        String safeMessage = (message != null && !message.isBlank())
                ? message
                : "Erro interno. Tente novamente.";
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", safeMessage));
    }
}
