package com.Accessus.Accessus.services;

import com.Accessus.Accessus.dto.user.*;
import com.Accessus.Accessus.entities.User;
import com.Accessus.Accessus.repositories.UserRepository;
import com.Accessus.Accessus.security.JwtTokenProvider;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
public class UserService {
    @Autowired
    UserRepository userRepository;

    @Autowired
    PasswordEncoder passwordEncoder;

    @Autowired
    JwtTokenProvider jwtTokenProvider;

    @Autowired
    private EmailService emailService;

    @Autowired
    private ObjectProvider<LogsService> logsServiceProvider;

    @Value("${app.base-url}")
    private String baseUrl;

    @Transactional(readOnly = true)
    public List<ResponseUserDto> findAll() {
        return userRepository.findAll()
                .stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional
    public void inviteUser(RegisterUserDto dto) {
        User user = new User();

        if (userRepository.findByEmail(dto.email()).isPresent()) {
            throw new RuntimeException("Usuário já existe");
        }
        user.setEmail(dto.email());
        user.setName(dto.name());
        user.setRole(dto.role());
        user.setDepartment(dto.department());
        user.setEnabled(false);
        String token = UUID.randomUUID().toString();
        user.setActivationToken(token);

        userRepository.save(user);

        String link = baseUrl + "/activate?token=" + token;
        emailService.sendUserActivation(user.getEmail(), link);
        logsServiceProvider.getObject().createLog(
                "criou o registro de "
                        + dto.name()
                        + ", email "
                        + dto.email()
                        + ", com permissão de "
                        + dto.role()
                        + ", departamento "
                        + dto.department()
        );
    }

    @Transactional
    public void activateUser(ActivateUserDto dto) {
        User user = userRepository.findByActivationToken(dto.token())
                .orElseThrow(() -> new RuntimeException("Token inválido"));

        user.setPassword(passwordEncoder.encode(dto.password()));
        user.setEnabled(true);
        user.setActivationToken(null);

        userRepository.save(user);
    }

    @Transactional(readOnly = true)
    public String login(LoginUserDto dto) {
        User user = userRepository.findByEmail(dto.email())
                .orElseThrow(() -> new RuntimeException("Credenciais inválidas"));

        if (!passwordEncoder.matches(dto.password(), user.getPassword())) {
            throw new RuntimeException("Credenciais inválidas");
        }

        if (!user.isEnabled()) {
            throw new RuntimeException("Conta desativada ou pendente de ativação");
        }

        return jwtTokenProvider.generateToken(user.getEmail(), user.getRole(), user.getName());
    }

    public User getAuthenticatedUser() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("Usuário não autenticado");
        }

        if (!(authentication.getPrincipal() instanceof User user)) {
            throw new RuntimeException("Principal inválido");
        }

        return user;
    }

    @Transactional
    public void inviteCodePassword(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        SecureRandom random = new SecureRandom();
        String code = String.format("%06d", random.nextInt(1000000));

        user.setTokenPassword(passwordEncoder.encode(code));

        user.setPasswordExpires(LocalDateTime.now(ZoneId.of("America/Sao_Paulo")).plusMinutes(10));

        user.setPasswordAttempts(0);

        userRepository.save(user);

        emailService.sendPasswordReset(user.getEmail(), code);
    }

    // ── Editar nome e e-mail ──────────────────────────────────────────────────
    @Transactional
    public ResponseUserDto updateUser(Long id, UpdateUserDto dto) {
        User caller = getAuthenticatedUser();
        User target = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        // Garante que o e-mail novo não pertence a outro usuário
        userRepository.findByEmail(dto.email()).ifPresent(existing -> {
            if (!existing.getId().equals(id)) {
                throw new RuntimeException("E-mail já está em uso");
            }
        });

        target.setName(dto.name());
        target.setEmail(dto.email());
        target.setDepartment(dto.department());
        userRepository.save(target);

        return toDto(target);
    }

    // ── Alterar perfil/role ───────────────────────────────────────────────────
    private static final Set<String> VALID_ROLES = Set.of("ADMIN", "RH", "OPERACIONAL", "DP");

    @Transactional
    public ResponseUserDto updateRole(Long id, UpdateRoleDto dto) {
        User caller = getAuthenticatedUser();

        if (!VALID_ROLES.contains(dto.role())) {
            throw new IllegalArgumentException("Perfil inválido: " + dto.role());
        }

        // Admin não pode rebaixar a si mesmo
        if (caller.getId().equals(id) && !dto.role().equals(caller.getRole())) {
            throw new RuntimeException("Você não pode alterar o próprio perfil");
        }

        User target = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        target.setRole(dto.role());
        userRepository.save(target);

        return toDto(target);
    }

    // ── Ativar / desativar ────────────────────────────────────────────────────
    @Transactional
    public ResponseUserDto toggleUser(Long id) {
        User caller = getAuthenticatedUser();

        if (caller.getId().equals(id)) {
            throw new RuntimeException("Você não pode desativar a própria conta");
        }

        User target = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        target.setEnabled(!Boolean.TRUE.equals(target.getEnabled()));
        userRepository.save(target);

        return toDto(target);
    }

    // ── Excluir usuário ───────────────────────────────────────────────────────
    @Transactional
    public void deleteUser(Long id) {
        User caller = getAuthenticatedUser();

        if (caller.getId().equals(id)) {
            throw new RuntimeException("Você não pode excluir a própria conta");
        }

        User target = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        userRepository.delete(target);

        logsServiceProvider.getObject().createLog("deletou " + target.getName() + ", email " + target.getEmail());
    }

    // ── Reenviar convite ──────────────────────────────────────────────────────
    @Transactional
    public void resendInvite(Long id) {
        User target = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        if (Boolean.TRUE.equals(target.getEnabled())) {
            throw new RuntimeException("Usuário já ativou a conta");
        }

        // Gera novo token de ativação
        String token = UUID.randomUUID().toString();
        target.setActivationToken(token);
        userRepository.save(target);

        String link = baseUrl + "/activate?token=" + token;
        emailService.sendUserActivation(target.getEmail(), link);
    }

    @Transactional
    public void resetPassword(String email, String code, String newPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        if (user.getTokenPassword() == null || user.getPasswordExpires() == null) {
            throw new RuntimeException("Nenhum código solicitado");
        }

        if (user.getPasswordAttempts() >= 4) {
            throw new RuntimeException("Tentativas excedidas");
        }

        if (user.getPasswordExpires().isBefore(LocalDateTime.now(ZoneId.of("America/Sao_Paulo")))) {
            throw new RuntimeException("Código expirado");
        }

        if (!passwordEncoder.matches(code, user.getTokenPassword())) {
            user.setPasswordAttempts(user.getPasswordAttempts() + 1);
            userRepository.save(user);

            throw new RuntimeException("Código inválido");
        }

        if (newPassword == null || newPassword.isBlank()) {
            throw new RuntimeException("Senha inválida");
        }

        user.setPassword(passwordEncoder.encode(newPassword.trim()));

        user.setTokenPassword(null);
        user.setPasswordExpires(null);
        user.setPasswordAttempts(0);

        userRepository.save(user);
    }

    @Transactional(readOnly = true)
    public List<ResponseUserDto> findAssignable() {
        return userRepository.findAll().stream()
                .filter(u -> Boolean.TRUE.equals(u.getEnabled()))
                .map(this::toDto)
                .toList();
    }

    public ResponseUserDto toDto(User user) {
        return new ResponseUserDto(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole(),
                user.getEnabled(),
                user.getDepartment()
        );
    }
}
