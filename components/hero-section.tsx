'use client'

import { useState, useEffect } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

interface HeroSectionProps {
  title: string
  quotes: { content: string; author: string }[]
}

export function HeroSection({ title, quotes }: HeroSectionProps) {
  const { scrollY } = useScroll()
  const opacity = useTransform(scrollY, [0, 300], [1, 0])
  const y = useTransform(scrollY, [0, 300], [0, 100])
  const [currentQuote, setCurrentQuote] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuote((prev) => (prev + 1) % quotes.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [quotes.length])

  return (
    <div className="relative h-screen min-h-[500px] w-full overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/background.jpg')" }}
      >
        <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px]" />
      </div>

      {/* Quote Carousel */}
      <div className="absolute left-8 top-24 z-10 max-w-md text-white/90 md:left-16 md:top-32">
        <motion.div
          key={currentQuote}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.8 }}
          className="bg-black/20 p-6 rounded-lg backdrop-blur-sm border border-white/10"
        >
          <p className="text-xl font-light italic leading-relaxed">"{quotes[currentQuote].content}"</p>
          <p className="mt-4 text-right text-sm font-medium">— {quotes[currentQuote].author}</p>
        </motion.div>
      </div>

      {/* Main Title */}
      <motion.div 
        className="absolute inset-0 flex items-center justify-center pointer-events-none px-4 -mt-20"
      >
        <h1 className="text-4xl sm:text-6xl md:text-8xl font-bold text-white drop-shadow-2xl tracking-tight text-center break-words">
          {title}
        </h1>
      </motion.div>
      
      {/* Scroll Indicator (Optional but helpful) */}
      <motion.div 
        className="absolute bottom-16 left-1/2 -translate-x-1/2 text-white/70"
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
        style={{ opacity }}
      >
        <ChevronDown className="h-10 w-10" />
      </motion.div>
    </div>
  )
}
