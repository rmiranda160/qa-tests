# CRONQA Finding: Stripe Billing BLOCKED — Pool Exhausted Day 4 + Login 500 Persists

**Date:** 2026-05-03 03:27 UTC  
**Tester:** tester (MCP remote pwmcp-zonacnc)  
**Target:** new.zonacnc.com  
**Focus:** stripe-billing  
**Duration:** ~5 min  
**Escenario:** 1/1 — ❌ BLOCKED  

## Blockers

### 1. Login page HTTP 500 (Día 4)
- URL: `https://new.zonacnc.com/es/iniciar-sesion`
- Error: `net::ERR_HTTP_RESPONSE_CODE_FAILURE`
- Persistente desde al menos 2026-04-30
- Sin login no se puede autenticar cuentas existentes para probar Stripe Billing

### 2. QA email pool test7-test30 completamente exhausto (Día 4)
- `.env.qa.email` contiene 24 emails: test7–test30@zonacnc.com
- Verificado: test7@zonacnc.com → "La dirección de correo electrónico ya está en uso"
- Todos confirmados como TAKEN en ejecuciones anteriores
- Sin email disponible del pool no se puede registrar nueva cuenta

## Impacto
Sin email disponible del pool y sin login funcional, no es posible:
- ✅ Registrar nueva cuenta
- ❌ Iniciar sesión en cuentas existentes
- ❌ Navegar a Pricing y seleccionar plan
- ❌ Probar flujo completo de Stripe Checkout

## Recomendación
1. **Refrescar pool QA**: Añadir nuevos emails test31+@zonacnc.com al `.env.qa.email`
2. **Reparar login**: Arreglar HTTP 500 en `/es/iniciar-sesion`
3. Alternativamente: permitir test con emails fuera del pool si hay IMAP configurado
