#!/bin/bash
# Convertir PNG a PDF usando ImageMagick con política personalizada

set -e

OUTPUT_DIR="./invoice-dataset"
POLICY_DIR="/home/node/.config/ImageMagick"

export MAGICK_CONFIGURE_PATH="$POLICY_DIR"

count=0
for png in "$OUTPUT_DIR"/*.png; do
    [ -e "$png" ] || continue
    # Convertir solo las primeras 10 para tener mix
    if [ $count -lt 10 ]; then
        pdf="${png%.png}.pdf"
        echo "Convirtiendo $png a $pdf"
        convert "$png" "$pdf" 2>&1 | grep -v warning || true
        ((count++))
    fi
done

echo "Convertidas $count facturas a PDF"