import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const chars = '!<>-_\\/[]{}—=+*^?#________'

interface TextScrambleProps {
    text: string
    className?: string
}

const TextScramble = ({ text, className = '' }: TextScrambleProps) => {
    const ref = useRef<HTMLSpanElement>(null)
    const [displayText, setDisplayText] = useState(text)
    const hasAnimated = useRef(false)

    useEffect(() => {
        const el = ref.current
        if (!el) return

        const trigger = ScrollTrigger.create({
            trigger: el,
            start: "top 90%",
            onEnter: () => {
                if (hasAnimated.current) return
                hasAnimated.current = true

                let iteration = 0
                const totalIterations = 12
                const originalText = text

                const interval = setInterval(() => {
                    setDisplayText(
                        originalText
                            .split('')
                            .map((char, index) => {
                                if (char === ' ') return ' '
                                if (index < iteration) return originalText[index]
                                return chars[Math.floor(Math.random() * chars.length)]
                            })
                            .join('')
                    )

                    iteration += originalText.length / totalIterations
                    if (iteration >= originalText.length) {
                        clearInterval(interval)
                        setDisplayText(originalText)
                    }
                }, 40)
            },
        })

        return () => trigger.kill()
    }, [text])

    return (
        <span ref={ref} className={`font-mono ${className}`}>
            {displayText}
        </span>
    )
}

export default TextScramble
