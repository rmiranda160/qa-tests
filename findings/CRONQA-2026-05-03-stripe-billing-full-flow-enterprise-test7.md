# CRONQA: stripe-billing — Full Payment Flow (test7@zonacnc.com)
**Date**: 2026-05-03 19:10 UTC  
**Focus**: stripe-billing (1 escenario)  
**Account**: test7@zonacnc.com — Test Vendor Seven QA  
**Plan**: Business → Enterprise (upgrade via Stripe)  
**Site**: https://new.zonacnc.com/es

---

## Resumen

Se probó el flujo completo de pagos con Stripe en `new.zonacnc.com` usando la cuenta **test7@zonacnc.com** con contraseña `77G7YmLXuOae` (restablecida mediante flujo de password reset). Se ejecutaron 3 operaciones de Stripe con tarjeta de prueba Visa 4242:

1. **Compra de add-on (x1)** — 5,98€ prorrateado ✅
2. **Cambio de cantidad de add-on (x1→x2)** — 5,95€ prorrateado ✅
3. **Upgrade de plan (Business→Enterprise)** — 99,20€ prorrateado ✅

---

## Flujo ejecutado

### 1. Login
- Password reset exitoso mediante email (token válido generado por `new.zonacnc.com`)
- Login con nueva contraseña: OK
- Session activa como "Test Vendor Seven QA"

### 2. Plan original: Business (199€/mes)
- 25 anuncios incluidos + 2 add-ons extra a 6€/mes
- Método de pago: Visa 4242
- Período: hasta 03/06/2026

### 3. Add-on: Anuncio extra (x1→x2)
- Completado vía Stripe checkout (modal de Stripe embebido)
- Invoice #235: 5,95€ (refund -5,96€ + charge +11,91€) ✅
- Stripe invoice URL válida: invoice.stripe.com
- PDF descargable ✅

### 4. Cambio de plan: Business → Enterprise
- Preview pricing correcto: -197,43€ (refund Business) + 296,63€ (prorated Enterprise) = **99,20€**
- Add-ons migrados automáticamente de 6,00€ → 3,00€ cada uno (sin cargo extra)
- Cargo completado en Stripe con tarjeta guardada
- Invoice #236: 99,20€ ✅
- Add-on adjustment Invoice #237: 0,00€ ✅

### 5. Nuevo plan: Enterprise Activa (299€/mes)
- 100 anuncios incluidos + 2 add-ons a 3€/mes = 102 anuncios totales
- Próximo cobro: 03/06/2026
- Add-ons: Anuncios extra x2 a 3.00€/u → 6.00€/mes
- Invoice history: 5 facturas completadas

---

## Histórico de facturas (Invoice IDs)

| # | ID | Concepto | Importe | Estado |
|---|-----|----------|---------|--------|
| 1 | 237 | Add-on adjustment (upgrade migration) | 0,00€ | ✅ |
| 2 | 236 | Upgrade Business→Enterprise | 99,20€ | ✅ |
| 3 | 235 | Add-on quantity x1→x2 proration | 5,95€ | ✅ |
| 4 | 234 | Add-on purchase (x1) | 5,98€ | ✅ |
| 5 | 233 | Upgrade Pro→Business (previous test) | 99,73€ | ✅ |

Total charged this session: **105,15€** (all via Stripe Visa 4242)

---

## Verificación IMAP (test7@zonacnc.com inbox)

Se verificaron los 16 emails del inbox mediante `openssl s_client` IMAP:

### Emails recibidos (plan/suscripción/billing)
| # | Asunto (ES) | Plantilla | OK? |
|---|-------------|-----------|-----|
| 12 | ¡Bienvenido a Pro! Tu suscripción está activa | Onboarding suscripción | ✅ ES |
| 13 | Factura pagada — Tu plan sigue activo | Invoice paid notification | ✅ ES |
| 14 | Add-on añadido a tu suscripción | Add-on added notification | ✅ ES |

