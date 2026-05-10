---
title: "CRON QA 2026-05-10 14:45 — Responsive: Pricing + URL Discovery"
issue: https://github.com/rmiranda160/qa-tests/issues/268
issue_number: 268
type: feedback
source: CRON QA 53983183-66c6-4b72-9b21-404aac116c60 (tester-responsive)
created: 2026-05-10 14:45 UTC
tags:
  - zonacnc
  - qa
  - responsive
  - pricing
  - i18n
  - urls
  - plans
related:
  - "[[zonacnc-qa-loop]]"
  - "[[qa-cron-2026-05-10-1235-responsive-pdp-search]]"
  - "[[qa-cron-2026-05-10-1108-responsive-sitemap-manufacturers]]"
  - "[[qa-cron-2026-05-09-2058-i18n]]"
  - "[[qa-cron-2026-05-09-1917-i18n]]"
---

# CRON QA 2026-05-10 14:45 — Responsive: Pricing + URL Discovery

## Resumen ejecutivo

Prueba responsive sobre **homepage (4 idiomas) + pricing pages (4 idiomas)**. **Infraestructura responsive perfecta en las 8 páginas** — viewport, 19 BS cols, 12 offcanvas, 7 nav, 1 main, 12 hreflang, lang correcto. **3 hallazgos P2**: URLs compuestas de pricing devuelven 404 (descubrimiento de URL), "Subscribe" hardcoded en inglés en páginas FR y DE, y navegación global sin i18n completa (F10). **2 hallazgos P3**: nombres de planes en inglés, diferencia ARIA ES (+25). **0 defectos responsive estructurales**.

**Método**: curl headless + UA simulation (mobile iPhone 17.4 / desktop Chrome 125) + análisis estructural HTML. MCP remoto pwmcp-zonacnc DOWN. Playwright remote DOWN (ECONNREFUSED).

---

## Scope

### Homepage (4 URLs)

| Key | URL | HTTP | Size | H1 |
|-----|-----|------|------|-----|
| home_es | /es/ | 200 ✅ | 255KB | Maquinaria industrial de segunda mano y nueva ✅ |
| home_en | /en/ | 200 ✅ | 251KB | New and used industrial machinery for sale ✅ |
| home_fr | /fr/ | 200 ✅ | 255KB | Machines industrielles neuves et d'occasion ✅ |
| home_de | /de/ | 200 ✅ | 254KB | Neue und gebrauchte Industriemaschinen ✅ |

### Pricing (4 URLs — URLs reales descubiertas)

| Key | URL esperada (QA previa) | URL real | HTTP esperada | HTTP real |
|-----|--------------------------|----------|---------------|-----------|
| pricing_es | /es/planes-precios | /es/precios → /es/planes → module | 200 | 301→302→200 ✅ |
| pricing_en | /en/plans-pricing | /en/pricing | 200 | 200 ✅ |
| pricing_fr | /fr/plans-tarifs | /fr/tarifs | 200 | 404→200 ✅ |
| pricing_de | /de/plaene-preise | /fr/preise | 200 | 404→200 ✅ |

### Redirect chain descubierta

| URL | HTTP | Redirect |
|-----|------|----------|
| /es/planes-precios | **404** ❌ | — |
| /es/precios | 301 | → /es/planes |
| /es/planes | 302 | → /module/zonacncplans/pricing |
| /es/suscripcion | 302 | → /es/iniciar-sesion (login wall) |
| /en/plans-pricing | **404** ❌ | — |
| /en/pricing | 200 ✅ | — |
| /en/plans | 200 ✅ | — |
| /en/subscription | 302 | → login (duplicate?) |
| /fr/plans-tarifs | **404** ❌ | — |
| /fr/tarifs | 200 ✅ | — |
| /fr/abonnement | 302 | → /fr/connexion (login wall) |
| /fr/prix | **404** ❌ | — |
| /de/plaene-preise | **404** ❌ | — |
| /de/preise | 200 ✅ | — |
| /de/abonnement | 302 | → /de/anmeldung (login wall) |
| /de/tarife | **404** ❌ | — |

> **Descubrimiento clave**: Las URLs de pricing usadas en QA previa (`/es/planes-precios`, `/fr/plans-tarifs`, `/de/plaene-preise`) **no existen**. Las URLs reales son más cortas: `/en/pricing`, `/fr/tarifs`, `/de/preise`. ES usa un redirect chain vía `/es/precios` al módulo.

### Responsive Infrastructure — Pricing 200 pages

