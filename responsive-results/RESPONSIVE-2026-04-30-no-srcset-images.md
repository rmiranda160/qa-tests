---
hash: a8f3c7b21d94
severity: medium
area: 'Responsive / Images'
status: open
detected_cycle: responsive
detected_at: 2026-04-30T18:30:00Z
spec_file: qa/tests/responsive/images-srcset.spec.ts
---

# RESPONSIVE-2026-04-30-no-srcset-images

## Esperado

Las imágenes en todas las páginas públicas deben usar `srcset` y `sizes`
para servir recursos adaptados al viewport del dispositivo, mejorando
rendimiento en mobile (menor peso de descarga) y calidad en retina/hidpi.

## Real

Ninguna de las páginas evaluadas usa `srcset` o `sizes` en sus etiquetas
`<img>`. Esto aplica a todas las imágenes del site (banners, logos,
thumbnails de productos, fotos de categoría, etc.).

| Página | Imágenes totales | Con srcset | Con sizes |
|---|---|---|---|
| Homepage (`/es/`) | 6 | 0 | 0 |
| Categoría metal (`/es/28-maquinaria-metal`) | 13 | 0 | 0 |
| Crear anuncio (`/es/module/zonacncproductadd/ads`) | 1 | 0 | 0 |
| Precios (`/es/pricing`) | 1 | 0 | 0 |

**Impacto estimado:** Las imágenes originales (sin escalar) pueden pesar
entre 200KB y 1MB cada una. Un móvil en 4G descargaría el mismo recurso
que un desktop en fibra óptica, desperdiciando ancho de banda y
ralentizando LCP (Largest Contentful Paint).

## Pasos

1. Abrir cualquiera de las URLs listadas arriba
2. Inspeccionar cualquier `<img>` en el DOM
3. Verificar ausencia de atributos `srcset` y `sizes`
4. Comparar el tamaño natural de la imagen (naturalWidth) vs el tamaño renderizado

## Evidencia

```
Recopilado mediante análisis HTML en 5 páginas principales:
- 6 imágenes en homepage: 0 con srcset
- 13 imágenes en categoría metal: 0 con srcset
- 1 imagen en crear anuncio: 0 con srcset
- 1 imagen en pricing: 0 con srcset
Total: 21 imágenes, 0 con srcset/sizes
```

El tema Hummingbird tiene 208 reglas @media en `theme.css`, con
breakpoints en 360, 576, 768, 992, 1200 y 1400px, lo que indica que el
tema soporta responsive design, pero las imágenes no aprovechan esta
capacidad.

## Hipótesis

El tema Hummingbird de PrestaShop 9 probablemente no configura `srcset`
automáticamente para las imágenes de productos. Las imágenes se sirven
desde `/img/p/` o mediante el ImageType de PrestaShop, que genera
múltiples tamaños, pero el `{img}` de Smarty/Twig no incluye `srcset`
por defecto.

**Archivos sospechoso:**
- `themes/hummingbird/templates/_partials/images.tpl` o similar
- Configuración de ImageType en BO (PrestaShop → Design → Image Settings)
- Módulos que insertan imágenes sin srcset (ps_imageslider, etc.)

## Severidad

**medium** — No es un bug funcional, pero afecta significativamente el
rendimiento en dispositivos móviles. Las páginas cargan imágenes de
tamaño completo en viewports pequeños, incrementando el peso de página
y el tiempo de carga en redes móviles.

## Histórico

| Fecha | Estado | Nota |
|---|---|---|
| 2026-04-30 | open | Detección inicial, ciclo responsive |
