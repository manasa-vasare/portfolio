import { useEffect, useRef } from 'react'
import gsap from 'gsap'

const BackgroundGlow = () => {
    const glowRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const glow = glowRef.current
        if (!glow) return

        const xTo = gsap.quickTo(glow, "x", { duration: 1.5, ease: "power2" })
        const yTo = gsap.quickTo(glow, "y", { duration: 1.5, ease: "power2" })

        const onMouseMove = (e: MouseEvent) => {
            xTo(e.clientX)
            yTo(e.clientY)
        }

        window.addEventListener('mousemove', onMouseMove)
        return () => window.removeEventListener('mousemove', onMouseMove)
    }, [])

    return (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
            <div
                ref={glowRef}
                className="absolute top-0 left-0 w-[60vw] h-[60vw] -translate-x-1/2 -translate-y-1/2 bg-indigo-500/10 rounded-full blur-[120px] will-change-transform"
            />
        </div>
    )
}

export default BackgroundGlow
