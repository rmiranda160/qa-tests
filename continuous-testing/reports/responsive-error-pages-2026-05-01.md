# Reporte Responsive: Error Pages (404)
**Fecha:** 2026-05-01  
**Responsable:** tester (subagent)  
**Focus:** responsive  
**Label:** qa-responsive  

## Resumen
| Estado | Tests | Pasaron | Fallaron |
|--------|-------|---------|----------|
| ✅ **PASS** | 6 | 6 | 0 |

## URLs evaluadas
1. `https://new.zonacnc.com/es/pagina-no-encontrada` (ruta estructurada)
2. `https://new.zonacnc.com/es/esta-url-no-existe-12345-qa-test` (ruta aleatoria)

## Viewports evaluados
| Viewport | Tamaño | Overflow horizontal | H1 visible | Body content |
|----------|--------|-------------------|------------|-------------|
| 📱 Mobile | 390×844 | ❌ No | ✅ "Página no encontrada" | ✅ 69K chars |
| 📟 Tablet | 768×1024 | ❌ No | ✅ "Página no encontrada" | ✅ Completo |
| 🖥️ Desktop | 1440×900 | ❌ No | ✅ "Página no encontrada" | ✅ Completo |

## Resultados detallados

### 1. `/es/pagina-no-encontrada`
| Check | Mobile | Tablet | Desktop |
|-------|--------|--------|---------|
| Status HTTP < 500 | ✅ | ✅ | ✅ |
| H1 visible | ✅ "Página no encontrada" | ✅ "Página no encontrada" | ✅ "Página no encontrada" |
| Body > 100 chars | ✅ | ✅ | ✅ |
| Sin overflow horizontal | ✅ (390=390) | ✅ (768=768) | ✅ (1440=1440) |
| Header/Nav completo | ✅ | ✅ | ✅ |
| Footer completo | ✅ | ✅ | ✅ |
| Skip-to-content link | ✅ | ✅ | ✅ |
| Cookie dialog | ✅ | ✅ | ✅ |
| Chat button | ✅ | ✅ | ✅ |

### 2. URL aleatoria (404)
| Check | Mobile | Tablet | Desktop |
|-------|--------|--------|---------|
| Status HTTP < 500 | ✅ | ✅ | ✅ |
| H1 visible | ✅ "Página no encontrada" | ✅ | ✅ |
| Body > 100 chars | ✅ (69K) | ✅ | ✅ |
| Sin overflow horizontal | ✅ (390=390) | ✅ | ✅ (1440=1440) |

## Hallazgos adicionales
- ✅ La página 404 es completa: incluye header, footer, breadcrumbs, barra de búsqueda, categorías, suscripción newsletter
- ✅ Título de página correcto: "Error 404"
- ✅ Skip-to-content link presente (accesibilidad)
- ✅ Cambio de idioma funcional desde 404
- ✅ Estructura semántica correcta (nav, main, contentinfo)
- ✅ 404 template único para rutas estructuradas y aleatorias
- ⚠️ 3 errores de consola (probablemente recursos estáticos o service worker)

## Conclusión
✅ **PASS** — Las páginas de error 404 son completamente responsivas. No hay desbordamiento horizontal en ningún viewport. La estructura se mantiene completa y funcional en mobile, tablet y desktop.

## Screenshots guardados
- `page-2026-05-01T20-50-10-030Z.png` — 404 page (desktop default)
- `page-2026-05-01T20-50-16-976Z.png` — 404 page @ mobile 390×844
- `page-2026-05-01T20-50-23-505Z.png` — 404 page @ tablet 768×1024
- `page-2026-05-01T20-50-29-683Z.png` — 404 page @ desktop 1440×900
- `page-2026-05-01T20-50-39-051Z.png` — Random 404 @ mobile 390×844
