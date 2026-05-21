import { motion, AnimatePresence } from 'framer-motion'

interface Props {
  message: string
  onClose: () => void
}

export default function Toast({ message, onClose }: Props) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        onClick={onClose}
        className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] bg-dinoclass-surface border border-dinoclass-spark/40 text-white px-8 py-4 rounded-xl shadow-2xl text-sm font-medium cursor-pointer"
      >
        {message}
      </motion.div>
    </AnimatePresence>
  )
}
