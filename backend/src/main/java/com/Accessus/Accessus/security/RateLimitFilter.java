package com.Accessus.Accessus.security;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class RateLimitFilter extends OncePerRequestFilter {

    // Balde por IP para cada endpoint protegido
    private final Map<String, Bucket> loginBuckets        = new ConcurrentHashMap<>();
    private final Map<String, Bucket> forgotBuckets       = new ConcurrentHashMap<>();
    private final Map<String, Bucket> validateBuckets     = new ConcurrentHashMap<>();

    private Bucket newLoginBucket() {
        // 5 tentativas por minuto
        return Bucket.builder()
                .addLimit(Bandwidth.builder().capacity(5).refillGreedy(5, Duration.ofMinutes(1)).build())
                .build();
    }

    private Bucket newForgotBucket() {
        // 3 tentativas por minuto
        return Bucket.builder()
                .addLimit(Bandwidth.builder().capacity(3).refillGreedy(3, Duration.ofMinutes(1)).build())
                .build();
    }

    private Bucket newValidateBucket() {
        // 10 tentativas por minuto
        return Bucket.builder()
                .addLimit(Bandwidth.builder().capacity(10).refillGreedy(10, Duration.ofMinutes(1)).build())
                .build();
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String path   = request.getRequestURI();
        String method = request.getMethod();
        String ip     = getClientIp(request);

        Bucket bucket = null;

        if ("POST".equals(method) && "/users/login".equals(path)) {
            bucket = loginBuckets.computeIfAbsent(ip, k -> newLoginBucket());
        } else if ("POST".equals(method) && "/users/forgot-password".equals(path)) {
            bucket = forgotBuckets.computeIfAbsent(ip, k -> newForgotBucket());
        } else if ("GET".equals(method) && path.startsWith("/candidates/validate")) {
            bucket = validateBuckets.computeIfAbsent(ip, k -> newValidateBucket());
        }

        if (bucket != null && !bucket.tryConsume(1)) {
            response.setStatus(429);
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.setCharacterEncoding("UTF-8");
            response.getWriter().write("{\"error\":\"Muitas tentativas. Aguarde 1 minuto.\"}");
            return;
        }

        filterChain.doFilter(request, response);
    }

    private String getClientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
