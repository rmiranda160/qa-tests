# TESTING_POST_DEPLOY.md - ContentoAI

**Versión:** 1.0  
**Fecha:** 2026-03-20  
**Responsable:** Tester  
**Estado:** ACTIVO

## Objetivo
Procedimiento sistemático para testing post-deploy de ContentoAI después de:
1. Deploy automático Plesk (Sam)
2. Implementación de optimizaciones (Kevin)

Garantizar que el sitio en producción funciona correctamente y las optimizaciones no introducen regresiones.

## Timeline Estricto
| Hora       | Tarea                                      | Responsable |
|------------|--------------------------------------------|-------------|
| 17:25-17:30| Checklist testing Laravel básico           | Tester      |
| 17:30-17:35| Scripts Playwright automatizados           | Tester      |
| 17:35-17:40| Preparar testing optimizaciones Kevin      | Tester      |
| 17:40-17:45| Checklist regression testing               | Tester      |
| 17:45-17:50| Coordinación con Kevin, finalizar documentación | Tester      |

## 1. Checklist Testing Laravel Básico
Verificar que el deploy de Laravel funciona correctamente.

**URLs críticas:**
- ✅ `https://cntai.cenarbe.com/` - Homepage
- ✅ `https://cntai.cenarbe.com/demo` - Demo IA
- ✅ `https://cntai.cenarbe.com/waitlist` - Formulario waitlist
- ✅ `https://cntai.cenarbe.com/admin` - Panel admin (si existe)

**Verificaciones por URL:** HTTP 200, no errores PHP/JS, contenido visible, formularios funcionan.

**Documento completo:** [checklist-laravel-basico.md](./checklist-laravel-basico.md)

## 2. Scripts Playwright Automatizados
Script de testing básico funcionalidad, responsive y performance.

**Archivo:** `tests/contentoai-laravel.spec.js`

**Verificaciones incluidas:**
- Homepage carga correctamente
- Demo IA genera contenido (mocked)
- Formulario waitlist envía datos
- Responsive design (mobile, tablet, desktop)
- Performance básica (LCP, FCP)

**Ejecución:**
```bash
cd /home/node/.openclaw/workspace-tester
BASE_URL=https://cntai.cenarbe.com npx playwright test agents/tester/tests/contentoai-laravel.spec.js
```

**Usar contenedor Playwright:** `51.254.244.216:3000` para testing real.

## 3. Testing Optimizaciones Kevin
Verificar que las optimizaciones están implementadas y funcionan.

**Optimizaciones a verificar:**
- Minificación CSS/JS (style.css ~8KB, script.js ~3.5KB)
- Lazy loading imágenes (atributo `loading="lazy"` en testimonios)
- Preconnect CDNs (cloudflare.com, jsdelivr.net, randomuser.me)
- Performance testing (Lighthouse scores antes/después)

**Script de verificación:** `scripts/verify-optimizations.js`

**Ejecución:**
```bash
cd agents/tester
node scripts/verify-optimizations.js
```

**Documento completo:** [testing-optimizaciones-kevin.md](./testing-optimizaciones-kevin.md)

## 4. Checklist Regression Testing
Asegurar que optimizaciones no rompen funcionalidad existente.

**Flujos críticos:**
- Demo IA sigue funcionando
- Waitlist envía emails correctamente
- Estilos consistentes (no broken CSS)
- JavaScript interactivo funciona

**Regla Miranda:** Verificar cada botón/acción tiene funcionalidad desarrollada.

**Documento completo:** [checklist-regression-testing.md](./checklist-regression-testing.md)

## 5. Criterios de Aceptación

### PASS (Deploy Estable)
- ✅ Todas las URLs responden HTTP 200
- ✅ No errores PHP/JavaScript en consola
- ✅ Formularios funcionan (demo, waitlist)
- ✅ Optimizaciones implementadas (minificación, lazy loading, preconnect)
- ✅ Lighthouse performance score >= 80 (o mejora respecto baseline)
- ✅ No regresiones en funcionalidad existente
- ✅ Todos los botones tienen funcionalidad (Regla Miranda)

