# Recomendaciones Concretas - Incoherencias UI Cenarbe

## Solución Recomendada (Opción A)

### 1. Modificar Testing Coherencia para "Mi Perfil"
**Archivo:** `/home/node/.openclaw/workspace-tester/coherence-tests.js`

**Cambios necesarios:**
```javascript
// En la función de prueba, antes de hacer clic en "Mi Perfil", agregar:
if (test.name.includes('Mi Perfil')) {
  // Abrir dropdown de usuario
  const dropdownToggle = await page.$('button.dropdown-toggle');
  if (dropdownToggle) {
    await dropdownToggle.click();
    await page.waitForTimeout(500);
  }
}
```

**Ubicación:** Dentro del bloque `if (button) { ... }`, antes de `await button.click();`

### 2. Implementar Botones Faltantes en UI
**Archivo(s):** Probablemente `/var/www/cenarbe/...` (fuera del workspace). Se necesita modificar el template del header/navbar.

**Cambios sugeridos:** Agregar en el dropdown de usuario:
```html
<li><a class="dropdown-item" href="/historial.php"><i class="bi bi-clock-history me-2"></i> Historial</a></li>
<li><a class="dropdown-item" href="/configuracion.php"><i class="bi bi-gear me-2"></i> Configuración</a></li>
<li><a class="dropdown-item" href="/ayuda.php"><i class="bi bi-question-circle me-2"></i> Ayuda</a></li>
```

### 3. Desarrollar Contenido para Páginas Vacías
- **historial.php:** Mostrar historial de reservas/usuario
- **configuracion.php:** Permitir ajustes de perfil, notificaciones, etc.
- **ayuda.php:** Preguntas frecuentes, contacto soporte

**Nota:** Si no se planea implementar estas páginas, considerar eliminarlas del testing.

### 4. Actualizar Selectores de Testing (si se agregan botones)
Los selectores actuales son adecuados si se agregan los enlaces con href que contenga las palabras clave.

## Plan de Implementación

### Fase 1 (Inmediata): Corregir Testing
- Modificar `coherence-tests.js` para manejar dropdown.
- Ejecutar pruebas de coherencia para verificar que "Mi Perfil" pase.
- Committear cambios.

### Fase 2 (Corto Plazo): Implementar UI
- Agregar enlaces faltantes en dropdown de usuario.
- Verificar que las páginas existentes tengan contenido mínimo.
- Si no hay contenido, crear páginas de placeholder con mensaje "En construcción".

### Fase 3 (Largo Plazo): Desarrollar Funcionalidades
- Implementar historial de reservas.
- Implementar configuración de usuario.
- Implementar sistema de ayuda/FAQ.

## Impacto Esperado
- **Coherencia UI:** 5/5 tests pasarán (actualmente 1/5).
- **Experiencia Usuario:** Mejorada con acceso a funcionalidades faltantes.
- **Mantenibilidad:** Testing más robusto y representativo de la realidad.

## Archivos Afectados
1. `/home/node/.openclaw/workspace-tester/coherence-tests.js`
2. Templates PHP del proyecto Cenarbe (fuera del workspace)
3. Posiblemente `integrate-coherence-tests.js` (si se cambian firmas)

## Riesgos
- **Dropdown puede cambiar de clase:** Usar selector más robusto (`button[aria-label*="usuario"]` o similar).
- **Páginas pueden requerir autenticación adicional:** Verificar acceso después de login.
- **Testing puede volverse más lento:** Agregar timeout adecuados.

## Validación
Después de implementar cambios, ejecutar:
```bash
cd /home/node/.openclaw/workspace-tester/continuous-testing/
node coherence-tests.js
```

Verificar que todos los tests pasen.