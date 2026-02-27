import { useRef, useEffect, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import {
    PerspectiveCamera,
    MeshDistortMaterial,
    MeshTransmissionMaterial,
    TorusKnot,
    Sphere,
    Icosahedron,
    Environment
} from '@react-three/drei'
import * as THREE from 'three'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const Sculpture = ({ isMobile }: { isMobile: boolean }) => {
    const groupRef = useRef<THREE.Group>(null)
    const liquidRef = useRef<THREE.Mesh>(null)
    const solidRef = useRef<THREE.Mesh>(null)
    const wireRef = useRef<THREE.Mesh>(null)

    // Progress values for morphing (0 to 1)
    const morphState = useRef({ p1: 1, p2: 0, p3: 0 })

    useEffect(() => {
        // Link morph states to scroll progress
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: "body",
                start: "top top",
                end: "bottom bottom",
                scrub: 1.5,
            }
        })

        // Blob to Torus
        tl.to(morphState.current, { p1: 0, p2: 1, p3: 0, duration: 1 })
        // Torus to Wireframe
        tl.to(morphState.current, { p1: 0, p2: 0, p3: 1, duration: 1 })
    }, [])

    useFrame((state) => {
        const { clock, mouse } = state
        const t = clock.getElapsedTime()

        if (groupRef.current) {
            // Gentle rotation and mouse parallax
            groupRef.current.rotation.y = t * 0.1
            groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, mouse.y * 0.2, 0.1)
            groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, mouse.x * (isMobile ? 0.1 : 0.3), 0.1)
        }

        // Apply visibility/opacities based on morphState
        const baseScale = isMobile ? 0.7 : 1
        if (liquidRef.current) {
            liquidRef.current.scale.setScalar(THREE.MathUtils.lerp(0.001, 1.25 * baseScale, morphState.current.p1))
            liquidRef.current.visible = morphState.current.p1 > 0.01
        }
        if (solidRef.current) {
            solidRef.current.scale.setScalar(THREE.MathUtils.lerp(0.001, baseScale, morphState.current.p2))
            solidRef.current.visible = morphState.current.p2 > 0.01
        }
        if (wireRef.current) {
            wireRef.current.scale.setScalar(THREE.MathUtils.lerp(0.001, 1.35 * baseScale, morphState.current.p3))
            wireRef.current.visible = morphState.current.p3 > 0.01
        }
    })

    return (
        <group ref={groupRef}>
            <ambientLight intensity={0.2} />
            <pointLight position={[10, 10, 10]} intensity={1.5} color="#fff" />
            <spotLight position={[-10, 20, 10]} angle={0.15} penumbra={1} intensity={2} color="#6366f1" />

            {/* State 1: Liquid Metallic Blob */}
            <Sphere ref={liquidRef} args={[1, 64, 64]}>
                <MeshDistortMaterial
                    color="#1e1b4b"
                    envMapIntensity={2}
                    clearcoat={1}
                    distort={0.6}
                    speed={2}
                    roughness={0}
                    metalness={1}
                    emissive="#4338ca"
                    emissiveIntensity={0.2}
                />
            </Sphere>

            {/* State 2: Solid Chrome Torus Knot */}
            <TorusKnot ref={solidRef} args={[0.7, 0.2, 128, 32]}>
                <MeshTransmissionMaterial
                    backside
                    samples={4}
                    thickness={1.5}
                    chromaticAberration={0.06}
                    anisotropy={0.1}
                    distortion={0.1}
                    distortionScale={0.1}
                    temporalDistortion={0.1}
                    color="#ffffff"
                />
            </TorusKnot>

            {/* State 3: Wireframe Neural Network */}
            <Icosahedron ref={wireRef} args={[1, 15]}>
                <meshStandardMaterial
                    wireframe
                    color="#a855f7"
                    emissive="#a855f7"
                    emissiveIntensity={3}
                    transparent
                    opacity={0.8}
                />
            </Icosahedron>

            <Environment preset="night" />
        </group>
    )
}

const MorphingSculpture = () => {
    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768)
        checkMobile()
        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [])

    return (
        <div className="fixed inset-0 z-0 pointer-events-none opacity-50">
            <Canvas dpr={[1, 2]}>
                <PerspectiveCamera makeDefault position={[0, 0, 4]} fov={45} />
                <Sculpture isMobile={isMobile} />
            </Canvas>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(15,23,42,0.4)_100%)]"></div>
        </div>
    )
}

export default MorphingSculpture
