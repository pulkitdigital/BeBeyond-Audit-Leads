/**
 * @typedef {Object} AppConfig
 * @property {string} MAIL_FROM_EMAIL
 * @property {string} MAIL_FROM_NAME
 * @property {string} MAIL_ADMIN_EMAIL
 * @property {string} BREVO_API_KEY
 * @property {string} WHATSAPP_ACCESS_TOKEN
 * @property {string} WHATSAPP_PHONE_NUMBER_ID
 * @property {string} WHATSAPP_BUSINESS_ACCOUNT_ID
 * @property {string} WHATSAPP_TEMPLATE_NAME
 * @property {string} WHATSAPP_API_VERSION
 * @property {string} WHATSAPP_LANGUAGE_CODE
 */

/** @type {AppConfig | null} */
let cachedConfig = null

/**
 * Reads and validates required server-side environment variables.
 * Throws once per cold start if configuration is invalid.
 *
 * @returns {AppConfig}
 */
export function getConfig() {
  if (cachedConfig) return cachedConfig

  const requiredKeys = [
    'MAIL_FROM_EMAIL',
    'MAIL_FROM_NAME',
    'MAIL_ADMIN_EMAIL',
    'BREVO_API_KEY',
    'WHATSAPP_ACCESS_TOKEN',
    'WHATSAPP_PHONE_NUMBER_ID',
    'WHATSAPP_BUSINESS_ACCOUNT_ID',
    'WHATSAPP_TEMPLATE_NAME',
  ]

  const missing = requiredKeys.filter((key) => !process.env[key]?.trim())
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
  }

  cachedConfig = {
    MAIL_FROM_EMAIL: process.env.MAIL_FROM_EMAIL.trim(),
    MAIL_FROM_NAME: process.env.MAIL_FROM_NAME.trim(),
    MAIL_ADMIN_EMAIL: process.env.MAIL_ADMIN_EMAIL.trim(),
    BREVO_API_KEY: process.env.BREVO_API_KEY.trim(),
    WHATSAPP_ACCESS_TOKEN: process.env.WHATSAPP_ACCESS_TOKEN.trim(),
    WHATSAPP_PHONE_NUMBER_ID: process.env.WHATSAPP_PHONE_NUMBER_ID.trim(),
    WHATSAPP_BUSINESS_ACCOUNT_ID: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID.trim(),
    WHATSAPP_TEMPLATE_NAME: process.env.WHATSAPP_TEMPLATE_NAME.trim(),
    WHATSAPP_API_VERSION: (process.env.WHATSAPP_API_VERSION || 'v20.0').trim(),
    WHATSAPP_LANGUAGE_CODE: (process.env.WHATSAPP_LANGUAGE_CODE || 'en').trim(),
  }

  return cachedConfig
}
