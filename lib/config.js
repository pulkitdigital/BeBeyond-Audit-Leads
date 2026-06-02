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
 * @typedef {'all'|'email'|'whatsapp'} ConfigScope
 */

/**
 * Returns trimmed env value or empty string.
 *
 * @param {string} key
 * @returns {string}
 */
function envValue(key) {
  return String(process.env[key] || '').trim()
}

/**
 * Reads and validates required server-side environment variables.
 * Throws once per cold start if configuration is invalid.
 *
 * @param {ConfigScope} [scope='all']
 * @returns {AppConfig}
 */
export function getConfig(scope = 'all') {
  if (!cachedConfig) {
    cachedConfig = {
      MAIL_FROM_EMAIL: envValue('MAIL_FROM_EMAIL'),
      MAIL_FROM_NAME: envValue('MAIL_FROM_NAME'),
      MAIL_ADMIN_EMAIL: envValue('MAIL_ADMIN_EMAIL'),
      BREVO_API_KEY: envValue('BREVO_API_KEY'),
      WHATSAPP_ACCESS_TOKEN: envValue('WHATSAPP_ACCESS_TOKEN'),
      WHATSAPP_PHONE_NUMBER_ID: envValue('WHATSAPP_PHONE_NUMBER_ID'),
      WHATSAPP_BUSINESS_ACCOUNT_ID: envValue('WHATSAPP_BUSINESS_ACCOUNT_ID'),
      WHATSAPP_TEMPLATE_NAME: envValue('WHATSAPP_TEMPLATE_NAME'),
      WHATSAPP_API_VERSION: envValue('WHATSAPP_API_VERSION') || 'v20.0',
      WHATSAPP_LANGUAGE_CODE: envValue('WHATSAPP_LANGUAGE_CODE') || 'en',
    }
  }

  const requiredByScope = {
    email: ['MAIL_FROM_EMAIL', 'MAIL_FROM_NAME', 'MAIL_ADMIN_EMAIL', 'BREVO_API_KEY'],
    whatsapp: [
      'WHATSAPP_ACCESS_TOKEN',
      'WHATSAPP_PHONE_NUMBER_ID',
      'WHATSAPP_BUSINESS_ACCOUNT_ID',
      'WHATSAPP_TEMPLATE_NAME',
    ],
    all: [
      'MAIL_FROM_EMAIL',
      'MAIL_FROM_NAME',
      'MAIL_ADMIN_EMAIL',
      'BREVO_API_KEY',
      'WHATSAPP_ACCESS_TOKEN',
      'WHATSAPP_PHONE_NUMBER_ID',
      'WHATSAPP_BUSINESS_ACCOUNT_ID',
      'WHATSAPP_TEMPLATE_NAME',
    ],
  }

  const requiredKeys = requiredByScope[scope] || requiredByScope.all
  const missing = requiredKeys.filter((key) => !cachedConfig[key])
  if (missing.length > 0) {
    throw new Error(`Missing required ${scope} environment variables: ${missing.join(', ')}`)
  }

  return cachedConfig
}
