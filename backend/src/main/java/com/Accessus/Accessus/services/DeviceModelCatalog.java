package com.Accessus.Accessus.services;

import java.util.Map;

// Modelo de aparelho não tem nenhum identificador confiável em comum com a Pulsus
// (ver DeviceService.syncDevices) e também não existe valor de comodato em lugar nenhum
// do sistema — essa tabela é a única fonte pros dois: o rótulo curto usado no nome do
// aparelho na Pulsus quando ele fica disponível (ex: "A12 DISPONIVEL") e o valor do
// contrato de comodato. Modelo fora da lista cai no fallback de cada método.
public final class DeviceModelCatalog {

    private record ModeloInfo(String rotulo, int valor) {}

    private static final Map<String, ModeloInfo> CATALOGO = Map.of(
            "SM-A156M", new ModeloInfo("A15", 800),
            "SM-A127M", new ModeloInfo("A12", 500),
            "SM-A125M", new ModeloInfo("A12", 500),
            "MOTO G35 5G", new ModeloInfo("MOTO G35", 1000),
            "REDMI 15C 25078RA3EL", new ModeloInfo("REDMI 15C", 1000)
    );

    private static final int VALOR_PADRAO = 300;

    private DeviceModelCatalog() {
    }

    public static int valor(String modelo) {
        ModeloInfo info = buscar(modelo);
        return info != null ? info.valor() : VALOR_PADRAO;
    }

    // Sem modelo mapeado, usa o próprio modelo como rótulo — garante que o nome
    // gravado na Pulsus nunca vira acidentalmente o nome de uma pessoa e engana
    // o matching automático do próximo sync (ver DeviceService.syncDevices).
    public static String rotulo(String modelo) {
        ModeloInfo info = buscar(modelo);
        if (info != null) return info.rotulo();
        return modelo != null ? modelo : "APARELHO";
    }

    private static ModeloInfo buscar(String modelo) {
        if (modelo == null) return null;
        return CATALOGO.get(modelo.trim().toUpperCase());
    }
}
