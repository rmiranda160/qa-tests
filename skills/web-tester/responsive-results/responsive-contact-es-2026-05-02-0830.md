# CRON QA — Responsive Test Report: Contacto (Spanish)
**Date:** 2026-05-02 08:30 UTC  
**Agent:** tester (subagent)  
**Focus:** responsive  
**Scenario:** Contact form page (Spanish)  
**URL:** https://new.zonacnc.com/es/contactenos  
**Method:** MCP remote browser (navigate + snapshot + resize + evaluate)  
**Verdict:** ✅ PASS (A-)

---

## Summary

| Check | Status | Detail |
|-------|--------|--------|
| Viewport meta tag | ✅ | `width=device-width, initial-scale=1` |
| HTTP status | ✅ | 200 |
| Page load time | ✅ | 470ms (DOM) / 528ms (full) |
| DOM size | ✅ | 556 elements |
| Console errors | ✅ | Only FedCM "accounts list empty" + "get() rejects" (non-critical, Google) |
| No horizontal overflow | ✅ | All 3 breakpoints |
| Cookie consent dialog | ✅ | Present at desktop, dismissible (`#zcnc-cc-accept`) |
| Test mode banner | ✅ | ⚠️ MODO TEST — visible at all breakpoints |
| Back to top link | ✅ | Present and functional |
| Chat button | ✅ | Present at all breakpoints |
| Viewport meta | ✅ | `width=device-width, initial-scale=1` |

---

## Responsive Breakpoint Results

### ✅ Desktop 1280×720

| Element | Status | Detail |
|---------|--------|--------|
| Top bar | ✅ | Full labels: Contacte con nosotros, Vendedores, Tarifas, Language selector (11 languages), Iniciar sesión |
| Main navbar | ✅ | Logo + "Categorías" text + search bar + "Vender máquina" text |
| Breadcrumb | ✅ | Inicio > Contacte con nosotros |
| Store info panel (left) | ✅ | "Información de la tienda" with location icon + email link (no-reply@mg.zonacnc-sales.es) |
| Form subject selector | ✅ | "Asunto" label + select: Servicio al cliente / Webmaster |
| Email input | ✅ | Label "Email" + placeholder "tu@email.com" |
| File attachment | ✅ | "Fichero adjunto" with file input |
| Message textarea | ✅ | "Mensaje" label + placeholder "¿En qué podemos ayudarte?" |
| "Enviar tu mensaje" button | ✅ | Present, visible, type=submit |
| Footer – Legal navigation | ✅ | Visible with links |
| Footer – Marketplace | ✅ | Visible |
| Footer – Nuestra empresa | ✅ | Visible |
| Footer – Su cuenta | ✅ | Visible with link to "mi-cuenta" |
| Footer – Store info | ✅ | Address: "zonacnc.com España" |
| Categorías destacadas | ✅ | 16 category links listed |
| Marcas líderes | ✅ | 12 brand links listed |
| Newsletter | ✅ | Email input + "Suscríbete" button |

### ✅ Tablet 768×1024

| Element | Status | Detail |
|---------|--------|--------|
| Top bar | ✅ | "Contacte con nosotros" text remains; Vendedores/Tarifas collapse to icon-only |
| Main navbar | ✅ | Logo + "Categorías" icon + search bar + "Vender máquina" icon |
| Breadcrumb | ✅ | Visible |
| Layout | ✅ | Store info panel stacks above contact form, full-width |
| Contact form fields | ✅ | Full-width: subject, email, file, message |
| Submit button | ✅ | Full-width |
| Footer | ✅ | 4-column navigation still shows text labels |
| No horizontal scroll | ✅ | bodyWidth=768px, scrollWidth=768px |

### ✅ Mobile 375×812

| Element | Status | Detail |
|---------|--------|--------|
| Top bar | ✅ | Hidden (clean collapse) |
| Main navbar | ✅ | Icon-only: logo, categories, language selector, search toggle, login, sell |
| Search toggle | ✅ | "Mostrar barra de búsqueda" button present + "Cancelar" to close |
| Breadcrumb | ✅ | Visible: "Inicio" link + "/ Contacte con nosotros" text |
| Store info panel | ✅ | Stacks above form: location icon + email link |
| Form subject selector | ✅ | 351×38px, full-width |
| Email input | ✅ | 351×38px, full-width |
| File attachment | ✅ | 351×38px, full-width |
| Message textarea | ✅ | 351×86px, full-width, adequate |
| "Enviar tu mensaje" button | ✅ | 351×38px, full-width, visible, clickable |
| Footer accordions | ✅ | "Mostrar/ocultar" toggles on ALL 5 sections |
| Categorías destacadas | ✅ | 16 category links |
| Marcas líderes | ✅ | 12 brand links |
| Cookie dialog | ✅ | Responsive "Aceptar y cerrar" (343×38px) |
| Chat button | ✅ | Visible |
| Back to top | ✅ | Present |
| No horizontal scroll | ✅ | bodyWidth=375px, no overflow |
| Test mode banner | ✅ | Visible |

---

## WCAG Tap Target Warnings (< 44px at mobile)

