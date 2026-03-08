import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const Atmosphere = () => {
    const orb1Ref = useRef<HTMLDivElement>(null)
    const orb2Ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const mm = gsap.matchMedia()

        mm.add("(min-width: 768px)", () => {
            // Orb 1: Main dynamic light
            gsap.to(orb1Ref.current, {
                scrollTrigger: {
                    trigger: "body",
                    start: "top top",
                    end: "bottom bottom",
                    scrub: 1.5
                },
                x: "20vw",
                y: "30vh",
                scale: 1.5,
                backgroundColor: "rgba(147, 51, 234, 0.15)", // Transition to purple
                duration: 1
            })

            // Orb 2: Counter-balance light
            gsap.to(orb2Ref.current, {
                scrollTrigger: {
                    trigger: "body",
                    start: "top top",
                    end: "bottom bottom",
                    scrub: 2
                },
                x: "-10vw",
                y: "-20vh",
                scale: 1.2,
                backgroundColor: "rgba(30, 64, 175, 0.2)", // Transition to deeper blue
                duration: 1
            })
        })

        return () => mm.revert()
    }, [])

    return (
        <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden opacity-60">
            {/* Orb 1: Top Rightish */}
            <div
                ref={orb1Ref}
                className="absolute top-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-indigo-600/10 blur-[120px] will-change-transform"
            />

            {/* Orb 2: Center Leftish */}
            <div
                ref={orb2Ref}
                className="absolute top-[40%] left-[-20%] w-[50vw] h-[50vw] rounded-full bg-slate-800/20 blur-[150px] will-change-transform"
            />

            {/* Orb 3: Bottom static pulse */}
            <div
                className="absolute bottom-[-20%] left-[20%] w-[70vw] h-[40vh] rounded-full bg-indigo-900/10 blur-[130px] opacity-50"
            />
        </div>
    )
}

export default Atmosphere
