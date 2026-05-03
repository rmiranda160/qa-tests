# RESPONSIVE TEST REPORT — 2026-05-03

**Tester:** test3@zonacnc.com  
**Entorno:** new.zonacnc.com (MODO TEST)  
**Focus Area:** responsive  
**Escenario:** 1 — Responsive layout audit: homepage, search, category, product detail, pricing, account  
**Viewports:** mobile 390×844, tablet 768×1024, desktop 1440×900

---

## Resumen

Se realizó una auditoría de diseño responsive en **6 páginas clave** del sitio new.zonacnc.com, probando cada una en **3 viewports** (18 combinaciones). Se verificaron: overflow horizontal, tamaños de elementos táctiles, errores de consola, visibilidad de secciones clave, y comportamiento del menú responsive.

**Veredicto general: ✅ SITIO RESPONSIVE — Sin errores críticos.**

---

## Resultados por página

### 1. Homepage (`/es/`)
| Viewport | Overflow | Touch targets <35px | Errores consola | Estado |
|----------|----------|--------------------|----------------|--------|
| Mobile 390×844 | ✅ No | ⚠️ 40 elementos | ✅ 0 | **OK** |
| Tablet 768×1024 | ✅ No | ⚠️ 50 elementos | ✅ 0 | **OK** |
| Desktop 1440×900 | ✅ No | ✅ No issues | ✅ 0 | **OK** |

### 2. Search (`/es/buscar`)
| Viewport | Overflow | Touch targets <35px | Errores consola | Estado |
|----------|----------|--------------------|----------------|--------|
| Mobile 390×844 | ✅ No | ⚠️ 43 elementos | ✅ 0 | **OK** |
| Tablet 768×1024 | ✅ No | ⚠️ 53 elementos | ✅ 0 | **OK** |
| Desktop 1440×900 | ✅ No | ✅ No issues | ✅ 0 | **OK** |

### 3. Product detail (Gildemeister CTX 510)
| Viewport | Overflow | Touch targets <35px | Errores consola | Estado |
|----------|----------|--------------------|----------------|--------|
| Mobile 390×844 | ✅ No | ⚠️ 44 elementos | ✅ 0 | **OK** |
| Tablet 768×1024 | ✅ No | ⚠️ 54 elementos | ✅ 0 | **OK** |
| Desktop 1440×900 | ✅ No | ✅ No issues | ✅ 0 | **OK** |

### 4. Pricing (`/es/pricing`)
| Viewport | Overflow | Touch targets <35px | Errores consola | Estado |
|----------|----------|--------------------|----------------|--------|
| Mobile 390×844 | ✅ No | ⚠️ 42 elementos | ✅ 0 | **OK** |
| Tablet 768×1024 | ✅ No | ⚠️ 52 elementos | ✅ 0 | **OK** |
| Desktop 1440×900 | ✅ No | ✅ No issues | ✅ 0 | **OK** |

### 5. Account (`/es/mi-cuenta`)
| Viewport | Overflow | Touch targets <35px | Errores consola | Estado |
|----------|----------|--------------------|----------------|--------|
| Mobile 390×844 | ✅ No | ⚠️ 38 elementos | ✅ 0 | **OK** |
| Tablet 768×1024 | ✅ No | ⚠️ 48 elementos | ✅ 0 | **OK** |
| Desktop 1440×900 | ✅ No | ✅ No issues | ✅ 0 | **OK** |

### 6. Category page (`/es/1216-centros-de-mecanizado-verticales`)
| Viewport | Overflow | Touch targets <35px | Errores consola | Estado |
|----------|----------|--------------------|----------------|--------|
| Mobile 390×844 | ✅ No | ⚠️ 90 elementos | ✅ 0 | **⚠️ Minor** |
| Tablet 768×1024 | ✅ No | ⚠️ 94 elementos | ✅ 0 | **⚠️ Minor** |
| Desktop 1440×900 | ✅ No | ✅ No issues | ✅ 0 | **OK** |

---

## Hallazgos

### 🔴 Hallazgo 1 — Touch targets insuficientes en mobile/tablet (WCAG AA)
**Severidad:** Media  
**Páginas afectadas:** Todas (categoría: 90+ targets <35px)  
**Descripción:** En viewports ≤768px, numerosos elementos interactivos (enlaces de categorías, filtros, iconos de favoritos, checks de condición) tienen dimensiones inferiores a 35px, muy por debajo del estándar WCAG AA de 44px para objetivos táctiles.  
**Impacto:** Dificultad de uso en dispositivos táctiles — usuarios pueden hacer clic en el elemento equivocado.  
**Recomendación:** Aumentar el padding/margin de los elementos interactivos en mobile para alcanzar al menos 44×44px de área táctil. Especial atención a:
- Iconos de favoritos (❤️) en cards de productos
- Checks de filtros en página de búsqueda/categoría
- Enlaces de categorías principales
- Botones de "Guardar favoritos" / "Enviar solicitud"

### ✅ Hallazgo 2 — Sin overflow horizontal
**Severidad:** N/A (positivo)  
**Descripción:** Ninguna página presenta overflow horizontal en ningún viewport. Todos los elementos se mantienen dentro del ancho de la ventana gráfica.

### ✅ Hallazgo 3 — Sin errores de consola JavaScript
**Severidad:** N/A (positivo)  
**Descripción:** No se detectaron errores ni warnings de JavaScript en ninguna página/viewport.

### ✅ Hallazgo 4 — Contenido completo en todos los viewports
**Severidad:** N/A (positivo)  
**Descripción:** Todas las secciones del sitio (header, hero, productos, categorías, pricing, footer) se renderizan correctamente en mobile, tablet y desktop. El footer usa acordeones en mobile (patrón responsive correcto).

### ✅ Hallazgo 5 — Menú responsive funcional
**Severidad:** N/A (positivo)  
**Descripción:** El header en mobile usa iconos con tooltips en lugar de texto completo (búsqueda, cuenta, vender), que es el patrón responsive correcto. El selector de idioma es un dropdown funcional en todos los viewports.

### ✅ Hallazgo 6 — Imágenes responsive sin distorsión
**Severidad:** N/A (positivo)  
**Descripción:** Las imágenes de productos y categorías se escalan correctamente al ancho del viewport sin distorsión ni recorte.

---

## Métricas generales

| Métrica | Mobile | Tablet | Desktop |
|---------|--------|--------|---------|
| Overflow horizontal | 0/6 páginas | 0/6 páginas | 0/6 páginas |
| Errores JS | 0/6 páginas | 0/6 páginas | 0/6 páginas |
| Páginas OK sin hallazgos | 0/6 | 0/6 | 6/6 |
| Páginas con touch targets <35px | 6/6 | 6/6 | 0/6 |

---

## Conclusión

El sitio new.zonacnc.com tiene **buen diseño responsive general** — no hay errores de layout, overflow, ni rotura de contenido en ningún viewport. El único hallazgo relevante es la **falta de optimización de touch targets para dispositivos móviles/táctiles**, que afecta a la usabilidad y al cumplimiento WCAG AA.

**Prioridad:** Media — mejora de UX, no blocker.

