#!/bin/bash
set -e

DATASET_DIR="/home/node/.openclaw/workspace-desarrollo/projects/sistema-contabilidad-miranda/testing/dataset"
BASE_URL="http://217.182.244.180:5000"
OUTPUT_JSON="/home/node/.openclaw/workspace-tester/ocr_results.json"

# Seleccionar 5 facturas con archivos txt
PDFS=()
for pdf in "$DATASET_DIR"/*.pdf; do
    base=$(basename "$pdf" .pdf)
    txt="$DATASET_DIR/$base.txt"
    if [[ -f "$txt" ]]; then
        PDFS+=("$pdf")
        if [[ ${#PDFS[@]} -ge 5 ]]; then
            break
        fi
    fi
done

echo "Testing ${#PDFS[@]} invoices" >&2

# Inicializar array de resultados en JSON
RESULTS_JSON="["

for pdf in "${PDFS[@]}"; do
    base=$(basename "$pdf" .pdf)
    txt="$DATASET_DIR/$base.txt"
    echo "Processing $base..." >&2
    
    # Extraer ground truth usando grep
    gt_numero=$(grep -m1 '^FACTURA ' "$txt" | sed 's/^FACTURA //')
    gt_proveedor=$(grep '^Proveedor:' "$txt" | sed 's/^Proveedor: //')
    gt_fecha=$(grep '^Fecha:' "$txt" | sed 's/^Fecha: //')
    gt_total=$(grep '^Total:' "$txt" | sed 's/^Total: //' | grep -o '[0-9]\+' | head -1)
    gt_iva=$(grep 'IVA' "$txt" | grep -o '[0-9]\+' | head -1)
    gt_division=$(grep '^División:' "$txt" | sed 's/^División: //')
    
    # Llamar al OCR
    ocr_response=$(curl -s -X POST "$BASE_URL/ocr/parse" -F "file=@$pdf")
    ocr_numero=$(echo "$ocr_response" | jq -r '.numero_factura // empty')
    ocr_proveedor=$(echo "$ocr_response" | jq -r '.proveedor // empty')
    ocr_fecha=$(echo "$ocr_response" | jq -r '.fecha // empty')
    ocr_total=$(echo "$ocr_response" | jq -r '.total // empty')
    ocr_iva=$(echo "$ocr_response" | jq -r '.iva // empty')
    ocr_division=$(echo "$ocr_response" | jq -r '.division // empty')
    ocr_confidence=$(echo "$ocr_response" | jq -r '.confidence // empty')
    
    # Función de comparación
    compare() {
        local gt="$1"
        local ocr="$2"
        if [[ -z "$gt" ]] || [[ -z "$ocr" ]]; then
            echo "missing"
        else
            gt_norm=$(echo "$gt" | tr '[:upper:]' '[:lower:]' | xargs)
            ocr_norm=$(echo "$ocr" | tr '[:upper:]' '[:lower:]' | xargs)
            if [[ "$gt_norm" == "$ocr_norm" ]] || [[ "$ocr_norm" == *"$gt_norm"* ]] || [[ "$gt_norm" == *"$ocr_norm"* ]]; then
                echo "match"
            else
                echo "mismatch"
            fi
        fi
    }
    
    cmp_numero=$(compare "$gt_numero" "$ocr_numero")
    cmp_proveedor=$(compare "$gt_proveedor" "$ocr_proveedor")
    cmp_fecha=$(compare "$gt_fecha" "$ocr_fecha")
    cmp_total=$(compare "$gt_total" "$ocr_total")
    cmp_iva=$(compare "$gt_iva" "$ocr_iva")
    cmp_division=$(compare "$gt_division" "$ocr_division")
    
    # Calcular accuracy (campos clave: numero, fecha, proveedor, total, iva)
    campos=("$cmp_numero" "$cmp_fecha" "$cmp_proveedor" "$cmp_total" "$cmp_iva")
    total_campos=5
    matches=0
    for c in "${campos[@]}"; do
        if [[ "$c" == "match" ]]; then
            ((matches++))
        fi
    done
    accuracy=$(( matches * 100 / total_campos ))
    
    # Construir objeto JSON para esta factura
    factura_json=$(jq -n \
        --arg factura "$base" \
        --arg accuracy "$accuracy" \
        --arg gt_numero "$gt_numero" \
        --arg gt_proveedor "$gt_proveedor" \
        --arg gt_fecha "$gt_fecha" \
        --arg gt_total "$gt_total" \
        --arg gt_iva "$gt_iva" \
        --arg gt_division "$gt_division" \
        --arg ocr_numero "$ocr_numero" \
        --arg ocr_proveedor "$ocr_proveedor" \
        --arg ocr_fecha "$ocr_fecha" \
        --arg ocr_total "$ocr_total" \
        --arg ocr_iva "$ocr_iva" \
        --arg ocr_division "$ocr_division" \
        --arg ocr_confidence "$ocr_confidence" \
        --arg cmp_numero "$cmp_numero" \
        --arg cmp_proveedor "$cmp_proveedor" \
        --arg cmp_fecha "$cmp_fecha" \
        --arg cmp_total "$cmp_total" \
        --arg cmp_iva "$cmp_iva" \
        --arg cmp_division "$cmp_division" \
        '{
            factura: $factura,
            accuracy: $accuracy | tonumber,
            ground_truth: {
                numero: $gt_numero,
                proveedor: $gt_proveedor,
                fecha: $gt_fecha,
                total: $gt_total,
                iva: $gt_iva,
                division: $gt_division
            },
            ocr_result: {
                numero: $ocr_numero,
                proveedor: $ocr_proveedor,
                fecha: $ocr_fecha,
                total: $ocr_total,
                iva: $ocr_iva,
                division: $ocr_division,
                confidence: $ocr_confidence
            },
            comparison: {
                numero: $cmp_numero,
                proveedor: $cmp_proveedor,
                fecha: $cmp_fecha,
                total: $cmp_total,
                iva: $cmp_iva,
                division: $cmp_division
            }
        }')
    
    # Añadir al array de resultados
    if [[ "$RESULTS_JSON" == "[" ]]; then
        RESULTS_JSON="$RESULTS_JSON$factura_json"
    else
        RESULTS_JSON="$RESULTS_JSON,$factura_json"
    fi
    
    echo "  Accuracy: $accuracy%" >&2
done

RESULTS_JSON="$RESULTS_JSON]"

# Guardar JSON
echo "$RESULTS_JSON" | jq '.' > "$OUTPUT_JSON"

# Calcular promedio
avg=$(echo "$RESULTS_JSON" | jq 'map(.accuracy) | add / length')
echo "Average accuracy: $avg%" >&2

# Evaluar criterio
if (( $(echo "$avg >= 90" | bc -l) )); then
    echo "✅ PASS: Accuracy >90%" >&2
else
    echo "❌ FAIL: Accuracy <90%" >&2
fi

echo "Results saved to $OUTPUT_JSON" >&2