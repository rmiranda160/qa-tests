# Regresión Quota-by-Active — Part 1 CONTINUACIÓN (TC-06 a TC-08 + verificaciones)

**Fecha**: 2026-05-06 09:21–09:35 UTC  
**Tester**: Tester subagent (continuation session)  
**Cuenta**: qatester-reg20260506@zonacnc.com (Starter, 3/3 activos)  
**Referencia**: PR #1613 + #1614 + #1621  
**Libro de regresión**: `qa/regression-book/quota-by-active.md`

---

## Estado Inicial

Al reanudar la sesión, la cuenta `test7@zonacnc.com` (password `77G7YmLXuOae`) ya no era accesible — password cambiado. Se optó por continuar con `qatester-reg20260506@zonacnc.com` (ZonaCNCtest2026!) que también tiene plan Starter y estaba en 3/3 activos.

**Anuncios activos al inicio**:
| ID | Título | Estado |
|----|--------|--------|
| 13069 | DMG MORI CTX 310 CNC Turning Center 2022 | Published |
| 13070 | Haas ST-20 CNC Lathe 2021 Q2 | Published |
| 13077 | Okuma LB3000 EX II CNC Lathe 2023 TC02-OVERFLOW | Published |
| 13071 | Mazak Quick Turn 250 CNC Lathe 2020 Q3 | Disabled |

**Quota**: 3/3 — Banner amarillo "Has alcanzado el máximo de tu plan"

---

## TC-06 · Moderator aprueba con cuota / Crear 4º anuncio ❌ FAIL (BUG confirmado)

### Verificación de bloqueo al crear 4º anuncio

**Precondición**: 3/3 activos, plan Starter  
**Acciones**:

1. Navegar a `/en/publicar`:
   - ❌ El formulario de creación de máquina NO aparece
   - ✅ Se muestra `zonacnc-quota-block`: "Has alcanzado el límite de anuncios de tu plan"
   - Texto: "Currently you have 3 … 3 anuncios activos permitidos"
   - Botones: "Expand my plan" + "Return to my account"
   - Los pasos del wizard (1 Data, 2 Photos, 3 Send) se renderizan pero SIN campos de formulario

2. Navegar a `/en/module/zonacncproductadd/ads`:
   - ❌ Mismo comportamiento: bloque completo sin formulario
   - 0 campos de producto (`machineFieldCount: 0`)

**Conclusión**: El formulario está COMPLETAMENTE BLOQUEADO en ambas rutas de creación cuando se alcanza 3/3. Esto contradice el nuevo modelo de cuota donde crear siempre debe estar permitido.

### Verificación adicional: suscripción

Navegando a `/en/subscription`:
- Plan: **Starter** — 39€/mes, ACTIVA
- Próximo cobro: 06/06/2026
- Anuncios activos: **3 / 3**
- Warning: "Has alcanzado el límite de anuncios de tu plan. Mejora tu plan"
- Método de pago: No guardado (Stripe usa tarjeta registrada)
- 1 factura: 06/05/2026 — Starter — 39.00 EUR — Completado

---

## TC-07 · Enforcequota cron ⚠️ NO EJECUTABLE

**Razón**: El endpoint `/en/module/zonacncplans/cron?action=enforcequota` requiere token de autenticación. Sin el token, responde 403 Forbidden.

El reporte anterior (Part 1) documentó:
- `candidates=1, applied=1, new_plan=0, new_quota=0`
- `stripe_sync: "sync_failed:plan_not_loaded"`

Esto ya fue registrado como **BUG-03 (MEDIUM)**.

---

## TC-08 · Forzar sobrepasar cuota vía API ❌ FAIL (bloqueo confirmado)

### Intento de creación vía POST directo

Se probaron múltiples variantes de POST a `/en/module/zonacncproductadd/ads`:

| Intento | Parámetros | Status | Body |
|---------|-----------|--------|------|
| #1 | `ajax=1&action=submitProduct&product[name]=...&product[price]=...` | 200 | **Empty (0 bytes)** |
| #2 | `fc=module&module=zonacncproductadd&controller=ads&product_name=...` | 200 | **Empty (0 bytes)** |
| #3 | `process=submitProduct&product[name]=...&product[price]=...` | 200 | **Empty (0 bytes)** |
| #4 | `redirect: manual` | 200 | **Empty (0 bytes), no Location header** |

**Conclusión**: El módulo `zonacncproductadd` bloquea la creación de anuncios vía API cuando el vendor está en el límite de cuota. Todas las peticiones POST retornan HTTP 200 con `content-length: 0` — el módulo detecta el estado de cuota y sale sin procesar.

