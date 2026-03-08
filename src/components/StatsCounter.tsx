import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const CountUp = ({ target, suffix = '', label }: { target: number, suffix?: string, label: string }) => {
    const [count, setCount] = useState(0)
    const ref = useRef<HTMLDivElement>(null)
    const hasAnimated = useRef(false)

    useEffect(() => {
        const el = ref.current
        if (!el) return

        const trigger = ScrollTrigger.create({
            trigger: el,
            start: "top 85%",
            onEnter: () => {
                if (hasAnimated.current) return
                hasAnimated.current = true

                const obj = { val: 0 }
                gsap.to(obj, {
                    val: target,
                    duration: 2,
                    ease: "power2.out",
                    onUpdate: () => setCount(Math.floor(obj.val)),
                })
            },
        })

        return () => trigger.kill()
    }, [target])

    return (
        <div ref={ref} className="text-center group">
            <div className="text-5xl md:text-7xl font-black tracking-tighter cinematic-text mb-2 transition-transform group-hover:scale-110 duration-500">
                {count}{suffix}
            </div>
            <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500">
                {label}
            </div>
        </div>
    )
}

const StatsCounter = () => {
    return (
        <section className="fade-section py-32 px-6 border-b border-white/5 relative">
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[30vh] bg-indigo-500/5 blur-[150px] rounded-full"></div>
            </div>
            <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12 md:gap-8 relative z-10">
                <CountUp target={3} suffix="+" label="Projects Built" />
                <CountUp target={10} suffix="+" label="Technologies" />
                <CountUp target={500} suffix="+" label="Git Commits" />
                <CountUp target={2} suffix="nd" label="Year Student" />
            </div>
        </section>
    )
}

export default StatsCounter
