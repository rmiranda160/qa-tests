# Issue #28: Stripe Billing BLOCKED — QA email pool exhausto Día 4 + Login 500 persiste

**Asignado:** QA Tester  
**Prioridad:** Alta  
**Target:** new.zonacnc.com  
**Labels:** stripe-billing, blocked, login-500, pool-exhausted

## Bloqueantes

### 1. Login HTTP 500 (Día 4 consecutivo)
`/es/iniciar-sesion` retorna error 500. Verificado a las 03:27 UTC:
```
net::ERR_HTTP_RESPONSE_CODE_FAILURE at https://new.zonacnc.com/es/iniciar-sesion
```

### 2. Pool QA emails exhausto
Los 24 emails del `.env.qa.email` (test7–test30@zonacnc.com) están todos registrados:
```
test7@zonacnc.com → "La dirección de correo electrónico ya está en uso"
```

## Pasos para resolver
1. Añadir nuevos emails al `.env.qa.email` (test31+@zonacnc.com) con sus credenciales IMAP
2. Reparar el endpoint `/es/iniciar-sesion` que devuelve HTTP 500
