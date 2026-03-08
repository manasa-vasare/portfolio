import { Canvas } from '@react-three/fiber'
import { PerspectiveCamera } from '@react-three/drei'

const Scene = () => {
    return (
        <>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1.5} />
            <spotLight position={[-10, 10, 10]} angle={0.15} penumbra={1} intensity={2} />
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
