import { useRef, useEffect, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import {
    PerspectiveCamera,
    MeshTransmissionMaterial,
    TorusKnot,
    Icosahedron,
    Octahedron,
    Environment
} from '@react-three/drei'
import * as THREE from 'three'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const Sculpture = ({ isMobile, isLightMode }: { isMobile: boolean, isLightMode: boolean }) => {
    const groupRef = useRef<THREE.Group>(null)
    const prismRef = useRef<THREE.Mesh>(null)
    const solidRef = useRef<THREE.Mesh>(null)
    const wireRef = useRef<THREE.Mesh>(null)

    // Interaction states
    const [hovered, setHovered] = useState(false)
    const hoverVal = useRef(0)
    const clickScale = useRef(1)
    const dragRotation = useRef({ x: 0, y: 0 })
    const isDragging = useRef(false)
    const lastMouse = useRef({ x: 0, y: 0 })

    // Progress values for morphing (0 to 1)
    const morphState = useRef({
        p1: 1,
        p2: 0,
        p3: 0,
        speed: 1,
        stress: 0,
        pop: 1
    })

    const [isLegendary, setIsLegendary] = useState(false)

    useEffect(() => {
        const handleLegendary = (e: any) => {
            setIsLegendary(e.detail.active)
            if (e.detail.active) {
                gsap.to(morphState.current, { speed: 8, duration: 2, ease: "power4.out" })
            } else {
                gsap.to(morphState.current, { speed: 1, duration: 2, ease: "power2.inOut" })
            }
        }
        window.addEventListener('legendary-mode', handleLegendary)
        return () => window.removeEventListener('legendary-mode', handleLegendary)
    }, [])

    useEffect(() => {
        document.body.style.cursor = hovered ? 'pointer' : 'auto'
    }, [hovered])

    const handleClick = () => {
        gsap.to(clickScale, {
            current: 1.3,
            duration: 0.1,
            yoyo: true,
            repeat: 1,
            ease: "power2.out",
            onComplete: () => { clickScale.current = 1 }
        })
    }

    const handlePointerDown = (e: any) => {
        isDragging.current = true
        lastMouse.current = { x: e.clientX, y: e.clientY }
    }

    const handlePointerUp = () => {
        isDragging.current = false
    }

    const handlePointerMove = (e: any) => {
        if (!isDragging.current) return
        const deltaX = e.clientX - lastMouse.current.x
        const deltaY = e.clientY - lastMouse.current.y
        dragRotation.current.x += deltaY * 0.005
        dragRotation.current.y += deltaX * 0.005
        lastMouse.current = { x: e.clientX, y: e.clientY }
    }

    useEffect(() => {
        // Link morph states to scroll progress
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: "body",
                start: "top top",
                end: "bottom bottom",
                scrub: 2,
            }
        })

        const master = morphState.current

        // --- Transition 1: Prism -> Knot ---
        tl.to(master, { p1: 0, duration: 1, ease: "expo.inOut" }, 0)
        tl.to(master, { p2: 1, duration: 1, ease: "expo.inOut" }, 0.2) // Overlap

        // Speed & Stress Peak
        tl.to(master, { speed: 4, stress: 1, pop: 1.2, duration: 0.5, ease: "power2.in" }, 0.25)
        tl.to(master, { speed: 1, stress: 0, pop: 1, duration: 0.5, ease: "power2.out" }, 0.75)

        // --- Transition 2: Knot -> Wireframe ---
        tl.to(master, { p2: 0, duration: 1, ease: "expo.inOut" }, 1.2)
        tl.to(master, { p3: 1, duration: 1, ease: "expo.inOut" }, 1.4)

        // Final stress peak
        tl.to(master, { speed: 3, stress: 0.8, duration: 0.5, ease: "power2.in" }, 1.4)
        tl.to(master, { speed: 1, stress: 0, duration: 0.5, ease: "power2.out" }, 1.9)
    }, [])

    useFrame((state, delta) => {
        const { clock, mouse } = state
        const t = clock.getElapsedTime()

        if (groupRef.current) {
            // Gentle rotation + mouse parallax + drag rotation + transition speed
            groupRef.current.rotation.y += delta * 0.02 * morphState.current.speed
            groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, mouse.y * 0.2 + dragRotation.current.x, 0.1)
            groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, mouse.x * (isMobile ? 0.1 : 0.3), 0.1)
        }

        // Hover animation lerp
        hoverVal.current = THREE.MathUtils.lerp(hoverVal.current, hovered ? 1 : 0, 0.1)
        const combinedScale = (clickScale.current + (hoverVal.current * 0.1)) * morphState.current.pop

        // Apply visibility/opacities based on morphState
        const baseScale = (isMobile ? 0.7 : 1) * combinedScale

        if (prismRef.current) {
            prismRef.current.scale.setScalar(THREE.MathUtils.lerp(0.001, 1.25 * baseScale, morphState.current.p1))
            prismRef.current.visible = morphState.current.p1 > 0.01
            prismRef.current.rotation.y = t * 0.01 * morphState.current.speed
        }
        if (solidRef.current) {
            solidRef.current.scale.setScalar(THREE.MathUtils.lerp(0.001, baseScale, morphState.current.p2))
            solidRef.current.visible = morphState.current.p2 > 0.01
            solidRef.current.rotation.x = t * 0.004 * morphState.current.speed
        }
        if (wireRef.current) {
            wireRef.current.scale.setScalar(THREE.MathUtils.lerp(0.001, 1.35 * baseScale, morphState.current.p3))
            wireRef.current.visible = morphState.current.p3 > 0.01
        }
    })

    return (
        <group
            ref={groupRef}
            onPointerOver={() => setHovered(true)}
            onPointerOut={() => setHovered(false)}
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onPointerMove={handlePointerMove}
            onClick={handleClick}
        >
            <ambientLight intensity={0.2} />
            <pointLight position={[10, 10, 10]} intensity={1.5} color="#fff" />
            <spotLight position={[-10, 20, 10]} angle={0.15} penumbra={1} intensity={2} color="#6366f1" />

            {/* State 1: Floating Glass Prism */}
            <Octahedron ref={prismRef} args={[1, 0]}>
                <MeshTransmissionMaterial
                    backside
                    samples={8}
                    thickness={1}
                    chromaticAberration={0.2 + (morphState.current.stress * 0.8)}
                    anisotropy={0.5}
                    distortion={morphState.current.stress * 0.5}
                    color={isLegendary ? "#a855f7" : "#6366f1"}
                    roughness={isLegendary ? 0.05 : 0.1}
                    transmission={1}
                />
            </Octahedron>

            {/* State 2: Solid Chrome Torus Knot */}
            <TorusKnot ref={solidRef} args={[0.7, 0.2, 128, 32]}>
                <MeshTransmissionMaterial
                    backside
                    samples={4}
                    thickness={1.5}
                    chromaticAberration={0.06 + (morphState.current.stress * 0.5)}
                    anisotropy={0.1}
                    distortion={0.1}
                    distortionScale={0.1}
                    temporalDistortion={0.1}
                    color={isLegendary ? "#a855f7" : "#ffffff"}
                />
            </TorusKnot>

            {/* State 3: Wireframe Neural Network */}
            <Icosahedron ref={wireRef} args={[1, 15]}>
                <meshStandardMaterial
                    wireframe
                    color={isLegendary ? "#a855f7" : (isLightMode ? '#4f46e5' : '#a855f7')}
                    emissive={isLegendary ? "#a855f7" : (isLightMode ? '#4f46e5' : '#a855f7')}
                    emissiveIntensity={isLegendary ? 8 : (hovered ? (isLightMode ? 2 : 5) : (isLightMode ? 1 : 3))}
                    transparent
                    opacity={isLegendary ? 0.9 : (isLightMode ? 0.6 : 0.8)}
                />
            </Icosahedron>

            <Environment preset="city" />
        </group>
    )
}

const MorphingSculpture = () => {
    const [isMobile, setIsMobile] = useState(false)
    const [isLightMode, setIsLightMode] = useState(false)

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768)
        checkMobile()
        window.addEventListener('resize', checkMobile)

        // Watch for light-mode class changes
        const observer = new MutationObserver(() => {
            setIsLightMode(document.documentElement.classList.contains('light-mode'))
        })
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })

        return () => {
            window.removeEventListener('resize', checkMobile)
            observer.disconnect()
        }
    }, [])

    return (
        <div className="fixed inset-0 z-0 pointer-events-none opacity-100">
            <div className={`absolute inset-0 ${isLightMode ? 'bg-[radial-gradient(circle_at_center,transparent_0%,rgba(248,250,252,0.7)_100%)]' : 'bg-[radial-gradient(circle_at_center,transparent_0%,rgba(15,23,42,0.6)_100%)]'}`}></div>
            <Canvas dpr={[1, 2]}>
                <PerspectiveCamera makeDefault position={[0, 0, 4]} fov={45} />
                <Sculpture isMobile={isMobile} isLightMode={isLightMode} />
            </Canvas>
        </div>
    )
}

export default MorphingSculpture
