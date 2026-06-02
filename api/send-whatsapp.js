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
    const config = getConfig()
    const body = req.body || {}
    const mobile = String(body.mobile || '').trim()
    const name = String(body.name || '').trim()
    const businessName = String(body.businessName || '').trim()
    const auditType = String(body.auditType || '').trim()

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
        to: result.to,
        business_account_id: config.WHATSAPP_BUSINESS_ACCOUNT_ID,
        api_version: config.WHATSAPP_API_VERSION,
        language_code: config.WHATSAPP_LANGUAGE_CODE,
        provider: result.raw,
      },
    })
  } catch (error) {
    console.error('send-whatsapp route failure:', {
      message: error?.message,
      status: error?.status,
      provider: error?.provider,
    })

    const statusCode = Number.isInteger(error?.status) ? error.status : 500
    return res.status(statusCode).json({
      ok: false,
      error: {
        code: statusCode >= 500 ? 'WHATSAPP_SEND_FAILED' : 'WHATSAPP_REQUEST_FAILED',
        message: 'Unable to send WhatsApp message at the moment.',
      },
      details: error?.provider || null,
    })
  }
}