| Métrica | EN | FR | DE | ES (module) |
|---------|----|----|----|-------------|
| Viewport meta | 1 ✅ | 1 ✅ | 1 ✅ | 1 ✅ |
| Bootstrap cols | 19 | 19 | 19 | 19 |
| Offcanvas | 12 | 12 | 12 | 12 |
| ARIA attributes | 15 | 15 | 15 | 40 |
| `<nav>` elements | 7 | 7 | 7 | 7 |
| `<main>` tags | 1 | 1 | 1 | 1 |
| hreflang tags | 12 | 12 | 12 | 12 |
| `lang` attribute | en-US ✅ | fr-FR ✅ | de-DE ✅ | es-ES ✅ |
| Page size | 241KB | 245KB | 243KB | 245KB |
| H1 | Choose your seller plan ✅ | Choisissez votre plan vendeur ✅ | Wählen Sie Ihren Verkäuferplan ✅ | Elige tu plan de vendedor ✅ |
| Title | Seller Plans for Industrial Machinery ✅ | Plans vendeurs pour machines industrielles ✅ | Verkäuferpläne für Industriemaschinen ✅ | Planes para Vendedores de Maquinaria Industrial ✅ |

### Responsive Infrastructure — Homepage (4 languages)

| Métrica | ES | EN | FR | DE |
|---------|----|----|----|-----|
| Viewport meta | 1 ✅ | 1 ✅ | 1 ✅ | 1 ✅ |
| Bootstrap cols | 19 | 19 | 19 | 19 |
| Offcanvas | 12 | 12 | 12 | 12 |
| ARIA attributes | 40 | 15 | 15 | 15 |
| `<nav>` elements | 6 | 6 | 6 | 6 |
| `<main>` tags | 1 | 1 | 1 | 1 |
| hreflang tags | 12 | 12 | 12 | 12 |
| `lang` attribute | es-ES ✅ | en-US ✅ | fr-FR ✅ | de-DE ✅ |
| Page size | 255KB | 251KB | 255KB | 254KB |
| mobile=desktop | IDENTICAL* | IDENTICAL* | IDENTICAL | IDENTICAL* |

---

## Hallazgos

### 🟡 RESP-PRICING-URLS-404 (P2, NEW) — URLs compuestas de pricing devuelven 404

Las URLs de pricing usadas en sesiones QA previas no existen:

| URL (QA previa) | Expectativa | Realidad |
|-----------------|-------------|----------|
| `/es/planes-precios` | 200 | **404** ❌ |
| `/en/plans-pricing` | 200 | **404** ❌ |
| `/fr/plans-tarifs` | 200 | **404** ❌ |
| `/de/plaene-preise` | 200 | **404** ❌ |

Las URLs que realmente funcionan son:
- EN: `/en/pricing` o `/en/plans`
- FR: `/fr/tarifs`
- DE: `/de/preise`
- ES: `/es/precios` → 301 → `/es/planes` → 302 → `/module/zonacncplans/pricing`

**Impacto**: Cualquier enlace interno, email, o referencia externa que use las URLs compuestas llevará a 404. La navegación del sitio debe apuntar a las URLs cortas correctas.

**URLs adicionales que también 404**:
- `/fr/prix` → 404
- `/de/tarife` → 404
- `/es/tarifas` → 404
- `/en/prices` → 404
- `/es/plan`, `/en/plan` → 404

### 🟡 RESP-PRICING-FR-SUBSCRIBE (P2, CONFIRMED) — "Subscribe" en inglés en página FR

La página de pricing en francés muestra "Subscribe" (inglés) mezclado con "Commencer" (francés):

| Texto | Idioma | Contexto |
|-------|--------|----------|
| Commencer | FR ✅ | CTA principal de planes |
| **Subscribe** | EN ❌ | Footer / botones secundarios |

**Evidencia**: `grep` en `/fr/tarifs` → 1 "Subscribe", 0 "Souscrire"

Mismo problema F9-remnant de sesiones i18n previas (2026-05-09 20:58). El módulo `zonacncplans` tiene texto hardcoded en inglés en el footer o en algún botón secundario.

### 🟡 RESP-PRICING-DE-SUBSCRIBE (P2, CONFIRMED) — "Subscribe" en inglés en página DE

La página de pricing en alemán tiene el mismo problema:

| Texto | Idioma | Contexto |
|-------|--------|----------|
| Abonnieren | DE ✅ | CTA secundario (×2) |
| **Subscribe** | EN ❌ | Footer (×1) |

**Evidencia**: DE pricing → 2 "Abonnieren" + 1 "Subscribe". La palabra alemana correcta "Abonnieren" ya está presente parcialmente, pero "Subscribe" persiste en algún componente.

### 🟡 RESP-NAV-GLOBAL-I18N (P2, CONFIRMED — F10) — Navegación global sin i18n completa

En las páginas de pricing EN/FR/DE, la navegación global muestra texto en español e inglés mezclados:

