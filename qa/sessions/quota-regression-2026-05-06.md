# QA Session: quota-by-active regression — Part 1 (TC-01 a TC-08)

**Date:** 2026-05-06 07:00–07:55 UTC  
**Tester:** Tester (subagent)  
**Environment:** https://new.zonacnc.com  
**User:** test7-quota@zonacnc.com / Test Siete  
**Plan:** Starter (3 activos) — ACTIVO  
**Regression Book:** `/projects/zonacnc/qa/regression-book/quota-by-active.md`  
**PRs tested:** #1613 + #1614 + #1621

---

## Setup realizado

### Registro y sub
- ✅ Usuario `test7-quota@zonacnc.com` registrado
- ✅ Dirección fiscal añadida (ID 6185): Calle Test 7, Madrid 28001
- ✅ Plan Starter contratado vía Stripe (pago exitoso): 39€/mes
- ✅ 3 anuncios creados exitosamente (IDs: 13072 Haas, 13073 DMG, 13075 Mazak)
- ✅ Banner "3 / 3" visible

### Anuncios creados

| ID | Máquina | Precio | Estado |
|----|---------|--------|--------|
| 13072 | Haas VF-2 2018 | 35,000€ | Published |
| 13073 | DMG Mori DMU 50 2019 | 85,000€ | Published |
| 13075 | Mazak VTC-300C 2017 | 42,000€ | Published |

### Crons ejecutados
- Moderator: `processed=1, approved=1`
- Enforcequota: `candidates=1, applied=1, new_plan=0, new_quota=0` ⚠️

---

## Resultados por test case

### TC-01 · Crear anuncio normal ✅ PASS
- URL: `/anuncio-publicado?id_product=13072` (sin `paused=1`)
- Badge: "Published"
- Banner: "Anuncios activos: 1 / 3" → luego "3 / 3"
- ⚠️ Nota: Auto-approve parece ON (product aparece como "Published" inmediatamente)

### TC-02 · Crear en overflow ❌ FAIL — BUG CRÍTICO
- **Expected:** Formulario completo y submisible, banner amarillo de aviso
- **Actual:** Formulario COMPLETAMENTE BLOQUEADO. Página muestra:
  - "Has alcanzado el límite de anuncios de tu plan"
  - "Currently you have 3 … 3 anuncios activos permitidos"
  - Links: "Expand my plan" + "Return to my account"
- **Impacto:** El nuevo modelo dice "crear anuncio → siempre permitido" pero el sistema está bloqueando como en el modelo viejo
- **URLs probadas:** `/en/publicar` y `/en/module/zonacncproductadd/ads` — ambas bloqueadas

### TC-03 · Activar con cuota ⚠️ BLOQUEADO
- Los botones toggle_active no funcionan debido a bug de JS

### TC-04 · Activar over-quota ⚠️ BLOQUEADO
- Misma causa que TC-03

### TC-05 · Pausar anuncio ❌ FAIL — BUG ALTO
- **Expected:** Click en "Disable" → AJAX 200, banner cambia a "2/3"
- **Actual:** Botones toggle_active no disparan llamadas AJAX. Clic no produce ningún efecto en backend
- **Causa raíz:** Error JS `Unexpected token '&'` impide ejecución de cualquier manejador interactivo

### TC-06 · Moderador aprueba con cuota ⚠️ NO VERIFICABLE
- Auto-approve parece activo (anuncios pasan directo a "Published")
- Moderator cron ejecutado exitosamente (1 approved)
- No se pudo verificar el flujo con pending + approve

### TC-07 · Moderador aprueba SIN cuota ⚠️ NO VERIFICABLE
- No se pudo crear anuncio en overflow (TC-02 bloqueado)
- No hay submission en pending para probar

### TC-08 · Enforcequota downgrade ⚠️ PARCIAL
- Cron ejecutado: `applied=1` pero `new_plan=0, new_quota=0`
- `stripe_sync: "sync_failed:plan_not_loaded"`
- No se pudo probar el flujo completo (requiere plan Pro downgrade a Starter)

---

## Bugs encontrados

