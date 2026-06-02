import { getConfig } from '../lib/config.js'
import { formatIndianWhatsAppNumber, sendWhatsAppTemplate } from '../lib/whatsapp.js'

/**
 * Sends customer WhatsApp template messages via Meta Cloud API.
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      ok: false,
      error: { code: 'METHOD_NOT_ALLOWED', message: 'Use POST for this endpoint.' },
    })
  }

  try {
    const config = getConfig('whatsapp')
    const body = req.body || {}
    const mobile       = String(body.mobile       || '').trim()
    const name         = String(body.name         || '').trim()
    const businessName = String(body.businessName || '').trim()
    const auditType    = String(body.auditType    || '').trim()

    if (!formatIndianWhatsAppNumber(mobile)) {
      return res.status(400).json({
        ok: false,
        error: { code: 'INVALID_MOBILE', message: 'Valid Indian mobile number is required.' },
      })
    }

    if (!name || !businessName || !auditType) {
      return res.status(400).json({
        ok: false,
        error: {
          code: 'INVALID_TEMPLATE_FIELDS',
          message: 'name, businessName and auditType are required.',
        },
      })
    }

    const result = await sendWhatsAppTemplate({ mobile, name, businessName, auditType })

    return res.status(200).json({
      ok: true,
      message: 'WhatsApp template sent successfully.',
      data: {
        to:                   result.to,
        business_account_id:  config.WHATSAPP_BUSINESS_ACCOUNT_ID,
        api_version:          config.WHATSAPP_API_VERSION,
        language_code:        config.WHATSAPP_LANGUAGE_CODE,
        provider:             result.raw,
      },
    })
  } catch (error) {
    // ── Detailed logging so Vercel Functions tab shows the real Meta error ──
    console.error('send-whatsapp route failure:', {
      message:  error?.message,
      status:   error?.status,
      provider: JSON.stringify(error?.provider ?? null), // ← prevents [object Object]
    })

    // ── If Meta returned a structured error, surface it in the response ─────
    const metaError  = error?.provider?.error            // Meta error object
    const metaCode   = metaError?.code                   // e.g. 190 (token expired)
    const metaMsg    = metaError?.error_data?.details
                    || metaError?.message
                    || null

    // Common Meta error codes → friendly message mapping
    const friendlyMessage = (() => {
      if (!metaCode) return 'Unable to send WhatsApp message at the moment.'
      if (metaCode === 190)  return 'WhatsApp access token expired. Please renew it in Meta Business Suite.'
      if (metaCode === 100)  return 'WhatsApp template not found or language code mismatch. Check WHATSAPP_TEMPLATE_NAME and WHATSAPP_LANGUAGE_CODE.'
      if (metaCode === 131030) return 'WhatsApp template rejected or paused by Meta.'
      if (metaCode === 131047) return 'Re-engagement window expired — user must message first.'
      if (metaCode === 131051) return 'Template language code mismatch. Current config: WHATSAPP_LANGUAGE_CODE=en'
      return metaMsg || 'Unable to send WhatsApp message at the moment.'
    })()

    const statusCode = Number.isInteger(error?.status) ? error.status : 500

    return res.status(statusCode).json({
      ok: false,
      error: {
        code:    statusCode >= 500 ? 'WHATSAPP_SEND_FAILED' : 'WHATSAPP_REQUEST_FAILED',
        message: friendlyMessage,
        ...(metaCode ? { meta_code: metaCode } : {}),
      },
      details: error?.provider ?? null,
    })
  }
}