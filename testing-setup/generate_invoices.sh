#!/bin/bash
# Generador de facturas de prueba en formato PNG (simuladas)

set -e

OUTPUT_DIR="./invoice-dataset"
mkdir -p "$OUTPUT_DIR"

# Lista de proveedores ficticios (anonimizados)
suppliers=("Tecnologías ACME S.L." "Servicios Informáticos Beta" "Soluciones Cloud Gamma" 
           "Hotel Paraíso S.A." "Transportes Veloces S.L." "Agencia de Viajes Delta"
           "Software Libre Epsilon" "Consultoría Zeta" "Mantenimiento Informático Theta"
           "Turismo Rural Iota" "Catering Kappa" "Eventos Lambda")

# Lista de clientes ficticios
clients=("Miranda (CEO)" "División Informática" "División Turismo" "Empresa X" "Empresa Y")

# Divisiones
divisions=("informática" "turismo")

# Generar 25 facturas
for i in {1..25}; do
    # Seleccionar aleatoriamente
    supplier=${suppliers[$RANDOM % ${#suppliers[@]}]}
    client=${clients[$RANDOM % ${#clients[@]}]}
    division=${divisions[$RANDOM % ${#divisions[@]}]}
    
    # Generar montos
    total=$((RANDOM % 5000 + 100))
    iva=$((total * 21 / 100))
    subtotal=$((total - iva))
    
    # Número de factura
    invoice_number="FACT-2026-$(printf %03d $i)"
    
    # Fecha
    date="2026-$(printf %02d $((RANDOM % 12 + 1)))-$(printf %02d $((RANDOM % 28 + 1)))"
    
    # Crear texto de factura
    invoice_text="FACTURA $invoice_number\n\n"
    invoice_text+="Cliente: $client\n"
    invoice_text+="Proveedor: $supplier\n"
    invoice_text+="División: $division\n"
    invoice_text+="Fecha: $date\n"
    invoice_text+="\n"
    invoice_text+="Descripción:\n"
    invoice_text+="  - Servicios de $division\n"
    invoice_text+="  - Materiales varios\n"
    invoice_text+="\n"
    invoice_text+="Subtotal: $subtotal €\n"
    invoice_text+="IVA (21%): $iva €\n"
    invoice_text+="Total: $total €\n"
    invoice_text+="\n"
    invoice_text+="Forma de pago: Transferencia bancaria\n"
    invoice_text+="Vencimiento: $date\n"
    
    # Nombre de archivo
    filename="$OUTPUT_DIR/factura_${i}_${division}.png"
    
    # Crear imagen usando ImageMagick
    echo "Generando $filename"
    convert -background white -fill black -pointsize 14 -font DejaVu-Sans \
            -size 800x1000 caption:"$invoice_text" "$filename" 2>/dev/null || {
        echo "Error al generar $filename"
    }
    
    # También crear una versión en texto plano para referencia
    textfile="${filename%.png}.txt"
    echo -e "$invoice_text" > "$textfile"
done

echo "Generadas $(ls -1 $OUTPUT_DIR/*.png 2>/dev/null | wc -l) facturas PNG en $OUTPUT_DIR"