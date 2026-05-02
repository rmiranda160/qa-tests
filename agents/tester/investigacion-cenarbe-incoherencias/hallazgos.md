# Hallazgos - Investigación Incoherencias UI Cenarbe

**Fecha:** 2026-03-20 23:39 UTC  
**Investigador:** Tester Subagent

## 1. Análisis Screenshot Incoherencia
No se pudo analizar screenshot directamente por restricciones de path. Sin embargo, del reporte de coherencia se observa:
- **Mi Perfil:** Elemento encontrado pero no visible (timeout en click)
- **Historial, Configuración, Ayuda:** Elementos no encontrados

## 2. Verificación HTML Actual (sin sesión)
- Página principal (https://dev1.cenarbe.com) NO contiene los términos "Mi Perfil", "Historial", "Configuración", "Ayuda" en el HTML.
- Menú principal: Inicio, Bicicletas, Rutas, Reservas, Contacto.

## 3. Verificación con Sesión Activa
- Login exitoso con credenciales test@cenarbe.com / Test123!
- HTML logueado incluye dropdown de usuario con:
  - **Mi Perfil** (enlace a `/perfil.php`)
  - **Mis Reservas** (enlace a `/mis-reservas.php`)
  - **Cerrar Sesión**
- **NO** se encontraron enlaces a Historial, Configuración, Ayuda en el HTML.

## 4. Existencia de Páginas PHP
- `perfil.php` → Existe (200 OK)
- `historial.php` → Existe (200 OK) pero redirige a página principal (contenido idéntico a index)
- `configuracion.php` → Redirige (302) posiblemente a login
- `ayuda.php` → Existe (200 OK) pero redirige a página principal

**Conclusión:** Las páginas existen pero no están vinculadas en la UI y probablemente no tienen contenido funcional.

## 5. Análisis Configuración Testing Coherencia
Archivo: `coherence-tests.js`

**Selectores definidos:**
- Mi Perfil: `a[href*="perfil"], button:has-text("Perfil"), :text("Mi Perfil")`
- Historial: `a[href*="historial"], button:has-text("Historial")`
- Configuración: `a[href*="config"], :text("Configuración")`
- Ayuda: `a[href*="ayuda"], :text("Ayuda"), :text("Soporte")`

**Problemas identificados:**
1. **Mi Perfil:** El selector es correcto pero el elemento está dentro de un dropdown colapsado. El script no abre el dropdown antes de hacer clic, causando "element is not visible".
2. **Historial, Configuración, Ayuda:** Los selectores no encuentran elementos porque no existen en el DOM.

## 6. Causa Raíz por Botón

### **Mi Perfil**
- **Causa:** Botón existe pero está oculto dentro de dropdown de usuario. Testing no interactúa con dropdown.
- **Impacto:** Usuarios no pueden acceder a su perfil a menos que abran el dropdown manualmente.
- **Severidad:** Media - Funcionalidad core (gestión de perfil) accesible pero requiere paso extra.

### **Historial**
- **Causa:** No existe enlace en la UI, aunque página `historial.php` existe (sin contenido funcional).
- **Impacto:** Usuarios no pueden acceder a historial de actividades (si existe).
- **Severidad:** Baja - Posiblemente no es una funcionalidad requerida.

### **Configuración**
- **Causa:** No existe enlace en la UI, página `configuracion.php` redirige.
- **Impacto:** Usuarios no pueden ajustar configuraciones.
- **Severidad:** Media - Configuración puede ser necesaria para personalización.

### **Ayuda**
- **Causa:** No existe enlace en la UI, página `ayuda.php` redirige.
- **Impacto:** Usuarios no pueden acceder a ayuda/soporte.
- **Severidad:** Media - Ayuda es importante para experiencia de usuario.

## 7. Recomendaciones

### Opción A (Recomendada): Implementar botones faltantes
1. **Agregar enlaces en dropdown de usuario:**
   - Añadir "Historial" (enlace a `/historial.php`)
   - Añadir "Configuración" (enlace a `/configuracion.php`)
   - Añadir "Ayuda" (enlace a `/ayuda.php`)
2. **Asegurar que las páginas tengan contenido funcional** (si no lo tienen, desarrollarlas).
3. **Modificar testing coherencia** para abrir dropdown antes de hacer clic en "Mi Perfil".

### Opción B: Ajustar solo testing
1. **Actualizar selectores** para reflejar la realidad actual:
   - Eliminar tests para "Historial", "Configuración", "Ayuda" (si no son funcionalidades requeridas).
   - O marcar como "skip" hasta que se implementen.
2. **Modificar test "Mi Perfil"** para abrir dropdown:
   ```javascript
   // Antes de hacer clic en "Mi Perfil"
   await page.click('button.dropdown-toggle'); // Abrir dropdown
   await page.waitForTimeout(500);
   ```

### Opción C: Implementación mínima
- Solo agregar enlaces básicos (aunque las páginas estén vacías) para mantener coherencia UI.
- Actualizar testing para reflejar nuevos selectores.

## 8. Próximos Pasos
1. Consultar con equipo de desarrollo si las páginas Historial, Configuración, Ayuda deben existir.
2. Implementar solución elegida.
3. Ejecutar testing coherencia específico para verificar corrección.

**Prioridad:** MEDIA - Incoherencias afectan experiencia usuario pero no bloquean funcionalidad core.