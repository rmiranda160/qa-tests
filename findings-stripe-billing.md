# Findings: stripe-billing — 2026-05-05

> Test account: test8@zonacnc.com | Plan: Pro | MCP: pwmcp-zonacnc | Site: new.zonacnc.com

---

## Finding 1 (HIGH): Variable substitution failure in add-on email

**Location**: Email template for add-on added (`Add-on añadido a tu suscripción`, IMAP msg #13)

**Observed**: The email body shows literal fallback text `(prorrateado por Stripe)` instead of the actual prorated amount.

```
Hemos añadido 1 x anuncio extra a tu suscripción Pro.
Stripe ha cobrado la parte proporcional ((prorrateado por Stripe)). La siguiente
factura recurrente la verás en 02/06/2026.

- Cobro proporcional ahora: (prorrateado por Stripe)
```

The actual prorated amount (€8.25, as seen in invoice email #14) is not substituted into the template. Double parentheses in the first instance suggest a nested fallback.

**Expected**: The actual prorated amount (e.g., `8,25 €`) should appear, not the fallback placeholder.

---

## Finding 2 (HIGH): Massive i18n leakage — English subscription page is ~80% Spanish

**Location**: `new.zonacnc.com/en/subscription` (and related billing pages)

**Observed**: When viewing the subscription page in English, the vast majority of content renders in Spanish. Specific untranslated strings:

| Element | Rendered (Spanish) | Expected (English) |
|---------|-------------------|-------------------|
| Page heading | "Mi suscripción" | "My subscription" |
| Plan status | "Activa" | "Active" |
| Next charge label | "Próximo cobro:" | "Next charge:" |
| Ads counter | "Anuncios activos" | "Active listings" |
| Price unit | "99 € /mes" | "99 € /month" |
| Limit warning | "Has alcanzado el límite..." | "You have reached your plan limit" |
| Payment heading | "Método de pago" | "Payment method" |
| Change card button | "Cambiar tarjeta" | "Change card" |
| Subscription heading | "Suscripción" | "Subscription" |
| Cancel text | "Puedes cancelar tu suscripción..." | Full paragraph in English |
| Cancel button | "Cancelar al final del período" | "Cancel at end of period" |
| Invoice heading | "Historial de facturas" | "Invoice history" |
| Table headers | "Fecha", "Plan", "Importe", "Estado", "Factura" | "Date", "Plan", "Amount", "Status", "Invoice" |
| Status | "Completado" | "Completed" |
| View invoice | "Ver factura" | "View invoice" |
| Add-on heading | "Añadir add-on a tu plan" | "Add add-on to your plan" |
| Add-on desc | "Se añade sobre tu suscripción..." | Full paragraph in English |
| Add-on type | "Anuncios extra" | "Extra listings" |
| Add-on status | "Cancelado" | "Cancelled" |
| Table cols | "Tipo", "Cantidad", "Precio", "Período" | "Type", "Quantity", "Price", "Period" |
| Add button | "Añadir" | "Add" |
| Breadcrumb | "Mi cuenta" / "Mi suscripción" | "My account" / "My subscription" |
| Footer legal links | "Aviso legal", "Politica de privacidad" | "Legal notice", "Privacy policy" |
| Footer company | "Nuestra empresa" | "Our company" |
| Footer marketplace | "Cómo funciona", "Planes para..." | "How it works", "Seller plans" |
| Footer unsubscribe | Full Spanish paragraph | English |

**Impact**: English-speaking users cannot effectively use the billing/subscription area.

---

## Finding 3 (MEDIUM): Email body not translated for English locale

**Location**: Password reset email templates (IMAP msgs #9, #10)

**Observed**: When user triggers password reset from English interface, the email subject is English ("Your new password", "Password query confirmation") but the **email body is entirely in Spanish**:

```
Subject: [zonacnc.com] Your new password
Body: Hola Test Usuario SEO,
       Su contraseña ha sido actualizada correctamente.
```

Same for password confirmation: English subject with Spanish body ("Confirmación de la solicitud de contraseña...").

**Expected**: Email body should match the user's language preference.

---

## Finding 4 (MEDIUM): Invoice description mixes English and Spanish

**Location**: Invoice history table on subscription page

**Observed**: The invoice description for the add-on purchase reads:

```
Remaining time on ZonaCNC — Add-on: anuncio extra after 05 May 2026 (+8,25 €)
```

English fragments ("Remaining time on", "after") are mixed with Spanish ("anuncio extra"). This comes from Stripe's invoice metadata but the concatenation produces broken output.

---

## Finding 5 (LOW): Email subject spacing error

**Location**: Password reset confirmation email subject (IMAP msg #11)

**Observed**: Subject reads `[zonacnc.com] Confirmación decontraseña` — missing space between `de` and `contraseña`.

**Expected**: `[zonacnc.com] Confirmación de contraseña`

---

## Finding 6 (LOW): Misleading invoice email wording

**Location**: Invoice paid email (IMAP msg #14)

**Observed**: The email says "Hemos cobrado la renovación de tu plan Pro" ("We have charged the renewal of your Pro plan"), but the transaction was an add-on purchase (extra listing), not a plan renewal. This is confusing for users.

---

## Finding 7 (INFO): No payment method required for add-on purchase

**Observed**: Before adding the add-on, the subscription page showed "No hay método de pago guardado" (No payment method saved). After adding the add-on, a Visa ending in 4242 appeared as the saved payment method, and an invoice was generated and paid.

This suggests the system either:
- Has a stored payment method in Stripe not reflected locally
- Automatically created a payment method during the transaction

No user action was required to provide payment details.
