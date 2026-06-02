/**
 * AuditForm.jsx  ─  BeBeyond Digital
 * ─────────────────────────────────────────────────────────────
 * Dependencies:
 *   npm install react-icons
 *   (No extra email library — serverless API uses fetch directly)
 *
 * Setup:
 *   1. Copy .env.example → .env.local and fill in your values
 *   2. Never commit .env.local to git (already in .gitignore by Vite/CRA)
 * ─────────────────────────────────────────────────────────────
 */

import { useState } from 'react'
import { FiUser, FiPhone, FiMail, FiGlobe, FiBriefcase, FiCheckCircle, FiAlertTriangle, FiTarget } from 'react-icons/fi'
import { FaInstagram, FaWhatsapp } from 'react-icons/fa'
import { HiClipboardDocumentList, HiCheckCircle } from 'react-icons/hi2'
import { MdBusiness, MdBarChart, MdPhoto, MdLanguage } from 'react-icons/md'
import { RiRocketLine, RiSparklingLine } from 'react-icons/ri'
import { BsStars } from 'react-icons/bs'

// ─── Frontend-safe env vars (VITE_ only) ─────────────────────────────────────
const GOOGLE_SHEET_URL = import.meta.env.VITE_GOOGLE_SHEET_URL
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Extracts a human-readable API error message.
 *
 * @param {any} err
 * @param {string} fallback
 * @returns {string}
 */
function apiErrorMessage(err, fallback) {
  if (!err) return fallback
  if (typeof err === 'string') return err
  if (typeof err?.error === 'string') return err.error
  if (typeof err?.error?.message === 'string') return err.error.message
  if (typeof err?.message === 'string') return err.message
  return fallback
}

// ─── API helpers ──────────────────────────────────────────────────────────────
async function sendEmail({ to_email, to_name, subject, html, audience }) {
  const res = await fetch('/api/send-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ to_email, to_name, subject, html, audience }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(apiErrorMessage(err, `Email error ${res.status}`))
  }
}

async function sendWhatsApp({ mobile, name, businessName, auditType }) {
  const res = await fetch('/api/send-whatsapp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mobile, name, businessName, auditType }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(apiErrorMessage(err, `WhatsApp error ${res.status}`))
  }
}

