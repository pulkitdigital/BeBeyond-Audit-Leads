import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { HiClipboardDocumentList, HiArrowRight } from 'react-icons/hi2'
import { FaWhatsapp } from 'react-icons/fa'
import { FiPhone } from 'react-icons/fi'
import { MdLocationOn, MdEmail } from 'react-icons/md'

const contactStrip = [
  { Icon: MdLocationOn, text: 'Chamber 6 Sangam Place, Civil Lines, Prayagraj, UP 211001' },
  { Icon: MdEmail,      text: 'info@bebeyond.digital' },
  { Icon: FiPhone,      text: '+91 99 1867 1867' },
]

const footerLinks = [
  ['Home',     'https://bebeyond.digital/'],
  ['Services', 'https://bebeyond.digital/services'],
  ['Projects', 'https://bebeyond.digital/projects'],
  ['Blog',     'https://bebeyond.digital/blogs'],
  ['Contact',  'https://bebeyond.digital/contact'],
]

const ease = [0.22, 1, 0.36, 1]

export default function Footer() {
  const sectionRef = useRef(null)
  const inView = useInView(sectionRef, { once: true, margin: '-80px' })

  return (
    <>
      {/* ── CTA Section ─────────────────────────────────────────────────── */}
      <section
        ref={sectionRef}
        className="
          relative isolate overflow-hidden
          bg-[#0B1A2D]
          px-[5%] pt-[60px] pb-[40px]
          text-center
          font-['Public_Sans',sans-serif]
          md:pb-[40px] md:pt-[80px]
        "
      >
        {/* Grid overlay */}
        <div
          aria-hidden
          className="
            pointer-events-none absolute inset-0 z-0
            [background-image:linear-gradient(rgba(33,158,188,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(33,158,188,0.07)_1px,transparent_1px)]
            [background-size:52px_52px]
            [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,black_20%,transparent_100%)]
          "
        />

        {/* Glow — left */}
        <div
          aria-hidden
          className="
            pointer-events-none absolute -left-[100px] top-[40%] z-[1]
            h-[380px] w-[380px] rounded-full
            bg-[radial-gradient(circle,rgba(33,158,188,0.2)_0%,transparent_70%)]
          "
        />

        {/* Glow — right */}
        <div
          aria-hidden
          className="
            pointer-events-none absolute -right-[100px] top-[40%] z-[1]
            h-[380px] w-[380px] rounded-full
            bg-[radial-gradient(circle,rgba(251,133,0,0.17)_0%,transparent_70%)]
          "
        />

        {/* Content */}
        <div className="relative z-[2] mx-auto max-w-[720px]">

          {/* Heading */}
          <motion.h2
            className="
              m-0 mb-[18px]
              font-['Bricolage_Grotesque',sans-serif] font-extrabold
              text-[clamp(30px,5.5vw,56px)] leading-[1.1] tracking-[-1px]
              text-white
            "
            initial={{ opacity: 0, y: 40 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.65, delay: 0.15, ease }}
          >
            Ready to Stop Being{' '}
            <span className="bg-gradient-to-br from-[#219ebc] to-[#fb8500] bg-clip-text text-transparent">
              Invisible Online?
            </span>
          </motion.h2>

          {/* Subtext */}
          <motion.p
            className="
              mx-auto mb-[16px] max-w-[520px]
              text-[clamp(15px,2vw,17px)] leading-[1.78]
              text-white/60
            "
            initial={{ opacity: 0, y: 28 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.25, ease }}
          >
            Book your free 30-minute audit today. We'll show you exactly what's holding
            your business back — and how to fix it.
          </motion.p>

          {/* Divider */}
          <motion.div
            className="mx-auto mb-[44px] h-[3px] w-[56px] rounded-full bg-gradient-to-r from-[#219ebc] to-[#fb8500]"
            initial={{ scaleX: 0, opacity: 0 }}
            animate={inView ? { scaleX: 1, opacity: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.35, ease }}
            style={{ originX: 0.5 }}
          />

          {/* Buttons */}
          <div className="mb-[52px] flex flex-wrap justify-center gap-3 max-[560px]:flex-col max-[560px]:items-stretch">
            {[
              <a
                key="audit"
                href="#audit-form"
                className="
                  inline-flex items-center justify-center gap-[9px]
                  rounded-[10px] bg-[#fb8500] px-[34px] py-[15px]
                  font-['Bricolage_Grotesque',sans-serif] text-[15px] font-bold text-white no-underline
                  shadow-[0_4px_24px_rgba(251,133,0,0.4)]
                  transition-all duration-200
                  hover:-translate-y-[3px] hover:shadow-[0_10px_36px_rgba(251,133,0,0.6)]
                  max-[560px]:w-full
                "
              >
                <HiClipboardDocumentList size={19} aria-hidden />
                Book Free Audit
              </a>,
              <a
                key="wa"
                href="https://wa.me/919918671867?text=Hi%2C%20I%20want%20to%20know%20more%20about%20BeBeyond%20Digital%20Solutions."
                target="_blank"
                rel="noopener noreferrer"
                className="
                  inline-flex items-center justify-center gap-[9px]
                  rounded-[10px] bg-[#1db954] px-[28px] py-[15px]
                  font-['Bricolage_Grotesque',sans-serif] text-[15px] font-bold text-white no-underline
                  shadow-[0_4px_20px_rgba(29,185,84,0.3)]
                  transition-all duration-200
                  hover:-translate-y-[3px] hover:shadow-[0_10px_30px_rgba(29,185,84,0.5)]
                  max-[560px]:w-full
                "
              >
                <FaWhatsapp size={19} aria-hidden />
                WhatsApp Us
              </a>,
              <a
                key="call"
                href="tel:+919918671867"
                className="
                  inline-flex items-center justify-center gap-[9px]
                  rounded-[10px] border border-white/25 bg-white/5 px-[28px] py-[15px]
                  font-['Bricolage_Grotesque',sans-serif] text-[15px] font-bold text-white no-underline
                  transition-all duration-200
                  hover:-translate-y-[3px] hover:border-white/60 hover:bg-white/10
                  max-[560px]:w-full
                "
              >
                <FiPhone size={17} aria-hidden />
                Call Now
              </a>,
            ].map((btn, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.4 + i * 0.1, ease }}
              >
                {btn}
              </motion.div>
            ))}
          </div>

          {/* Contact strip */}
          <motion.div
            className="flex flex-wrap justify-center border-t border-white/[0.08] pt-8 max-[560px]:flex-col"
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.4, delay: 0.7, ease }}
          >
            {contactStrip.map(({ Icon, text }, i) => (
              <motion.div
                key={text}
                className="
                  flex items-center gap-[9px] px-[22px] py-[10px]
                  border-r border-white/[0.08] text-[13px] text-white/50
                  transition-colors duration-200 hover:text-white/90
                  last:border-r-0
                  max-[560px]:w-full max-[560px]:justify-center
                  max-[560px]:border-r-0 max-[560px]:border-b max-[560px]:border-b-white/[0.06]
                  max-[560px]:last:border-b-0
                "
                initial={{ opacity: 0, y: 16 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.45, delay: 0.75 + i * 0.1, ease }}
              >
                <Icon className="shrink-0 text-base text-[#219ebc]" aria-hidden />
                {text}
              </motion.div>
            ))}
          </motion.div>

        </div>
      </section>

      {/* ── Footer bar ──────────────────────────────────────────────────── */}
      <motion.footer
        className="
          border-t border-white/[0.05] bg-[#04070d]
          px-[5%] py-7 text-center
          font-['Public_Sans',sans-serif]
        "
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.5, delay: 1.0, ease }}
      >
        <div className="mb-3 flex flex-wrap justify-center gap-0.5">
          {footerLinks.map(([label, href]) => (
            <a
              key={label}
              href={href}
              className="
                rounded px-3 py-1 text-[13px] text-white/40 no-underline
                transition-colors duration-200
                hover:bg-[rgba(33,158,188,0.08)] hover:text-[#219ebc]
              "
            >
              {label}
            </a>
          ))}
        </div>
        <p className="text-xs text-white/25">
          © 2026 Be Beyond Digital Solutions. All Rights Reserved. | Designed by BeBeyond ·
          Prayagraj, Uttar Pradesh
        </p>
      </motion.footer>

      {/* ── Mobile sticky CTA ───────────────────────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 z-[200] hidden bg-[#fb8500] shadow-[0_-4px_24px_rgba(0,0,0,0.3)] md:hidden max-[768px]:block">
        <a
          href="#audit-form"
          className="
            flex items-center justify-center gap-[9px] px-5 py-[15px]
            font-['Bricolage_Grotesque',sans-serif] text-[15px] font-bold text-white no-underline
          "
        >
          <HiArrowRight size={18} aria-hidden />
          Book Your Free Audit — Only Few Spots Left
        </a>
      </div>
    </>
  )
}