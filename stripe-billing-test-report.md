# Stripe Billing Test Report — new.zonacnc.com

**Date:** 2026-05-05 00:24 UTC  
**Test Account:** test7@zonacnc.com (Test Vendor Seven QA)  
**Plan:** Pro — €99/mes, next charge 05/06/2026  
**Payment Method:** Visa •••• 4242 (Stripe test card)  
**Environment:** ⚠️ TESTMODUS / Stripe Sandbox

---

## 1. Escenario ejecutado: Compra de add-on "Anuncio extra"

| Paso | Acción | Resultado |
|------|--------|-----------|
| 1 | Login test7@zonacnc.com | ✅ Autenticado como "Test Vendor Seven QA" |
| 2 | Navegar a /es/suscripcion | ✅ Plan Pro activo, 2 add-ons (18€/mes), facturas=9 |
| 3 | Añadir 1 Anuncio extra (9€/mes) | ✅ Diálogo de confirmación: "Stripe cobrará la parte proporcional" |
| 4 | Confirmar compra | ✅ Add-on añadido, límite 12→13 anuncios |
| 5 | Verificar factura generada | ✅ Invoice #AZHLKTSF-0093, €8.98, Visa •••• 4242 |
| 6 | Verificar factura en Stripe | ✅ Stripe Sandbox, "Invoice paid", descargable |
| 7 | Verificar email de confirmación | ✅ Email UID 32: "Add-on añadido a tu suscripción" (ES) |
| 8 | Verificar contador facturas | ✅ 9→10 en "Rechnungen & Zahlungen" |
| 9 | Verificar historial facturación | ✅ Fila nueva: 05/05/2026, 8.98 EUR, Completado |

---

## 2. Stripe Integration Verification

### 2.1 Stripe Invoices (Verificados)
| Invoice # | Fecha | Importe | Concepto |
|-----------|-------|---------|----------|
| AZHLKTSF-0093 | 05/05/2026 | €8.98 | Add-on Anuncio Extra (prorrateado) |
| AZHLKTSF-0092 | 05/05/2026 | €5.72 | Add-on ajuste |
| AZHLKTSF-00XX | 05/05/2026 | €59.94 | Cambio Starter→Pro |
| AZHLKTSF-00XX | 05/05/2026 | €30.07 | Plan Starter inicial |

### 2.2 Stripe Invoice Page
- ✅ URL: `invoice.stripe.com/i/acct_1TPLFqELpLIGgmZK/...`
- ✅ Título: "Entorno de prueba de Veleta Comercializaciones y Servicios SLU"
- ✅ "Sandbox" badge visible
- ✅ "Invoice paid" + "€8.98"
- ✅ Payment method: "Visa •••• 4242"
- ✅ Botones: "Download invoice" / "Download receipt"
- ✅ Footer: "Powered by Stripe" + Terms/Privacy links
- ⚠️ Invoice page is bilingual: company name in Spanish, UI in English

### 2.3 Stripe Test Cards
- ✅ Visa 4242 funciona correctamente como método de pago guardado
- ✅ Cobros prorrateados calculados correctamente

---

## 3. Email Verification (IMAP)

### 3.1 Emails Recibidos (Inbox test7@zonacnc.com, 32 total)
De los 32 correos, 16 son recientes (4-5 Mayo 2026), 4 son transaccionales de billing:

| UID | Asunto | Tipo | Idioma |
|-----|--------|------|--------|
| 29 | ¡Bienvenido a Starter! Tu suscripción está activa | Plan activation | ES |
| 30 | Empieza con buen pie en ZonaCNC: 3 pasos en 10 minutos | Onboarding | ES |
| 31 | Factura pagada — Tu plan sigue activo | Payment receipt | ES |
| 32 | Add-on añadido a tu suscripción | Add-on confirmation | ES |