async function submitToGoogleSheet(payload) {
  if (!GOOGLE_SHEET_URL) {
    console.warn('Google Sheet URL not configured; skipping sheet submission')
    return
  }

  try {
    const res = await fetch(GOOGLE_SHEET_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    // no-cors returns opaque response; this branch mostly helps local/proxy cases
    if (res.type !== 'opaque' && !res.ok) {
      throw new Error(`Google Sheet submission failed with status ${res.status}`)
    }
  } catch (error) {
    console.error('Google Sheet submission failed:', error)
    throw error
  }
}

// ─── Customer thank-you email HTML ───────────────────────────────────────────
function customerEmailHtml({ name, businessName, businessType, auditLabel, instagram, website }) {
  return `
  <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#0B1A2D;color:#fff;border-radius:12px;overflow:hidden;">
    <div style="background:linear-gradient(135deg,#219ebc,#fb8500);padding:32px 40px;text-align:center;">
      <h1 style="margin:0;font-size:24px;color:#fff;">Audit Request Received!</h1>
      <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">BeBeyond Digital</p>
    </div>
    <div style="padding:32px 40px;">
      <p style="font-size:16px;">Hi <strong>${name}</strong>,</p>
      <p style="color:rgba(255,255,255,0.7);line-height:1.7;">
        Thank you for submitting your <strong style="color:#219ebc;">Free Digital Audit</strong> request!<br/>
        We'll review and send you a detailed report within <strong>24 hours</strong>.
      </p>
      <div style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);border-radius:10px;padding:20px 24px;margin:24px 0;">
        <p style="margin:0 0 12px;font-size:12px;text-transform:uppercase;letter-spacing:1px;color:rgba(255,255,255,0.4);">Submission Summary</p>
        <table style="width:100%;font-size:14px;border-collapse:collapse;">
          <tr><td style="padding:6px 0;color:rgba(255,255,255,0.5);">Business</td><td style="color:#fff;text-align:right;">${businessName}</td></tr>
          <tr><td style="padding:6px 0;color:rgba(255,255,255,0.5);">Type</td><td style="color:#fff;text-align:right;">${businessType}</td></tr>
          <tr><td style="padding:6px 0;color:rgba(255,255,255,0.5);">Audit</td><td style="color:#fb8500;text-align:right;font-weight:bold;">${auditLabel}</td></tr>
          <tr><td style="padding:6px 0;color:rgba(255,255,255,0.5);">Instagram</td><td style="color:#fff;text-align:right;">${instagram}</td></tr>
          <tr><td style="padding:6px 0;color:rgba(255,255,255,0.5);">Website</td><td style="color:#fff;text-align:right;">${website}</td></tr>
        </table>
      </div>
      <p style="color:rgba(255,255,255,0.6);font-size:14px;line-height:1.8;">
        Stay tuned — big improvements are coming!<br/><br/>
        — <strong>Team BeBeyond Digital</strong><br/>+91 99 1867 1867
      </p>
    </div>
  </div>`
}

// ─── Admin lead notification email HTML ──────────────────────────────────────
function adminEmailHtml({ name, mobile, email, businessName, businessType, auditLabel, instagram, website, submittedAt }) {
  return `
  <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f9fafb;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
    <div style="background:#0B1A2D;padding:24px 32px;">
      <h2 style="margin:0;color:#fb8500;font-size:20px;">New Audit Lead</h2>
      <p style="margin:4px 0 0;color:rgba(255,255,255,0.5);font-size:13px;">${submittedAt}</p>
    </div>
    <div style="padding:28px 32px;">
      <table style="width:100%;font-size:14px;border-collapse:collapse;">
        <tr style="border-bottom:1px solid #e5e7eb;"><td style="padding:10px 0;color:#6b7280;width:130px;">Name</td><td style="color:#111827;font-weight:600;">${name}</td></tr>
        <tr style="border-bottom:1px solid #e5e7eb;"><td style="padding:10px 0;color:#6b7280;">Mobile</td><td style="color:#111827;">+91 ${mobile}</td></tr>
        <tr style="border-bottom:1px solid #e5e7eb;"><td style="padding:10px 0;color:#6b7280;">Email</td><td style="color:#219ebc;">${email}</td></tr>
        <tr style="border-bottom:1px solid #e5e7eb;"><td style="padding:10px 0;color:#6b7280;">Business</td><td style="color:#111827;font-weight:600;">${businessName}</td></tr>
        <tr style="border-bottom:1px solid #e5e7eb;"><td style="padding:10px 0;color:#6b7280;">Business Type</td><td style="color:#111827;">${businessType}</td></tr>
        <tr style="border-bottom:1px solid #e5e7eb;"><td style="padding:10px 0;color:#6b7280;">Audit</td><td style="color:#fb8500;font-weight:bold;">${auditLabel}</td></tr>
        <tr style="border-bottom:1px solid #e5e7eb;"><td style="padding:10px 0;color:#6b7280;">Instagram</td><td style="color:#111827;">${instagram}</td></tr>
        <tr><td style="padding:10px 0;color:#6b7280;">Website</td><td style="color:#111827;">${website}</td></tr>
      </table>
    </div>
  </div>`
}

const BUSINESS_TYPES = [
  'E-Commerce', 'Restaurant / Café', 'Fashion & Apparel', 'Real Estate',
  'Healthcare / Clinic', 'Education / Coaching', 'Travel & Tourism',
  'Fitness / Gym', 'Beauty & Salon', 'IT / Software', 'Freelancer', 'Other',
]

// ─── Blocked disposable email domains ────────────────────────────────────────
const BLOCKED_DOMAINS = new Set([
  'mailinator.com','guerrillamail.com','10minutemail.com','tempmail.com',
  'throwaway.email','yopmail.com','trashmail.com','fakeinbox.com',
  'sharklasers.com','guerrillamailblock.com','grr.la','spam4.me',
  'dispostable.com','maildrop.cc','mintemail.com','mailnull.com',
  'spamgourmet.com','spamgourmet.net','spamgourmet.org','receiveonly.net',
  'trashmail.at','trashmail.io','discard.email','byom.de',
  'nada.email','spamhereplease.com','mailnesia.com',
])

const VALID_EMAIL_REGEX = /^[a-zA-Z0-9]([a-zA-Z0-9._+-]*[a-zA-Z0-9])?@[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z]{2,})+$/

