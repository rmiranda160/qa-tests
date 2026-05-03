# CRON_QA: stripe-billing — Reporte 2026-05-03 21:53 UTC

**Ejecutor:** tester (pwmcp-zonacnc)
**Entorno:** new.zonacnc.com (MODO TEST)
**Cuenta QA:** test11@zonacnc.com (Starter)
**Plan:** Starter (3 anuncios, 39€/mes, Trial 30d, próximo cobro 02/06/2026)
**Duración:** ~30 min
**Escenario:** 1 — Creación de anuncio + verificación de suscripción/facturación

---

## Resumen Ejecutivo

| Aspecto | Estado |
|---|---|
| Login / Autenticación | ✅ PASS |
| Suscripción Starter (UI) | ✅ PASS |
| Stripe estado (Activa) | ✅ PASS |
| Creación de anuncio (1/3 slots) | ✅ PASS |
| Facturación (página) | ✅ PASS (sin movimientos) |
| Email #3 "Bienvenido a Starter" | ✅ PASS (variables OK) |
| Email #4 Onboarding "Empieza con buen pie" | ❌ **REGRESSION** (variables sueltas) |
| Email #5 Password reset | ✅ PASS |
| Email #6 Password confirm | ✅ PASS |

---

## Hallazgos Detallados

### 🔴 FINDING-001 (REGRESSION): Onboarding email template variables sin reemplazar

**Severidad:** Medium
**Componente:** Email templates → Onboarding (post-suscripción)
**Archivos afectados:** Plantilla de email "Empieza con buen pie en ZonaCNC: 3 pasos en 10 minutos"

**Descripción:**
El email #4 de test11 (enviado tras activar Starter) contiene las siguientes variables de plantilla **sin procesar** (aparecen literalmente en el cuerpo del email):

- `{vendor_dashboard_url}`
- `{max_listings}`
- `{new_ad_url}`
- `{messaging_url}`
- `{boost_quota_monthly}`
- `{boostpacks_url}`

**Evidencia (IMAP email #4, test11):**
```
...
Paso 1: Crea tu primer anuncio
Accede a tu panel de vendedor desde el siguiente enlace: {vendor_dashboard_url}
...
Paso 2: Publica hasta {max_listings} anuncios
...
Crea tu primer anuncio en {new_ad_url}
...
Paso 3: Conecta con compradores
Gestiona tus conversaciones en {messaging_url}
...
Mejora tu visibilidad: tienes {boost_quota_monthly} Boost 24h al mes
Consigue más contactos con {boostpacks_url}
```

**Contexto:** Este mismo bug fue reportado previamente en el reporte del 2026-05-03 18:25 UTC (cuenta test8, plan Pro). **No se ha corregido.** Afecta tanto a Starter como a Pro.

**Acción recomendada:** Revisar la función que procesa las variables de la plantilla de onboarding (`Mail::send()` o el hook que reemplaza `{vendor_dashboard_url}` etc.) y asegurar que el array de variables se pasa correctamente.

---

### 🟢 PASS-001: Suscripción Starter — Activación y UI

**Plan contratado:** Starter
**Estado:** Activa
**Precio:** 39€ /mes
**Próximo cobro:** 02/06/2026
**Método de pago:** Stripe (tarjeta registrada en cuenta Stripe)

La UI muestra correctamente:
- "Starter Activa" con badge verde
- Contador "Anuncios activos: 1 / 3" (tras crear anuncio)
- Enlace a "Cambiar de plan"
- Add-ons disponibles (Anuncio extra 12€/mes)

---

### 🟢 PASS-002: Creación de anuncio bajo Starter

**Anuncio creado:** ID 12969 — "Torno CNC Haas ST-10"
**Fecha:** 2026-05-03 21:57 UTC
**Categoría:** Tornos > Tornos automáticos
**Marca:** Haas
**Precio:** 25.000€
**Estado:** Pendiente de revisión

La UI muestra correctamente:
- "Anuncio publicado" → "Tu anuncio 'Torno CNC Haas ST-10' esta pendiente de revision. Te notificaremos por email cuando sea aprobado."
- Contador de anuncios en suscripción se actualizó de 0/3 → 1/3

**Nota:** No se generó email de notificación por la creación (esperado — el anuncio está pendiente de revisión).

---

### 🟢 PASS-003: Facturación — Página de facturas vacía (esperado)

La página "Facturas y pagos" muestra:
- "Sin movimientos todavía" con icono
- Texto explicativo: "Cuando contrates un plan o un pack Boost, los pagos aparecerán aquí."
- Comportamiento correcto: la suscripción está en período de prueba, primer cobro el 02/06/2026

---

### 🟢 PASS-004: Email "Bienvenido a Starter" — Variables correctas

Email #3 de test11 enviado desde Stripe subscription activation:

| Variable | Esperado | Recibido |
|---|---|---|
| Plan | Starter | Starter |
| Precio | 39,00€ | 39,00€ |
| Próximo cobro | 02/06/2026 | 02/06/2026 |

Todas las variables se reemplazaron correctamente en este template.

---

### 🟢 PASS-005: Password reset flow

Email #5 (Confirmación de contraseña):
- Idioma: Español ✓
- Token de reset presente y funcional ✓
- Enlace correcto con parámetros `token`, `id_customer`, `reset_token` ✓

Email #6 (Su nueva contraseña):
- Idioma: Español ✓
- Mensaje de confirmación correcto ✓

**Nota:** A diferencia del reporte anterior con test9, no se observó mezcla de idiomas (EN subject + ES body) en estos correos de test11.

---

## Resumen de Resultados

| Prueba | Resultado |
|---|---|
| Login con credenciales válidas | ✅ |
| Suscripción Starter visible y activa | ✅ |
| Contador de anuncios (0/3 → 1/3) | ✅ |
| Creación de anuncio (pendiente revisión) | ✅ |
| Página de facturación (sin movimientos) | ✅ |
| Email #3 Bienvenido a Starter (variables) | ✅ |
| Email #4 Onboarding (variables) | ❌ REGRESSION |
| Email #5 Password reset request | ✅ |
| Email #6 Password reset confirm | ✅ |

**FINDINGS:** 1 (REGRESSION: onboarding template variables)
**PASS:** 5
**FAIL:** 0 (regression inherited from previous build)

---

## Referencias

- Reporte anterior: `report-stripe-billing-2026-05-03-1825.md` (test8, Pro Active)
- Cuenta QA: test11@zonacnc.com (ID customer: 6623)
- Anuncio creado: ID 12969
- Stripe subscription: Starter (sub_starter_test11)
- Site: https://new.zonacnc.com/es/
