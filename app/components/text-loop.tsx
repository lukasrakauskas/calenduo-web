import { useState, useEffect } from 'react'

import { AnimatePresence, motion } from 'framer-motion'

interface Props {
  texts: string[]
  delay?: number
}

export default function TextLoop({
  texts = [],
  delay = 3000,
}: React.PropsWithoutRef<Props>) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setIndex(index + 1)
    }, delay)

    return () => clearTimeout(timeoutId)
  }, [index, setIndex, texts, delay])

  return (
    <AnimatePresence>
      <motion.span
        layout
        key={index}
        className="absolute"
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 100, opacity: 0 }}
        transition={{
          x: { type: 'spring', stiffness: 500, damping: 100 },
          opacity: { duration: 0.2 },
        }}
      >
        {texts[index % texts.length]}
      </motion.span>
      <span className="opacity-0">{texts[index % texts.length]}</span>
    </AnimatePresence>
  )
}