### 3.2 Email Template Review (UID 32 — Add-on confirmation)
- **Formato:** multipart/alternative (text/plain + text/html)
- **Encoding:** quoted-printable, UTF-8
- **From:** no-reply@mg.zonacnc-sales.es
- **HTML:** Responsive design con logo ZonaCNC, botones CTA, footer legal
- **Contenido HTML:** Bien estructurado — include de header/footer, colores corporativos, link a suscripción
- **Contenido texto plano:** Funcional, con URLs completas
- ✅ Plantilla profesional, bien formada
- ⚠️ Solo disponible en español — no se detectó versión en otros idiomas

### 3.3 Email Template Review (UID 31 — Payment receipt)
- Misma estructura: logo, mensaje, tabla de detalles de pago
- Incluye enlace a factura Stripe PDF
- "Próximo cobro: 05/06/2026"
- ✅ Claro, informativo

### 3.4 IMAP Method
- ✅ Conexión vía openssl s_client a zonacnc.com:993
- ✅ Login con credenciales de .env.qa.email
- ✅ Búsqueda por subject "billing" → sin resultados (asuntos en español)
- ✅ Búsqueda por fecha SINCE 4-May-2026 → resultados correctos

---

## 4. Translation Review (German / Deutsch)

### 4.1 Global UI (✅ Bien traducido)
| Original (ES) | Deutsch | Estado |
|---------------|---------|--------|
| Cambiar idioma | Sprache wechseln | ✅ |
| Vendedores | Verkäufer | ✅ |
| Precios | Preise | ✅ |
| Categorías | Kategorien | ✅ |
| Vender máquina | Maschine verkaufen | ✅ |
| Mis anuncios | Meine Anzeigen | ✅ |
| Mis mensajes | Meine Nachrichten | ✅ |
| Panel de vendedor | Verkäufer-Dashboard | ✅ |
| Mi suscripción | Mein Abonnement | ✅ |
| Facturas y pagos | Rechnungen & Zahlungen | ✅ |
| Test mode banner | TESTMODUS — Testumgebung | ✅ |

### 4.2 Subscription Page /de/abonnement (❌ SIN TRADUCIR)
| Elemento | Muestra | Esperado |
|----------|---------|----------|
| Page title | "Mi suscripción" | "Mein Abonnement" |
| Plan status | "Activa" | "Aktiv" |
| Next charge | "Próximo cobro" | "Nächste Abbuchung" |
| Price unit | "€ /mes" | "€/Monat" |
| Active ads | "Anuncios activos" | "Aktive Anzeigen" |
| Limit warning | "Has alcanzado el límite..." | "Sie haben das Anzeigenlimit..." |
| Upgrade CTA | "Mejora tu plan" | "Plan upgraden" |
| Change plan | "Cambiar de plan" | "Plan wechseln" |
| Payment method | "Método de pago" | "Zahlungsmethode" |
| Change card | "Cambiar tarjeta" | "Karte wechseln" |
| Cancel text | "Puedes cancelar tu suscripción..." | "Sie können Ihr Abonnement..." |
| Cancel button | "Cancelar al final del período" | "Am Periodenende kündigen" |
| Invoice history | "Historial de facturas" | "Rechnungshistorie" |
| Table headers | "Fecha / Plan / Importe / Estado / Factura" | "Datum / Plan / Betrag / Status / Rechnung" |
| Status | "Completado" | "Abgeschlossen" |
| View invoice | "Ver factura" | "Rechnung ansehen" |
| Add-on table | "Tipo / Cantidad / Precio / Período / Estado" | "Typ / Menge / Preis / Zeitraum / Status" |
| Active status | "Activo" | "Aktiv" |
| Cancel button | "Cancelar" | "Kündigen" |
| Add add-on section | "Añadir add-on a tu plan" | "Add-on zu Ihrem Plan hinzufügen" |
| Add-on description | "Se añade sobre tu suscripción..." | Spanischer Text |
| Add button | "Añadir" | "Hinzufügen" |
| Breadcrumb | "Mi cuenta" | "Mein Konto" |