### 🐛 BUG-01 · CRITICAL — Formulario de creación bloqueado en límite de cuota
**Severidad:** Critical 🔴  
**Labels:** `qa-quota-regression`, `bug`, `critical`  
**Test case:** TC-02  
**Descripción:**  
El formulario de creación de anuncios se bloquea completamente cuando el vendor llega al límite de anuncios activos de su plan (3/3 para Starter). Según el nuevo modelo v2, el formulario DEBE aparecer completo y submisible, con un banner amarillo de aviso pero sin bloqueo.

**Expected:** Formulario completo y submisible en overflow → redirect `/success?paused=1`  
**Actual:** Página bloqueada con mensaje "Has alcanzado el límite" y links "Expand my plan" / "Return to my account"

**Pasos para reproducir:**
1. Login como vendor con plan Starter (3 activos)
2. Crear 3 anuncios hasta llegar a "Anuncios activos: 3 / 3"
3. Navegar a `/en/publicar` o `/en/module/zonacncproductadd/ads`
4. Ver página de bloqueo en lugar del formulario

### 🐛 BUG-02 · HIGH — Error JavaScript "Unexpected token '&'" bloquea todos los botones interactivos
**Severidad:** High 🟠  
**Labels:** `qa-quota-regression`, `bug`, `high`, `javascript`  
**Test cases:** TC-03, TC-04, TC-05  
**Descripción:**  
Todas las páginas del sitio muestran un error JavaScript de compilación: `Unexpected token '&'`. Este error impide la ejecución de manejadores de eventos interactivos, incluyendo:
- Botones Disable/Activate (toggle_active) en Mis Anuncios
- Botones Delete en Mis Anuncios
- Posiblemente otros botones AJAX en todo el sitio

**Impacto:** Los vendors no pueden pausar, activar ni eliminar anuncios. La funcionalidad central está rota.

**Pasos para reproducir:**
1. Login como cualquier vendor
2. Ir a `/en/mis-anuncios`
3. Abrir consola del navegador → ver error `Unexpected token '&'`
4. Intentar click en cualquier botón "Disable", "Activate" o "Delete" → sin respuesta

### 🐛 BUG-03 · MEDIUM — Enforcequota: stripe_sync falla con "plan_not_loaded"
**Severidad:** Medium 🟡  
**Labels:** `qa-quota-regression`, `bug`, `medium`, `cron`  
**Descripción:**  
El cron enforcequota procesó 1 candidato pero reportó `stripe_sync: sync_failed:plan_not_loaded`. Aunque `applied=1`, los valores `new_plan=0, new_quota=0` son sospechosos y requieren investigación.

### ⚠️ NOTA · Payment method no almacenado
**Severidad:** Note 🔵  
**Descripción:**  
Tras pago exitoso en Stripe (invoice de 39€ completada), la página de suscripción muestra "No hay método de pago guardado en este sitio."

---

## Resumen

| Test Case | Resultado | Notas |
|-----------|-----------|-------|
| TC-01 | ✅ PASS | Creación normal funciona |
| TC-02 | ❌ FAIL | Form bloqueado (BUG-01) |
| TC-03 | ⚠️ BLOCKED | JS error (BUG-02) |
| TC-04 | ⚠️ BLOCKED | JS error (BUG-02) |
| TC-05 | ❌ FAIL | toggle_active no funciona (BUG-02) |
| TC-06 | ⚠️ NO TEST | Auto-approve parece ON |
| TC-07 | ⚠️ NO TEST | Overflow bloqueado (BUG-01) |
| TC-08 | ⚠️ PARCIAL | stripe_sync failed (BUG-03) |

**Total: 1 PASS, 2 FAIL, 4 BLOCKED/NO TEST, 1 PARTIAL**

---

## Recomendaciones

1. **URGENTE:** Arreglar BUG-01 — desbloquear formulario de creación en overflow
2. **URGENTE:** Arreglar BUG-02 — corregir error JS `Unexpected token '&'` que rompe toda la interactividad
3. **MEDIA:** Investigar BUG-03 — stripe_sync failed en enforcequota
4. Re-ejecutar Parte 1 completa tras fixes
5. Probar Parte 2 (TC-09 a TC-15) en sesión separada
