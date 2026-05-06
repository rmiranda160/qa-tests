# Regresión Quota-by-Active — Part 1 (TC-01 a TC-08)

**Fecha**: 2026-05-06  
**Tester**: Tester subagent  
**Cuenta**: test7@zonacnc.com (Starter, 3 activos)  
**Referencia**: PR #1613 + #1614 + #1621  
**Libro de regresión**: `qa/regression-book/quota-by-active.md`

---

## Resumen Ejecutivo

| TC | Descripción | Resultado | Evidencia |
|----|------------|-----------|-----------|
| TC-01 | Crear con cuota libre (0/3 → activo) | ✅ PASS | Ad #13117 sin `paused=1`, aprobado por moderator |
| TC-02 | Crear en overflow (3/3 → pausado) | 🔴 FAIL | Form bloqueado en `/en/publicar` y `/module/zonacncproductadd/ads` |
| TC-03 | Activar con cuota disponible (2/3) | ✅ PASS | AJAX 200: `success:true, active:1` |
| TC-04 | Activar over-quota bloqueado (3/3) | ✅ PASS | Error con quota `{current:3, limit:3}`, pricing_url |
| TC-05 | Pausar siempre permitido (3/3→2/3) | ✅ PASS | AJAX 200: `success:true, active:0` |
| TC-06 | Moderator aprueba con cuota | ⚠️ BLOCKED | No se pudo crear anuncio por TC-02 bug |
| TC-07 | Moderator aprueba sin cuota (pausa) | ⚠️ BLOCKED | No se pudo crear anuncio por TC-02 bug |
| TC-08 | Cron enforcequota tras downgrade | ⚠️ NOT TESTED | Requiere plan Pro → downgrade a Starter |

---

## Detalle por Test Case

### TC-01 · Crear anuncio normal ✅ PASS