### FAIL (Rollback Requerido)
- ❌ Alguna URL crítica devuelve 4xx/5xx
- ❌ Errores de consola que bloquean funcionalidad
- ❌ Formularios no envían datos
- ❌ Optimizaciones ausentes o rotas
- ❌ Performance score < 70
- ❌ Regresión crítica (ej. demo no funciona)

### PASS_WITH_NOTES (Aceptable con Observaciones)
- ⚠️  Errores de consola no críticos (warnings)
- ⚠️  Tiempo de carga ligeramente mayor (<5s)
- ⚠️  Optimizaciones parcialmente implementadas (ej. falta un CDN)
- ⚠️  Issues de estilo menores (diferencias menores en márgenes)

## 6. Plan de Rollback
Si testing falla (FAIL), ejecutar rollback inmediato:

### Rollback Optimizaciones (Kevin)
1. Revertir cambios en CSS/JS a versión anterior (Git)
2. Re‑desplegar archivos estáticos
3. Verificar que sitio funciona sin optimizaciones

### Rollback Deploy Laravel (Sam)
1. Revertir a commit anterior estable
2. Re‑ejecutar deploy Plesk
3. Restaurar backup de base de datos si necesario

### Comunicación
- Notificar a coordinator inmediatamente
- Informar a Kevin/Sam para acciones correctivas
- Documentar causa del fallo en reporte

## 7. Coordinación con Kevin
**Timeline testing:** Inmediatamente después de implementar optimizaciones.

**Criterios éxito definidos conjuntamente:**
- Performance score objetivo: ___ (definir con Kevin)
- Tamaños máximos CSS/JS: ___ (confirmar con Kevin)
- CDNs requeridos: cloudflare.com, jsdelivr.net, randomuser.me

**Comunicación resultados:**
- Reporte claro a coordinator con PASS/FAIL
- Enviar evidencias (screenshots, Lighthouse reports)
- Si PASS, aprobar deploy como estable
- Si FAIL, activar plan rollback y notificar

## 8. Scripts Reutilizables para Futuros Deploys

### Lista de Scripts
1. `tests/contentoai-laravel.spec.js` - Testing básico funcionalidad
2. `scripts/verify-optimizations.js` - Verificación optimizaciones
3. `scripts/button-action-verifier.js` - Verificación Regla Miranda (si existe)
4. `scripts/run-all-tests.sh` - Orquestación completa

### Variables de Entorno
```bash
export BASE_URL=https://cntai.cenarbe.com
export LIGHTHOUSE_THRESHOLD=80
```

### Integración con CI/CD
- Ejecutar scripts post-deploy automáticamente
- Notificar resultados a Telegram/email
- Bloquear deploy si tests fallan

## 9. Estructura de Directorios
```
agents/tester/
├── checklist-laravel-basico.md
├── testing-optimizaciones-kevin.md
├── checklist-regression-testing.md
├── TESTING_POST_DEPLOY.md (este archivo)
├── tests/
│   └── contentoai-laravel.spec.js
├── scripts/
│   ├── verify-optimizations.js
│   └── run-all-tests.sh
└── screenshots/ (generado durante testing)
```

## 10. Próximos Pasos
1. Esperar notificación de deploy completado (Sam)
2. Ejecutar checklist Laravel básico (manual/automático)
3. Notificar resultados a coordinator
4. Esperar implementación optimizaciones (Kevin)
5. Ejecutar testing optimizaciones y regression
6. Reportar PASS/FAIL y proceder según criterios
7. Documentar lecciones aprendidas para futuros deploys

## Contactos
- **Coordinator:** Miranda (Telegram)
- **Desarrollo:** Kevin (optimizaciones)
- **Deploy:** Sam (Plesk automático)
- **Testing:** Tester (responsable de este documento)

---

**Última actualización:** 2026-03-20 17:45 UTC  
**Próxima revisión:** Después de cada deploy mayor