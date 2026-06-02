import { getConfig } from './config.js'

/**
 * Formats Indian mobile numbers for WhatsApp Cloud API.
 *
 * @param {string | number} mobile
 * @returns {string | null}
 */
export function formatIndianWhatsAppNumber(mobile) {
  const digits = String(mobile || '').replace(/\D/g, '')
  const normalized = digits.length > 10 ? digits.slice(-10) : digits

  if (!/^[6-9]\d{9}$/.test(normalized)) {
    return null
  }

  return `91${normalized}`
}

/**
 * Sends an approved WhatsApp template with body parameters.
 *
 * @param {Object} input
 * @param {string|number} input.mobile
 * @param {string} input.name
 * @param {string} input.businessName
 * @param {string} input.auditType
 * @returns {Promise<{to: string, raw: any}>}
 */
export async function sendWhatsAppTemplate({ mobile, name, businessName, auditType }) {
  const config = getConfig()
  const to = formatIndianWhatsAppNumber(mobile)

  if (!to) {
    const error = new Error('Invalid mobile number')
    error.status = 400
    throw error
  }

  const response = await fetch(
    `https://graph.facebook.com/${config.WHATSAPP_API_VERSION}/${config.WHATSAPP_PHONE_NUMBER_ID}/messages`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.WHATSAPP_ACCESS_TOKEN}`,
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to,
        type: 'template',
        template: {
          name: config.WHATSAPP_TEMPLATE_NAME,
          language: { code: config.WHATSAPP_LANGUAGE_CODE },
          components: [
            {
              type: 'body',
              parameters: [
                { type: 'text', text: String(name || '').trim() || '-' },
                { type: 'text', text: String(businessName || '').trim() || '-' },
                { type: 'text', text: String(auditType || '').trim() || '-' },
              ],
            },
          ],
        },
      }),
    }
  )

  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    const error = new Error('WhatsApp API request failed')
    error.status = response.status
    error.provider = data
    throw error
  }

  return { to, raw: data }
}
