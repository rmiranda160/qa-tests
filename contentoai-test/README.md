# ContentoAI Landing Page & Waitlist

Despliegue de la landing page para ContentoAI en contentoai.cenarbe.com.

## Estructura

```
.
├── index.html          # Landing page principal
├── css/                # Estilos
├── js/                 # JavaScript (incluye integración con API)
├── images/             # Imágenes y favicon
├── api/                # Backend PHP para lista de espera
│   ├── config.php      # Configuración de SQLite
│   └── submit_waitlist.php # Endpoint para guardar emails
├── private/            # Datos sensibles (BD SQLite)
│   └── .htaccess       # Denega acceso web
└── .htaccess           # Configuración Apache
```

## Requisitos del servidor

- PHP 7.4 o superior con extensión SQLite3.
- Apache con mod_rewrite (opcional).
- Permisos de escritura en el directorio `private/`.

## Configuración

1. Clonar repositorio en el directorio web (ej: `/var/www/vhosts/contentoai.cenarbe.com/httpdocs`).
2. Asegurar que el directorio `private/` sea escribible por el usuario del servidor web:

```bash
chmod 755 private
chown www-data:www-data private  # Ajustar usuario/grupo según el entorno
```

3. La primera vez que se envíe un formulario, se creará automáticamente el archivo `private/database.sqlite` y la tabla `waitlist_emails`.

## Funcionamiento

- El formulario de lista de espera en la página envía una petición POST a `/api/submit_waitlist.php`.
- Los datos se validan y almacenan en la base de datos SQLite.
- Se evitan duplicados por email (constraint UNIQUE).
- La respuesta es JSON con éxito o error.

## Seguridad

- El directorio `private/` está protegido por `.htaccess` para denegar acceso web.
- Se sanitizan las entradas del formulario.
- Se recomienda implementar medidas adicionales (CAPTCHA, rate limiting) en producción.

## Mantenimiento

Para ver los emails registrados, se puede usar una herramienta de SQLite como `sqlite3 private/database.sqlite` y ejecutar:

```sql
SELECT * FROM waitlist_emails;
```

## Notas

- Este backend es mínimo y está pensado para una lista de espera simple.
- Para escalar, considerar migrar a MySQL y añectar autenticación para administración.
- La landing page está diseñada como SPA estática; el formulario funciona mediante AJAX.