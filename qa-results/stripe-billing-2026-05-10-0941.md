# Stripe Billing QA — 2026-05-10 09:41 UTC

## Status: 🟡 OPERATIONAL — STATUS QUO

### PASSING (11/11)
- ✅ Backend tests: 45/45 ALL PASS
- ✅ Boost ledger: diff=0 (2 vendors, 10 monthly + 70 permanent = 80)
- ✅ Stripe Prices: 21 OK (4 plans × 2 freq + 4 add-ons × 2 freq + 5 boost packs)
- ✅ Pricing pages: 4/4 200 OK (/pricing in ES/EN/FR/DE)
- ✅ Sell pages: 4/4 200 OK
- ✅ Checkout flow: pagar-plan → login redirect localizado por idioma
- ✅ IMAP: 24/24 cuentas test7-test30 accesibles
- ✅ MCP API: /api/v1/mcp 401 (endpoint existe)
- ✅ /subscription: /en/subscription 302 → login (nueva mejora)
- ✅ /suscripcion: /es/suscripcion 302 → login
- ✅ Account pages: /de/mein-konto, /fr/donnees-personnelles, /de/persoenliche-daten todos 404 (sin cambios)

### P2 ISSUES (6 open, 2 new)

| ID | Descripción | Estado |
|----|-------------|--------|
| F5 | "tu plan tu plan" en email cancelación (test24 UID=15) | 🔴 16º QA sin fix |
| F9v | Header i18n: "Buscar" ES en EN/FR/DE, "Subscribe" EN en FR/DE | 🔴 Sin cambios |
| NH1 | URL "pagar-plan" hardcodeada ES en 4 idiomas | 🔴 Sin cambios |
| W1 | /webhook GET 404, POST 403 | 🔴 4º día |
| W2 | /stripewebhook GET 404, POST 403 | 🔴 Sin cambios |
| A1 | Admin panel: todas URLs 404 | 🔴 Sin cambios |
| **NH4** | **Importe vacío en email Boost Pack (test24 UID=14)** | 🆕 P2 |
| **NH5** | **3+ días sin actividad de billing (desde May 7)** | 🆕 P2 |

### P3 ISSUES (10 open)

| ID | Descripción |
|----|-------------|
| RESP-DE | /de/mein-konto → 404 |
| RESP-FR | /fr/donnees-personnelles → 404 |
| RESP-DE2 | /de/persoenliche-daten → 404 |
| R3-H1 | Sell page H1 vacío ×4 idiomas |
| F12 | Newsletter "Subscribe" EN en FR/DE |
| N19 | "Periodo: monthly" en emails ES (test14 UID=10) |
| REM1 | "gratis" (ES) remnant en FR pricing |
| REM2 | "Añadir nueva máquina" (ES) en DE sell page |
| REM3 | "Cancel" (EN) en FR pricing button |
| NH6 | /en/subscription ahora 302 (mejora P4) |

### Pricing i18n — STATU QUO

| Label | ES | EN | FR | DE |
|-------|----|----|----|----|
| CTA subscribe | ✅ | ✅ | ✅ | ✅ |
| CTA buy | ✅ | ✅ | — | ✅ |
| CTA cancel | ✅ | ✅ | 🟡 Cancel | ✅ |
| "Boost Pack" | ✅ | ✅ | 🟡 | 🟡 |
| "Featured" | 🟡 | 🟡 | 🟡 | 🟡 |
| "monthly" | 🟡 | 🟡 | 🟡 | 🟡 |

### Billing Emails — Cuentas con actividad

| Cuenta | Último billing | Tipo |
|--------|---------------|------|
| test7 | May 6, 19:12 | Factura Starter |
| test9 | May 7, 09:01 | Bienvenida Starter |
| test10 | May 6, 08:19 | Bienvenida Starter |
| test14 | May 5, 18:51 | Bienvenida Business + N19 |
| test15 | May 7, 17:32 | Add-on + Factura (ÚLTIMO EVENTO) |
| test24 | May 5, 08:07 | Add-on + Factura + Cancelación + Boost Pack (NH4) |
| test26 | May 7, 02:46 | Add-on + Factura |

### Recomendaciones

1. **BLOCKER**: Restaurar /webhook y /stripewebhook (3+ días sin billing)
2. **HIGH**: F5 "tu plan tu plan" → `$plan->name[$id_lang]`
3. **HIGH**: NH4 Importe vacío en email Boost Pack
4. **HIGH**: Recuperar acceso admin panel
5. **MEDIUM**: NH1 Localizar "pagar-plan" para EN/FR/DE
6. **MEDIUM**: i18n "Boost Pack" / "Featured" / "monthly" en FR/DE
7. **MEDIUM**: F9v Header i18n ("Buscar" ES residual)
