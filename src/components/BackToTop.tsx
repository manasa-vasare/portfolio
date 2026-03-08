import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const BackToTop = () => {
    const [visible, setVisible] = useState(false)
    const btnRef = useRef<HTMLButtonElement>(null)

    useEffect(() => {
        const trigger = ScrollTrigger.create({
            trigger: document.body,
            start: "top -300",
            onEnter: () => setVisible(true),
            onLeaveBack: () => setVisible(false),
        })

        return () => trigger.kill()
    }, [])

    useEffect(() => {
        if (btnRef.current) {
            gsap.to(btnRef.current, {
                scale: visible ? 1 : 0,
                opacity: visible ? 1 : 0,
                duration: 0.4,
                ease: "back.out(2)",
            })
        }
    }, [visible])

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    return (
        <button
            ref={btnRef}
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 z-[90] w-12 h-12 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl flex items-center justify-center hover:bg-indigo-500/20 hover:border-indigo-500/30 transition-all duration-300 group hover:shadow-[0_0_30px_rgba(99,102,241,0.3)]"
            style={{ transform: 'scale(0)', opacity: 0 }}
            aria-label="Back to top"
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-slate-400 group-hover:text-indigo-400 group-hover:-translate-y-0.5 transition-all duration-300"
            >
                <path d="m18 15-6-6-6 6" />
            </svg>
        </button>
    )
}

export default BackToTop