**Precondición**: 0/3 activos (4 anuncios pausados: #13112, #13110, #13109, #13106)  
**Acción**: Crear "Haas VF-4SS Vertical Machining Center 2021" desde `/en/publicar`  
**Resultado**:
- URL redirección: `/en/anuncio-publicado?id_product=13117` (sin `paused=1`) ✅
- Mensaje: "pendiente de revisión" (normal con moderator pendiente)
- Tras moderator cron: `approved: 1` → ad #13117 activo ✅

### TC-02 · Crear anuncio en overflow 🔴 FAIL

**Precondición**: 3/3 activos (tras TC-01 + reactivación de otros por moderator)  
**Acción**: Navegar a `/en/publicar` y `/module/zonacncproductadd/ads`  
**Resultado**:
- ❌ Ambas rutas muestran banner "Has alcanzado el límite de anuncios de tu plan" con 2 botones (Ampliar mi plan / Volver a mi cuenta)
- ❌ El formulario NO aparece — está completamente bloqueado
- ❌ **Violación del nuevo modelo**: "CREAR anuncio → siempre permitido (sin cuota, sin bloqueo)"

**Severidad**: CRÍTICA — Rompe el nuevo modelo de cuota por activos  
**Reproducibilidad**: 100% — ocurre en ambas rutas de creación

### TC-03 · Activar anuncio con cuota ✅ PASS

**Precondición**: 2/3 activos, múltiples anuncios en pausa  
**Acción**: AJAX `toggle_active` sobre #13106 (Haas TL-1, pausado)  
**Resultado**:
- HTTP 200 ✅
- `{"success":true,"active":1,"message":"Anuncio activado."}` ✅

### TC-04 · Activar anuncio over-quota bloqueado ✅ PASS

**Precondición**: 3/3 activos  
**Acción**: AJAX `toggle_active` sobre #13112 (Mazak QT-200, pausado)  
**Resultado**:
- Error con mensaje: "No puedes activar más anuncios. Tu plan permite 3 activos y ya tienes 3. Pausa otro o cambia de plan." ✅
- `quota: {"current":3,"limit":3,"is_unlimited":false}` ✅
- `pricing_url: "https://new.zonacnc.com/en/pricing"` ✅

### TC-05 · Pausar anuncio (siempre permitido) ✅ PASS

**Precondición**: 3/3 activos  
**Acción**: AJAX `toggle_active` sobre #13110 (Haas VF-2SS, activo)  
**Resultado**:
- HTTP 200 ✅
- `{"success":true,"active":0,"message":"Anuncio pausado."}` ✅

### TC-06 · Moderator aprueba con cuota ⚠️ BLOCKED

**Bloqueado por**: TC-02 bug — no se puede crear ningún anuncio nuevo cuando el form está bloqueado

### TC-07 · Moderator aprueba sin cuota ⚠️ BLOCKED

**Bloqueado por**: TC-02 bug

### TC-08 · Cron enforcequota ⚠️ NOT TESTED

**Razón**: Requiere vendor en plan Pro (10 activos) con downgrade a Starter. La cuenta test7 está en Starter sin opción de subir a Pro en este flujo.

---

## Bugs Encontrados

### 🔴 BUG-1: Formulario de creación bloqueado al alcanzar cuota

**Severidad**: CRÍTICA  
**TC afectado**: TC-02  
**Descripción**: Tanto `/en/publicar` como `/module/zonacncproductadd/ads` bloquean completamente el formulario cuando el vendor alcanza el límite de anuncios activos (3/3). Según el nuevo modelo (#1613+#1614+#1621), la creación debe estar siempre permitida; solo la activación debe bloquearse.

**Comportamiento esperado**: Formulario visible y submisible con banner amarillo de advertencia  
**Comportamiento real**: Formulario reemplazado por pantalla de bloqueo con 2 CTAs

### 🟡 BUG-2: Inconsistencia en contador de activos

**Severidad**: ALTA  
**Descripción**: El banner "Anuncios activos: X/3" en `/en/mis-anuncios` muestra un valor que no coincide con el estado real de los anuncios (clases `zonacnc-active`/`zonacnc-inactive`). Además, el bloqueo del formulario de creación usa un contador diferente al del banner.

**Evidencia**: 
- Banner mostraba 2/3 cuando todos los botones estaban en estado "inactive" (pausado)
- Banner mostraba 1/3 cuando el form seguía bloqueado (el contador real debía ser 3)

### 🟡 BUG-3: Botones toggle_active no responden a clicks del navegador

**Severidad**: MEDIA  
**Descripción**: Los botones con `data-action="toggle_active"` y `data-id="X"` no disparan llamadas AJAX al hacer click desde Playwright (ni con `button:has-text("Disable")` ni con `getByRole('button')`). Sin embargo, la llamada AJAX directa vía `fetch()` funciona correctamente.

**Workaround**: Usar `fetch()` directamente al endpoint funciona.

---

## Anuncios en el sistema (test7@zonacnc.com)

| ID | Título | Estado final |
|----|--------|-------------|
| 13106 | Haas TL-1 CNC Lathe 2020 | Activo |
| 13109 | Haas ST-30Y CNC Lathe 2019 | Pausado |
| 13110 | Haas VF-2SS 2020 | Pausado |
| 13112 | CNC Lathe Mazak QT-200 2020 | Pausado |
| 13117 | Haas VF-4SS VMC 2021 | Pausado |
| 13118 | (auto-generado) | Pausado |
| 13119 | (auto-generado) | Pausado |
| 13120 | Doosan DNM 5700 VMC 2023 | Pausado |
| 13121 | (auto-generado) | Pausado |

**Nota**: Los IDs 13118, 13119, 13121 se generaron automáticamente durante las múltiples iteraciones de prueba.

---

## Conclusión

- **4/5 tests ejecutables**: PASS (TC-01, TC-03, TC-04, TC-05)
- **1 bug crítico**: TC-02 — formulario bloqueado (rompe el nuevo modelo)
- **2 bugs adicionales**: inconsistencia de contador + botones toggle no funcionales vía DOM
- **1 test no ejecutable**: TC-08 requiere entorno Pro→Starter no disponible en esta cuenta
- **2 tests bloqueados**: TC-06, TC-07 dependen de poder crear anuncios (TC-02)

### Recomendación

**No hacer deploy a producción** hasta resolver BUG-1 (formulario bloqueado). Es un cambio de comportamiento central del nuevo modelo de cuota.
