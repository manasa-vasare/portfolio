import React, { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'

interface RacingGameProps {
    onClose: () => void
}

const RacingGame: React.FC<RacingGameProps> = ({ onClose }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const [gameState, setGameState] = useState<'start' | 'playing' | 'gameover'>('start')
    const [score, setScore] = useState(0)
    const [highScore, setHighScore] = useState(0)

    // Game Constants
    const CAR_WIDTH = 40
    const CAR_HEIGHT = 70
    const LANE_WIDTH = 100
    const NUM_LANES = 3
    const ROAD_WIDTH = LANE_WIDTH * NUM_LANES

    // Game Refs
    const playerPos = useRef(1) // 0, 1, 2 (lanes)
    const obstacles = useRef<{ id: number; lane: number; y: number }[]>([])
    const gameLoop = useRef<number | null>(null)
    const speed = useRef(5)
    const lastObstacleTime = useRef(0)

    useEffect(() => {
        const savedHighScore = localStorage.getItem('racing-high-score')
        if (savedHighScore) setHighScore(parseInt(savedHighScore))
    }, [])

    const startGame = () => {
        setGameState('playing')
        setScore(0)
        playerPos.current = 1
        obstacles.current = []
        speed.current = 7
        lastObstacleTime.current = 0

        gsap.fromTo(containerRef.current, { opacity: 0 }, { opacity: 1, duration: 0.5 })
    }

    const handleKeyDown = (e: KeyboardEvent) => {
        if (gameState !== 'playing') return
        if (e.key === 'ArrowLeft' && playerPos.current > 0) {
            playerPos.current -= 1
        } else if (e.key === 'ArrowRight' && playerPos.current < NUM_LANES - 1) {
            playerPos.current += 1
        }
    }

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [gameState])

    useEffect(() => {
        if (gameState !== 'playing') return

        const canvas = canvasRef.current!
        const ctx = canvas.getContext('2d')!
        canvas.width = ROAD_WIDTH + 100
        canvas.height = window.innerHeight * 0.8

        const update = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height)

            // Road background
            ctx.fillStyle = '#0f172a'
            ctx.fillRect(50, 0, ROAD_WIDTH, canvas.height)

            // Lane lines
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'
            ctx.setLineDash([20, 20])
            ctx.lineDashOffset -= speed.current
            for (let i = 1; i < NUM_LANES; i++) {
                ctx.beginPath()
                ctx.moveTo(50 + i * LANE_WIDTH, 0)
                ctx.lineTo(50 + i * LANE_WIDTH, canvas.height)
                ctx.stroke()
            }
            ctx.setLineDash([])

            // Road borders (glowing)
            ctx.shadowBlur = 15
            ctx.shadowColor = '#10b981'
            ctx.strokeStyle = '#10b981'
            ctx.lineWidth = 4
            ctx.beginPath()
            ctx.moveTo(50, 0)
            ctx.lineTo(50, canvas.height)
            ctx.stroke()
            ctx.beginPath()
            ctx.moveTo(50 + ROAD_WIDTH, 0)
            ctx.lineTo(50 + ROAD_WIDTH, canvas.height)
            ctx.stroke()
            ctx.shadowBlur = 0

            // Player Car
            const playerX = 50 + playerPos.current * LANE_WIDTH + (LANE_WIDTH - CAR_WIDTH) / 2
            const playerY = canvas.height - CAR_HEIGHT - 50

            // Draw Car (Formula Style)
            ctx.fillStyle = '#10b981'
            // Body
            ctx.fillRect(playerX + 10, playerY, 20, 70)
            // Front Wing
            ctx.fillRect(playerX, playerY + 5, 40, 5)
            // Rear Wing
            ctx.fillRect(playerX, playerY + 60, 40, 5)
            // Tires
            ctx.fillStyle = '#000'
            ctx.fillRect(playerX - 2, playerY + 10, 8, 15)
            ctx.fillRect(playerX + 34, playerY + 10, 8, 15)
            ctx.fillRect(playerX - 2, playerY + 50, 8, 15)
            ctx.fillRect(playerX + 34, playerY + 50, 8, 15)

            // Spawn obstacles
            if (Date.now() - lastObstacleTime.current > 1500 / (speed.current / 5)) {
                obstacles.current.push({
                    id: Date.now(),
                    lane: Math.floor(Math.random() * NUM_LANES),
                    y: -CAR_HEIGHT
                })
                lastObstacleTime.current = Date.now()
            }

            // Update and Draw Obstacles
            obstacles.current.forEach((obs, index) => {
                obs.y += speed.current

                ctx.fillStyle = '#ef4444'
                const obsX = 50 + obs.lane * LANE_WIDTH + (LANE_WIDTH - CAR_WIDTH) / 2
                // Obstacle (Cone or Block)
                ctx.beginPath()
                ctx.moveTo(obsX + 20, obs.y)
                ctx.lineTo(obsX, obs.y + 40)
                ctx.lineTo(obsX + 40, obs.y + 40)
                ctx.fill()

                // Collision detection
                if (
                    obs.lane === playerPos.current &&
                    obs.y + 40 > playerY &&
                    obs.y < playerY + CAR_HEIGHT
                ) {
                    setGameState('gameover')
                }

                // Cleanup
                if (obs.y > canvas.height) {
                    obstacles.current.splice(index, 1)
                    setScore(s => {
                        const newScore = s + 10
                        if (newScore % 100 === 0) speed.current += 0.5
                        return newScore
                    })
                }
            })

            if (gameState === 'playing') {
                gameLoop.current = requestAnimationFrame(update)
            }
        }

        gameLoop.current = requestAnimationFrame(update)
        return () => cancelAnimationFrame(gameLoop.current!)
    }, [gameState])

    useEffect(() => {
        if (gameState === 'gameover' && score > highScore) {
            setHighScore(score)
            localStorage.setItem('racing-high-score', score.toString())
        }
    }, [gameState, score, highScore])

    return (
        <div ref={containerRef} className="fixed inset-0 z-[1000] bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-6">
            <div className="max-w-4xl w-full glass-card overflow-hidden flex flex-col items-center p-8 md:p-12 relative border border-emerald-500/20">
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                </button>

                <div className="mb-8 text-center">
                    <h2 className="text-3xl md:text-5xl font-bold tracking-tighter text-emerald-400 mb-2">Retro <span className="italic">Racer</span></h2>
                    <p className="text-slate-500 text-sm uppercase tracking-[0.3em]">Simulator Build v1.02</p>
                </div>

                {gameState === 'start' && (
                    <div className="flex flex-col items-center gap-8 py-12">
                        <div className="w-32 h-32 rounded-full border border-emerald-500/30 flex items-center justify-center animate-pulse">
                            <span className="text-6xl">🏎️</span>
                        </div>
                        <div className="text-center">
                            <p className="text-slate-400 mb-6 max-w-xs text-sm">Use Arrow Keys to dodge obstacles and keep the Team Euros car on the track.</p>
                            <button
                                onClick={startGame}
                                className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full font-bold uppercase text-xs tracking-widest transition-all shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:scale-105"
                            >
                                Launch Engine
                            </button>
                        </div>
                    </div>
                )}

                {gameState === 'playing' && (
                    <div className="relative">
                        <div className="absolute top-4 left-4 z-10 px-4 py-2 bg-slate-950/80 rounded-lg border border-white/5">
                            <p className="text-[10px] text-slate-500 uppercase tracking-widest">Score</p>
                            <p className="text-2xl font-mono text-emerald-400 font-bold">{score.toString().padStart(6, '0')}</p>
                        </div>
                        <canvas ref={canvasRef} className="rounded-xl border border-white/5 shadow-2xl bg-slate-950" />
                    </div>
                )}

                {gameState === 'gameover' && (
                    <div className="flex flex-col items-center gap-8 py-12 text-center">
                        <h3 className="text-4xl md:text-6xl font-black text-rose-500 uppercase italic tracking-tighter">Crash Detected</h3>
                        <div className="grid grid-cols-2 gap-8 mb-4">
                            <div>
                                <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Final Score</p>
                                <p className="text-3xl font-mono text-white font-bold">{score}</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Best Lap</p>
                                <p className="text-3xl font-mono text-emerald-400 font-bold">{highScore}</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <button
                                onClick={startGame}
                                className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white rounded-full font-bold uppercase text-xs tracking-widest transition-all border border-white/10"
                            >
                                Re-Initialize
                            </button>
                            <button
                                onClick={onClose}
                                className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-full font-bold uppercase text-xs tracking-widest transition-all"
                            >
                                Exit Sim
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default RacingGame
