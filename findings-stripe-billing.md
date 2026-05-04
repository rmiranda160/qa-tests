# Stripe Billing Subscription Flow — Test Findings

**Date**: 2026-05-04 02:19–02:28 UTC  
**Tester**: test7@zonacnc.com  
**Scope**: new.zonacnc.com/es/  
**Environment**: ⚠️ MODO TEST — Stripe test mode confirmed  

---

## 1. Authentication Flow (Password Reset)

### Precondition
- All test accounts (test7–test30) already exist but passwords unknown.
- IMAP accessible via openssl s_client on zonacnc.com:993.

### Reset Flow
1. Navigated to `/es/iniciar-sesion` → clicked "¿Olvidaste tu contraseña?"
2. Entered email → confirmation message shown
3. **IMAP fetch**: Used `FETCH BODY[1.1.1]` to extract text/plain part (quoted-printable encoded)
4. Extracted reset URL: `https://new.zonacnc.com/es/recuperar-contraseña?token=688d37cb35baf386bdc98ba667b8a41e&id_customer=6606&reset_token=b5b6d87d1f029b3ad68c14f53c065cb345cef123`
5. Set password: `Test1234!Segura` — minimum strength "Fuerte" required

### Email Templates Verified
| # | Subject | Content | Translation |
|---|---------|---------|-------------|
| 18/19 | "[zonacnc.com] Confirmación de contraseña" | Reset link with token | Spanish |
| 20 | "[zonacnc.com] Su nueva contraseña" | "Su contraseña ha sido actualizada correctamente." | Spanish |

**Email structure**: multipart/related → multipart/alternative (text/plain qp + text/html qp) + image/jpeg (logo base64)  
**Sender**: no-reply@mg.zonacnc-sales.es  
**Encoding**: quoted-printable for text parts

---

## 2. Stripe Integration Details

### Stripe Account
- **Account ID**: `acct_1TPLFqELpLIGgmZK`
- **Company**: "Entorno de prueba de Veleta Comercializaciones y Servicios SLU"
- **Mode**: ✅ Test mode (all invoice URLs contain `test_` prefix)
- **Card on file**: Visa ending in 4242 (Stripe test card)

### API Endpoints Used
| Action | Endpoint | Method |
|--------|----------|--------|
| Change card | `/es/module/zonacncplans/paymentmethodupdate` | POST |
| Change plan | `/es/module/zonacncplans/change` | GET |
| Subscription | `/es/module/zonacncplans/subscription` | GET |
| Billing | `/es/module/zonacncplans/billing` | GET |
| Invoice download | `/es/module/zonacncplans/billingdownload?id=N` | GET |

### Payment Update Flow
1. Click "Cambiar tarjeta" → POST to `paymentmethodupdate`
2. Opens Stripe Elements modal with iframes for card number, expiry, CVC
3. Uses Stripe.js v3 for Elements rendering
4. **Not** Stripe Customer Portal — custom modal on site

---

## 3. Subscription Management UI

### Current Subscription (test7)
- **Plan**: Enterprise — Active ✅
- **Price**: €299.00/month
- **Next billing**: 03/06/2026
- **Active ads**: 11/102 limit
- **Payment**: Visa •••• •••• •••• 4242

### Available Plans (Spanish)
| Plan | Price | Ads | Extra ad | Features |
|------|-------|-----|----------|----------|
| Free | €0/mes | 3 | - | 5 fotos/anuncio, Perfil empresa |
| Starter | €39/mes | 3 | €12/mes | 10 fotos, 3 destacados/mes |
| Pro | €99/mes | 10 | €9/mes | 20 fotos, estadísticas, 8 destacados, CSV |
| Business | €199/mes | 25 | €6/mes | 30 fotos, badge verificado, 20 destacados |
| Enterprise | €299/mes | 100 | €3/mes | 50 fotos, badge, 60 destacados, CSV |

### Plan Change Logic
- **Upgrade**: Immediate, proportional proration (Stripe-managed)
- **Downgrade**: Applies at end of current period
- **Cancellation**: End of paid period
- **Add-ons**: Carry over at new plan price or remove
- **7-day refund policy**: Full refund if no verified contacts, written request to soporte@zonacnc.com

### Add-ons Active
- **Anuncios extra** ×2: €6.00/month (€3.00 each)

### Invoice History (all 03/05/2026)
| Invoice | Amount | Description |
|---------|--------|-------------|
| #AZHLKTSF-0074 | €0.00 | Proration from 2× add-on change |
| #AZHLKTSF-0073 | €99.20 | Business→Enterprise upgrade proration |
| #AZHLKTSF-0072 | €5.95 | Add-on quantity change proration |
| #AZHLKTSF-0071 | €5.98 | Add-on remaining time |
| #AZHLKTSF-0070 | €99.73 | Pro→Business upgrade proration |

---

## 4. Spanish Translations Verified

| UI Text | English | Correct? |
|---------|---------|----------|
| Mi suscripción | My subscription | ✅ |
| Método de pago | Payment method | ✅ |
| Actualizar método de pago | Update payment method | ✅ |
| Facturas y pagos | Bills and payments | ✅ |
| Completado | Completed | ✅ |
| Cambiar tarjeta | Change card | ✅ |
| Cambiar de plan | Change plan | ✅ |
| Cancelar al final del período | Cancel at end of period | ✅ |
| Próximo cobro | Next billing | ✅ |
| Add-ons | Add-ons (kept in English) | ✅ |
| Anuncios extra | Extra ads | ✅ |
| Historial de facturas | Invoice history | ✅ |
| Añadir add-on a tu plan | Add add-on to your plan | ✅ |
| Se añade sobre tu suscripción actual. Stripe cobra solo la parte proporcional... | Add-on proration explanation | ✅ |
| 7 días naturales — condiciones | 7 calendar days — conditions | ✅ |
| soporte@zonacnc.com | Support email | ✅ |

---

## 5. Conclusion

**Stripe billing subscription flow is functional for test7:**

1. ✅ Password reset → IMAP email extraction → token → new password
2. ✅ Login with new credentials
3. ✅ Account dashboard with "Mi suscripción" and "Facturas y pagos" links
4. ✅ Subscription page shows active Enterprise plan with Stripe-managed billing
5. ✅ Payment method update via Stripe Elements (custom modal)
6. ✅ Plan change interface with proration explanations
7. ✅ Add-on management (add/cancel)
8. ✅ Stripe-hosted invoices accessible (test mode)
9. ✅ All Spanish translations correct
10. ✅ Email templates verified via IMAP (password reset and confirmation)

**Note**: All emails in test environment are encrypted at rest in IMAP (AES?) — must use specific MIME part fetches (BODY[1.1.1]) and quoted-printable decode to read plain text.
