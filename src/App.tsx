import { useEffect, useRef } from "react"
import gsap from "gsap"
import ScrollTrigger from "gsap/ScrollTrigger"
import Lenis from "lenis"
import Hero3D from "./components/Hero3D"
import MorphingSculpture from "./components/MorphingSculpture"

gsap.registerPlugin(ScrollTrigger)

// --- Magnetic Component ---
const Magnetic = ({ children }: { children: React.ReactNode }) => {
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
      xTo(x * 0.35)
      yTo(y * 0.35)
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
  }, [])

  return <div ref={ref} className="inline-block">{children}</div>
}

// --- Tilt Card Component ---
const TiltCard = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => {
  const cardRef = useRef<HTMLDivElement>(null)

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
      className={`relative transition-transform duration-500 ease-out will-change-transform ${className}`}
      style={{ transformStyle: 'preserve-3d' }}
    >
      {children}
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
        ctx.fillStyle = "rgba(129, 140, 248, 0.5)"
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx.closePath()
        ctx.fill()
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
      // Slightly reduced density for 3D coexistence
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

    window.addEventListener("mousemove", (e) => {
      mouse.x = e.clientX
      mouse.y = e.clientY
    })

    window.addEventListener("resize", resize)
    resize()
    animate()

    return () => window.removeEventListener("resize", resize)
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
      duration: 1.2,
      smoothWheel: true,
    })
    lenisRef.current = lenis

    function raf(time: number) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }

    requestAnimationFrame(raf)

    const ctx = gsap.context(() => {
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
          delay: 0.5,
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
          scrub: 1,
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
      <div className="grain-overlay fixed inset-0 z-50 overflow-hidden pointer-events-none"></div>

      <ParticleBackground />
      <MorphingSculpture />

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-[100] px-6 py-8 flex justify-between items-center mix-blend-difference pointer-events-none">
        <span className="text-xl font-black uppercase tracking-tighter pointer-events-auto leading-none cursor-pointer">
          MV.
        </span>
        <div className="flex gap-4 md:gap-8 pointer-events-auto text-[10px] md:text-xs font-bold uppercase tracking-[0.1em] md:tracking-[0.2em] opacity-60">
          <a href="#home" onClick={(e) => scrollToSection(e, "#home")} className="hover:opacity-100 transition-opacity">Home</a>
          <a href="#about" onClick={(e) => scrollToSection(e, "#about")} className="hover:opacity-100 transition-opacity">About</a>
          <a href="#work" onClick={(e) => scrollToSection(e, "#work")} className="hover:opacity-100 transition-opacity">Work</a>
          <a href="#contact" onClick={(e) => scrollToSection(e, "#contact")} className="hover:opacity-100 transition-opacity">Contact</a>
        </div>
      </nav>

      <div className="relative z-10 overflow-x-hidden">
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
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="fade-section min-h-screen flex items-center justify-center px-6 py-32 border-b border-white/5 relative">
          <div className="max-w-7xl w-full grid md:grid-cols-12 gap-12 items-start">
            <div className="md:col-span-1 text-slate-600 text-xs font-bold uppercase tracking-widest pt-4">01.</div>
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

        {/* Projects Section */}
        <section
          id="work"
          ref={horizontalRef}
          className="h-screen overflow-hidden border-b border-white/5"
        >
          <div
            ref={projectsRef}
            className="flex w-[400%] h-full"
          >
            {/* Title Slide */}
            <div className="w-screen flex items-center justify-center px-6 md:px-20">
              <h2 className="text-[clamp(3rem,10vw,8rem)] font-black uppercase tracking-tighter opacity-40">
                <MaskText className="cinematic-text">Selected Work</MaskText>
              </h2>
            </div>

            {/* Project Card 1 */}
            <div className="w-screen flex items-center justify-center px-6 md:px-20">
              <div className="glass-card w-full max-w-6xl aspect-video md:aspect-[21/9] flex flex-col md:flex-row items-center overflow-hidden">
                <div className="w-full md:w-1/2 h-full bg-gradient-to-br from-indigo-900 to-indigo-700/50 p-12 flex items-center justify-center">
                  <div className="w-3/4 aspect-square rounded-2xl bg-white/10 blur-3xl"></div>
                </div>
                <div className="w-full md:w-1/2 p-12 md:p-20">
                  <span className="text-indigo-500 font-bold uppercase tracking-[0.2em] text-[10px] mb-4 block">Interactive Application</span>
                  <h3 className="text-3xl md:text-5xl font-bold mb-6">Cinematic Portfolio</h3>
                  <p className="text-slate-400 text-lg leading-relaxed mb-8">
                    A high-end web experience crafted with React, GSAP, and Frame Motion for seamless interaction.
                  </p>
                  <Magnetic>
                    <button className="px-8 py-3 rounded-full border border-white/20 hover:bg-white/10 transition-colors uppercase text-xs font-bold tracking-widest">
                      Explore Project
                    </button>
                  </Magnetic>
                </div>
              </div>
            </div>

            {/* Project Card 2 */}
            <div className="w-screen flex items-center justify-center px-6 md:px-20">
              <div className="glass-card w-full max-w-6xl aspect-video md:aspect-[21/9] flex flex-col md:flex-row-reverse items-center overflow-hidden">
                <div className="w-full md:w-1/2 h-full bg-gradient-to-br from-purple-900 to-purple-700/50 p-12 flex items-center justify-center">
                  <div className="w-3/4 aspect-square rounded-2xl bg-white/10 blur-3xl"></div>
                </div>
                <div className="w-full md:w-1/2 p-12 md:p-20">
                  <span className="text-purple-500 font-bold uppercase tracking-[0.2em] text-[10px] mb-4 block">Algorithm Visualization</span>
                  <h3 className="text-3xl md:text-5xl font-bold mb-6">DSA Visualizer</h3>
                  <p className="text-slate-400 text-lg leading-relaxed mb-8">
                    Deconstructing complex data structures through intuitive, motion-driven visual patterns.
                  </p>
                  <Magnetic>
                    <button className="px-8 py-3 rounded-full border border-white/20 hover:bg-white/10 transition-colors uppercase text-xs font-bold tracking-widest">
                      Case Study
                    </button>
                  </Magnetic>
                </div>
              </div>
            </div>

            {/* Card 3 */}
            <div className="w-screen flex items-center justify-center px-6 md:px-20">
              <div className="glass-card w-full max-w-6xl aspect-video md:aspect-[21/9] flex items-center justify-center bg-white/5">
                <div className="text-center p-20">
                  <h3 className="text-3xl md:text-5xl font-bold mb-6">
                    <MaskText className="italic">More work coming soon.</MaskText>
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
            <div className="md:col-span-1 text-slate-600 text-xs font-bold uppercase tracking-widest pt-4">02.</div>
            <div className="md:col-span-11">
              <h2 className="text-4xl md:text-7xl font-bold mb-20 leading-tight">
                <MaskText align="left">
                  Technical <span className="text-purple-500 italic">Arsenal</span>.
                </MaskText>
              </h2>

              <div id="skills-grid" className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Frontend */}
                <TiltCard className="h-full">
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
                        <span key={skill.name} className="skill-tag flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full text-[10px] font-bold border border-white/5 hover:bg-white/10 transition-all cursor-default">
                          <img src={`https://skillicons.dev/icons?i=${skill.icon}`} alt={skill.name} className="w-3.5 h-3.5 object-contain" />
                          {skill.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </TiltCard>

                {/* 3D & Animation */}
                <TiltCard className="h-full">
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
                        <span key={skill.name} className="skill-tag flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full text-[10px] font-bold border border-white/5 hover:bg-white/10 transition-all cursor-default">
                          {skill.icon ? <img src={`https://skillicons.dev/icons?i=${skill.icon}`} alt={skill.name} className="w-3.5 h-3.5 object-contain" /> : <div className="w-3.5 h-3.5 rounded-full bg-purple-500/20"></div>}
                          {skill.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </TiltCard>

                {/* Core */}
                <TiltCard className="h-full">
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
                        <span key={skill.name} className="skill-tag flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full text-[10px] font-bold border border-white/5 hover:bg-white/10 transition-all cursor-default">
                          {skill.icon ? <img src={`https://skillicons.dev/icons?i=${skill.icon}`} alt={skill.name} className="w-3.5 h-3.5 object-contain" /> : <div className="w-3.5 h-3.5 rounded-full bg-slate-500/20"></div>}
                          {skill.name}
                        </span>
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
            <div className="md:col-span-1 text-slate-600 text-xs font-bold uppercase tracking-widest pt-4">03.</div>
            <div className="md:col-span-11">
              <h2 className="text-4xl md:text-7xl font-bold mb-20 leading-tight">
                <MaskText align="left">
                  Academic <span className="text-slate-500 italic">Foundation</span>.
                </MaskText>
              </h2>

              <div className="glass-card p-12 md:p-20 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -mr-32 -mt-32 group-hover:bg-indigo-500/10 transition-colors"></div>
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-12">
                  <div>
                    <span className="text-indigo-500 font-bold uppercase tracking-[0.2em] text-xs mb-4 block">2024 – 2028</span>
                    <h3 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">B.Tech in Computer Science</h3>
                    <p className="text-slate-400 text-lg max-w-xl">
                      I am currently pursuing a B.E. in Computer Science and Artificial Intelligence (2nd year) at KLE Technological University. My academic focus lies in core computer science fundamentals such as data structures, algorithms, object-oriented programming, and database systems, along with specialized subjects in artificial intelligence and machine learning. Through coursework and practical projects, I am developing strong problem-solving abilities and a solid understanding of how intelligent systems are designed and implemented. I am particularly interested in building innovative, real-world solutions by combining programming skills with AI-driven technologies. As a motivated and continuously learning student, I actively work on improving both my technical expertise and analytical thinking to prepare myself for future challenges in the tech industry.
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-5xl md:text-7xl font-black text-white/5 tracking-tighter uppercase transition-colors group-hover:text-white/10 italic">Engineer</p>
                  </div>
                </div>
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
      </div>
    </div>
  )
}

export default App