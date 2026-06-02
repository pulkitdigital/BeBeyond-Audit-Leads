# BeBeyond Event Form

A Vite + React lead capture form for BeBeyond Digital that:

- collects audit requests from users,
- stores submissions in Google Sheets,
- sends customer and admin emails via Brevo API,
- sends a WhatsApp Cloud API template message after successful submission.

This project uses **Vercel serverless routes** in the `api/` folder.  
There is **no Express/NestJS/separate Node backend**.

---

## Tech Stack

- `React` + `Vite`
- `Tailwind CSS`
- `Vercel Serverless Functions` (`api/*.js`)
- `Brevo Transactional Email API` (email delivery)
- `Meta WhatsApp Cloud API` (template messaging)
- `Google Apps Script Webhook` (Google Sheet write endpoint)

---

## Project Structure

```txt
.
├─ src/
│  ├─ components/
│  │  └─ AuditForm.jsx
│  └─ ...
├─ api/
│  ├─ send-email.js
│  └─ send-whatsapp.js
├─ .env.example
├─ package.json
└─ README.md
```

---

## Form Submission Flow

When a valid form is submitted from `AuditForm.jsx`, the app performs:

1. Save lead to Google Sheet endpoint (`VITE_GOOGLE_SHEET_URL`)
2. Send customer confirmation email (`/api/send-email`)
3. Send admin lead notification email (`/api/send-email`)
4. Send customer WhatsApp template message (`/api/send-whatsapp`)

> WhatsApp failures are intentionally non-blocking.  
> If WhatsApp fails, the error is logged and the success screen still appears.

---

## Environment Variables

Copy `.env.example` to `.env.local` for local development:

```bash
cp .env.example .env.local
```

Set values:

### Frontend-exposed variable

- `VITE_GOOGLE_SHEET_URL`  
  Google Apps Script web app URL that receives form submission payload.

### Server-side email variables

- `BREVO_API_KEY`
- `MAIL_FROM_EMAIL`
- `MAIL_FROM_NAME`
- `MAIL_ADMIN_EMAIL`

### Server-side WhatsApp variables

- `WHATSAPP_ACCESS_TOKEN`
- `WHATSAPP_PHONE_NUMBER_ID`
- `WHATSAPP_BUSINESS_ACCOUNT_ID`
- `WHATSAPP_TEMPLATE_NAME`

> Never commit real secrets to git.

---

## API Routes

### `POST /api/send-email`

Serverless route that sends email through Brevo API.  
Expected body:

```json
{
  "to_email": "user@example.com",
  "to_name": "User Name",
  "subject": "Email Subject",
  "html": "<p>HTML body</p>"
}
```

### `POST /api/send-whatsapp`

Serverless route that sends an approved WhatsApp template message via Meta Cloud API.  
Expected body:

```json
{
  "mobile": "9876543210",
  "name": "Rahul Sharma",
  "businessName": "My Brand",
  "auditType": "Instagram + Website"
}
```

Behavior:

- mobile is normalized to `91XXXXXXXXXX`,
- template body variables use `name`, `businessName`, and `auditType`,
- invalid number returns `400`,
- provider errors are forwarded with status,
- missing env variables return `500`.

---

## Local Development

Install dependencies:

```bash
npm install
```

Start development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```

---

## Vercel Deployment

1. Push code to your Git provider.
2. Import the repository in Vercel.
3. In Vercel project settings, add all env variables from `.env.example`.
4. Redeploy (or deploy) the project.
5. Verify serverless routes:
   - `/api/send-email`
   - `/api/send-whatsapp`

Important:

- `VITE_` variables are bundled for frontend usage.
- Non-`VITE_` variables are only available in serverless functions.

---

## Testing Checklist

### Functional success path

1. Submit form with valid data.
2. Verify row appears in Google Sheet.
3. Verify customer email is received.
4. Verify admin email is received.
5. Verify WhatsApp template message is received on submitted number.
6. Verify success UI is shown.

### WhatsApp failure tolerance

1. Temporarily set wrong `WHATSAPP_ACCESS_TOKEN`.
2. Submit form again.
3. Verify Google Sheet + emails still work.
4. Verify success UI still appears.
5. Verify WhatsApp error appears in server logs.

---

## Notes

- Use only **approved WhatsApp templates** for production sends.
- Template variables count/order in Meta template must match what `api/send-whatsapp.js` sends.
- If your template language is not English, update `language.code` in `api/send-whatsapp.js`.
