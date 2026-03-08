import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const ScrollProgress = () => {
    const barRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.to(barRef.current, {
                scaleX: 1,
                ease: "none",
                scrollTrigger: {
                    trigger: document.body,
                    start: "top top",
                    end: "bottom bottom",
                    scrub: 0.3,
                }
            })
        })
        return () => ctx.revert()
    }, [])

    return (
        <div className="fixed top-0 left-0 w-full h-[2px] z-[200] pointer-events-none">
            <div
                ref={barRef}
                className="h-full w-full origin-left"
                style={{
                    transform: 'scaleX(0)',
                    background: 'linear-gradient(90deg, #6366f1, #a855f7, #6366f1)',
                    boxShadow: '0 0 20px rgba(99, 102, 241, 0.5), 0 0 60px rgba(99, 102, 241, 0.2)',
                }}
            />
        </div>
    )
}

export default ScrollProgress