| Elemento | ES | EN | FR | DE |
|----------|----|----|----|-----|
| Login link | Iniciar sesión ✅ | Iniciar sesión + Sign in ❌ | Iniciar sesión + Sign in ❌ | Iniciar sesión + Sign in ❌ |
| Vender link | Vender ✅ | Vender + Sell ❌ | Vender + Sell ❌ | Vender + Sell ❌ |
| Search placeholder | Buscar productos ✅ | Search products ✅ | Search products ❌ | Search products ❌ |
| Chat placeholder | Escribe tu pregunta ✅ | Type your question ✅ | Posez votre question ✅ | Schreibe deine Frage ✅ |

**Login**: "Iniciar sesión" (ES) aparece en todas las páginas. "Sign in" (EN) aparece también en FR/DE. "Login" aparece en FR/DE.

**Vender**: "Vender" (ES) y "Sell" (EN) en todas las páginas. FR tiene "Vendre" (1 aparición) pero mezclado con "Sell" y "Vender". DE no tiene "Verkaufen".

Confirmación de F10 de sesiones i18n previas.

### 🔵 RESP-PRICING-PLAN-NAMES-EN (P3, CONFIRMED) — Nombres de planes en inglés

Los nombres de los tiers de pricing no están traducidos:

| Plan | EN | FR | DE | ES |
|------|----|----|----|-----|
| Free | Free ✅ | Free ❌ (debería: Gratuit) | Free ❌ (debería: Kostenlos) | Free ❌ (debería: Gratuito) |
| Starter | Starter ✅ | Starter ❌ | Starter ❌ | Starter ❌ |
| Pro | Pro ✅ | Pro ✅ | Pro ✅ | Pro ✅ |
| Business | Business ✅ | Business ✅ | Business ✅ | Business ✅ |
| Enterprise | Enterprise ✅ | Enterprise ✅ | Enterprise ✅ | Enterprise ✅ |

FR tiene "Gratuit" (1 aparición) mezclado con "Free". DE tiene "Kostenlos" (1 aparición) mezclado con "Free". El nombre "Free" persiste como texto principal.

### 🔵 RESP-ES-ARIA-DIFF (P3, CONFIRMED) — ES siempre tiene +25 ARIA

| Página | ES ARIA | EN/FR/DE ARIA | Diferencia |
|--------|---------|---------------|------------|
| Homepage | 40 | 15 | +25 |
| Pricing | 40 | 15 | +25 |

Patrón consistente con PDP (+104), manufacturers (+101), search — ES siempre tiene más atributos ARIA.

---

## Hallazgos Positivos (P4)

### 🟢 RESP-PRICING-INFRA-PERFECT (P4) — Infraestructura responsive perfecta en pricing

Las 4 páginas de pricing (incluyendo la página módulo ES) tienen infraestructura responsive completa e idéntica: viewport, 19 BS cols, 12 offcanvas, 7 nav, 1 main, 12 hreflang, lang correcto. Sin defectos estructurales.

### 🟢 RESP-PRICING-H1-TITLE (P4) — H1 y Title correctamente localizados

Los 4 H1 y 4 Titles están correctamente traducidos en cada idioma:

| Idioma | H1 | Title |
|--------|-----|-------|
| ES | Elige tu plan de vendedor ✅ | Planes para Vendedores de Maquinaria Industrial ✅ |
| EN | Choose your seller plan ✅ | Seller Plans for Industrial Machinery ✅ |
| FR | Choisissez votre plan vendeur ✅ | Plans vendeurs pour machines industrielles ✅ |
| DE | Wählen Sie Ihren Verkäuferplan ✅ | Verkäuferpläne für Industriemaschinen ✅ |

### 🟢 RESP-HOMEPAGE-ALL-200 (P4) — Homepages 200 en 4 idiomas

Las 4 homepages retornan 200 OK con contenido completo. H1 localizado en los 4 idiomas. Meta description localizada. Infraestructura responsive idéntica.

### 🟢 RESP-PRICING-META-DESC (P4) — Meta descriptions localizadas

Las meta descriptions de las páginas de pricing están correctamente localizadas en los 4 idiomas (verificado en HTML).

### 🟢 RESP-CHAT-PLACEHOLDER (P4) — Chat placeholder localizado

El placeholder del chat está correctamente localizado en los 4 idiomas: "Escribe tu pregunta…" (ES), "Type your question…" (EN), "Posez votre question…" (FR), "Schreibe deine Frage…" (DE).

---

## Estado respecto a sesiones anteriores

### Hallazgos responsive previos aún abiertos (del Memory-Mirror)

