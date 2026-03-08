import React, { useEffect, useRef } from "react"
import gsap from "gsap"
import ScrollTrigger from "gsap/ScrollTrigger"
import Lenis from "lenis"
import Hero3D from "./components/Hero3D"
import MorphingSculpture from "./components/MorphingSculpture"
import BackgroundGlow from "./components/BackgroundGlow"
import Preloader from "./components/Preloader"
import Atmosphere from "./components/Atmosphere"
import ScrollProgress from "./components/ScrollProgress"
import StatsCounter from "./components/StatsCounter"
import TextScramble from "./components/TextScramble"
import Marquee from "./components/Marquee"
import BackToTop from "./components/BackToTop"
import StatusBadge from "./components/StatusBadge"
import KonamiEasterEgg from "./components/KonamiEasterEgg"
import ThemeToggle from "./components/ThemeToggle"
import Typewriter from "./components/Typewriter"
import RacingGame from "./components/RacingGame"
import MagicShopWorld from "./components/MagicShopWorld"

gsap.registerPlugin(ScrollTrigger)

// --- Magnetic Component ---
const Magnetic = ({ children, strength = 0.35 }: { children: React.ReactNode, strength?: number }) => {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0
    if (isTouch) return

    const xTo = gsap.quickTo(ref.current, "x", { duration: 1, ease: "elastic.out(1, 0.3)" })
    const yTo = gsap.quickTo(ref.current, "y", { duration: 1, ease: "elastic.out(1, 0.3)" })

    const mouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e
      const { width, height, left, top } = ref.current!.getBoundingClientRect()
      const x = clientX - (left + width / 2)
      const y = clientY - (top + height / 2)
      xTo(x * strength)
      yTo(y * strength)
    }

    const mouseLeave = () => {
      xTo(0)
      yTo(0)
    }

    const currentRef = ref.current
    currentRef?.addEventListener("mousemove", mouseMove)
    currentRef?.addEventListener("mouseleave", mouseLeave)

    return () => {
      currentRef?.removeEventListener("mousemove", mouseMove)
      currentRef?.removeEventListener("mouseleave", mouseLeave)
    }
  }, [strength])

  return <div ref={ref} className="inline-block transition-transform duration-75">{children}</div>
}

