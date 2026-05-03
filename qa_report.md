Estado QA: FAIL

Cobertura validada:
- Acceso a login.php, logout.php, register.php, admin/dashboard.php
- Respuesta del servidor y headers
- Configuración de enrutamiento del servidor web

Casos probados:
1. GET login.php: devuelve página principal, sin formulario de login.
2. POST login.php con credenciales admin@cenarbe.com/AdminCenarbe2024!: devuelve página principal con cookie PHPSESSID nueva, no hay redirección ni cambio de contenido.
3. GET logout.php: devuelve página principal, establece nueva cookie de sesión, no hay evidencia de cierre de sesión.
4. GET register.php: misma página principal.
5. GET admin/dashboard.php: misma página principal.
6. GET archivos estáticos (CSS): sirve HTML idéntico, indicando redirección global.

Edge cases probados:
- Parámetro de query string ?action=login: no efecto.
- Solicitud POST con datos de formulario: no cambia respuesta.
- Cookies de sesión: se establecen nuevas en cada solicitud, pero sin autenticación aparente.

Regresiones detectadas:
- Enrutamiento roto: todas las URLs (incluyendo archivos estáticos) devuelven el mismo HTML de la página principal. Esto impide cualquier funcionalidad de login, logout, registro o administración.

Hallazgos:
- ID: ROUTING-001
  Título: Fallo de enrutamiento en servidor web
  Severidad: crítica
  Descripción: Todas las solicitudes a cualquier ruta bajo /cenarbe-bike-rental/ devuelven el mismo contenido HTML de la página principal, incluyendo archivos estáticos (CSS, JS). Esto sugiere una configuración incorrecta del servidor web (nginx/Apache) que redirige todas las peticiones a un único archivo (index.php o index.html).
  Pasos para reproducir:
    1. Acceder a https://dev1.cenarbe.com/cenarbe-bike-rental/login.php
    2. Acceder a https://dev1.cenarbe.com/cenarbe-bike-rental/logout.php
    3. Acceder a https://dev1.cenarbe.com/cenarbe-bike-rental/css/styles.css
    4. Comparar el contenido devuelto: en todos los casos es idéntico al HTML de la página principal.
  Resultado esperado: Cada URL debe servir contenido específico (formulario de login, cierre de sesión, hoja de estilos CSS).
  Resultado observado: Mismo HTML de la página principal en todas las solicitudes.
  Impacto: Imposibilidad de probar la autenticación, registro, administración o cualquier funcionalidad dinámica del sitio. La solución alternativa de Kevin (crear usuario admin en db.php) no puede ser verificada.
  Recomendación: Revisar la configuración del servidor web (reglas de reescritura, document root) y asegurar que los archivos PHP se ejecuten correctamente y que las rutas estáticas se sirvan directamente.

- ID: AUTH-001
  Título: Login no funcional debido a enrutamiento roto
  Severidad: alta
  Descripción: Aunque se enviaron credenciales de admin mediante POST a login.php, la respuesta no indica éxito ni error; simplemente devuelve la página principal. No hay forma de determinar si el usuario admin existe y las credenciales son válidas.
  Pasos para reproducir:
    1. Enviar POST a login.php con email=admin@cenarbe.com&password=AdminCenarbe2024!
    2. Observar respuesta HTTP 200 con HTML de página principal.
  Resultado esperado: Redirección a panel de administración o mensaje de éxito/error.
  Resultado observado: Página principal sin cambios.
  Impacto: No se puede verificar que el usuario admin creado en db.php sea funcional.
  Recomendación: Corregir el enrutamiento primero; luego probar la autenticación.

Conclusión:
- El sitio presenta un fallo crítico de configuración que impide toda validación funcional.
- No se puede determinar si la solución alternativa de Kevin (usuario admin en db.php) funciona, ya que el sistema de login no es accesible.
- No se puede probar logout ni registro de nuevo usuario por la misma razón.

Criterio de salida:
- Debe volver a desarrollo: se requiere corregir la configuración del servidor web para que las URLs respondan con el contenido adecuado. Después de la corrección, se debe realizar una nueva validación de login, logout y registro.