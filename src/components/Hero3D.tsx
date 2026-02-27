import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, MeshDistortMaterial, Sphere, PerspectiveCamera } from '@react-three/drei'
import * as THREE from 'three'

const Scene = () => {
    const meshRef = useRef<THREE.Mesh>(null)

    useFrame((state) => {
        const { mouse } = state
        if (meshRef.current) {
            // Subtle parallax rotation based on mouse
            meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, mouse.y * 0.2, 0.1)
            meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, mouse.x * 0.2, 0.1)
        }
    })

    const gradientTexture = useMemo(() => {
        const canvas = document.createElement('canvas')
        canvas.width = 256
        canvas.height = 256
        const context = canvas.getContext('2d')
        if (context) {
            const gradient = context.createRadialGradient(128, 128, 0, 128, 128, 128)
            gradient.addColorStop(0, '#6366f1') // Indigo-500
            gradient.addColorStop(1, '#a855f7') // Purple-500
            context.fillStyle = gradient
            context.fillRect(0, 0, 256, 256)
        }
        const texture = new THREE.CanvasTexture(canvas)
        return texture
    }, [])

    const isMobile = window.innerWidth < 768

    return (
        <>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1.5} />
            <spotLight position={[-10, 10, 10]} angle={0.15} penumbra={1} intensity={2} />

            <Float speed={2} rotationIntensity={1} floatIntensity={2}>
                <Sphere ref={meshRef} args={[1, 64, 64]} scale={isMobile ? 1.2 : 1.5}>
                    <MeshDistortMaterial
                        map={gradientTexture}
                        distort={0.4}
                        speed={2}
                        roughness={0.2}
                        metalness={0.8}
                        emissive="#4338ca"
                        emissiveIntensity={0.5}
                    />
                </Sphere>
            </Float>
        </>
    )
}

const Hero3D = () => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

    return (
        <div className="absolute inset-0 z-0 opacity-40">
            <Canvas dpr={[1, 2]}>
                <PerspectiveCamera makeDefault position={[0, 0, isMobile ? 6 : 5]} fov={50} />
                <Scene />
            </Canvas>
        </div>
    )
}

export default Hero3D
