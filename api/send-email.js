import { getConfig } from '../lib/config.js'
import { sendBrevoEmail, validateEmail } from '../lib/email.js'

/**
 * Sends customer/admin emails via Brevo API.
 *
 * For `audience: "admin"`, destination email is resolved server-side from env.
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
    const audience = body.audience === 'admin' ? 'admin' : 'customer'

    const toEmail = audience === 'admin' ? config.MAIL_ADMIN_EMAIL : String(body.to_email || '').trim()
    const toName =
      audience === 'admin'
        ? 'BeBeyond Admin'
        : String(body.to_name || '').trim() || toEmail
    const subject = String(body.subject || '').trim()
    const html = String(body.html || '').trim()

    if (!validateEmail(toEmail)) {
      return res.status(400).json({
        ok: false,
        error: { code: 'INVALID_EMAIL', message: 'A valid recipient email is required.' },
      })
    }

    if (!subject || subject.length < 3 || subject.length > 200) {
      return res.status(400).json({
        ok: false,
        error: { code: 'INVALID_SUBJECT', message: 'Subject must be 3-200 characters.' },
      })
    }

    if (!html || html.length < 20 || html.length > 200000) {
      return res.status(400).json({
        ok: false,
        error: { code: 'INVALID_HTML', message: 'HTML body must be 20-200000 characters.' },
      })
    }

    const result = await sendBrevoEmail({ toEmail, toName, subject, html })

    return res.status(200).json({
      ok: true,
      message: 'Email sent successfully.',
      data: {
        audience,
        to_email: toEmail,
        message_id: result.messageId || null,
      },
    })
  } catch (error) {
    console.error('send-email route failure:', {
      message: error?.message,
      status: error?.status,
      provider: error?.provider,
    })

    const statusCode = Number.isInteger(error?.status) ? error.status : 500
    return res.status(statusCode).json({
      ok: false,
      error: {
        code: statusCode >= 500 ? 'EMAIL_SEND_FAILED' : 'EMAIL_REQUEST_FAILED',
        message: 'Unable to send email at the moment.',
      },
      details: error?.provider || null,
    })
  }
}