| Severity | Count | Elements | Size |
|----------|-------|----------|------|
| 🟡 MEDIUM | 1 | "Categorías" nav link | 61×37px (height −7px) |
| 🟡 MEDIUM | 1 | Language selector (select) | 153×38px (height −6px) |
| 🟡 MEDIUM | 1 | Search input (combobox) | 246×42px (height −2px, borderline) |
| 🟡 MEDIUM | 1 | "Cancelar" search button | 93×38px |
| 🟡 MEDIUM | 1 | "Enviar tu mensaje" submit button | 351×38px (height −6px) |
| 🟡 MEDIUM | 1 | Newsletter email input | 236×38px |
| 🟡 MEDIUM | 1 | Newsletter "Suscríbete" button | 107×38px |
| 🟡 MEDIUM | 5 | Footer accordion toggles (Legal, Marketplace, Nuestra Empresa, Su cuenta, Información tienda) | 24×26px each (−18px) |
| 🟡 MEDIUM | 1 | Breadcrumb "Inicio" link | 35×17px |
| 🟢 LOW | 28 | Category/brand text links in footer | 15–20px height (text links, expected behavior) |
| 🟢 LOW | 1 | Cookie "Política de cookies" link | 128×17px |
| 🟢 LOW | 1 | "Volver arriba" | 1×1px (focus-only, expected) |
| 🟢 LOW | 1 | "Ir al contenido principal" skip link | 1×1px (focus-only, expected) |

> **Note:** These tap target issues are **systemic** to the Hummingbird theme and consistent with findings from all previous responsive tests. The contact form fields at 38px height (vs 44px recommendation) and footer accordion toggles at 24×26px are recurring patterns. No new unique issues specific to this contact page.

---

## Form Structure Verification

| Field | Label | Visible | Required | Type |
|-------|-------|---------|----------|------|
| Subject/Asunto | ✅ "Asunto" | ✅ | ❌ | `<select>` (Servicio al cliente / Webmaster) |
| Email | ✅ "Email" | ✅ | ✅ | `<input type="email">` placeholder: "tu@email.com" |
| File attachment | ✅ "Fichero adjunto" | ✅ | ❌ | `<input type="file">` |
| Message | ✅ "Mensaje" | ✅ | ✅ | `<textarea>` placeholder: "¿En qué podemos ayudarte?" |
| Hidden fields | — | ❌ | — | url, token (CSRF) |
| Submit | ✅ "Enviar tu mensaje" | ✅ | — | `<button type="submit">` |

---

## Button/Action Verification (Regla Miranda)

| Button/Action | Status | Detail |
|---------------|--------|--------|
| "Enviar tu mensaje" (submit) | ✅ | Present at all breakpoints, type=submit, visible |
| Subject selector (dropdown) | ✅ | 2 options: Servicio al cliente, Webmaster |
| Email input | ✅ | Present, required |
| File attachment | ✅ | File upload input present |
| Message textarea | ✅ | Present, required |
| "Suscríbete" newsletter | ✅ | Email input + subscribe button |
| Footer section toggles (mobile) | ✅ | 5 sections with "Mostrar/ocultar" buttons |
| "Inicio" breadcrumb link | ✅ | Links to homepage |
| Language selector | ✅ | 11 languages, current=Español |
| "Iniciar sesión" link | ✅ | Points to login with back URL |
| "Vender máquina" link | ✅ | Points to ads module |
| "Categorías" link | ✅ | Points to busqueda |
| Footer – "Su cuenta" link | ✅ | Points to mi-cuenta |
| Email contact link | ✅ | mailto:no-reply@mg.zonacnc-sales.es |
| "Aceptar y cerrar" cookies | ✅ | Present via #zcnc-cc-accept |
| "Abrir chat de ayuda" | ✅ | Present, button with icon |
| "Volver arriba" | ✅ | Present and functional |
| "Ir al contenido principal" | ✅ | Skip-to-content link (focus-only) |
| Category links in footer | ✅ | 16 categories, all clickable |
| Brand links in footer | ✅ | 12 brands, all clickable |
| "Política de cookies" link | ✅ | Links to /content/9-cookies |

---

## HTTP Performance

| Metric | Value |
|--------|-------|
| DOM Content Loaded | 470ms |
| Full load | 528ms |
| DOM size | 556 elements |
| Total page height | 1,699px (desktop), 2,231px (tablet), 2,166px (mobile) |

---

## Conclusion

**✅ PASS (A-)** — The Spanish Contact page (`/es/contactenos`) renders correctly across all 3 tested viewports (1280×720, 768×1024, 375×812).

**Positive findings:**
- ✅ No layout breakage or horizontal overflow at any breakpoint
- ✅ All form fields present with correct labels and are full-width on mobile
- ✅ Submit button visible and functional
- ✅ Footer accordion collapse/expand works on mobile
- ✅ Cookie dialog, chat button, test mode banner, and back-to-top all present
- ✅ Very fast load time (528ms full)
- ✅ WCAG form labels properly associated (`for` attributes)

**WCAG notes (all pre-existing systemic issues):**
- Form fields at 38px (vs 44px recommended tap target height)
- Footer accordion toggles at 24×26px
- Footer/breadcrumb text links at 17-20px height
- Same pattern observed across all previous responsive tests (homepage, search, login, registration, etc.)
- No new unique issues introduced on this page
