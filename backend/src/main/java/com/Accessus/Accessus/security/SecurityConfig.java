package com.Accessus.Accessus.security;

import com.google.api.client.auth.oauth2.Credential;
import com.google.api.client.googleapis.auth.oauth2.GoogleCredential;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.services.people.v1.PeopleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Lazy;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {
    @Autowired
    private JwtAuthFilter jwtAuthenticationFilter;

    @Autowired
    private RateLimitFilter rateLimitFilter;

    @Value("${app.cors.allowed-origins}")
    private String allowedOrigins;

    @Value("${google.client-id}")
    private String googleClientId;

    @Value("${google.client-secret}")
    private String googleClientSecret;

    @Value("${google.refresh-token}")
    private String googleRefreshToken;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
                .csrf(AbstractHttpConfigurer::disable)
                .httpBasic(AbstractHttpConfigurer::disable)
                .formLogin(AbstractHttpConfigurer::disable)

                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )

                .authorizeHttpRequests(auth -> auth

                        // =========================================================
                        // ROTAS PÚBLICAS
                        // =========================================================
                        .requestMatchers(
                                "/users/login",
                                "/h2-console/**",
                                "/users/activate",

                                "/users/forgot-password",
                                "/users/reset-password",
                                "/swagger-ui/**",
                                "/swagger-ui.html",
                                "/v3/api-docs/**"
                        ).permitAll()

                        // =========================================================
                        // FLUXO PÚBLICO CANDIDATO
                        // =========================================================
                        .requestMatchers(HttpMethod.GET, "/candidates/validate").permitAll()

                        .requestMatchers(HttpMethod.GET,
                                "/candidates/public/**",
                                "/field/public/**",
                                "/fieldValue/*/values"
                        ).permitAll()

                        .requestMatchers(HttpMethod.POST,
                                "/fieldValue/*/values",
                                "/fieldValue/public/**",
                                "/candidates/public/**",
                                "/candidates/changeStatus/*",
                                "/candidates/*/upload"
                        ).permitAll()

                        // =========================================================
                        // ADMIN — logs
                        // =========================================================
                        .requestMatchers(HttpMethod.GET, "/logs")
                        .hasRole("ADMIN")

                        // =========================================================
                        // ADMIN — gestão de usuários
                        // =========================================================
                        .requestMatchers(HttpMethod.GET, "/users/me").authenticated()
                        .requestMatchers(HttpMethod.GET, "/users/assignable").authenticated()
                        .requestMatchers(HttpMethod.GET, "/users").hasRole("ADMIN")

                        .requestMatchers(HttpMethod.POST, "/users/register")
                        .hasRole("ADMIN")

                        .requestMatchers(HttpMethod.PUT, "/users/*/role")
                        .hasRole("ADMIN")

                        .requestMatchers(HttpMethod.PUT, "/users/*")
                        .hasRole("ADMIN")

                        .requestMatchers(HttpMethod.PATCH, "/users/*/toggle")
                        .hasRole("ADMIN")

                        .requestMatchers(HttpMethod.DELETE, "/users/*")
                        .hasRole("ADMIN")

                        .requestMatchers(HttpMethod.POST, "/users/*/resend-invite")
                        .hasRole("ADMIN")

                        // =========================================================
                        // CANDIDATOS — ADMIN e RH
                        // =========================================================
                        .requestMatchers(HttpMethod.GET, "/candidates/**")
                        .hasAnyRole("ADMIN", "RH")

                        .requestMatchers(HttpMethod.POST, "/candidates/**")
                        .hasAnyRole("ADMIN", "RH")

                        .requestMatchers(HttpMethod.PUT, "/candidates/**")
                        .hasAnyRole("ADMIN", "RH")

                        .requestMatchers(HttpMethod.DELETE, "/candidates/**")
                        .hasAnyRole("ADMIN", "RH")

                        // =========================================================
                        // FIELDS — ADMIN e RH
                        // =========================================================
                        .requestMatchers(HttpMethod.POST, "/field/**")
                        .hasAnyRole("ADMIN", "RH")

                        .requestMatchers(HttpMethod.PUT, "/field/**")
                        .hasAnyRole("ADMIN", "RH")

                        .requestMatchers(HttpMethod.DELETE, "/field/**")
                        .hasAnyRole("ADMIN", "RH")

                        // =========================================================
                        // FIELD VALUES — ADMIN e RH
                        // =========================================================
                        .requestMatchers(HttpMethod.GET, "/fieldValue/**")
                        .hasAnyRole("ADMIN", "RH")

                        .requestMatchers(HttpMethod.POST, "/fieldValue/**")
                        .hasAnyRole("ADMIN", "RH")

                        .requestMatchers(HttpMethod.PUT, "/fieldValue/**")
                        .hasAnyRole("ADMIN", "RH")

                        .requestMatchers(HttpMethod.DELETE, "/fieldValue/**")
                        .hasAnyRole("ADMIN", "RH")

                        // =========================================================
                        // QUALQUER OUTRA ROTA
                        // =========================================================
                        .anyRequest().authenticated()
                )

                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                .headers(headers ->
                        headers.frameOptions(frame -> frame.sameOrigin())
                )

                .addFilterBefore(rateLimitFilter, UsernamePasswordAuthenticationFilter.class)

                .addFilterBefore(jwtAuthenticationFilter, RateLimitFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        configuration.setAllowedOriginPatterns(Arrays.asList(allowedOrigins.split(",")));

        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);
        configuration.setExposedHeaders(List.of("Authorization"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    @Lazy
    public PeopleService peopleService() throws Exception {
        Credential credential = new GoogleCredential.Builder()
                .setTransport(GoogleNetHttpTransport.newTrustedTransport())
                .setJsonFactory(GsonFactory.getDefaultInstance())
                .setClientSecrets(googleClientId, googleClientSecret)
                .build()
                .setRefreshToken(googleRefreshToken);

        return new PeopleService.Builder(
                GoogleNetHttpTransport.newTrustedTransport(),
                GsonFactory.getDefaultInstance(),
                credential
        )
                .setApplicationName("Accessus")
                .build();
    }
}
