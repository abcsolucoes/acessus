package com.Accessus.Accessus.controllers;

import com.Accessus.Accessus.dto.field.CreateFieldDto;
import com.Accessus.Accessus.entities.Field;
import com.Accessus.Accessus.services.FieldService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/field")
public class FieldController {
    @Autowired
    FieldService fieldService;

    @PostMapping("/create")
    public ResponseEntity<Field> createField(@RequestBody @Valid CreateFieldDto dto) {
        return ResponseEntity.ok(fieldService.createField(dto));
    }

    @GetMapping("/{candidateId}")
    public ResponseEntity<List<Field>> loadFields(@PathVariable Long candidateId) {
        return ResponseEntity.ok(fieldService.loadFields(candidateId));
    }

    // Rota pública — usada pelo formulário de candidatos (sem autenticação)
    @GetMapping("/public/{candidateId}")
    public ResponseEntity<List<Field>> loadFieldsPublic(
            @PathVariable Long candidateId,
            @RequestParam String token) {
        fieldService.validateCandidateToken(candidateId, token);
        return ResponseEntity.ok(fieldService.loadFields(candidateId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteField(@PathVariable Long id, @RequestParam(required = false) Long candidateId) {
        fieldService.delete(id, candidateId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<List<Field>> findAll() {
        return ResponseEntity.ok(fieldService.findAll());
    }
}
