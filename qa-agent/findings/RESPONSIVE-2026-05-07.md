# QA Responsive — 2026-05-07 11:33 UTC

**Site:** https://new.zonacnc.com  
**Viewports tested:** Mobile (375×667), Tablet (768×1024), Desktop (1440×900)  
**Pages tested:** Home, Category Listing, Product Detail, Pricing, Login, Registration  

---

## Resumen

| Métrica | Resultado |
|---------|-----------|
| Horizontal scroll (mobile) | ❌ Encontrado en 1 página |
| Horizontal scroll (tablet) | ✅ Sin incidencias |
| Horizontal scroll (desktop) | ✅ Sin incidencias |
| Viewport meta tag | ✅ `width=device-width, initial-scale=1` |
| Hamburguesa menú (mobile) | ✅ Visible |
| Cookie consent UX (mobile) | ❌ Ocupa 64% del viewport |
| Títulos SEO | ⚠️ Registration page = "zonacnc.com" |
| Errores JS en consola | ⚠️ Google One Tap + Unexpected token '&' |
| Touch targets pequeños | ⚠️ 44 elementos < 44px |

---

## 🔴 Finding #1 — Horizontal overflow en category listing (mobile)

**Severity:** Alta  
**Page:** `/es/8-centros-de-mecanizado` (category listing)  
**Viewport:** Mobile 375×667  
**Evidence:** `body.scrollWidth=511 > clientWidth=375`

**Root cause:** Product listing row index 5 contiene el título "DEPÓSITO AUTÓNOMO DE REFRIGERACIÓN CON FILTRO." que no se envuelve correctamente dentro del contenedor `.zcnc-row-link` (349px). Los hijos `.zcnc-row-info`, `.zcnc-row-title`, `.zcnc-row-desc`, etc. se extienden hasta 486px (right=511, left=25).

**CSS culpable:**
- `.zcnc-row-link` tiene `overflow: visible` → permite que los hijos desborden
- `.zcnc-row-info` tiene `flex-wrap: nowrap` + `width: 486px` (forzado por el contenido largo)
- El título largo en MAYÚSCULAS agrava el problema al no tener `word-break` ni `overflow-wrap`
- `.zcnc-row-desc` tiene `overflow: hidden` pero el daño ya está hecho por los padres

**Fix sugerido:**
1. Añadir `word-break: break-word` o `overflow-wrap: break-word` a `.zcnc-row-title`
2. Cambiar `.zcnc-row-link` de `overflow: visible` a `overflow: hidden`
3. Añadir `max-width: 100%` en la cadena de contenedores
4. Considerar `text-overflow: ellipsis` para títulos muy largos en mobile

---

## 🟡 Finding #2 — Cookie consent ocupa 64% del viewport en mobile

**Severity:** Media  
**Page:** Todas (global)  
**Viewport:** Mobile 375×667  

**Evidence:** `.zcnc-cc` mide 426px de alto (top=241, bottom=667), ocupando el 64% de la pantalla en móvil.

Esto bloquea casi todo el contenido útil en primera carga. Aunque es un banner de consentimiento necesario, el tamaño es excesivo.

**Fix sugerido:**
- Reducir el padding/margins del banner en mobile
- Usar un diseño más compacto para el texto de consentimiento
- Considerar un banner tipo "bottom sheet" más pequeño

---

## 🟡 Finding #3 — Título de página "zonacnc.com" en Registration

**Severity:** Baja (SEO)  
**Page:** `/es/?controller=registration`  
**Viewport:** Todos  

**Evidence:** `<title>zonacnc.com</title>` — falta un título descriptivo. Otras páginas tienen títulos correctos (ej: "Iniciar Sesión — ZonaCNC Marketplace de Maquinaria").

**Fix sugerido:** Añadir título SEO descriptivo: "Crear Cuenta — ZonaCNC Marketplace de Maquinaria"

---

## 🟡 Finding #4 — Errores Google One Tap en consola

**Severity:** Baja  
**Page:** Todas  

**Evidence:** 3 tipos de errores recurrentes en todas las páginas:
- `Provider's accounts list is empty.`
- `FedCM get() rejects with NetworkError: Error retrieving a token.`
- `Not signed in with the identity provider.`
- `Unexpected token '&'` (35+ ocurrencias)

Estos son errores del módulo Google Sign-In / One Tap (`zonacnc-oauth`). Aunque no rompen funcionalidad, generan ruido y pueden indicar un problema de configuración en FedCM.

---

## 🟡 Finding #5 — Touch targets pequeños

**Severity:** Baja (accesibilidad)  
**Page:** Home (mobile)  

**Evidence:** 44 elementos interactivos con width o height < 44px (mínimo recomendado WCAG 2.5.5). Incluye:
- "Mostrar/ocultar enlaces" buttons: 24×26px
- Links de categorías y alertas: 30px height
- Search input: 38px height

**Fix sugerido:** Revisar elementos con height < 44px y aumentar el área táctil con padding.

---

## ✅ Páginas sin incidencias responsive

- **Homepage** — Sin overflow horizontal en ningún viewport
- **Product detail** — Sin overflow, layout responsive correcto
- **Pricing** — Tarjetas se adaptan correctamente en mobile
- **Login** — Formulario responsive, sin overflow
- **Registration** — Formulario responsive, sin overflow
- **Tablet (768px)** — Todas las páginas sin overflow

---

## ✅ Elementos responsive correctos

- Viewport meta tag presente y correcto
- Menú hamburguesa visible y funcional en mobile
- Header sticky con z-index adecuado
- Imágenes responsive (escalan correctamente)
- Chat FAB posicionado correctamente (bottom-right)
- Navegación offcanvas para mobile
- Footer responsive con columnas colapsables

---

## Métricas por viewport

| Página | Mobile (375) | Tablet (768) | Desktop (1440) |
|--------|-------------|-------------|----------------|
| Home | bodySW=375 ✅ | bodySW=768 ✅ | bodySW=1440 ✅ |
| Category | bodySW=511 ❌ | bodySW=768 ✅ | bodySW=1440 ✅ |
| Product | bodySW=375 ✅ | bodySW=768 ✅ | bodySW=1440 ✅ |
| Pricing | bodySW=375 ✅ | bodySW=768 ✅ | bodySW=1440 ✅ |
| Login | bodySW=375 ✅ | bodySW=768 ✅ | bodySW=1440 ✅ |
| Register | bodySW=375 ✅ | bodySW=768 ✅ | bodySW=1440 ✅ |