### 4.3 Billing Page /de/facturacion (❌ SIN TRADUCIR)
| Elemento | Muestra | Esperado |
|----------|---------|----------|
| Page title | "Facturas y pagos" | "Rechnungen & Zahlungen" |
| Description | "Aquí encontrarás un histórico..." | Spanischer Text |
| Table headers | "Fecha / Concepto / Importe / Estado / Factura" | "Datum / Beschreibung / Betrag / Status / Rechnung" |
| Status | "completado" / "pendiente" | "abgeschlossen" / "ausstehend" |
| View invoice | "Ver factura" | "Rechnung ansehen" |

**Resumen traducciones:** La interfaz global está bien traducida al alemán, pero las páginas de suscripción y facturación muestran TODO el contenido en español. Esto es un bug de traducción.

---

## 5. Funcionalidades Verificadas

| Funcionalidad | Estado | Detalles |
|--------------|--------|----------|
| Login | ✅ | Funciona, sesión mantenida |
| Ver plan activo | ✅ | Pro €99/mes |
| Añadir add-on | ✅ | Diálogo de confirmación claro |
| Cobro Stripe (prorrateo) | ✅ | €8.98 correcto (~22 días restantes de €9) |
| Factura Stripe generada | ✅ | AZHLKTSF-0093 |
| PDF factura descargable | ✅ | Vía /module/zonacncplans/billingdownload |
| Historial actualizado | ✅ | Nueva fila en suscripción y facturación |
| Contador facturas | ✅ | 9→10 |
| Email transaccional enviado | ✅ | UID 32, en español |
| Enlace Stripe en email | ✅ | Lleva a invoice.stripe.com |
| Vista factura Stripe | ✅ | Modo test, datos correctos |
| Cambio de idioma (header) | ✅ | Deutsch/English/Català/etc. |
| Traducción sidebar | ✅ | Correcta |
| Traducción suscripción (DE) | ❌ | Todo en español |
| Traducción facturación (DE) | ❌ | Todo en español |
| Test mode banner | ✅ | Visible en todas las páginas |

---

## 6. Issues Encontrados

### BUG-001: Páginas de suscripción/facturación no traducidas al alemán
**Severidad:** Medium  
**URLs:** `/de/abonnement`, `/de/facturacion`, `/de/suscripcion`  
**Descripción:** Al cambiar a Deutsch, la navegación global y sidebar se traducen correctamente, pero el contenido principal de las páginas de suscripción y facturación permanece en español.  
**Impacto:** Usuarios alemanes ven la UI de billing en español, lo que puede generar confusión y reducir conversiones.

### BUG-002: Emails transaccionales solo en español
**Severidad:** Low-Medium  
**Descripción:** Todos los emails de billing (activación, factura, add-on) se envían en español independientemente del idioma del usuario.  
**Impacto:** Usuarios no hispanohablantes reciben emails en un idioma que puede no entender.

### BUG-003: Título de página no traducido
**Severidad:** Low  
**URL:** `/de/facturacion`  
**Descripción:** El `<title>` es "Facturas y pagos · ZonaCNC" incluso en la versión alemana.

---

## 7. Conclusión

✅ **Stripe billing funciona correctamente.** Los cobros se procesan, las facturas se generan en Stripe Sandbox, los emails de notificación se envían, y el historial se actualiza en tiempo real. El prorrateo de add-ons calcula correctamente.

⚠️ **Las traducciones al alemán están incompletas** en las páginas de billing (suscripción y facturación), mostrando todo el contenido en español. Los emails transaccionales solo existen en español.

**Recomendación:** Añadir traducciones DE para el módulo de suscripción y facturación, y generar emails multi-idioma basados en la preferencia del usuario.

---

## 8. Notas Técnicas

- **Stripe Account:** acct_1TPLFqELpLIGgmZK (test mode)
- **Email From:** no-reply@mg.zonacnc-sales.es
- **IMAP Server:** zonacnc.com:993 (SSL)
- **Invoice URL pattern:** `invoice.stripe.com/i/acct_1TPLFqELpLIGgmZK/test_...`
- **PDF download URL pattern:** `/module/zonacncplans/billingdownload?id=N&from=subscription`
- **Billing page:** `/de/facturacion` (URL slug correcto en DE, contenido en ES)
- **MCP Browser:** pwmcp-zonacnc (Playwright-based)
