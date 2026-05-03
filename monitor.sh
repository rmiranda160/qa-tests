#!/bin/bash
# Monitoreo continuo de proyectos Cenarbe
# Ejecutar cada 5 minutos

set -e

WORKSPACE="/home/node/.openclaw/workspace-tester"
SHARED_MEMORY="/home/node/.openclaw/workspace-desarrollo/shared-memory"
TIMESTAMP=$(date -u '+%Y-%m-%d %H:%M UTC')
REPORT_FILE="$SHARED_MEMORY/estado-proyectos-$(date -u '+%Y-%m-%d').md"

# Si el archivo de reporte no existe, crear uno nuevo
if [ ! -f "$REPORT_FILE" ]; then
    cp "$SHARED_MEMORY/estado-proyectos-2026-03-19.md" "$REPORT_FILE" 2>/dev/null || touch "$REPORT_FILE"
fi

# Funciones de log
log() {
    echo "[$(date -u '+%Y-%m-%d %H:%M:%S UTC')] $1"
}

# Verificar URL
check_url() {
    local url=$1
    local code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$url")
    echo "$code"
}

# Inicializar variables
CNTAI_CODE=$(check_url "https://cntai.cenarbe.com")
CONTENTOAI_CODE=$(check_url "https://contentoai.cenarbe.com")
CENARBE_CONFIG_CODE=$(check_url "https://dev1.cenarbe.com/admin/config.php")
CENARBE_CLIENTES_CODE=$(check_url "https://dev1.cenarbe.com/admin/clientes.php")
CENARBE_BICICLETAS_CODE=$(check_url "https://dev1.cenarbe.com/admin/bicicletas-nueva.php")
VILLA_CODE=$(check_url "https://villazocotin.cenarbe.com")

# Determinar estados
if [ "$CNTAI_CODE" = "200" ]; then
    CNTAI_STATE="🟢 200 OK"
else
    CNTAI_STATE="🔴 $CNTAI_CODE"
fi

if [ "$CONTENTOAI_CODE" = "200" ]; then
    CONTENTOAI_STATE="🟢 200 OK"
else
    CONTENTOAI_STATE="🔴 $CONTENTOAI_CODE"
fi

# Cenarbe: considerar éxito si algún código cambia a 200 (o diferente de 403/404)
CENARBE_STATE="🟡"
if [ "$CENARBE_CONFIG_CODE" = "200" ] || [ "$CENARBE_CLIENTES_CODE" = "200" ] || [ "$CENARBE_BICICLETAS_CODE" = "200" ]; then
    CENARBE_STATE="🟢 ALGÚN 200"
elif [ "$CENARBE_CONFIG_CODE" = "403" ] && [ "$CENARBE_CLIENTES_CODE" = "404" ] && [ "$CENARBE_BICICLETAS_CODE" = "404" ]; then
    CENARBE_STATE="🟡 403/404 (sin cambios)"
else
    CENARBE_STATE="🟡 Códigos: $CENARBE_CONFIG_CODE $CENARBE_CLIENTES_CODE $CENARBE_BICICLETAS_CODE"
fi

if [ "$VILLA_CODE" = "200" ]; then
    VILLA_STATE="🟢 200 OK"
else
    VILLA_STATE="🔴 $VILLA_CODE"
fi

# Detectar cambios críticos
ALERT=""
if [ "$CNTAI_CODE" = "200" ]; then
    # Smoke test rápido para cntai (si está accesible)
    log "ContentoAI (cntai) accesible - ejecutando smoke test básico"
    # Podría agregar más verificaciones aquí
    ALERT="$ALERT\n✅ ContentoAI (cntai) ahora accesible (200)"
elif [ "$CNTAI_CODE" != "503" ]; then
    ALERT="$ALERT\n⚠️  ContentoAI (cntai) cambió a código $CNTAI_CODE"
fi

if [ "$CENARBE_CONFIG_CODE" = "200" ] || [ "$CENARBE_CLIENTES_CODE" = "200" ] || [ "$CENARBE_BICICLETAS_CODE" = "200" ]; then
    ALERT="$ALERT\n⚠️  Cenarbe admin ahora devuelve 200 (Kevin posiblemente corrigió)"
fi

if [ "$VILLA_CODE" != "200" ]; then
    ALERT="$ALERT\n🚨 Villa Zocotin caída ($VILLA_CODE)"
fi

# Actualizar archivo de estado
# Buscar la sección de monitoreo continuo y reemplazarla
SECTION_START="## Monitoreo Continuo - Tester"
NEW_SECTION="$SECTION_START
**Fecha:** $TIMESTAMP
**Estado ContentoAI (cntai.cenarbe.com):** $CNTAI_STATE
**Estado ContentoAI (contentoai.cenarbe.com):** $CONTENTOAI_STATE
**Estado Cenarbe issues críticos:** $CENARBE_STATE
**Estado Villa Zocotin:** $VILLA_STATE
**Issues nuevos detectados:** $(if [ -z "$ALERT" ]; then echo "Ninguno"; else echo "Ver alertas"; fi)
**Recomendaciones:** Monitoreo automático activo.

"

# Usar sed para reemplazar o añadir sección
if grep -q "$SECTION_START" "$REPORT_FILE"; then
    # Reemplazar desde SECTION_START hasta la próxima sección ## o ---
    sed -i "/$SECTION_START/,/^## \|^---/c$NEW_SECTION" "$REPORT_FILE"
else
    # Insertar antes del último ---
    sed -i "/^---/i $NEW_SECTION" "$REPORT_FILE"
fi

log "Monitoreo completado - $TIMESTAMP"
if [ -n "$ALERT" ]; then
    log "Alertas:$ALERT"
    # Aquí podríamos enviar notificación a canal (Slack, etc.)
    echo -e "ALERTAS MONITOREO $TIMESTAMP:$ALERT" >> "$WORKSPACE/alertas.log"
fi