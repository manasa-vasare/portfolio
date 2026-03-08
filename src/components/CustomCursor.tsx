import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'

const CustomCursor = () => {
    const cursorRef = useRef<HTMLDivElement>(null)
    const [hovered, setHovered] = useState(false)
    const [isVisible, setIsVisible] = useState(false)
    const pos = useRef({ x: 0, y: 0 })
    const vel = useRef({ x: 0, y: 0 })

    useEffect(() => {
        const cursor = cursorRef.current
        if (!cursor) return

        const xTo = gsap.quickTo(cursor, "x", { duration: 0.15, ease: "power3.out" })
        const yTo = gsap.quickTo(cursor, "y", { duration: 0.15, ease: "power3.out" })

        const onMouseMove = (e: MouseEvent) => {
            if (!isVisible) setIsVisible(true)

            // Calculate velocity
            vel.current.x = e.clientX - pos.current.x
            vel.current.y = e.clientY - pos.current.y
            pos.current.x = e.clientX
            pos.current.y = e.clientY

            // Update position
            xTo(e.clientX)
            yTo(e.clientY)

            // Calculate rotation and scale based on velocity
            const speed = Math.sqrt(vel.current.x ** 2 + vel.current.y ** 2)
            const angle = Math.atan2(vel.current.y, vel.current.x) * (180 / Math.PI)

            if (!hovered && speed > 1) {
                gsap.to(cursor, {
                    rotation: angle,
                    scaleX: 1 + Math.min(speed / 100, 1.5),
                    scaleY: 1 - Math.min(speed / 200, 0.4),
                    duration: 0.2,
                    ease: "power2.out"
                })
            }
        }

        const handleHover = (e: MouseEvent) => {
            const target = e.target as HTMLElement
            const isHoverable = target.closest('a, button, [role="button"], .magnetic-target, canvas, .skill-tag')
            setHovered(!!isHoverable)
        }

        window.addEventListener('mousemove', onMouseMove)
        window.addEventListener('mouseover', handleHover)

        return () => {
            window.removeEventListener('mousemove', onMouseMove)
            window.removeEventListener('mouseover', handleHover)
        }
    }, [isVisible, hovered])

    useEffect(() => {
        if (!cursorRef.current) return

        if (hovered) {
            gsap.to(cursorRef.current, {
                width: 40,
                height: 40,
                borderRadius: '8px',
                backgroundColor: 'rgba(99, 102, 241, 0.15)',
                borderColor: 'rgba(99, 102, 241, 1)',
                borderWidth: 1,
                scaleX: 1,
                scaleY: 1,
                rotation: 0,
                duration: 0.3,
                ease: "expo.out"
            })
        } else {
            gsap.to(cursorRef.current, {
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: 'rgba(99, 102, 241, 1)',
                borderColor: 'transparent',
                borderWidth: 0,
                duration: 0.3,
                ease: "expo.out"
            })
        }
    }, [hovered])

    if (typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0)) return null

    return (
        <div
            className={`fixed inset-0 pointer-events-none z-[99999] ${isVisible ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
        >
            <div
                ref={cursorRef}
                className="fixed top-0 left-0 w-2 h-2 bg-indigo-500 rounded-full -translate-x-1/2 -translate-y-1/2 border-white/0 flex items-center justify-center pointer-events-none"
            >
                {/* Focus Frame Corners */}
                {hovered && (
                    <div className="absolute inset-0">
                        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-indigo-400 -translate-x-1 -translate-y-1" />
                        <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-indigo-400 translate-x-1 -translate-y-1" />
                        <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-indigo-400 -translate-x-1 translate-y-1" />
                        <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-indigo-400 translate-x-1 translate-y-1" />
                    </div>
                )}
            </div>
        </div>
    )
}

export default CustomCursor
