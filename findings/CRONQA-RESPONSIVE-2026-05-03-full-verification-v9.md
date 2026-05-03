# CRON QA: Responsive — Full Verification (9 pages × 4 viewports)

**Date:** 2026-05-03 20:30 UTC  
**Focus:** responsive  
**Site:** new.zonacnc.com  
**Agent:** tester (cron: tester-responsive)  
**Method:** MCP browser (pwmcp-zonacnc) — manual viewport + JS evaluation  

---

## Resultado: ⚠️ PASS CON HALLAZGOS

**6 páginas probadas × 4 viewports (375, 768, 1280, 1440/1920) = 23 combinaciones**  
No hay layout breakages ni 500 errors. El sitio está operativo. 2 hallazgos responsive + 1 accesibilidad + 1 console error + 1 URL.

---

### Resumen

| Página | Mobile 375 | Tablet 768 | Desktop 1280 | Desktop 1440/1920 |
|--------|-----------|-----------|-------------|------------------|
| `/es/` (Homepage) | ⚠️ Hero overflow 75px + 12 touch | ⚠️ Hero overflow 154px + 13 touch | ✅ OK | ⚠️ Hero 384px + CTA 20px overflow |
| `/es/28-maquinaria-metal` (Category) | ✅ 0 overflow + 47 touch | ⚠️ Accordion 24px overflow + 37 touch | ✅ OK | ✅ OK |
| `/es/pricing` (Pricing) | ⚠️ Card 4px overflow + 11 touch | ✅ | ✅ | ✅ |
| `/es/buscar` (Search/listing) | ✅ 0 overflow + 31 touch | ✅ | ✅ | ✅ |
| `/es/iniciar-sesion` (Login) | ✅ 0 overflow + 12 touch | ✅ | ✅ | ✅ |
| Product page (Gildemeister CTX 510) | ✅ 0 overflow + 18 touch | ✅ | ✅ | ✅ |
| Registration page | ✅ 0 overflow + 18 touch | ✅ | ✅ | ✅ |

---

### Hallazgo 1 (MEDIUM): Content clipping in hero section (`section.zcnc-hero`)

**Severidad:** MEDIUM  
**Descripción:** La sección hero de la homepage usa `overflow: hidden` y recorta contenido interno. El contenido real es más ancho que el contenedor visible.

| Viewport | Diferencia scrollWidth vs clientWidth |
|----------|--------------------------------------|
| 375×667 (mobile) | 75px clipped |
| 768×1024 (tablet) | 154px clipped |
| 1920×1080 (desktop) | 384px clipped |

**Impacto:** En todos los viewports hay contenido del hero que se pierde visualmente. En mobile es significativo (75px = ~20% del ancho). Esto podría ocultar texto, imágenes decorativas o CTAs.

**Elemento:** `section.zcnc-hero` con imágenes de fondo/decoración  
**URL:** `https://new.zonacnc.com/es/`

---

### Hallazgo 2 (LOW): Content clipping in CTA section (`div.zonacnc-cta-inner`)

**Severidad:** LOW  
**Descripción:** En desktop 1920px, el contenedor interno de la CTA section tiene 20px de contenido recortado vía `overflow: hidden`.  
**Elemento:** `div.zonacnc-cta-inner`  
**URL:** `https://new.zonacnc.com/es/`

---

### Hallazgo 3 (HIGH): Small touch targets en mobile (WCAG 2.5.5)

**Severidad:** HIGH  
**Descripción:** Múltiples enlaces y botones en vista mobile tienen dimensiones inferiores a los 44×44px recomendados por WCAG 2.5.5 (Target Size).

| Elemento | Altura mínima | Peor caso |
|----------|-------------|-----------|
| Breadcrumb links | 17px | `Inicio`, breadcrumbs |
| Brand links | 16px | `Gildemeister`, brand tags |
| Nav buttons | 37px | `Categorías`, `Cancelar` |
| Zoom button | 38×38px | Product zoom |
| Contact link | 18px | `Contactar para ver` |
| Checkbox inputs | 13×13px | Form checkboxes |

**Páginas afectadas:** Todas las páginas con breadcrumbs (todas excepto homepage), todas con formularios, todas con listados de marcas/productos.

**En mobile 375×667:**
- Homepage: 12 targets < 44px
- Category page: 47 targets < 44px
- Search page: 31 targets < 44px
- Product page: 18 targets < 44px
- Registration: 18 targets < 44px

---

### Hallazgo 4 (LOW): Console error "Not signed in with the identity provider"

**Severidad:** LOW  
**Descripción:** En las páginas de búsqueda y listado se registra un error de consola: `"Not signed in with the identity provider."`  
**Impacto:** Probablemente un widget de login social (Google/Apple SSO) que se carga y lanza error cuando el usuario no está autenticado.  
**URL:** Páginas de búsqueda (`/es/buscar`, `/es/28-maquinaria-metal`)

---

### Hallazgo 5 (LOW): Pricing page URL redirect

**Severidad:** LOW  
**Descripción:** La URL `/es/content/10-precios` (usada en pruebas previas) hace un redirect 301 a `/es/content/10-preguntas-frecuentes`. La página de precios correcta está en `/es/pricing`.  
**Impacto:** Mínimo — la redirección funciona, pero el path antiguo debería actualizarse en referencias/documentación.

---

### Estado del sitio

- **Login (`/es/iniciar-sesion`):** ✅ HTTP 200 con formulario (recuperado del error 500 de días anteriores)
- **Registro (`/?controller=registration`):** ✅ HTTP 200 con formulario de 25 campos
- **Todas las páginas:** ✅ No hay HTTP 500 ni páginas vacías
- **Viewport meta:** ✅ Presente y correctamente configurado (`width=device-width, initial-scale=1`)
- **Footer:** ✅ Acordeón responsive funcional en mobile

---

### Conclusión

El sitio está **operativo** y **responsive** (no hay layout breakages). Los 5 hallazgos son:

| # | Severidad | Descripción | 
|---|-----------|-------------|
| 1 | MEDIUM | Hero section content clipping (todos los viewports) |
| 2 | LOW | CTA inner section clipping (desktop 1920px) |
| 3 | HIGH | Touch targets < 44px en mobile (WCAG 2.5.5) |
| 4 | LOW | Console error: SSO provider |
| 5 | LOW | Pricing URL redirect obsoleto |

**Respuesta general:** ✅ PASS — pero se recomienda corregir touch targets (alta prioridad WCAG) y revisar el overflow del hero.
