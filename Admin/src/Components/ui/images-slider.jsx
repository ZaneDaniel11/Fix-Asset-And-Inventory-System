"use client"

import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { useEffect, useState, useCallback } from "react"

export const ImagesSlider = ({
  images,
  children,
  overlay = true,
  overlayClassName,
  className,
  autoplay = true,
  direction = "up",
  autoplayInterval = 5000,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(false)
  const [loadedImages, setLoadedImages] = useState([])

  const handleNext = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1 === images.length ? 0 : prevIndex + 1))
  }, [images.length])

  const handlePrevious = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 < 0 ? images.length - 1 : prevIndex - 1))
  }, [images.length])

  useEffect(() => {
    loadImages()
  }, [images])

  const loadImages = () => {
    setLoading(true)
    const loadPromises = images.map((image) => {
      return new Promise((resolve, reject) => {
        const img = new Image()
        img.crossOrigin = "anonymous"
        img.src = image
        img.onload = () => resolve(image)
        img.onerror = () => reject(`Failed to load ${image}`)
      })
    })

    Promise.allSettled(loadPromises).then((results) => {
      const successful = results
        .filter((r) => r.status === "fulfilled")
        .map((r) => r.value)

      setLoadedImages(successful)
      setLoading(false)

      const failed = results.filter((r) => r.status === "rejected")
      if (failed.length > 0) {
        console.warn("Some images failed to load:", failed.map((f) => f.reason))
      }
    })
  }

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "ArrowRight") {
        handleNext()
      } else if (event.key === "ArrowLeft") {
        handlePrevious()
      }
    }

    window.addEventListener("keydown", handleKeyDown)

    let interval
    if (autoplay && loadedImages.length > 1) {
      interval = setInterval(() => {
        handleNext()
      }, autoplayInterval)
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      if (interval) clearInterval(interval)
    }
  }, [autoplay, autoplayInterval, handleNext, handlePrevious, loadedImages.length])

  const slideVariants = {
    initial: {
      opacity: 0,
      scale: 1.05,
      zIndex: 1,
    },
    visible: {
      opacity: 1,
      scale: 1,
      zIndex: 2,
      transition: {
        duration: 1.2,
        ease: [0.25, 0.46, 0.45, 0.94],
        opacity: { duration: 1.0 },
        scale: { duration: 1.2 },
      },
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      zIndex: 1,
      transition: {
        duration: 1.0,
        ease: [0.55, 0.085, 0.68, 0.53],
        opacity: { duration: 0.8 },
        scale: { duration: 1.0 },
      },
    },
  }

  const areImagesLoaded = loadedImages.length > 0

  if (loading) {
    return (
      <div
        className={cn("overflow-hidden h-full w-full relative flex items-center justify-center bg-gray-100", className)}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full"
        />
      </div>
    )
  }

  return (
    <div className={cn("overflow-hidden h-full w-full relative flex items-center justify-center", className)}>
      {areImagesLoaded && children}
      {areImagesLoaded && overlay && (
        <motion.div
          className={cn("absolute inset-0 bg-black/60 z-40", overlayClassName)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        />
      )}
      {areImagesLoaded && (
        <AnimatePresence mode="wait">
          <motion.img
            key={currentIndex}
            src={loadedImages[currentIndex]}
            initial="initial"
            animate="visible"
            exit="exit"
            variants={slideVariants}
            className="image h-full w-full absolute inset-0 object-cover object-center"
            alt={`Slide ${currentIndex + 1}`}
          />
        </AnimatePresence>
      )}

      {areImagesLoaded && loadedImages.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-50">
          {loadedImages.map((_, index) => (
            <motion.button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-300",
                index === currentIndex ? "bg-white" : "bg-white/50"
              )}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
