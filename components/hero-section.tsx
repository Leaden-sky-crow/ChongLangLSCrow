'use client'

import { useState, useEffect } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

interface HeroSectionProps {
  title: string
  subtitle?: string
  quotes: { content: string; author: string }[]
}

export function HeroSection({ title, subtitle, quotes }: HeroSectionProps) {
  const { scrollY } = useScroll()
  const opacity = useTransform(scrollY, [0, 300], [1, 0])
  const y = useTransform(scrollY, [0, 300], [0, 100])
  const [currentQuote, setCurrentQuote] = useState(0)
  const [resetKey, setResetKey] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuote((prev) => (prev + 1) % quotes.length)
    }, 10000)  // 10 秒轮播
    return () => clearInterval(interval)
  }, [quotes.length, resetKey])

  const handleQuoteClick = () => {
    setCurrentQuote((prev) => (prev + 1) % quotes.length)
    setResetKey((k) => k + 1)  // 手动切换后重置自动轮播计时器
  }

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
      <div className="absolute left-0 top-0 z-10 w-[min(90vw,26rem)] text-white/90">
        <motion.div
          key={currentQuote}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          onClick={handleQuoteClick}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              handleQuoteClick()
            }
          }}
          role="button"
          tabIndex={0}
          title="点击切换语录"
          className="cursor-pointer select-none rounded-br-2xl border border-white/25 bg-black/25 p-4 shadow-xl shadow-black/20 backdrop-blur-md md:p-5"
        >
          <p className="font-reading text-base font-light leading-relaxed md:text-lg">
            "{quotes[currentQuote].content}"
          </p>
          <p className="mt-2 text-right font-reading text-xs font-medium md:mt-3 md:text-sm">
            — {quotes[currentQuote].author}
          </p>
          <div className="mt-2 text-right text-[10px] text-white/50 md:mt-3">
            {currentQuote + 1} / {quotes.length}
          </div>
        </motion.div>
      </div>

      {/* Main Title */}
      <motion.div 
        className="absolute inset-0 flex items-center justify-center pointer-events-none px-4 -mt-20"
      >
        <div className="text-center">
          <h1 className="font-reading text-[clamp(2.5rem,8vw,6rem)] font-bold text-white drop-shadow-2xl tracking-tight text-balance leading-[1.15]">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-6 font-reading text-[clamp(1.125rem,3vw,1.875rem)] text-white/90 font-light tracking-wide">
              {subtitle}
            </p>
          )}
        </div>
      </motion.div>
      
      {/* Scroll Indicator (Optional but helpful) */}
      <motion.div 
        className="absolute bottom-24 left-1/2 -translate-x-1/2 text-white/70"
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
        style={{ opacity }}
      >
        <ChevronDown className="h-10 w-10" />
      </motion.div>
    </div>
  )
}
