import { useEffect, useState, useRef } from 'react'

const roles = [
    "Frontend Developer",
    "3D Enthusiast",
    "UI Engineer",
    "Motion Designer",
    "Problem Solver",
]

const Typewriter = () => {
    const [text, setText] = useState('')
    const [isDeleting, setIsDeleting] = useState(false)
    const roleIndex = useRef(0)
    const charIndex = useRef(0)

    useEffect(() => {
        const currentRole = roles[roleIndex.current]

        const timeout = setTimeout(() => {
            if (!isDeleting) {
                // Typing
                charIndex.current++
                setText(currentRole.slice(0, charIndex.current))

                if (charIndex.current === currentRole.length) {
                    // Pause at end of word
                    setTimeout(() => setIsDeleting(true), 2000)
                }
            } else {
                // Deleting
                charIndex.current--
                setText(currentRole.slice(0, charIndex.current))

                if (charIndex.current === 0) {
                    setIsDeleting(false)
                    roleIndex.current = (roleIndex.current + 1) % roles.length
                }
            }
        }, isDeleting ? 50 : 100)

        return () => clearTimeout(timeout)
    }, [text, isDeleting])

    return (
        <div className="h-6 flex items-center justify-center gap-1">
            <span className="text-xs md:text-sm font-medium tracking-[0.2em] uppercase text-indigo-400/80">
                {text}
            </span>
            <span className="w-[2px] h-4 bg-indigo-500 animate-pulse" />
        </div>
    )
}

export default Typewriter