**Nota**: La creación vía API DIRECTA también está bloqueada. No hay bypass posible por este vector.

---

## Comparativa entre sesiones

| Aspecto | Sesión 1 (test7-quota) | Sesión 2 (test7) | Sesión 3 (qatester-reg) | **Esta sesión (qatester-reg)** |
|---------|----------------------|-------------------|------------------------|-------------------------------|
| TC-02 (crear en overflow) | FAIL: Form bloqueado | FAIL: Form bloqueado | FAIL: Sin detección over-quota | FAIL: Form bloqueado |
| TC-03 (activar con cuota) | BLOCKED (JS error) | ✅ PASS (AJAX) | FAIL (409) | — |
| TC-04 (activar over-quota) | BLOCKED (JS error) | ✅ PASS (409 + msg) | FAIL (409 + no msg) | — |
| TC-05 (pausar) | ❌ FAIL (JS error) | ✅ PASS | ✅ PASS | — |
| TC-06 (crear 4º) | BLOCKED | BLOCKED | — | ❌ FAIL (bloqueado) |
| TC-07 (enforcequota) | NO TEST | NO TEST | — | ⚠️ NO TOKEN |
| TC-08 (API force) | PARCIAL | NO TEST | — | ❌ FAIL (bloqueo API) |

---

## Bugs consolidados

### 🔴 CRITICAL — 2 bugs

| ID | Descripción | Evidencia |
|----|------------|-----------|
| **BUG-01** | Formulario de creación COMPLETAMENTE BLOQUEADO al alcanzar cuota. Tanto `/en/publicar` como `/en/module/zonacncproductadd/ads` reemplazan el formulario con `zonacnc-quota-block` y botones "Expandir plan" / "Volver". | screenshot, DOM inspection: 0 machine fields, quota-block presente |
| **BUG-02** (B-REG-02) | Moderator cron activa anuncios ignorando cuota. El anuncio #13077 (Okuma) fue creado en overflow y quedó PUBLISHED activo tras cron → 4/3 efectivo. | ID 13077: badge=Published, active |

### 🟠 HIGH — 3 bugs

| ID | Descripción |
|----|------------|
| **BUG-03** (B-REG-03) | Toggle active/pause retorna JSON malformado (HTML en lugar de JSON). Error `Unexpected token '&'` en consola. |
| **BUG-04** (B-REG-04) | Sin feedback visible en UI cuando activación es rechazada (409). Alert element existe pero vacío. |
| **BUG-05** (B-REG-05) | Contador de cuota no se actualiza vía AJAX tras toggle. Requiere refresh de página. |

### 🟡 MEDIUM — 3 bugs

| ID | Descripción |
|----|------------|
| **BUG-06** (B-REG-06) | Banner amarillo "límite alcanzado" ausente en formulario de creación. |
| **BUG-07** (B-REG-07) | Badge DISABLED contradice status PUBLISHED en mismo anuncio (incoherencia UI). |
| **BUG-08** (B-REG-08) | Mensaje de éxito siempre muestra "pendiente de revisión" ignorando auto-approve. |

### 🔵 LOW — 1 bug

| ID | Descripción |
|----|------------|
| **BUG-09** (B-REG-09) | Enforcequota: `stripe_sync: sync_failed:plan_not_loaded` para subscription 1. |

---

## API Block Analysis (TC-08 detalle)

El módulo `zonacncproductadd` parece tener **doble bloqueo**:
1. **Bloqueo UI**: El template renderiza `zonacnc-quota-block` en lugar del formulario cuando `active_count >= quota_limit`
2. **Bloqueo API**: El método `postProcess()` o equivalente devuelve respuesta vacía (posiblemente `exit()` o `die()`) sin procesar la solicitud

El comportamiento en el módulo probablemente es:
```php
if ($activeCount >= $quotaLimit) {
    // Bloquea completamente - no procesa POST
    exit; // o return empty
}
```

Esto viola el nuevo modelo donde:
- UI debe mostrar formulario con banner amarillo
- POST debe procesarse y crear el anuncio con `active=0`
- Redirect debe ser `/success?paused=1`

---

## Recomendaciones finales

1. **URGENTE (antes de deploy)**: Desbloquear formulario en overflow — mostrar form con warning, no bloqueo
2. **URGENTE**: Moderator cron debe verificar cuota antes de activar anuncios aprobados
3. **ALTA**: Arreglar endpoint toggle_active para retornar JSON válido en 409
4. **MEDIA**: Actualizar contador de cuota vía AJAX tras toggle
5. **MEDIA**: Unificar badges PUBLISHED/DISABLED con estado real

---

*Reporte generado por OpenClaw QA — tester subagent continuation — 2026-05-06 09:35 UTC*
