import { useEffect, useCallback } from 'react'

const SECRET = ['b', 'a', 'n', 'g', 't', 'a', 'n']

const KonamiEasterEgg = () => {
    const handleKeySequence = useCallback(() => {
        let index = 0

        const handler = (e: KeyboardEvent) => {
            if (e.key.toLowerCase() === SECRET[index]) {
                index++
                if (index === SECRET.length) {
                    // Dispatch custom event for persistent Magic Shop mode
                    window.dispatchEvent(new CustomEvent('legendary-mode', { detail: { active: true } }))
                    index = 0
                }
            } else {
                index = e.key.toLowerCase() === SECRET[0] ? 1 : 0
            }
        }

        window.addEventListener('keydown', handler)
        return () => window.removeEventListener('keydown', handler)
    }, [])

    useEffect(() => {
        const cleanup = handleKeySequence()
        return cleanup
    }, [handleKeySequence])

    return null
}

export default KonamiEasterEgg
