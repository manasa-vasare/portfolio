import { useEffect, useRef } from 'react'
import gsap from 'gsap'

const phrases = [
    "Creative Developer",
    "●",
    "UI Engineer",
    "●",
    "Motion Enthusiast",
    "●",
    "Problem Solver",
    "●",
    "React + Three.js",
    "●",
    "Open to Opportunities",
    "●",
    "Design Thinker",
    "●",
    "Always Shipping",
    "●",
]

const Marquee = () => {
    const trackRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const track = trackRef.current
        if (!track) return

        // Duplicate content for seamless loop
        const content = track.innerHTML
        track.innerHTML = content + content

        const tween = gsap.to(track, {
            xPercent: -50,
            duration: 30,
            ease: "none",
            repeat: -1,
        })

        // Speed up on hover
        const handleEnter = () => gsap.to(tween, { timeScale: 3, duration: 0.4 })
        const handleLeave = () => gsap.to(tween, { timeScale: 1, duration: 0.4 })

        track.addEventListener("mouseenter", handleEnter)
        track.addEventListener("mouseleave", handleLeave)

        return () => {
            tween.kill()
            track.removeEventListener("mouseenter", handleEnter)
            track.removeEventListener("mouseleave", handleLeave)
        }
    }, [])

    return (
        <section className="py-8 border-y border-white/5 overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-transparent to-slate-950 z-10 pointer-events-none" />
            <div
                ref={trackRef}
                className="flex items-center gap-8 whitespace-nowrap w-max"
            >
                {phrases.map((phrase, i) => (
                    <span
                        key={i}
                        className={`text-sm md:text-base font-medium tracking-widest uppercase ${phrase === "●"
                                ? "text-indigo-500 text-xs"
                                : "text-slate-500 hover:text-white transition-colors duration-300"
                            }`}
                    >
                        {phrase}
                    </span>
                ))}
            </div>
        </section>
    )
}

export default Marquee