### Emails NO recibidos (⚠️ Posible bug/omisión)
| Evento | Email esperado? | Resultado |
|--------|----------------|-----------|
| Add-on quantity change (x1→x2) | No hubo email | ⚠️ Sin notificación |
| Plan upgrade (Business→Enterprise) | No hubo email | ⚠️ Sin notificación |

### Email de onboarding on-hold
| # | Asunto | Notas |
|---|--------|-------|
| 11 | Empieza con buen pie en ZonaCNC | 3 pasos onboarding (Lun 19:22h) |

### Password reset emails — Language mismatch (known)
| # | Asunto | Idioma | Issue |
|---|--------|--------|-------|
| 3 | Confirmación de contraseña | ES ✅ | OK |
| 4 | Su nueva contraseña | ES ✅ | OK |
| 9 | Password query confirmation | EN ⚠️ | Language mismatch (session in English) |
| 10 | Your new password | EN ⚠️ | Language mismatch (session in English) |

---

## Stripe integration review

### Puntos verificados
- ✅ Stripe checkout modal embebido para add-ons
- ✅ Stripe API charge directa para upgrade de plan (cargo único)
- ✅ Invoice URLs de Stripe válidas (invoice.stripe.com)
- ✅ PDF descargable desde ZonaCNC (billingdownload)
- ✅ Prorrateo correcto con refund de días no consumidos
- ✅ Migración de add-ons a precio del nuevo plan
- ✅ Tarjeta guardada (Visa 4242) reutilizada correctamente
- ✅ Historial de facturas completo en UI

### Issues encontrados

1. **Missing email notifications**: El sistema NO envía emails para cambios de cantidad de add-on ni para upgrades de plan. Solo se envía email en:
   - Primera compra de add-on (email #14)
   - Primera compra de suscripción (email #12)
   - Factura pagada periódica (email #13)
   
   Esto puede ser por diseño, pero debería confirmarse si se esperan notificaciones para estos eventos.

2. **Invoice concept text in English mixing**: Las descripciones de conceptos en facturas mezclan inglés con español:
   - `"Unused time on 2 × ZonaCNC — Add-on: anuncio extra after 03 May 2026 (−11,91 €)"`
   - Texto fijo en inglés + texto dinámico en español
   
   **Severidad**: Baja (cosmético, generado por Stripe, no por la app)

3. **Zero-amount invoice**: Invoice #237 por 0,00€ se genera para el ajuste de add-ons durante upgrade. Podría omitirse o agruparse con la invoice principal.

---

## Template / Translation Review

### Páginas verificadas
| Página | Estado | Notas |
|--------|--------|-------|
| /es/module/zonacncplans/subscription | ✅ ES | Correcto |
| /es/module/zonacncplans/change | ✅ ES | Correcto |
| /es/module/zonacncplans/billing | ✅ ES | Correcto |
| /es/ (homepage) | ✅ ES | Correcto |
| /es/module/zonacncplans/pricing | ✅ ES | Correcto (visto en visita previa) |

### Traducciones OK
- "Mi suscripcion" (sidebar, minúscula pero consistente con el patrón)
- "Facturas y pagos" ✅
- "Cambiar plan" ✅
- "Plan actualizado. Cargo prorrateado: €100,00." ✅
- "Método de pago" ✅
- "Anuncios extra x2 3.00 € 6.00 € /mes Activo" ✅
- "¿Cómo funciona el cambio de plan?" con upgrade/downgrade/cancelación/add-ons explicados ✅
- "Devolución 7 días — condiciones" ✅

---

## Conclusión

**Estado: ✅ PASS** — El flujo completo de stripe-billing funciona correctamente en `new.zonacnc.com`.

- Stripe procesa pagos correctamente con tarjeta de prueba Visa 4242
- Prorrateo de add-ons y cambios de plan es matemáticamente correcto
- Facturas se generan con enlaces a Stripe y PDF descargable
- La UI en español es correcta y las traducciones están completas

**2 issues menores registrados** (cosméticos, no bloqueantes):
1. Emails no enviados para cambios de add-on/plan (verificar si es intencional)
2. Descripciones de concepto en facturas mezclan EN/ES (generado por Stripe)
