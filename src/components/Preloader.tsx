import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'

// Isolate progress to prevent name re-renders
const ProgressBar = () => {
    const [counter, setCounter] = useState(0)

    useEffect(() => {
        const interval = setInterval(() => {
            setCounter(prev => {
                if (prev >= 100) {
                    clearInterval(interval)
                    return 100
                }
                return prev + Math.floor(Math.random() * 8) + 1
            })
        }, 80)
        return () => clearInterval(interval)
    }, [])

    return (
        <div className="flex flex-col items-center">
            <div className="w-24 h-[1px] bg-white/10 overflow-hidden relative">
                <div
                    className="h-full bg-indigo-500 transition-all duration-300 ease-out"
                    style={{ width: `${counter}%` }}
                />
            </div>
            {/* Emit event when done */}
            {counter === 100 && <DoneTrigger />}
        </div>
    )
}

const DoneTrigger = () => {
    useEffect(() => {
        window.dispatchEvent(new CustomEvent('preloaderDone'))
    }, [])
    return null
}

const Preloader = () => {
    const loaderRef = useRef<HTMLDivElement>(null)
    const swipeOverlayRef = useRef<HTMLDivElement>(null)
    const lettersRef = useRef<HTMLSpanElement[]>([])

    useEffect(() => {
        const handleDone = () => {
            const tl = gsap.timeline({
                onComplete: () => {
                    if (loaderRef.current) loaderRef.current.style.display = 'none'
                }
            })

            tl.to(lettersRef.current, {
                opacity: 0,
                y: -20,
                duration: 0.8,
                stagger: 0.04,
                ease: "power2.in"
            })
                .to(swipeOverlayRef.current, {
                    yPercent: -100,
                    duration: 1.2,
                    ease: "expo.inOut"
                }, "-=0.2")
                .to(loaderRef.current, {
                    opacity: 0,
                    duration: 0.8,
                    ease: "none"
                }, "-=0.4")
        }

        window.addEventListener('preloaderDone', handleDone)
        return () => window.removeEventListener('preloaderDone', handleDone)
    }, [])

    useEffect(() => {
        gsap.fromTo(lettersRef.current,
            { opacity: 0, y: 10 },
            {
                opacity: 1,
                y: 0,
                duration: 1.5,
                stagger: 0.05,
                ease: "power2.out",
                delay: 0.5
            }
        )
    }, [])

    const name = "MANASA VASARE".split("")

    return (
        <div
            ref={loaderRef}
            className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-950 overflow-hidden select-none"
        >
            <div
                ref={swipeOverlayRef}
                className="absolute top-full left-0 w-full h-full bg-indigo-600 z-50 transition-transform duration-0"
            />

            <div className="relative z-30 flex flex-col items-center gap-16">
                <div className="flex flex-nowrap justify-center px-4">
                    {name.map((char, i) => (
                        <span
                            key={i}
                            ref={el => { if (el) lettersRef.current[i] = el }}
                            className={`text-[clamp(1.5rem,7vw,4rem)] font-extralight tracking-[0.4em] text-white/95 inline-block ${char === " " ? "w-[1em]" : ""}`}
                        >
                            {char}
                        </span>
                    ))}
                </div>

                <ProgressBar />
            </div>
        </div>
    )
}

export default Preloader
