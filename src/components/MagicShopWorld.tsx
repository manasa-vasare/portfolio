import React, { useEffect, useRef } from 'react'
import gsap from 'gsap'

interface MagicShopWorldProps {
    onClose: () => void
}

const MagicShopWorld: React.FC<MagicShopWorldProps> = ({ onClose }) => {
    const containerRef = useRef<HTMLDivElement>(null)
    const contentRef = useRef<HTMLDivElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        // Entrance Animation
        gsap.fromTo(containerRef.current,
            { opacity: 0, scale: 1.1 },
            { opacity: 1, scale: 1, duration: 1.5, ease: "expo.out" }
        )

        // Escape listener
        const handleKeydown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                gsap.to(containerRef.current, {
                    opacity: 0,
                    scale: 0.9,
                    duration: 0.8,
                    ease: "expo.in",
                    onComplete: onClose
                })
            }
        }

        window.addEventListener('keydown', handleKeydown)

        // Galaxy Particles
        const canvas = canvasRef.current!
        const ctx = canvas.getContext('2d')!
        let stars: any[] = []

        const resize = () => {
            canvas.width = window.innerWidth
            canvas.height = window.innerHeight
            init()
        }

        function init() {
            stars = []
            for (let i = 0; i < 400; i++) {
                stars.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    size: Math.random() * 1.5,
                    speed: Math.random() * 0.5 + 0.1,
                    opacity: Math.random(),
                    color: Math.random() > 0.8 ? '#f0abfc' : '#fff'
                })
            }
        }

        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height)
            stars.forEach(star => {
                star.y -= star.speed
                if (star.y < 0) star.y = canvas.height

                ctx.fillStyle = star.color
                ctx.globalAlpha = star.opacity
                ctx.beginPath()
                ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2)
                ctx.fill()
            })
            requestAnimationFrame(animate)
        }

        resize()
        animate()
        window.addEventListener('resize', resize)

        return () => {
            window.removeEventListener('keydown', handleKeydown)
            window.removeEventListener('resize', resize)
        }
    }, [onClose])

    return (
        <div
            ref={containerRef}
            className="fixed inset-0 z-[2000] bg-[#0c0118] overflow-hidden flex items-center justify-center p-6 md:p-12"
        >
            <canvas ref={canvasRef} className="absolute inset-0 z-0 opacity-40" />

            {/* Immersive Background Glows */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/4 w-[600px] h-[600px] bg-purple-950/30 rounded-full blur-[180px] -translate-y-1/2 animate-pulse"></div>
                <div className="absolute top-1/2 right-1/4 w-[600px] h-[600px] bg-fuchsia-950/20 rounded-full blur-[180px] -translate-y-1/2 animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>

            <div ref={contentRef} className="relative z-10 max-w-5xl w-full h-full flex flex-col justify-center items-center">
                {/* Magic Shop Header */}
                <div className="text-center mb-16">
                    <p className="text-purple-400 font-bold tracking-[0.6em] text-[10px] uppercase mb-4 animate-bounce">Opening the Door</p>
                    <h1 className="text-5xl md:text-8xl font-black italic text-white tracking-tighter mb-4">
                        Magic <span className="text-purple-500">Shop</span>.
                    </h1>
                    <p className="text-slate-400 text-lg md:text-xl font-medium tracking-wide max-w-2xl mx-auto italic">
                        "I do believe your galaxy... I want to listen to your melody."
                    </p>
                </div>

                {/* Personal Portfolio Grid */}
                <div className="grid md:grid-cols-3 gap-6 w-full auto-rows-fr">

                    {/* Section: Core Philosophy */}
                    <div className="glass-card p-8 border border-purple-500/20 hover:border-purple-400/40 transition-colors group">
                        <h3 className="text-purple-400 text-xs font-bold uppercase tracking-widest mb-6">Core Philosophy</h3>
                        <p className="text-white text-lg font-bold mb-4">Engineering with Empathy.</p>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            I believe technical excellence is only half the story. The best code is written with an understanding of human emotion and rhythm—finding harmony between logic and life.
                        </p>
                    </div>

                    {/* Section: Artistic Pulse */}
                    <div className="glass-card p-8 border border-purple-500/20 hover:border-purple-400/40 transition-colors group">
                        <h3 className="text-purple-400 text-xs font-bold uppercase tracking-widest mb-6">Artistic Pulse</h3>
                        <p className="text-white text-lg font-bold mb-4">Metrical Expression.</p>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            Singing and dancing aren't just hobbies; they're how I stay connected to creativity. They teach me discipline, timing, and how to convey a message through movement and sound.
                        </p>
                    </div>

                    {/* Section: Inspiration */}
                    <div className="glass-card p-8 border border-purple-500/20 hover:border-purple-400/40 transition-colors group">
                        <h3 className="text-purple-400 text-xs font-bold uppercase tracking-widest mb-6">Soundtrack of Life</h3>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded bg-purple-500/20 flex items-center justify-center text-xs">💜</div>
                                <div>
                                    <p className="text-white text-xs font-bold">Bangtan Sonyeondan</p>
                                    <p className="text-slate-500 text-[10px]">Artists & Inspirations</p>
                                </div>
                            </div>
                            <p className="text-slate-400 text-xs italic leading-relaxed">
                                "We are not seven, with you." Learning from their resilience, artistry, and global positive impact through music.
                            </p>
                        </div>
                    </div>

                    {/* Large Personal Message */}
                    <div className="md:col-span-3 glass-card p-10 border border-purple-500/10 flex flex-col md:flex-row items-center gap-10">
                        <div className="flex-1">
                            <h2 className="text-3xl font-bold text-white mb-6">The Universe within Manasa.</h2>
                            <p className="text-slate-400 leading-relaxed mb-6">
                                Welcome to my personal corner. Beyond the repositories and the motorsports, I'm someone who finds beauty in the details—the lyrics of a song, the precision of a dance move, and the elegance of a perfectly executed design. Thank you for visiting my Magic Shop.
                            </p>
                            <div className="flex gap-4">
                                <span className="text-[10px] py-1 px-3 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">Creativity</span>
                                <span className="text-[10px] py-1 px-3 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">Resilience</span>
                                <span className="text-[10px] py-1 px-3 rounded-full bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/20">Harmony</span>
                            </div>
                        </div>
                        <div className="w-32 h-32 md:w-48 md:h-48 rounded-full bg-[radial-gradient(circle_at_center,#a78bfa_0%,transparent_70%)] opacity-50 blur-xl animate-pulse"></div>
                    </div>
                </div>

                {/* Footer Info */}
                <div className="mt-16 text-center animate-pulse">
                    <p className="text-slate-500 text-[10px] uppercase tracking-[0.5em]">Press <span className="text-purple-400 border border-purple-500/30 px-2 py-0.5 rounded">ESC</span> to Close Magic Shop</p>
                </div>
            </div>
        </div>
    )
}

export default MagicShopWorld
