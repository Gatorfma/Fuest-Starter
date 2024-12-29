'use client'

import { useEffect, useRef } from 'react'

export function AnimatedBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
        if (!ctx) return

        // Set canvas size
        const setSize = () => {
            canvas.width = window.innerWidth
            canvas.height = window.innerHeight
        }
        setSize()
        window.addEventListener('resize', setSize)

        // Grid parameters
        const gridSize = 30
        let time = 0

        // Animation
        function animate() {
            if (!canvas) return
            
            time += 0.002
            ctx.fillStyle = '#000814' // Dark blue background
            ctx.fillRect(0, 0, canvas.width, canvas.height)

            // Draw grid
            ctx.strokeStyle = '#0466c8' // Neon blue
            ctx.lineWidth = 0.5

            for (let x = 0; x < canvas.width; x += gridSize) {
                for (let y = 0; y < canvas.height; y += gridSize) {
                    const distanceFromCenter = Math.sqrt(
                        Math.pow(x - canvas.width / 2, 2) + Math.pow(y - canvas.height / 2, 2)
                    )
                    const wave = Math.sin(distanceFromCenter * 0.01 + time) * 5

                    ctx.beginPath()
                    ctx.arc(x + wave, y + wave, 1, 0, Math.PI * 2)
                    ctx.stroke()
                }
            }

            requestAnimationFrame(animate)
        }

        animate()

        return () => {
            window.removeEventListener('resize', setSize)
        }
    }, [])

    return <canvas ref={canvasRef} className="fixed inset-0 -z-10" />
}

