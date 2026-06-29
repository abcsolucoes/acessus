package com.Accessus.Accessus.controllers;

import com.Accessus.Accessus.services.DysrupService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.Accessus.Accessus.services.DysrupService.LatLng;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/dysrup")
public class DysrupController {

    @Autowired
    private DysrupService dysrupService;

    @GetMapping("/itineraries")
    public ResponseEntity<List<Map<String, Object>>> getActiveItineraries() {
        return ResponseEntity.ok(dysrupService.getActiveItineraries());
    }

    @PostMapping("/gerar-juncao")
    public ResponseEntity<String> gerarJuncao() {
        dysrupService.gerarJuncaoAsync();
        return ResponseEntity.accepted()
                .body("Geração iniciada. O consolidado será enviado por email ao finalizar.");
    }

    @GetMapping("/coordenadas")
    public ResponseEntity<LatLng> getCoordenadas(@RequestParam String zipcode) {
        return ResponseEntity.ok(dysrupService.getLatLng(zipcode));
    }

    @GetMapping("/cep")
    public ResponseEntity<Map<String, Object>> getEnderecoPorCep(@RequestParam String cep) {
        return ResponseEntity.ok(dysrupService.getEnderecoPorCep(cep));
    }

    @PostMapping("/registrar-candidato/{candidateId}")
    public ResponseEntity<Map<String, Object>> registrarCandidato(@PathVariable Long candidateId) {
        return ResponseEntity.ok(dysrupService.registrarNaDysrup(candidateId));
    }
}
