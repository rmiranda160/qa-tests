# Plan de Pruebas - Villazocotin

## Objetivo
Verificar instalación de base de datos y funcionamiento de la landing page y sistema de reservas.

## URLs de prueba
- Sitio principal: https://villazocotin.cenarbe.com
- Panel de administración: https://villazocotin.cenarbe.com/admin/login.php
- (Posible) API de reservas: Por determinar

## Casos de prueba

### 1. Disponibilidad del sitio
- **Caso:** Acceso a la página principal.
- **Pasos:** GET https://villazocotin.cenarbe.com
- **Criterio de éxito:** Respuesta HTTP 200, contenido HTML sin errores PHP visibles.
- **Herramienta:** curl / web_fetch

### 2. Verificación de base de datos (conexión)
- **Caso:** Página de administración carga sin errores de BD.
- **Pasos:** GET https://villazocotin.cenarbe.com/admin/login.php
- **Criterio de éxito:** Respuesta 200, no contiene mensajes "error connecting to database", "undefined variable $pdo", etc.
- **Herramienta:** curl + grep de palabras clave de error.

### 3. Funcionalidad de calendario
- **Caso:** El calendario de disponibilidad muestra fechas y precios.
- **Pasos:** Inspeccionar HTML de la página principal para elementos del calendario (clases .calendar, .available, etc.).
- **Criterio de éxito:** Existencia de elementos de calendario con datos (días, precios).
- **Herramienta:** Inspección del DOM.

### 4. Formulario de reserva
- **Caso:** El formulario de reserva existe y tiene campos requeridos.
- **Pasos:** Buscar formulario con action que apunte a un script de procesamiento (ej. reserva.php).
- **Criterio de éxito:** Formulario encontrado, campos necesarios presentes (nombre, email, fechas, etc.).
- **Herramienta:** Análisis HTML.

### 5. Envío de formulario (simulación)
- **Caso:** Enviar datos de prueba y verificar respuesta.
- **Pasos:** Realizar POST al endpoint del formulario con datos válidos.
- **Criterio de éxito:** Respuesta HTTP 200 o redirección, sin errores de BD.
- **Nota:** Esto podría crear una reserva real; considerar usar datos de prueba únicos o desactivar en producción.

### 6. Panel de administración - Intento de login
- **Caso:** Probar credenciales por defecto o inválidas.
- **Pasos:** POST a admin/login.php con usuario/contraseña incorrectos.
- **Criterio de éxito:** Mensaje de error apropiado (no error de BD).
- **Precaución:** No realizar demasiados intentos para no bloquear IP.

## Verificación de base de datos (directa)
Si se tiene acceso SSH y credenciales de BD, se pueden ejecutar consultas:
- Conectar a MySQL/MariaDB.
- Listar bases de datos.
- Verificar que exista la BD de villazocotin y sus tablas.
- Contar registros en tablas clave.

## Checklist de preparación
- [ ] Confirmar que el sitio está accesible.
- [ ] Identificar endpoint del formulario de reserva.
- [ ] Identificar endpoint de login de administración.
- [ ] Preparar datos de prueba (fechas, nombres, emails).
- [ ] Definir umbral de errores aceptables.

## Herramientas a utilizar
- curl / web_fetch para peticiones HTTP.
- grep para búsqueda de errores.
- browser (Playwright) para interacciones complejas si es necesario.
- (Opcional) sqlcmd para consultas directas a BD si se proporcionan credenciales.

## Notas
- Las pruebas deben ejecutarse después de que Kevin haya realizado los pulls y confirmado que los cambios están desplegados.
- Reportar cualquier hallazgo con severidad (crítica, alta, media, baja) siguiendo el formato de informe QA.