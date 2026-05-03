# Responsive Test — Full Verification — 2026-05-03 20:30 UTC

## Resultado: ⚠️ PASS CON HALLAZGOS

Test realizado via MCP browser sobre new.zonacnc.com. 6 páginas × 4 viewports.

### Pruebas ejecutadas
- Homepage (/) @ 375, 768, 1280, 1440, 1920 (1920 tiene overflow)
- Category page (/28-maquinaria-metal) @ 375, 768
- Pricing page (/pricing) @ 375, 768, 1440
- Search page (/buscar) @ 375, 768, 1280
- Product page (Gildemeister CTX 510) @ 375
- Login page (/iniciar-sesion) @ 375
- Registration page @ 375

### Hallazgos
1. Hero section overflow:hidden (75-384px clipping)
2. Touch targets < 44px (media de 12-47 por página en mobile)
3. Console error SSO provider
4. Pricing URL redirect /content/10-precios → FAQ
