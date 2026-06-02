import { useEffect, useRef, useState } from 'react'
import { PiPhoneCall } from 'react-icons/pi'

// ─── tiny GSAP-free spring-in hook ──────────────────────────────────────────
function useSlideIn(delay = 300) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.transform = 'translateY(-80px)'
    el.style.opacity = '0'
    el.style.transition = `transform 0.8s cubic-bezier(0.22,1,0.36,1) ${delay}ms,
                           opacity   0.8s cubic-bezier(0.22,1,0.36,1) ${delay}ms`
    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.style.transform = 'translateY(0)'
        el.style.opacity = '1'
      })
    })
    return () => cancelAnimationFrame(raf)
  }, [delay])
  return ref
}

export default function Header() {
  const navRef = useSlideIn(300)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  return (
    <header
      ref={navRef}
      style={{ opacity: 0 }}
      className={[
        // layout + sticky
        'sticky top-0 z-50 flex justify-center',
        // base background matching Hero section
        'bg-[#0B1A2D]',
        // radial gradients via inline bg-image (Tailwind arbitrary values)
        '[background-image:radial-gradient(ellipse_60%_140%_at_70%_120%,rgba(33,158,188,.13)_0%,transparent_70%),radial-gradient(ellipse_40%_120%_at_10%_160%,rgba(251,133,0,.08)_0%,transparent_60%)]',
        // grid overlay using pseudo – kept in a <style> block below since
        // Tailwind can't target ::before with full bg-image arbitrary values
        'navbar-grid-overlay',
        // scroll-aware shadow
        scrolled
          ? 'shadow-[0_4px_32px_rgba(0,0,0,.45),0_1px_0_rgba(33,158,188,.15)] transition-shadow duration-300'
          : 'shadow-[0_2px_16px_rgba(0,0,0,.20)] transition-shadow duration-300',
      ].join(' ')}
    >
      {/* ── grid overlay pseudo-element ──────────────────────────────────── */}
      <style>{`
        .navbar-grid-overlay::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,.03) 1px, transparent 1px);
          background-size: 60px 60px;
          pointer-events: none;
          z-index: 0;
        }
      `}</style>

      {/* ── inner container ──────────────────────────────────────────────── */}
      <div className="relative z-10 w-full max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 sm:h-[72px] lg:h-20 items-center justify-between">

          {/* Logo */}
          <a
            href="https://bebeyond.digital"
            title="BeBeyond Digital Home Page"
            className="flex items-center"
          >
            <img
              src="/bebeyond_logo.png"
              alt="Be Beyond Digital Solutions"
              className="h-7 sm:h-10 lg:h-12 w-auto object-contain transition-all duration-300"
            />
          </a>

          {/* Call CTA */}
          <a
            href="tel:+919026861110"
            className="group flex items-center gap-2 sm:gap-3 no-underline font-['Public_Sans',sans-serif]"
          >
            {/* Phone icon */}
            <PiPhoneCall
              className="
                text-[#FB8500] flex-shrink-0
                w-[18px] h-[18px] sm:w-6 sm:h-6 lg:w-7 lg:h-7
                transition-transform duration-200 group-hover:scale-110
              "
            />

            {/* Text stack */}
            <div className="flex flex-col items-start leading-none gap-[1px] sm:gap-[3px]">
              <span className="
                text-[#219ebc] font-semibold tracking-[0.06em] uppercase
                text-[10px] sm:text-xs lg:text-sm
              ">
                Let&apos;s Chat
              </span>
              <span className="
                text-white font-bold
                text-xs sm:text-sm lg:text-base
                transition-colors duration-200 group-hover:text-[#219ebc]
              ">
                +91&nbsp;99&nbsp;1867&nbsp;1867
              </span>
            </div>
          </a>

        </div>
      </div>
    </header>
  )
}