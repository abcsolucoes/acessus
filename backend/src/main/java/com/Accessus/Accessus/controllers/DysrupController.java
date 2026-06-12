package com.Accessus.Accessus.controllers;

import com.Accessus.Accessus.services.DysrupService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Async;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.nio.file.Files;
import java.nio.file.Path;

@RestController
@RequestMapping("/dysrup")
public class DysrupController {

    @Autowired
    private DysrupService dysrupService;

    @PostMapping("/gerar-juncao")
    public ResponseEntity<String> gerarJuncao() {
        dysrupService.gerarJuncaoAsync();
        return ResponseEntity.accepted()
                .body("Geração iniciada. O consolidado será enviado por email ao finalizar.");
    }
}
