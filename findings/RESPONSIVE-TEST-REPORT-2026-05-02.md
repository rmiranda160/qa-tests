# Informe de Pruebas Responsive — new.zonacnc.com

**Fecha:** 2026-05-02 12:23 UTC  
**Sitio:** https://new.zonacnc.com  
**Modo:** Responsive  
**Usuario registrado:** test15@zonacnc.com (registrado durante la prueba)  
**Navegador:** Chromium via MCP remoto (pwmcp-zonacnc)

---

## Resumen

| Aspecto | Resultado |
|---|---|
| Document Overflow (scroll horizontal) | ✅ Ninguno detectado |
| Element Overflow crítico | ✅ Ninguno detectado |
| Layout responsive | ✅ Correcto |
| Desplazamiento mobile | ✅ Correcto |
| Navegación mobile | ✅ Menú funcional |
| Footer responsive | ✅ Acordeón en mobile |

**Resultado general: ✅ PASS**

---

## Viewports probados

| Viewport | Resolución |
|---|---|
| Desktop | 1440 × 900 |
| Tablet | 768 × 1024 |
| Mobile | 390 × 844 |

## Páginas probadas

| Página | URL |
|---|---|
| Home | `/es/` |
| Búsqueda | `/es/buscar?search_query=torno` |
| Categoría | `/es/28-maquinaria-metal` |
| Pricing | `/es/module/zonacncplans/pricing` |

---

## Hallazgos detallados

### Document Overflow (scroll horizontal)
- **Ninguna página** en ningún viewport presenta scroll horizontal no deseado.
- ✅ El elemento `<html>` no excede el ancho del viewport en ningún caso.

### Element Overflow / Text Clip
Se detectaron elementos con `scrollWidth > clientWidth`, pero **todos corresponden a estilos CSS intencionales**:

| Tipo | Descripción | Intencional |
|---|---|---|
| `TEXT_CLIP` | `a: "Ir al contenido principal"` (skip-link) | ✅ Sí — patrón accesibilidad, oculto visualmente |
| `TEXT_CLIP` | `span: "Mostrar/ocultar..."` en footer (mobile) | ✅ Sí — toggles de acordeón footer |
| `TEXT_CLIP` | `span: "Condiciones generales..."` (footer descriptions) | ✅ Sí — truncado con text-overflow: ellipsis |
| `TEXT_CLIP` | `a: "Volver arriba"` | ✅ Sí — botón flotante con overflow hidden |
| `TEXT_CLIP` | `label: "Buscar maquinaria industrial"` | ✅ Sí — label oculto accesible |

### Layout Responsive

**Desktop (1440px):**
- ✅ Todo el contenido visible sin scroll horizontal
- ✅ Categorías en grid de 4 columnas
- ✅ Header completo con búsqueda y navegación
- ✅ Pricing cards en línea

**Tablet (768px):**
- ✅ Layout se adapta correctamente
- ✅ Categorías en grid de 2-3 columnas
- ✅ Búsqueda funcional
- ✅ Productos en grid responsivo

**Mobile (390px):**
- ✅ Navegación colapsada con menú adaptativo
- ✅ Categorías en grid de 2 columnas
- ✅ Footer con toggles acordeón
- ✅ Sin elementos cortados o fuera de pantalla
- ✅ Pricing cards apiladas verticalmente
- ✅ Búsqueda ocupa ancho completo

---

## Conclusiones

La plataforma **new.zonacnc.com** supera las pruebas responsive:

1. **No hay errores de overflow horizontal** en ningún viewport.
2. **El layout se adapta correctamente** a los 3 tamaños de pantalla probados (desktop, tablet, mobile).
3. **La navegación mobile funciona** con menú colapsado.
4. **Las páginas de listado, búsqueda, categoría y pricing** se renderizan correctamente en todos los viewports.
5. **El registro de usuario** funcionó sin problemas con test15@zonacnc.com.

**Estado: ✅ PASS — Sin incidencias responsive críticas**

---

## Screenshots

Las screenshots se encuentran en:
- `findings/responsivo-desktop-pricing.png`
- `findings/responsivo-mobile-home.png`
- `findings/responsivo-mobile-search.png`
- `findings/responsivo-mobile-category.png`
- `findings/responsivo-mobile-pricing.png`
- `findings/responsivo-tablet-home.png`
- `findings/responsivo-tablet-search.png`
