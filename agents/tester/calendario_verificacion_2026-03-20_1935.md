# Verificación Calendario Cenarbe
**Fecha:** 2026-03-20 19:35 UTC  
**Contexto:** Kevin corrigió error fatal en calendario. Verificar funcionalidad.

## 1. Carga calendario sin errores
- **HTTP Status:** 200 OK
- **Errores PHP encontrados:**
  - Warning: Undefined variable $current_page en header.php líneas 83, 89, 95, 101, 107, 113
  - Warning: Cannot modify header information - headers already sent en functions.php línea 22
- **FullCalendar en HTML:** No detectado (búsqueda "fullcalendar" sin resultados)
- **Conclusión:** Página carga con warnings no críticos, pero falta evidencia de carga de FullCalendar.

## 2. APIs funcionan
- **API bicicletas:** `GET /calendario/api/bicicletas.php` → HTTP 200, JSON array con 57 elementos.
- **API eventos:** `GET /calendario/api/eventos.php?fecha=2026-03` → HTTP 200, JSON array vacío ([]).
- **Validación JSON:** `GET /calendario/api/eventos.php` → JSON válido (array vacío).
- **Conclusión:** APIs responden correctamente.

## 3. Testing rápido con contenedor Playwright
- **Smoke test:** Endpoint `POST /test/smoke` responde "Running" (probablemente asíncrono, no se obtuvo resultado).
- **API test:** Endpoint `POST /test/api` responde "Running".
- **Conclusión:** No se pudo obtener resultado de los tests automatizados; contenedor puede estar ocupado o requiere polling.

## 4. Integración con sesión
- **Login con credenciales test:** POST a login.php → HTTP 302 (redirección), cookie PHPSESSID establecida.
- **Acceso a calendario con cookies:** HTTP 200.
- **Errores PHP con sesión:** Mismos warnings de $current_page.
- **Conclusión:** Autenticación funciona, calendario accesible con sesión.

## 5. Estado general
**Parcialmente funcional.**

### Errores encontrados
1. Warnings PHP por variable no definida `$current_page` (header.php).
2. Warning "Cannot modify header information" (functions.php).
3. No se detecta carga de FullCalendar en el frontend (riesgo de que el calendario no se renderice).

### Recomendaciones
1. **Corregir warnings PHP:** Definir `$current_page` antes de incluír header.php.
2. **Verificar carga de FullCalendar:** Asegurar que los recursos JS/CSS de FullCalendar estén cargados en el frontend.
3. **Prueba de funcionalidad de calendario:** Realizar test end-to-end para crear/modificar/eliminar eventos y confirmar que la corrección de Kevin solucionó el error fatal.
4. **Monitorear logs de PHP:** Revisar si hay errores fatales en producción.

## Evidencias
Comandos ejecutados:
```bash
curl -I "https://dev1.cenarbe.com/calendario/"
curl -s "https://dev1.cenarbe.com/calendario/" | grep -i "error\|fatal\|exception\|warning"
curl -s "https://dev1.cenarbe.com/calendario/api/bicicletas.php" | jq '. | length'
curl -s "https://dev1.cenarbe.com/calendario/api/eventos.php?fecha=2026-03" | jq '.'
curl -s "https://dev1.cenarbe.com/calendario/api/eventos.php" | python3 -m json.tool 2>/dev/null && echo "JSON válido"
curl -c cookies.txt -X POST "https://dev1.cenarbe.com/login.php" -d "email=test@cenarbe.com&password=Test123!"
curl -b cookies.txt "https://dev1.cenarbe.com/calendario/" -I
```

Resultados disponibles en logs de sesión.

**Prioridad:** MEDIA - La corrección parece haber solucionado el error fatal, pero persisten warnings y falta verificar frontend.