const initialState = {
  name: '', mobile: '', email: '', businessName: '',
  businessType: '', instagram: '', website: '', auditType: 'both',
}

export default function AuditForm() {
  const [form, setForm]                       = useState(initialState)
  const [errors, setErrors]                   = useState({})
  const [status, setStatus]                   = useState('idle') // idle | loading | success | error
  const [whatsappWarning, setWhatsappWarning] = useState(false)

  // ── Validation ────────────────────────────────────────────────────────────
  const validate = () => {
    const e = {}

    const name = form.name.trim()
    if (!name)                                  e.name = 'Name is required'
    else if (name.length < 2)                   e.name = 'Name too short'
    else if (/\d/.test(name))                   e.name = 'Name cannot contain numbers'
    else if (!/^[a-zA-Z\s'.,-]+$/.test(name))  e.name = 'Enter a real name'

    const mob = form.mobile.trim()
    if (!mob)                              e.mobile = 'Mobile number is required'
    else if (!/^\d{10}$/.test(mob))        e.mobile = 'Must be exactly 10 digits'
    else if (!/^[6-9]/.test(mob))          e.mobile = 'Enter a valid Indian mobile number'
    else if (/^(\d)\1{9}$/.test(mob))      e.mobile = 'Enter a real mobile number'

    const email = form.email.trim().toLowerCase()
    if (!email) {
      e.email = 'Email is required'
    } else if (!VALID_EMAIL_REGEX.test(email)) {
      e.email = 'Enter a valid email address'
    } else if (email.includes('..')) {
      e.email = 'Invalid email format'
    } else {
      const domain = email.split('@')[1]
      if (BLOCKED_DOMAINS.has(domain)) {
        e.email = 'Disposable emails not allowed'
      } else if (domain.split('.').some(p => p.length === 0)) {
        e.email = 'Invalid email format'
      }
    }

    const bname = form.businessName.trim()
    if (!bname)                e.businessName = 'Business name is required'
    else if (bname.length < 2) e.businessName = 'Name too short'

    if (!form.businessType) e.businessType = 'Please select business type'

    // ── Instagram is always required (collected from every user) ──────────
    const ig = form.instagram.trim().replace('@', '')
    if (!ig) {
      e.instagram = 'Instagram handle is required'
    } else if (ig.length < 2) {
      e.instagram = 'Handle too short'
    } else if (!/^[a-zA-Z0-9._]{1,30}$/.test(ig)) {
      e.instagram = 'Invalid Instagram handle (a–z, 0–9, . _ only)'
    }

    // ── Website is always required (collected from every user) ────────────
    const url = form.website.trim()
    if (!url) {
      e.website = 'Website URL is required'
    } else {
      try {
        const parsed = new URL(url.startsWith('http') ? url : 'https://' + url)
        if (!parsed.hostname.includes('.')) e.website = 'Enter a valid URL'
      } catch {
        e.website = 'Enter a valid URL (e.g. https://yourbrand.com)'
      }
    }

    return e
  }

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }))
  }

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (ev) => {
    ev.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setStatus('loading')
    setWhatsappWarning(false)

    const auditLabel =
      form.auditType === 'both'      ? 'Instagram + Website' :
      form.auditType === 'instagram' ? 'Instagram Only' : 'Website Only'

    try {
      // 1. Save to Google Sheets
      await submitToGoogleSheet({
        ...form,
        instagram:   `@${form.instagram.replace('@', '')}`,
        website:     form.website,
        submittedAt: new Date().toISOString(),
      })

      const emailData = {
        name:         form.name,
        mobile:       form.mobile,
        email:        form.email,
        businessName: form.businessName,
        businessType: form.businessType,
        auditLabel,
        instagram:    `@${form.instagram.replace('@', '')}`,
        website:      form.website,
        submittedAt:  new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      }

      // 2. Customer thank-you email
      await sendEmail({
        to_email: form.email,
        to_name:  form.name,
        subject:  'Audit Request Received — BeBeyond Digital',
        html:     customerEmailHtml(emailData),
      })

      // 3. Admin notification email
      await sendEmail({
        audience: 'admin',
        subject:  `New Audit Lead — ${form.businessName}`,
        html:     adminEmailHtml(emailData),
      })

      // 4. WhatsApp template message (non-blocking)
      try {
        await sendWhatsApp({
          mobile:       form.mobile,
          name:         form.name,
          businessName: form.businessName,
          auditType:    auditLabel,
        })
      } catch (whatsappError) {
        console.error('WhatsApp send failed:', whatsappError?.message || whatsappError)
        setWhatsappWarning(true)
      }

      setStatus('success')

    } catch (err) {
      console.error(err)
      setStatus('error')
    }
  }

  // ── Success Screen ────────────────────────────────────────────────────────
  if (status === 'success') {
    return (
      <div className="min-h-screen bg-[#0B1A2D] flex items-center justify-center px-4 py-16
        [background-image:radial-gradient(ellipse_60%_60%_at_50%_0%,rgba(33,158,188,.15)_0%,transparent_70%)]">
        <div className="max-w-md w-full text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full
            bg-gradient-to-br from-[#219ebc] to-[#fb8500] mb-6 shadow-[0_0_40px_rgba(33,158,188,0.4)]">
            <HiCheckCircle className="text-white text-4xl" />
          </div>
          <h2 className="font-['Bricolage_Grotesque',sans-serif] text-3xl font-extrabold text-white mb-3">
            You're All Set! <BsStars className="inline text-[#fb8500] mb-1" />
          </h2>
          <p className="text-white/60 text-base leading-relaxed mb-2">
            Thank you <span className="text-[#219ebc] font-semibold">{form.name}</span>!
            Your audit request has been received.
          </p>
          <p className="text-white/50 text-sm mb-2 flex items-center justify-center gap-1.5">
            <FiCheckCircle className="text-green-400 shrink-0" />
            Confirmation email sent to <span className="text-white/70">{form.email}</span>
          </p>

          {/* WhatsApp status */}
          {whatsappWarning ? (
            <p className="text-amber-400 text-sm mb-8 bg-amber-400/10 border border-amber-400/20 rounded-xl py-2.5 px-4 flex items-center justify-center gap-2">
              <FiAlertTriangle className="shrink-0" />
              WhatsApp message could not be delivered. We will contact you shortly.
            </p>
          ) : (
            <p className="text-white/50 text-sm mb-8 flex items-center justify-center gap-1.5">
              <FaWhatsapp className="text-green-400 shrink-0" />
              WhatsApp confirmation sent to +91 {form.mobile}
            </p>
          )}

          <button
            onClick={() => { setForm(initialState); setStatus('idle'); setWhatsappWarning(false) }}
            className="px-8 py-3 rounded-xl bg-white/10 border border-white/20 text-white text-sm font-semibold
              hover:bg-white/15 transition-all duration-200"
          >
            Submit Another
          </button>
        </div>
      </div>
    )
  }

  // ── Form ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#0B1A2D] flex items-center justify-center px-4 py-16
      [background-image:radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(33,158,188,.12)_0%,transparent_70%),radial-gradient(ellipse_40%_40%_at_90%_80%,rgba(251,133,0,.08)_0%,transparent_60%)]
      font-['Public_Sans',sans-serif]">

      {/* Grid bg */}
      <div aria-hidden className="pointer-events-none fixed inset-0
        [background-image:linear-gradient(rgba(255,255,255,.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.025)_1px,transparent_1px)]
        [background-size:52px_52px]" />

      <div className="relative z-10 w-full max-w-2xl">

        {/* Header */}
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-2 bg-[rgba(33,158,188,0.12)] border border-[rgba(33,158,188,0.3)]
            rounded-full px-4 py-1.5 text-[11px] font-bold tracking-[2px] uppercase text-[#5dd1ec] mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#5dd1ec] animate-pulse" />
            Free Audit — Limited Spots
          </span>
          <h1 className="font-['Bricolage_Grotesque',sans-serif] text-4xl md:text-5xl font-extrabold text-white
            leading-tight tracking-tight mb-3">
            Get Your Free{' '}
            <span className="bg-gradient-to-r from-[#219ebc] to-[#fb8500] bg-clip-text text-transparent">
              Digital Audit
            </span>
          </h1>
          <p className="text-white/50 text-base max-w-md mx-auto">
            Fill in your details and we'll audit your Instagram &amp; website — completely free.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-6 md:p-10
          shadow-[0_32px_80px_rgba(0,0,0,0.5)] backdrop-blur-sm">

          <form onSubmit={handleSubmit} noValidate>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              {/* Name */}
              <Field label="Full Name" icon={<FiUser />} error={errors.name}>
                <input
                  type="text"
                  placeholder="Rahul Sharma"
                  value={form.name}
                  onChange={e => handleChange('name', e.target.value)}
                  autoComplete="name"
                  className={inputCls(errors.name)}
                />
              </Field>

              {/* Mobile */}
              <Field label="Mobile Number" icon={<FiPhone />} error={errors.mobile}>
                <div className="flex">
                  <span className="flex items-center px-3 bg-white/[0.06] border border-r-0 border-white/[0.12]
                    rounded-l-xl text-white/50 text-sm select-none">+91</span>
                  <input
                    type="tel"
                    placeholder="9876543210"
                    maxLength={10}
                    value={form.mobile}
                    onChange={e => handleChange('mobile', e.target.value.replace(/\D/g, ''))}
                    autoComplete="tel"
                    className={inputCls(errors.mobile) + ' rounded-l-none'}
                  />
                </div>
              </Field>

              {/* Email */}
              <Field label="Email Address" icon={<FiMail />} error={errors.email}>
                <input
                  type="email"
                  placeholder="rahul@example.com"
                  value={form.email}
                  onChange={e => handleChange('email', e.target.value.trim())}
                  autoComplete="email"
                  className={inputCls(errors.email)}
                />
              </Field>

              {/* Business Name */}
              <Field label="Business Name" icon={<MdBusiness />} error={errors.businessName}>
                <input
                  type="text"
                  placeholder="My Awesome Brand"
                  value={form.businessName}
                  onChange={e => handleChange('businessName', e.target.value)}
                  className={inputCls(errors.businessName)}
                />
              </Field>

              {/* Business Type — full width */}
              <Field label="Business Type" icon={<FiBriefcase />} error={errors.businessType} className="md:col-span-2">
                <div className="relative">
                  <select
                    value={form.businessType}
                    onChange={e => handleChange('businessType', e.target.value)}
                    style={{ colorScheme: 'dark' }}
                    className={inputCls(errors.businessType) + ' cursor-pointer pr-10'}
                  >
                    <option value="" style={{ background: '#0f2236', color: '#ffffff99' }}>
                      Select your business type…
                    </option>
                    {BUSINESS_TYPES.map(t => (
                      <option key={t} value={t} style={{ background: '#0f2236', color: '#fff' }}>
                        {t}
                      </option>
                    ))}
                  </select>
                  {/* Custom chevron */}
                  <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/40">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              </Field>

              {/* ── Instagram Handle — always visible, always required ─────── */}
              <Field
                label="Instagram Handle"
                icon={<FaInstagram />}
                error={errors.instagram}
                className="md:col-span-2"
              >
                <div className="flex">
                  <span className="flex items-center px-3 bg-white/[0.06] border border-r-0 border-white/[0.12]
                    rounded-l-xl text-white/50 text-sm select-none">@</span>
                  <input
                    type="text"
                    placeholder="yourbrand"
                    value={form.instagram}
                    onChange={e => handleChange('instagram', e.target.value.replace(/[@\s]/g, ''))}
                    className={inputCls(errors.instagram) + ' rounded-l-none'}
                  />
                </div>
              </Field>

              {/* ── Website URL — always visible, always required ─────────── */}
              <Field
                label="Website URL"
                icon={<FiGlobe />}
                error={errors.website}
                className="md:col-span-2"
              >
                <input
                  type="url"
                  placeholder="https://yourbrand.com"
                  value={form.website}
                  onChange={e => handleChange('website', e.target.value)}
                  className={inputCls(errors.website)}
                />
              </Field>

              {/* ── Audit Type — 3-column card grid */}
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold uppercase tracking-widest text-white/50 mb-3">
                  What Would You Like Audited?
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { val: 'both',      label: 'Instagram + Website', icon: <MdBarChart size={28} /> },
                    { val: 'instagram', label: 'Instagram Only',      icon: <FaInstagram size={26} /> },
                    { val: 'website',   label: 'Website Only',        icon: <MdLanguage size={28} /> },
                  ].map(({ val, label, icon }) => (
                    <label
                      key={val}
                      className={`flex flex-col items-center justify-center gap-2 px-3 py-4 rounded-xl border cursor-pointer
                        text-xs font-semibold transition-all duration-200 select-none text-center
                        ${form.auditType === val
                          ? 'border-[#219ebc] bg-[rgba(33,158,188,0.15)] text-[#5dd1ec] shadow-[0_0_20px_rgba(33,158,188,0.15)]'
                          : 'border-white/[0.10] bg-white/[0.03] text-white/50 hover:border-white/25 hover:text-white/70 hover:bg-white/[0.05]'
                        }`}
                    >
                      <input
                        type="radio" name="auditType" value={val}
                        checked={form.auditType === val}
                        onChange={() => handleChange('auditType', val)}
                        className="sr-only"
                      />
                      <span className={form.auditType === val ? 'text-[#5dd1ec]' : 'text-white/40'}>
                        {icon}
                      </span>
                      <span className="leading-tight">{label}</span>
                      {/* Radio dot */}
                      <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all
                        ${form.auditType === val ? 'border-[#219ebc]' : 'border-white/25'}`}>
                        {form.auditType === val && (
                          <span className="w-2 h-2 rounded-full bg-[#219ebc]" />
                        )}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

            </div>

            {/* Error banner */}
            {status === 'error' && (
              <p className="mt-5 text-center text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl py-3 px-4 flex items-center justify-center gap-2">
                <FiAlertTriangle className="shrink-0" />
                Something went wrong. Please try again or WhatsApp us at +91 99 1867 1867.
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={status === 'loading'}
              className="mt-8 w-full flex items-center justify-center gap-3
                py-4 rounded-xl bg-gradient-to-r from-[#219ebc] to-[#fb8500]
                font-['Bricolage_Grotesque',sans-serif] text-white font-bold text-lg
                shadow-[0_8px_32px_rgba(251,133,0,0.35)]
                hover:shadow-[0_12px_40px_rgba(251,133,0,0.55)] hover:-translate-y-0.5
                active:translate-y-0 transition-all duration-200
                disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              {status === 'loading' ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Submitting…
                </>
              ) : (
                <>
                  <HiClipboardDocumentList size={22} />
                  Book My Free Audit
                  <FaWhatsapp size={20} />
                </>
              )}
            </button>

            <p className="mt-4 text-center text-xs text-white/30 flex items-center justify-center gap-1.5">
              <FiTarget className="shrink-0" />
              No spam. No credit card. Just a free honest audit.
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const inputCls = (err) =>
  `w-full bg-[#0f2236] border ${err ? 'border-red-400/60' : 'border-white/[0.12]'}
   rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm
   focus:outline-none focus:border-[#219ebc] focus:bg-[#0a1c30]
   transition-all duration-200 appearance-none
   disabled:opacity-40 disabled:cursor-not-allowed`

function Field({ label, icon, error, children, className = '' }) {
  return (
    <div className={className}>
      <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-white/50 mb-2">
        <span className="text-[#219ebc] text-sm">{icon}</span>
        {label}
      </label>
      {children}
      {error && <p className="mt-1.5 text-xs text-red-400">{error}</p>}
    </div>
  )
}