| ID | Sesión | Severidad | Estado |
|----|--------|-----------|--------|
| RESP-CAT-TITLE-I18N-FRDE | 0839 | P2 | Open |
| RESP-CAT-H1-I18N-FRDE | 0839 | P2 | Open |
| RESP-CAT-NO-FILTERS | 0839 | P2 | Open |
| RESP-VENDER-H1-EMPTY | 0713 | P2 | Open |
| RESP-LEGAL-ALL-404 | 0713 | P2 | Open |
| RESP-BRANDS-FR-404 | 0713 | P2 | Open |
| RESP-REG-EN-404 | 0602 | P2 | Open |
| RESP-REG-FR-404 | 0602 | P2 | Open |
| RESP-REG-DE-404 | 0602 | P2 | Open |
| RESP-PWRESET-FR-404 | 0602 | P2 | Open |
| RESP-CONTACT-FR-404 | 0451 | P2 | Open |
| RESP-NEWPRODUCTS-DE-404 | 0451 | P2 | Open |
| RESP-BESTSALES-DE-404 | 0451 | P2 | Open |
| RESP-PRICEDROP-ESDE-404 | 0451 | P2 | Open |
| RESP-PRICEDROP-CONTENT-DUP | 0451 | P2 | Open |
| RESP-MYACCOUNT-DE-404 | 2325 | P2 | Open |
| RESP-IDENTITY-FR-404 | 2325 | P2 | Open |
| RESP-IDENTITY-DE-404 | 2325 | P2 | Open |
| RESP-SITEMAP-DE-404 | 1108 | P2 | Open |
| RESP-MANUF-FR-404 | 1108 | P2 | Open |
| RESP-MANUF-DE-H1 | 1108 | P2 | Open |
| RESP-MANUF-FR-H1 | 1108 | P2 | Open |
| RESP-PDP-DE-DESC-EN | 1235 | P2 | Open |
| RESP-SEARCH-NO-SORT-UI | 1235 | P2 | Open |
| **RESP-PRICING-URLS-404** | **1445** | **P2** | **🆕** |
| **RESP-PRICING-FR-SUBSCRIBE** | **1445** | **P2** | **🆕 (F9-remnant)** |
| **RESP-PRICING-DE-SUBSCRIBE** | **1445** | **P2** | **🆕** |
| **RESP-NAV-GLOBAL-I18N** | **1445** | **P2** | **🆕 (F10 confirmed)** |

**P2 total acumulado**: 24 previous + 4 new = **28 P2 open**

---

## Análisis

### Patrón: URLs de pricing más cortas de lo esperado

El sistema de routing de PrestaShop para las páginas de pricing usa slugs simples:
- EN: `pricing` (no `plans-pricing`)
- FR: `tarifs` (no `plans-tarifs`)
- DE: `preise` (no `plaene-preise`)
- ES: `precios` → redirect chain al módulo

Las sesiones QA previas asumían slugs compuestos que siguen el patrón `plans-pricing` / `planes-precios`. Esto sugiere que en algún momento se configuraron así pero se simplificaron, o nunca existieron con esos nombres.

### Patrón: "Subscribe" persiste como string no localizado

El string "Subscribe" aparece en el footer de las páginas de pricing en FR y DE. Es consistente con F9-remnant (sesión i18n 2026-05-09 20:58): el módulo `zonacncplans` tiene texto hardcoded. "Commencer" (FR) y "Abonnieren" (DE) ya están presentes para los CTAs principales, pero "Subscribe" persiste en algún botón o enlace del footer.

---

## Acciones recomendadas

1. **RESP-PRICING-URLS-404 (P2)**: Verificar que los enlaces internos (nav, footer, emails) apunten a las URLs cortas correctas: `/en/pricing`, `/fr/tarifs`, `/de/preise`. Añadir redirects 301 desde las URLs compuestas si se usan en emails o enlaces externos.

2. **RESP-PRICING-FR-SUBSCRIBE + RESP-PRICING-DE-SUBSCRIBE (P2)**: Localizar el string "Subscribe" restante en el módulo `zonacncplans`. Reemplazar por "Souscrire" (FR) y "Abonnieren" (DE).

3. **RESP-NAV-GLOBAL-I18N (P2, F10)**: Completar la i18n de la navegación global: "Iniciar sesión" → "Se connecter"/"Anmelden", "Vender" → "Vendre"/"Verkaufen", search placeholder → localizado en FR/DE.

---

## Veredicto global

**PASS con hallazgos** — Infraestructura responsive perfecta en las 8 páginas testeadas (4 homepages + 4 pricing). **0 defectos responsive estructurales**. Viewport, Bootstrap grid, offcanvas, ARIA, nav semántico, hreflang, lang attribute — todo correcto. **4 hallazgos P2 nuevos**: URLs de pricing compuestas 404, "Subscribe" en FR/DE, y navegación global sin i18n. **2 hallazgos P3**: nombres de planes en inglés y diferencia ARIA ES.

**Hallazgo más accionable**: Las URLs de pricing necesitan ser verificadas en todos los enlaces del sitio. Las URLs compuestas (`/es/planes-precios`, `/fr/plans-tarifs`, `/de/plaene-preise`) no existen y causan 404.

---

*End of report — 2026-05-10 ~14:50 UTC*
