package com.Accessus.Accessus.controllers;

import com.Accessus.Accessus.dto.user.*;
import com.Accessus.Accessus.services.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/users")
public class UserController {
    @Autowired
    UserService userService;

    @GetMapping()
    public ResponseEntity<List<ResponseUserDto>> findAll() {
        return ResponseEntity.ok(userService.findAll());
    }

    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody @Valid LoginUserDto dto) {
        return ResponseEntity.ok(userService.login(dto));
    }

    @PostMapping("/register")
    public ResponseEntity<Void> inviteUser(@RequestBody @Valid RegisterUserDto dto) {
        userService.inviteUser(dto);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/activate")
    public ResponseEntity<String> activate(@RequestBody @Valid ActivateUserDto dto) {
        userService.activateUser(dto);
        return ResponseEntity.ok("Conta ativada com sucesso");
    }

    @GetMapping("/me")
    public ResponseEntity<ResponseUserDto> getMe() {
        return ResponseEntity.ok(userService.toDto(userService.getAuthenticatedUser()));
    }

    @GetMapping("/assignable")
    public ResponseEntity<List<ResponseUserDto>> findAssignable() {
        return ResponseEntity.ok(userService.findAssignable());
    }

    @PostMapping("/forgot-password")
    public void forgotPassword(@RequestBody @Valid EmailUserDto dto) {
        userService.inviteCodePassword(dto.email());
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Void> resetPassword(@RequestBody @Valid ResetPasswordDto dto) {
        userService.resetPassword(dto.email(), dto.code(), dto.password());
        return ResponseEntity.ok().build();
    }

    // ── Editar nome e e-mail ──────────────────────────────────────────────────
    @PutMapping("/{id}")
    public ResponseEntity<ResponseUserDto> updateUser(
            @PathVariable Long id,
            @RequestBody @Valid UpdateUserDto dto) {
        return ResponseEntity.ok(userService.updateUser(id, dto));
    }

    // ── Alterar perfil/role ───────────────────────────────────────────────────
    @PutMapping("/{id}/role")
    public ResponseEntity<ResponseUserDto> updateRole(
            @PathVariable Long id,
            @RequestBody @Valid UpdateRoleDto dto) {
        return ResponseEntity.ok(userService.updateRole(id, dto));
    }

    // ── Ativar / desativar ────────────────────────────────────────────────────
    @PatchMapping("/{id}/toggle")
    public ResponseEntity<ResponseUserDto> toggleUser(@PathVariable Long id) {
        return ResponseEntity.ok(userService.toggleUser(id));
    }

    // ── Excluir ───────────────────────────────────────────────────────────────
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    // ── Reenviar convite ──────────────────────────────────────────────────────
    @PostMapping("/{id}/resend-invite")
    public ResponseEntity<Void> resendInvite(@PathVariable Long id) {
        userService.resendInvite(id);
        return ResponseEntity.ok().build();
    }
}
