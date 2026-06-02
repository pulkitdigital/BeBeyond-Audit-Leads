import { getConfig } from './config.js'

/**
 * Validates an email address.
 *
 * @param {string} email
 * @returns {boolean}
 */
export function validateEmail(email) {
  if (typeof email !== 'string') return false
  const value = email.trim().toLowerCase()
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

/**
 * Sends email through Brevo transactional API.
 *
 * @param {Object} payload
 * @param {string} payload.toEmail
 * @param {string} payload.toName
 * @param {string} payload.subject
 * @param {string} payload.html
 * @returns {Promise<{messageId?: string, raw: any}>}
 */
export async function sendBrevoEmail({ toEmail, toName, subject, html }) {
  const config = getConfig('email')

  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': config.BREVO_API_KEY,
    },
    body: JSON.stringify({
      sender: {
        email: config.MAIL_FROM_EMAIL,
        name: config.MAIL_FROM_NAME,
      },
      to: [
        {
          email: toEmail,
          name: toName || toEmail,
        },
      ],
      subject,
      htmlContent: html,
    }),
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    const error = new Error('Brevo API request failed')
    error.status = response.status
    error.provider = data
    throw error
  }

  return {
    messageId: data?.messageId,
    raw: data,
  }
}
