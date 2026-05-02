# Plan de Pruebas - Cenarbe Bike Rental

## Objetivo
Probar flujo completo de reserva: registro, login, carrito, checkout. Detectar bugs en cada paso.

## URLs de prueba
- Sitio principal: https://dev1.cenarbe.com
- Registro: https://dev1.cenarbe.com/register.php
- Login: https://dev1.cenarbe.com/login.php
- Carrito: https://dev1.cenarbe.com/carrito.php
- Checkout: https://dev1.cenarbe.com/checkout.php (asumido)
- Bicicletas: https://dev1.cenarbe.com/bicicletas.php
- Reservas: https://dev1.cenarbe.com/reservas.php (posible historial)

## Flujo de prueba completo

### 1. Registro de nuevo usuario
- **Caso:** Crear una cuenta con datos válidos.
- **Pasos:**
  1. Navegar a register.php.
  2. Rellenar formulario (nombre, email, contraseña, etc.).
  3. Enviar formulario.
- **Criterio de éxito:**
  - Redirección a página de éxito o login.
  - Mensaje de confirmación (flash message).
  - Usuario creado en BD (verificar si se puede login).
- **Datos de prueba:** Generar email único (ej. test+timestamp@example.com).

### 2. Login con credenciales creadas
- **Caso:** Iniciar sesión con el usuario recién registrado.
- **Pasos:**
  1. Navegar a login.php.
  2. Introducir email y contraseña.
  3. Enviar.
- **Criterio de éxito:**
  - Redirección a página de inicio o perfil.
  - Sesión iniciada (aparece nombre de usuario o enlace a logout).
  - No aparece enlace a login/register.

### 3. Añadir producto al carrito
- **Caso:** Seleccionar una bicicleta y agregarla al carrito.
- **Pasos:**
  1. Navegar a bicicletas.php.
  2. Identificar un producto disponible (botón "Añadir al carrito").
  3. Hacer clic en el botón.
- **Criterio de éxito:**
  - Producto agregado al carrito (mensaje de confirmación).
  - El carrito muestra el producto (icono de carrito con cantidad).
  - Precio total actualizado.

### 4. Ver carrito
- **Caso:** Acceder a carrito.php y verificar contenido.
- **Pasos:**
  1. Navegar a carrito.php.
  2. Verificar que el producto añadido aparece con detalles (nombre, precio, cantidad).
  3. Verificar opciones de modificar cantidad o eliminar.
- **Criterio de éxito:**
  - Página carga sin errores.
  - Producto listado correctamente.
  - Subtotal y total calculados.

### 5. Proceder al checkout
- **Caso:** Iniciar proceso de compra.
- **Pasos:**
  1. Hacer clic en "Proceder al pago" o similar.
  2. Rellenar formulario de envío/pago (si aplica).
  3. Confirmar pedido.
- **Criterio de éxito:**
  - Redirección a confirmación de pedido.
  - Resumen de pedido mostrado.
  - Posible generación de número de reserva.

### 6. Verificación de mensajes flash
- Durante el flujo, verificar que los mensajes de éxito/error se muestran y desaparecen adecuadamente.

## Casos adicionales

### 7. Validación de formularios
- Registro con email ya existente → mensaje de error.
- Login con credenciales incorrectas → mensaje de error.
- Campos obligatorios vacíos → validación frontend/backend.

### 8. Persistencia de carrito entre sesiones
- Añadir producto sin estar logueado, luego loguearse → carrito debe mantenerse.

### 9. Logout
- Cerrar sesión y verificar que el carrito se vacíe o persista según diseño.

### 10. Responsive design
- Verificar que las páginas sean usables en móvil (opcional).

## Checklist de preparación
- [ ] Confirmar que todas las URLs son accesibles.
- [ ] Identificar selectores CSS / IDs clave para automatización.
- [ ] Preparar datos de prueba (usuarios, productos).
- [ ] Definir secuencia exacta de pasos para browser automation.
- [ ] Configurar cookies de sesión si se requiere autenticación previa.

## Herramientas
- Browser automation (Playwright via OpenClaw browser tool) para simular interacciones de usuario.
- curl para peticiones HTTP simples.
- Inspección de red para verificar llamadas AJAX.

## Notas
- Las pruebas deben ejecutarse después de que Kevin haya realizado los pulls y confirmado que los cambios están desplegados.
- Reportar cualquier hallazgo con severidad (crítica, alta, media, baja) siguiendo el formato de informe QA.
- Prestar atención a regresiones: comparar con el informe anterior donde existía error fatal de $pdo.
- Si se encuentra el mismo error fatal, reportar como crítica.