// --- Tilt Card Component ---
const TiltCard = ({ children, className = "", glowColor = "rgba(99, 102, 241, 0.15)" }: { children: React.ReactNode, className?: string, glowColor?: string }) => {
  const cardRef = useRef<HTMLDivElement>(null)
  const glowRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || 'ontouchstart' in window) return
    const card = cardRef.current
    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    const rotateX = (y - centerY) / 20
    const rotateY = (centerX - x) / 20

    gsap.to(card, {
      rotateX,
      rotateY,
      duration: 0.5,
      ease: "power2.out",
      transformPerspective: 1000,
    })

    if (glowRef.current) {
      gsap.to(glowRef.current, {
        top: y,
        left: x,
        duration: 0.1,
        ease: "power2.out"
      })
    }
  }

  const handleMouseLeave = () => {
    if (!cardRef.current) return
    gsap.to(cardRef.current, {
      rotateX: 0,
      rotateY: 0,
      duration: 0.5,
      ease: "power2.out",
    })
  }

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative group overflow-hidden transition-transform duration-500 ease-out will-change-transform ${className}`}
      style={{ transformStyle: 'preserve-3d' }}
    >
      <div
        ref={glowRef}
        className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 w-80 h-80 opacity-0 group-hover:opacity-100 rounded-full blur-[80px] transition-opacity duration-500 z-0"
        style={{ background: glowColor }}
      />
      <div className="relative z-10 h-full">{children}</div>
    </div>
  )
}

// --- Mask Text Component ---
const MaskText = ({ children, className = "", delay = 0, align = "center" }: { children: React.ReactNode, className?: string, delay?: number, align?: "left" | "center" | "right" }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(textRef.current,
        {
          yPercent: 100,
          rotateX: 20,
          opacity: 0
        },
        {
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 98%",
            toggleActions: "play none none none",
          },
          yPercent: 0,
          rotateX: 0,
          opacity: 1,
          duration: 1.2,
          delay,
          ease: "power4.out",
        }
      )
    })
    return () => ctx.revert()
  }, [delay])

  const alignmentClass = align === "center" ? "justify-center" : align === "right" ? "justify-end" : "justify-start"

  return (
    <div ref={containerRef} className={`overflow-hidden py-2 -my-2 flex ${alignmentClass} w-full`}>
      <div ref={textRef} className={`will-change-transform ${className}`}>
        {children}
      </div>
    </div>
  )
}

// --- Particle System Component ---
const ParticleBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext("2d")!
    let particles: Particle[] = []
    let mouse = { x: 0, y: 0, radius: 150 }
    let isLightMode = document.documentElement.classList.contains('light-mode')

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      init()
    }

    class Particle {
      x: number; y: number; baseX: number; baseY: number; size: number; density: number;
      constructor(x: number, y: number) {
        this.x = x
        this.y = y
        this.baseX = x
        this.baseY = y
        this.size = Math.random() * 2 + 1
        this.density = (Math.random() * 30) + 1
      }
      draw() {
        // Darker indigo for light mode (#4338ca), lighter for dark mode (#818cf8)
        const color = isLightMode ? "rgba(67, 56, 202" : "rgba(129, 140, 248";
        ctx.shadowBlur = this.size * 3;
        ctx.shadowColor = `${color}, 1)`;
        ctx.fillStyle = `${color}, ${Math.random() > 0.9 ? 0.9 : 0.6})`;
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx.closePath()
        ctx.fill()
        ctx.shadowBlur = 0;
      }
      update() {
        let dx = mouse.x - this.x
        let dy = mouse.y - this.y
        let distance = Math.sqrt(dx * dx + dy * dy)
        let forceDirectionX = dx / distance
        let forceDirectionY = dy / distance
        let maxDistance = mouse.radius
        let force = (maxDistance - distance) / maxDistance
        let directionX = forceDirectionX * force * this.density
        let directionY = forceDirectionY * force * this.density

        if (distance < mouse.radius) {
          this.x -= directionX
          this.y -= directionY
        } else {
          if (this.x !== this.baseX) {
            let dx = this.x - this.baseX
            this.x -= dx / 10
          }
          if (this.y !== this.baseY) {
            let dy = this.y - this.baseY
            this.y -= dy / 10
          }
        }
      }
    }

    function init() {
      particles = []
      const numberOfParticles = (canvas.width * canvas.height) / 1800
      for (let i = 0; i < numberOfParticles; i++) {
        let x = Math.random() * canvas.width
        let y = Math.random() * canvas.height
        particles.push(new Particle(x, y))
      }
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      for (let i = 0; i < particles.length; i++) {
        particles[i].draw()
        particles[i].update()
      }
      requestAnimationFrame(animate)
    }

    // Theme observer
    const observer = new MutationObserver(() => {
      isLightMode = document.documentElement.classList.contains('light-mode')
    })
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })

    window.addEventListener("mousemove", (e) => {
      mouse.x = e.clientX
      mouse.y = e.clientY
    })

    window.addEventListener("resize", resize)
    resize()
    animate()

    return () => {
      window.removeEventListener("resize", resize)
      observer.disconnect()
    }
  }, [])

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />
}

function App() {
  const heroRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const storyRef = useRef<HTMLHeadingElement>(null)
  const horizontalRef = useRef<HTMLDivElement>(null)
  const projectsRef = useRef<HTMLDivElement>(null)
  const lenisRef = useRef<Lenis | null>(null)
  const [showGame, setShowGame] = React.useState(false)
  const [isMagicWorld, setIsMagicWorld] = React.useState(false)

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault()
    if (lenisRef.current) {
      lenisRef.current.scrollTo(id, {
        duration: 1.8,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      })
    }
  }

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.5,
      lerp: 0.08,
      smoothWheel: true,
    })
    lenisRef.current = lenis

    function raf(time: number) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }

    requestAnimationFrame(raf)

    const ctx = gsap.context(() => {
      // Listen for Magic World trigger
      const handleMagicWorld = (e: any) => {
        setIsMagicWorld(e.detail.active)
        if (e.detail.active && lenisRef.current) {
          lenisRef.current.stop()
        } else if (lenisRef.current) {
          lenisRef.current.start()
        }
      }
      window.addEventListener('legendary-mode', handleMagicWorld)

      // Hero Scroll Animation (separate from entrance)
      const heroTl = gsap.timeline({
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top top",
          end: "bottom center",
          scrub: true,
        }
      });

      heroTl.to(".hero-scroll-out", {
        y: -100,
        opacity: 0,
        stagger: 0.1,
        ease: "power2.inOut"
      })
        .to(".hero-overlay", {
          opacity: 0.5,
          ease: "none"
        }, 0);

      // Hero Entrance Mask
      gsap.fromTo(".hero-line",
        {
          yPercent: 120,
          rotateX: 30,
          opacity: 0
        },
        {
          yPercent: 0,
          rotateX: 0,
          opacity: 1,
          duration: 1.8,
          stagger: 0.2,
          ease: "expo.out",
          delay: 3.2,
        }
      );

      // Fade-in sections

      // Horizontal Scroll
      gsap.to(projectsRef.current, {
        x: () => {
          if (!projectsRef.current) return 0;
          return -(projectsRef.current.scrollWidth - window.innerWidth);
        },
        ease: "none",
        scrollTrigger: {
          trigger: horizontalRef.current,
          start: "top top",
          end: () => `+=${projectsRef.current?.scrollWidth || 3000}`,
          scrub: 1.5,
          pin: true,
          invalidateOnRefresh: true,
        },
      });

      // Fade-in sections
      gsap.utils.toArray(".fade-section").forEach((section) => {
        gsap.from(section as HTMLElement, {
          scrollTrigger: {
            trigger: section as HTMLElement,
            start: "top 85%",
            toggleActions: "play none none none",
          },
          y: 50,
          opacity: 0,
          duration: 1,
          ease: "power3.out",
        });
      });

      // Special Stagger for Skills (fromTo for visibility safety)
      gsap.fromTo(".skill-tag",
        {
          y: 20,
          opacity: 0,
          scale: 0.8,
        },
        {
          scrollTrigger: {
            trigger: "#skills-grid",
            start: "top 85%",
            toggleActions: "play none none none",
          },
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.8,
          stagger: {
            each: 0.05,
            from: "random",
          },
          ease: "back.out(1.7)",
        }
      );
    })

    return () => {
      ctx.revert()
      lenis.destroy()
    }
  }, [])

  return (
    <div className="bg-slate-950 text-slate-50 relative selection:bg-indigo-500/30 overflow-hidden">
      <Preloader />
      <ScrollProgress />
      <Atmosphere />
      <div className="grain-overlay fixed inset-0 z-50 overflow-hidden pointer-events-none"></div>

      <ParticleBackground />
      <BackgroundGlow />
      <MorphingSculpture />
      <BackToTop />
      <KonamiEasterEgg />

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-[100] px-6 py-8 flex justify-between items-center mix-blend-difference pointer-events-none">
        <Magnetic strength={0.2}>
          <span className="text-xl font-black uppercase tracking-tighter pointer-events-auto leading-none cursor-pointer">
            MV.
          </span>
        </Magnetic>
        <div className="flex gap-4 md:gap-8 pointer-events-auto text-[10px] md:text-xs font-bold uppercase tracking-[0.1em] md:tracking-[0.2em] opacity-60">
          <Magnetic strength={0.1}>
            <a href="#home" onClick={(e) => scrollToSection(e, "#home")} className="hover:opacity-100 transition-opacity p-2">Home</a>
          </Magnetic>
          <Magnetic strength={0.1}>
            <a href="#about" onClick={(e) => scrollToSection(e, "#about")} className="hover:opacity-100 transition-opacity p-2">About</a>
          </Magnetic>
          <Magnetic strength={0.1}>
            <a href="#work" onClick={(e) => scrollToSection(e, "#work")} className="hover:opacity-100 transition-opacity p-2">Work</a>
          </Magnetic>
          <Magnetic strength={0.1}>
            <a href="#contact" onClick={(e) => scrollToSection(e, "#contact")} className="hover:opacity-100 transition-opacity p-2">Contact</a>
          </Magnetic>
        </div>
        <ThemeToggle />
      </nav>

      <main className="relative z-10">
        {/* Hero Section */}
        <section
          id="home"
          ref={heroRef}
          className="relative h-screen flex flex-col items-center justify-center text-center overflow-hidden border-b border-white/5"
        >
          <Hero3D />
          <div className="hero-overlay absolute inset-0 bg-gradient-to-b from-indigo-500/10 via-transparent to-transparent opacity-0 pointer-events-none"></div>

          <h1
            ref={titleRef}
            className="text-[clamp(3rem,15vw,12rem)] font-extrabold tracking-tighter leading-[0.85] flex flex-col items-center"
          >
            <div className="overflow-hidden py-4 hero-scroll-out translate-z-0">
              <span className="hero-line block px-4 cinematic-text">Manasa</span>
            </div>
            <div className="overflow-hidden py-4 hero-scroll-out translate-z-0">
              <span className="hero-line block px-4 cinematic-text">Vasare</span>
            </div>
          </h1>

          <div className="mt-12 flex flex-col items-center gap-4">
            <p className="text-sm md:text-base text-slate-400 font-medium tracking-[0.3em] uppercase">
              Design & Engineering
            </p>
            <div className="w-px h-12 bg-gradient-to-b from-indigo-500 to-transparent"></div>
            <div className="mt-4 hero-scroll-out">
              <Typewriter />
            </div>
            <div className="mt-6 hero-scroll-out">
              <StatusBadge />
            </div>

            <div className="mt-12 hero-scroll-out">
              <Magnetic strength={0.2}>
                <a
                  href="#work"
                  onClick={(e) => scrollToSection(e, "#work")}
                  className="group relative inline-flex items-center gap-3 px-10 py-5 bg-white text-black hover:bg-slate-200 rounded-full font-bold uppercase text-xs tracking-[0.2em] transition-all duration-500 pointer-events-auto shadow-[0_20px_40px_rgba(255,255,255,0.1)] hover:shadow-[0_25px_50px_rgba(255,255,255,0.2)]"
                >
                  <span>Explore Work</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-y-1 transition-transform">
                    <path d="M7 7l5 5 5-5" />
                    <path d="M7 13l5 5 5-5" />
                  </svg>
                </a>
              </Magnetic>
            </div>
          </div>
        </section>

        {/* Marquee Ticker */}
        <Marquee />

        {/* About Section */}
        <section id="about" className="fade-section min-h-screen flex items-center justify-center px-6 py-32 border-b border-white/5 relative">
          <div className="max-w-7xl w-full grid md:grid-cols-12 gap-12 items-start">
            <div className="md:col-span-1 text-slate-600 text-xs font-bold uppercase tracking-widest pt-4">
              <TextScramble text="01." className="text-slate-600 text-xs font-bold uppercase tracking-widest" />
            </div>
            <div className="md:col-span-6">
              <h2
                ref={storyRef}
                className="text-4xl md:text-7xl font-bold mb-12 leading-tight"
              >
                <MaskText align="left" delay={0.1}>Building <span className="text-indigo-500 italic">interactive</span></MaskText>
                <MaskText align="left" delay={0.2}>stories through code.</MaskText>
              </h2>
              <p className="text-xl text-slate-400 leading-relaxed max-w-xl">
                Computer Science student at the intersection of logic and creativity.
                Currently exploring the limits of frontend motion and robust engineering.
              </p>
            </div>

            <div className="md:col-start-9 md:col-span-4 bg-white/5 border border-white/10 p-12 rounded-3xl backdrop-blur-3xl">
              <h3 className="text-indigo-400 text-xs font-bold mb-8 uppercase tracking-widest">Focus Areas</h3>
              <ul className="space-y-6 text-lg font-medium">
                <li className="flex items-center gap-4 group">
                  <span className="w-2 h-2 rounded-full bg-indigo-500 group-hover:scale-150 transition-transform"></span>
                  Interface Engineering
                </li>
                <li className="flex items-center gap-4 group">
                  <span className="w-2 h-2 rounded-full bg-purple-500 group-hover:scale-150 transition-transform"></span>
                  Motion Design
                </li>
                <li className="flex items-center gap-4 group">
                  <span className="w-2 h-2 rounded-full bg-slate-500 group-hover:scale-150 transition-transform"></span>
                  Problem Solving
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Stats Counter */}
        <StatsCounter />

        {/* Projects Section */}
        <section
          id="work"
          ref={horizontalRef}
          className="h-screen overflow-hidden border-b border-white/5"
        >
          <div
            ref={projectsRef}
            className="flex w-[500%] h-full"
          >
            {/* Title Slide */}
            <div className="w-screen flex items-center justify-center px-6 md:px-20">
              <h2 className="text-[clamp(3rem,10vw,8rem)] font-black uppercase tracking-tighter opacity-40">
                <MaskText className="cinematic-text">Selected Work</MaskText>
              </h2>
            </div>

            {/* Project Card 1: Cinematic Portfolio */}
            <div className="w-screen flex items-center justify-center px-6 md:px-20">
              <div className="glass-card w-full max-w-6xl min-h-[500px] md:min-h-[550px] flex flex-col md:flex-row items-stretch overflow-hidden transition-all duration-700 hover:scale-[1.01]">
                <div className="w-full md:w-1/2 h-full bg-gradient-to-br from-indigo-950 via-indigo-900 to-slate-950 p-12 flex flex-col items-center justify-center project-card-hover relative" onMouseMove={(e) => { const rect = e.currentTarget.getBoundingClientRect(); e.currentTarget.style.setProperty('--mouse-x', ((e.clientX - rect.left) / rect.width * 100) + '%'); e.currentTarget.style.setProperty('--mouse-y', ((e.clientY - rect.top) / rect.height * 100) + '%'); }}>
                  <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
                  <div className="relative z-10 w-48 h-48 rounded-full bg-indigo-500/10 blur-[60px] animate-pulse"></div>
                  <div className="absolute z-20 text-white/5 font-black text-[12rem] select-none tracking-tighter">PORT</div>
                  <div className="relative z-30 flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-400">
                        <path d="M12 19l7-7 3 3-7 7-3-3z" />
                        <path d="M18 13l-1.5-7.5L4 2l3.5 12.5L12 13l3 3 3-3z" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="w-full md:w-1/2 p-10 md:p-16 flex flex-col justify-center">
                  <div className="flex items-center gap-4 mb-4">
                    <span className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 text-[10px] font-bold uppercase tracking-widest">Lead Developer</span>
                    <span className="text-slate-600 text-[10px] font-bold uppercase tracking-widest font-mono">01.</span>
                  </div>
                  <h3 className="text-3xl md:text-5xl font-bold mb-4 tracking-tighter">Cinematic Portfolio</h3>
                  <p className="text-slate-400 text-base md:text-lg leading-relaxed mb-6">
                    A high-end web experience featuring 3D morphing sculptures, scroll-linked animations, and a seamless cinematic aesthetic.
                  </p>

                  <div className="space-y-3 mb-8">
                    <div className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2"></div>
                      <p className="text-slate-300 text-sm">Orchestrated complex GSAP timelines for smooth, scroll-linked 3D transitions and text reveals.</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2"></div>
                      <p className="text-slate-300 text-sm">Optimized React Three Fiber performance using custom shaders and efficient geometry management.</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-8">
                    {['React', 'Three.js', 'GSAP', 'Tailwind'].map(tech => (
                      <span key={tech} className="px-3 py-1 bg-white/5 rounded-md text-[9px] font-bold border border-white/10 text-slate-300">{tech}</span>
                    ))}
                  </div>

                  <Magnetic strength={0.4}>
                    <a href="https://github.com/manasa-vasare/portfolio" target="_blank" rel="noopener noreferrer" className="group px-8 py-3 rounded-full bg-white text-black transition-all hover:bg-slate-200 uppercase text-xs font-bold tracking-widest pointer-events-auto inline-flex items-center gap-2">
                      <span>Live Repository</span>
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform"><path d="M5 12h14m-7-7 7 7-7 7" /></svg>
                    </a>
                  </Magnetic>
                </div>
              </div>
            </div>

            {/* Project Card 2: RouteLLM Chat */}
            <div className="w-screen flex items-center justify-center px-6 md:px-20">
              <div className="glass-card w-full max-w-6xl min-h-[500px] md:min-h-[550px] flex flex-col md:flex-row-reverse items-stretch overflow-hidden transition-all duration-700 hover:scale-[1.01]">
                <div className="w-full md:w-1/2 h-full bg-gradient-to-br from-emerald-950 via-emerald-900 to-slate-950 p-12 flex flex-col items-center justify-center project-card-hover relative" onMouseMove={(e) => { const rect = e.currentTarget.getBoundingClientRect(); e.currentTarget.style.setProperty('--mouse-x', ((e.clientX - rect.left) / rect.width * 100) + '%'); e.currentTarget.style.setProperty('--mouse-y', ((e.clientY - rect.top) / rect.height * 100) + '%'); }}>
                  <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
                  <div className="relative z-10 w-48 h-48 rounded-full bg-emerald-500/10 blur-[60px] animate-pulse"></div>
                  <div className="absolute z-20 text-white/5 font-black text-[12rem] select-none tracking-tighter">AI</div>
                  <div className="relative z-30 flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400">
                        <path d="M12 2a10 10 0 1 0 10 10H12V2z" />
                        <path d="M12 12L2.1 12.3" />
                        <path d="M12 12l9.8-.3" />
                        <path d="M12 2c5.5 0 10 4.5 10 10s-4.5 10-10 10S2 17.5 2 12s4.5-10 10-10z" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="w-full md:w-1/2 p-10 md:p-16 flex flex-col justify-center">
                  <div className="flex items-center gap-4 mb-4">
                    <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-[10px] font-bold uppercase tracking-widest">AI Engineer</span>
                    <span className="text-slate-600 text-[10px] font-bold uppercase tracking-widest font-mono">02.</span>
                  </div>
                  <h3 className="text-3xl md:text-5xl font-bold mb-4 tracking-tighter">RouteLLM Chat</h3>
                  <p className="text-slate-400 text-base md:text-lg leading-relaxed mb-6">
                    Streamlit app using RouteLLM with Groq as an efficient weak model fallback for intelligent query routing.
                  </p>

                  <div className="space-y-3 mb-8">
                    <div className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2"></div>
                      <p className="text-slate-300 text-sm">Implemented cost-optimized routing that dynamically allocates queries to the most efficient LLM.</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2"></div>
                      <p className="text-slate-300 text-sm">Developed a responsive chat interface using Streamlit, integrating seamless fallback mechanisms.</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-8">
                    {['Python', 'Streamlit', 'RouteLLM', 'Groq'].map(tech => (
                      <span key={tech} className="px-3 py-1 bg-white/5 rounded-md text-[9px] font-bold border border-white/10 text-slate-300">{tech}</span>
                    ))}
                  </div>

                  <Magnetic strength={0.4}>
                    <a href="https://github.com/manasa-vasare/routellm-chat" target="_blank" rel="noopener noreferrer" className="group px-8 py-3 rounded-full bg-emerald-600 text-white transition-all hover:bg-emerald-500 uppercase text-xs font-bold tracking-widest pointer-events-auto inline-flex items-center gap-2">
                      <span>Explore AI</span>
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6m4-3l9 9-9 9m-5-9h14" /></svg>
                    </a>
                  </Magnetic>
                </div>
              </div>
            </div>

            {/* Project Card 3: Air Canvas */}
            <div className="w-screen flex items-center justify-center px-6 md:px-20">
              <div className="glass-card w-full max-w-6xl min-h-[500px] md:min-h-[550px] flex flex-col md:flex-row items-stretch overflow-hidden transition-all duration-700 hover:scale-[1.01]">
                <div className="w-full md:w-1/2 h-full bg-gradient-to-br from-orange-950 via-orange-900 to-slate-950 p-12 flex flex-col items-center justify-center project-card-hover relative" onMouseMove={(e) => { const rect = e.currentTarget.getBoundingClientRect(); e.currentTarget.style.setProperty('--mouse-x', ((e.clientX - rect.left) / rect.width * 100) + '%'); e.currentTarget.style.setProperty('--mouse-y', ((e.clientY - rect.top) / rect.height * 100) + '%'); }}>
                  <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
                  <div className="relative z-10 w-48 h-48 rounded-full bg-orange-500/10 blur-[60px] animate-pulse"></div>
                  <div className="absolute z-20 text-white/5 font-black text-[12rem] select-none tracking-tighter">CV</div>
                  <div className="relative z-30 flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-orange-400">
                        <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="w-full md:w-1/2 p-10 md:p-16 flex flex-col justify-center">
                  <div className="flex items-center gap-4 mb-4">
                    <span className="px-3 py-1 bg-orange-500/10 border border-orange-500/20 rounded-full text-orange-400 text-[10px] font-bold uppercase tracking-widest">Developer</span>
                    <span className="text-slate-600 text-[10px] font-bold uppercase tracking-widest font-mono">03.</span>
                  </div>
                  <h3 className="text-3xl md:text-5xl font-bold mb-4 tracking-tighter">Air Canvas</h3>
                  <p className="text-slate-400 text-base md:text-lg leading-relaxed mb-6">
                    A virtual drawing tool that tracks hand movements in real-time using computer vision, allowing users to paint on a digital canvas in mid-air.
                  </p>

                  <div className="space-y-3 mb-8">
                    <div className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-2"></div>
                      <p className="text-slate-300 text-sm">Leveraged OpenCV and MediaPipe for low-latency hand tracking and gesture recognition.</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-2"></div>
                      <p className="text-slate-300 text-sm">Engineered an intuitive interface for mid-air interaction, providing a unique digital painting experience.</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-8">
                    {['Python', 'OpenCV', 'MediaPipe', 'NumPy'].map(tech => (
                      <span key={tech} className="px-3 py-1 bg-white/5 rounded-md text-[9px] font-bold border border-white/10 text-slate-300">{tech}</span>
                    ))}
                  </div>

                  <Magnetic strength={0.4}>
                    <a href="https://github.com/manasa-vasare/air-canvas" target="_blank" rel="noopener noreferrer" className="group px-8 py-3 rounded-full bg-orange-600 text-white transition-all hover:bg-orange-500 uppercase text-xs font-bold tracking-widest pointer-events-auto inline-flex items-center gap-2">
                      <span>View Project</span>
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform"><path d="M5 12h14m-7-7 7 7-7 7" /></svg>
                    </a>
                  </Magnetic>
                </div>
              </div>
            </div>

            {/* Coming Soon Card */}
            <div className="w-screen flex items-center justify-center px-6 md:px-20">
              <div className="glass-card w-full max-w-6xl aspect-video md:aspect-[21/9] flex items-center justify-center bg-white/5 group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 transition-opacity group-hover:opacity-100 opacity-0 duration-700"></div>
                <div className="text-center p-20 relative z-10">
                  <h3 className="text-3xl md:text-5xl font-bold mb-6">
                    <MaskText className="italic transition-all duration-700 group-hover:tracking-[0.1em]">More work coming soon.</MaskText>
                  </h3>
                  <p className="text-slate-500 tracking-[0.3em] uppercase text-xs font-bold">In development</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Skills Section */}
        <section id="skills" className="fade-section min-h-screen flex items-center justify-center px-6 py-32 border-b border-white/5 relative overflow-hidden">
          {/* Decorative background for skills */}
          <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-[120px]"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[120px]"></div>
            <div className="scan-line absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent h-20 w-full"></div>
          </div>

          <div className="max-w-7xl w-full grid md:grid-cols-12 gap-12 items-start relative z-10">
            <div className="md:col-span-1 text-slate-600 text-xs font-bold uppercase tracking-widest pt-4">
              <TextScramble text="02." className="text-slate-600 text-xs font-bold uppercase tracking-widest" />
            </div>
            <div className="md:col-span-11">
              <h2 className="text-4xl md:text-7xl font-bold mb-20 leading-tight">
                <MaskText align="left">
                  Technical <span className="text-purple-500 italic">Arsenal</span>.
                </MaskText>
              </h2>

              <div id="skills-grid" className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Frontend */}
                <TiltCard className="h-full rounded-3xl" glowColor="rgba(99, 102, 241, 0.2)">
                  <div className="glass-card p-10 h-full group border-indigo-500/10 hover:border-indigo-500/30 transition-colors">
                    <h3 className="text-indigo-400 text-sm font-bold mb-8 uppercase tracking-widest">Frontend</h3>
                    <div className="flex flex-wrap gap-3">
                      {[
                        { name: "React", icon: "react" },
                        { name: "TypeScript", icon: "typescript" },
                        { name: "Next.js", icon: "nextjs" },
                        { name: "Tailwind", icon: "tailwind" },
                        { name: "HTML5", icon: "html" },
                        { name: "CSS3", icon: "css" }
                      ].map(skill => (
                        <Magnetic key={skill.name} strength={0.4}>
                          <span className="skill-tag flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full text-[10px] font-bold border border-white/5 hover:bg-white/10 hover:border-indigo-500/30 transition-all cursor-default group/tag translate-z-10">
                            <img
                              src={`https://skillicons.dev/icons?i=${skill.icon}`}
                              alt={skill.name}
                              className="w-3.5 h-3.5 object-contain group-hover/tag:scale-125 group-hover/tag:rotate-12 transition-transform duration-300"
                            />
                            {skill.name}
                          </span>
                        </Magnetic>
                      ))}
                    </div>
                  </div>
                </TiltCard>

                {/* 3D & Animation */}
                <TiltCard className="h-full rounded-3xl" glowColor="rgba(168, 85, 247, 0.2)">
                  <div className="glass-card p-10 h-full group border-purple-500/10 hover:border-purple-500/30 transition-colors">
                    <h3 className="text-purple-400 text-sm font-bold mb-8 uppercase tracking-widest">3D & Motion</h3>
                    <div className="flex flex-wrap gap-3">
                      {[
                        { name: "Three.js", icon: "threejs" },
                        { name: "R3 Fiber", icon: null },
                        { name: "GSAP", icon: "gsap" },
                        { name: "Framer", icon: "framer" },
                        { name: "Lenis", icon: null }
                      ].map(skill => (
                        <Magnetic key={skill.name} strength={0.4}>
                          <span className="skill-tag flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full text-[10px] font-bold border border-white/5 hover:bg-white/10 hover:border-purple-500/30 transition-all cursor-default group/tag translate-z-10">
                            {skill.icon ? (
                              <img
                                src={`https://skillicons.dev/icons?i=${skill.icon}`}
                                alt={skill.name}
                                className="w-3.5 h-3.5 object-contain group-hover/tag:scale-125 group-hover/tag:rotate-12 transition-transform duration-300"
                              />
                            ) : (
                              <div className="w-3.5 h-3.5 rounded-full bg-purple-500/20 group-hover/tag:scale-125 transition-transform duration-300"></div>
                            )}
                            {skill.name}
                          </span>
                        </Magnetic>
                      ))}
                    </div>
                  </div>
                </TiltCard>

                {/* Core */}
                <TiltCard className="h-full rounded-3xl" glowColor="rgba(148, 163, 184, 0.2)">
                  <div className="glass-card p-10 h-full group border-slate-500/10 hover:border-slate-500/30 transition-colors">
                    <h3 className="text-slate-400 text-sm font-bold mb-8 uppercase tracking-widest">Core</h3>
                    <div className="flex flex-wrap gap-3">
                      {[
                        { name: "DSA", icon: "cpp" },
                        { name: "Git", icon: "git" },
                        { name: "PostgreSQL", icon: "postgres" },
                        { name: "Python", icon: "python" },
                        { name: "Problem Solving", icon: null }
                      ].map(skill => (
                        <Magnetic key={skill.name} strength={0.4}>
                          <span className="skill-tag flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full text-[10px] font-bold border border-white/5 hover:bg-white/10 hover:border-slate-400/30 transition-all cursor-default group/tag translate-z-10">
                            {skill.icon ? (
                              <img
                                src={`https://skillicons.dev/icons?i=${skill.icon}`}
                                alt={skill.name}
                                className="w-3.5 h-3.5 object-contain group-hover/tag:scale-125 group-hover/tag:rotate-12 transition-transform duration-300"
                              />
                            ) : (
                              <div className="w-3.5 h-3.5 rounded-full bg-slate-500/20 group-hover/tag:scale-125 transition-transform duration-300"></div>
                            )}
                            {skill.name}
                          </span>
                        </Magnetic>
                      ))}
                    </div>
                  </div>
                </TiltCard>
              </div>
            </div>
          </div>
        </section>

        {/* Education Section */}
        <section className="fade-section min-h-screen flex items-center justify-center px-6 py-32 border-b border-white/5 relative">
          <div className="max-w-7xl w-full grid md:grid-cols-12 gap-12 items-start">
            <div className="md:col-span-1 text-slate-600 text-xs font-bold uppercase tracking-widest pt-4">
              <TextScramble text="03." className="text-slate-600 text-xs font-bold uppercase tracking-widest" />
            </div>
            <div className="md:col-span-11">
              <h2 className="text-4xl md:text-7xl font-bold mb-20 leading-tight">
                <MaskText align="left">
                  Academic <span className="text-slate-500 italic">Foundation</span>.
                </MaskText>
              </h2>

              <div className="glass-card p-10 md:p-16 relative overflow-hidden group border border-white/5 hover:border-indigo-500/20 transition-all duration-700">
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-[100px] -mr-48 -mt-48 transition-all duration-1000 group-hover:bg-indigo-500/10"></div>

                <div className="relative z-10 grid md:grid-cols-12 gap-12 items-center">
                  <div className="md:col-span-8">
                    <div className="flex items-center gap-4 mb-8">
                      <span className="px-4 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 text-[10px] font-bold uppercase tracking-widest">2024 – 2028</span>
                      <div className="h-px w-12 bg-white/10"></div>
                      <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest font-mono">Present</span>
                    </div>

                    <h3 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight group-hover:text-white transition-colors">B.Tech in Computer Science</h3>
                    <p className="text-slate-400 text-lg md:text-xl font-medium mb-8 leading-relaxed">
                      Specialized in <span className="text-white italic">Artificial Intelligence</span> & Machine Learning at KLE Technological University.
                    </p>

                    <div className="grid grid-cols-2 gap-x-8 gap-y-4 max-w-lg mt-8 border-l border-white/10 pl-8">
                      {[
                        "Data Structures & Algorithms",
                        "Object Oriented Programming",
                        "Database Systems (DBMS)",
                        "Artificial Intelligence",
                        "Neural Networks",
                        "System Architecture"
                      ].map(item => (
                        <div key={item} className="flex items-center gap-3 group/item">
                          <div className="w-1.5 h-1.5 rounded-full bg-indigo-500/50 group-hover/item:bg-indigo-500 transition-colors"></div>
                          <span className="text-slate-500 group-hover/item:text-slate-300 transition-colors text-sm font-medium">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="md:col-span-4 flex justify-center md:justify-end">
                    <div className="relative">
                      <div className="absolute inset-0 bg-indigo-500/20 blur-3xl animate-pulse"></div>
                      <div className="relative w-32 h-32 md:w-48 md:h-48 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl flex items-center justify-center overflow-hidden rotate-6 group-hover:rotate-0 transition-transform duration-700">
                        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-400 opacity-50">
                          <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                          <path d="M6 12v5c3 3 9 3 12 0v-5" />
                        </svg>
                        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 via-transparent to-transparent"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Internship Card */}
              <div className="glass-card p-10 md:p-16 mt-12 relative overflow-hidden group border border-white/5 hover:border-emerald-500/20 transition-all duration-700">
                <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-[100px] -mr-48 -mt-48 transition-all duration-1000 group-hover:bg-emerald-500/10"></div>

                <div className="relative z-10 grid md:grid-cols-12 gap-12 items-center">
                  <div className="md:col-span-8">
                    <div className="flex items-center gap-4 mb-8">
                      <span className="px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-[10px] font-bold uppercase tracking-widest">3 Months Internship</span>
                      <div className="h-px w-12 bg-white/10"></div>
                      <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest font-mono">Team Euros Racing</span>
                    </div>

                    <h3 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight group-hover:text-white transition-colors">Steering Subsystem Intern</h3>
                    <p className="text-slate-400 text-lg md:text-xl font-medium mb-8 leading-relaxed">
                      Contributing to the design and development of high-performance steering mechanisms at <span className="text-white italic">KLE Technological University</span>.
                    </p>

                    <div className="flex flex-wrap gap-3 mt-8">
                      {["SolidWorks", "Ansys", "Mechanical Engineering", "R&D"].map(tech => (
                        <span key={tech} className="px-3 py-1 bg-white/5 rounded-md text-[9px] font-bold border border-white/10 text-slate-300">{tech}</span>
                      ))}
                    </div>
                  </div>

                  <div className="md:col-span-4 flex justify-center md:justify-end">
                    <div className="relative">
                      <div className="absolute inset-0 bg-emerald-500/20 blur-3xl animate-pulse"></div>
                      <div className="relative w-32 h-32 md:w-48 md:h-48 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl flex items-center justify-center overflow-hidden -rotate-6 group-hover:rotate-0 transition-transform duration-700">
                        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400 opacity-50">
                          <circle cx="12" cy="12" r="10" />
                          <path d="M12 2v20" />
                          <path d="M2 12h20" />
                          <path d="M12 12l5 5" />
                          <path d="M12 12l-5-5" />
                        </svg>
                        <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/10 via-transparent to-transparent"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Beyond Academics Section */}
        <section id="beyond" className="fade-section min-h-screen flex items-center justify-center px-6 py-32 border-b border-white/5 relative overflow-hidden">
          <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
            <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[150px] -translate-y-1/2"></div>
            <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-emerald-500/20 rounded-full blur-[150px] -translate-y-1/2"></div>
          </div>

          <div className="max-w-7xl w-full grid md:grid-cols-12 gap-12 items-start relative z-10">
            <div className="md:col-span-1 text-slate-600 text-xs font-bold uppercase tracking-widest pt-4">
              <TextScramble text="04." className="text-slate-600 text-xs font-bold uppercase tracking-widest" />
            </div>
            <div className="md:col-span-11">
              <h2 className="text-4xl md:text-7xl font-bold mb-20 leading-tight">
                <MaskText align="left">
                  Beyond <span className="text-slate-500 italic">Academics</span>.
                </MaskText>
              </h2>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Motorsports Card */}
                <TiltCard className="h-full rounded-3xl" glowColor="rgba(16, 185, 129, 0.2)">
                  <div className="glass-card p-10 md:p-12 h-full group border border-white/5 hover:border-emerald-500/20 transition-all duration-700 flex flex-col justify-between">
                    <div>
                      <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
                        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400">
                          <circle cx="12" cy="12" r="10" />
                          <path d="M12 2v20M2 12h20M12 12l5-5M12 12l-5 5" />
                        </svg>
                      </div>
                      <h3 className="text-2xl md:text-3xl font-bold mb-4 tracking-tight">Motorsports</h3>
                      <p className="text-slate-400 text-base leading-relaxed mb-6 italic">
                        "Engineering at the edge of performance."
                      </p>
                      <p className="text-slate-500 text-sm leading-relaxed">
                        Passionate about the intersection of mechanical engineering and data. My time with <span className="text-white">Team Euros Racing</span> has taught me how to work under pressure, optimize for efficiency, and embrace the thrill of high-speed technical problem solving.
                      </p>
                    </div>
                    <div className="mt-8 pt-8 border-t border-white/5 flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400/60">Steering & Dynamics</span>
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => setShowGame(true)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity duration-700 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[10px] font-bold text-emerald-400 uppercase tracking-widest hover:bg-emerald-500/20"
                        >
                          Launch Sim
                        </button>
                        <div className="flex -space-x-2">
                          {[1, 2, 3].map(i => (
                            <div key={i} className="w-6 h-6 rounded-full border border-slate-950 bg-slate-800 flex items-center justify-center text-[8px] font-bold text-slate-500">
                              {i === 1 ? '🏎️' : i === 2 ? '🔧' : '⚡'}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </TiltCard>

                {/* Creative Expression Card */}
                <TiltCard className="h-full rounded-3xl" glowColor="rgba(168, 85, 247, 0.2)">
                  <div className="glass-card p-10 md:p-12 h-full group border border-white/5 hover:border-purple-500/20 transition-all duration-700 flex flex-col justify-between">
                    <div>
                      <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
                        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400">
                          <path d="M9 18V5l12-2v13" />
                          <circle cx="6" cy="18" r="3" />
                          <circle cx="18" cy="16" r="3" />
                        </svg>
                      </div>
                      <h3 className="text-2xl md:text-3xl font-bold mb-4 tracking-tight">Creative Expression</h3>
                      <p className="text-slate-400 text-base leading-relaxed mb-6 italic">
                        "Finding rhythm in music and code."
                      </p>
                      <p className="text-slate-500 text-sm leading-relaxed">
                        I explore the world through <span className="text-white">singing and dancing</span>. These art forms allow me to express complex emotions and maintain a creative balance that fuels my technical innovation. Finding the harmony in a melody is much like finding the elegance in a well-written algorithm.
                      </p>
                    </div>
                    <div className="mt-8 pt-8 border-t border-white/5 flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-purple-400/60">Vocal & Motion Art</span>
                      <div className="flex -space-x-2">
                        {[1, 2, 3].map(i => (
                          <div key={i} className="w-6 h-6 rounded-full border border-slate-950 bg-slate-800 flex items-center justify-center text-[8px] font-bold text-slate-500">
                            {i === 1 ? '🎤' : i === 2 ? '💃' : '✨'}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </TiltCard>
              </div>
            </div>
          </div>
        </section>

        {/* Skills & Footer */}
        <footer id="contact" className="px-6 pb-32 bg-slate-950">
          <div className="max-w-7xl mx-auto border-t border-white/10 pt-20">
            <div className="grid md:grid-cols-2 gap-32">
              <div>
                <h2 className="text-5xl md:text-8xl lg:text-9xl font-bold tracking-tighter cinematic-text mb-8 md:mb-12">Let's Connect</h2>
                <p className="text-xl text-slate-400 max-w-md leading-relaxed">
                  Open for internships, freelance opportunities, and interesting coffee chats.
                </p>
                <div className="mt-8 flex flex-wrap gap-4">
                  <Magnetic strength={0.4}>
                    <a
                      href="mailto:manasa.b.vasare@gmail.com"
                      className="group relative inline-flex items-center gap-3 px-8 py-4 bg-indigo-600 hover:bg-indigo-500 rounded-full text-white font-bold uppercase text-xs tracking-widest transition-all duration-300 hover:shadow-[0_0_40px_rgba(99,102,241,0.4)] pointer-events-auto"
                    >
                      <span>Get In Touch</span>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform">
                        <path d="M5 12h14" />
                        <path d="m12 5 7 7-7 7" />
                      </svg>
                    </a>
                  </Magnetic>
                  <Magnetic strength={0.4}>
                    <a
                      href="/resume.pdf"
                      download
                      className="group inline-flex items-center gap-3 px-8 py-4 border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 rounded-full font-bold uppercase text-xs tracking-widest transition-all duration-300 pointer-events-auto text-indigo-400 hover:text-indigo-300"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-y-0.5 transition-transform">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" x2="12" y1="15" y2="3" />
                      </svg>
                      <span>Download Resume</span>
                    </a>
                  </Magnetic>
                  <Magnetic strength={0.4}>
                    <a
                      href="https://github.com/manasa-vasare"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-3 px-8 py-4 border border-white/20 hover:bg-white/10 rounded-full font-bold uppercase text-xs tracking-widest transition-all duration-300 pointer-events-auto"
                    >
                      <span>View GitHub</span>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                        <polyline points="15 3 21 3 21 9" />
                        <line x1="10" x2="21" y1="14" y2="3" />
                      </svg>
                    </a>
                  </Magnetic>
                </div>
              </div>

              <div className="flex flex-col justify-end gap-12">
                <div className="grid grid-cols-2 gap-12">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-widest text-slate-600 mb-6">Contact</h4>
                    <div className="flex gap-6">
                      <Magnetic>
                        <a
                          href="mailto:manasa.b.vasare@gmail.com"
                          className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-full hover:bg-indigo-500/20 hover:text-indigo-400 transition-all border border-white/10 group/social"
                          aria-label="Email"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover/social:scale-110 transition-transform"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
                        </a>
                      </Magnetic>
                      <Magnetic>
                        <a
                          href="https://www.linkedin.com/in/manasa-vasare-ab2559348"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-full hover:bg-blue-600/20 hover:text-blue-400 transition-all border border-white/10 group/social"
                          aria-label="LinkedIn"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover/social:scale-110 transition-transform"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect width="4" height="12" x="2" y="9" /><circle cx="4" cy="4" r="2" /></svg>
                        </a>
                      </Magnetic>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-widest text-slate-600 mb-6">Source</h4>
                    <div className="flex gap-6">
                      <Magnetic>
                        <a
                          href="https://github.com/manasa-vasare"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-full hover:bg-indigo-500/20 hover:text-indigo-400 transition-all border border-white/10 group/social"
                          aria-label="GitHub"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover/social:scale-110 transition-transform"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" /><path d="M9 18c-4.51 2-5-2-7-2" /></svg>
                        </a>
                      </Magnetic>
                      <Magnetic>
                        <a
                          href="https://x.com/_manasa_vasare"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-full hover:bg-blue-400/20 hover:text-blue-400 transition-all border border-white/10 group/social"
                          aria-label="X (Twitter)"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="group-hover/social:scale-110 transition-transform"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                        </a>
                      </Magnetic>
                    </div>
                  </div>
                </div>
                <div className="text-xs font-medium text-slate-700 uppercase tracking-widest pt-12 border-t border-white/5 flex justify-between">
                  <span>© 2026 MANASA VASARE</span>
                  <span>DESIGNED TO INSPIRE</span>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </main>
      {showGame && <RacingGame onClose={() => setShowGame(false)} />}
      {isMagicWorld && <MagicShopWorld onClose={() => {
        setIsMagicWorld(false)
        if (lenisRef.current) lenisRef.current.start()
        // Signal deactivation to other components
        window.dispatchEvent(new CustomEvent('legendary-mode', { detail: { active: false } }))
      }} />}
    </div>
  )
}

export default App