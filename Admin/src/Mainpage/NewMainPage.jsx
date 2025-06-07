"use client"

import { ImagesSlider } from "../Components/ui/images-slider"
import { motion } from "framer-motion"
import { AppleCardsCarousel } from "../Components/ui/apple-cards-carousel"
import z1 from "./photo/Z1.jpg"

export default function HomeSection() {
  const images = [z1, z1, z1]

  // Sample data for the Apple Cards Carousel
  const cards = [
    {
      category: "Product",
      title: "You can do more with AI.",
      src: "/placeholder.svg?height=500&width=500",
      content: (
        <div className="bg-[#F5F5F7] dark:bg-neutral-800 p-8 md:p-14 rounded-3xl mb-4">
          <p className="text-neutral-600 dark:text-neutral-400 text-base md:text-2xl font-sans max-w-3xl mx-auto">
            <span className="font-bold text-neutral-700 dark:text-neutral-200">
              The first rule of Apple club is that you boast about Apple club.
            </span>{" "}
            Keep a journal, quickly jot down a grocery list, and take amazing class notes. Want to convert those notes
            to text? No problem. Langotiya jeetu ka mara hua yaar is ready to capture every thought.
          </p>
        </div>
      ),
    },
    {
      category: "iOS",
      title: "Photography just got better.",
      src: "/placeholder.svg?height=500&width=500",
      content: (
        <div className="bg-[#F5F5F7] dark:bg-neutral-800 p-8 md:p-14 rounded-3xl mb-4">
          <p className="text-neutral-600 dark:text-neutral-400 text-base md:text-2xl font-sans max-w-3xl mx-auto">
            <span className="font-bold text-neutral-700 dark:text-neutral-200">
              With iOS 18, your photos are more organized than ever.
            </span>{" "}
            Advanced machine learning helps you find exactly what you're looking for in your photo library.
          </p>
        </div>
      ),
    },
    {
      category: "Hiring",
      title: "Hiring for a Staff Software Engineer",
      src: "/placeholder.svg?height=500&width=500",
      content: (
        <div className="bg-[#F5F5F7] dark:bg-neutral-800 p-8 md:p-14 rounded-3xl mb-4">
          <p className="text-neutral-600 dark:text-neutral-400 text-base md:text-2xl font-sans max-w-3xl mx-auto">
            <span className="font-bold text-neutral-700 dark:text-neutral-200">
              We're looking for a Staff Software Engineer to join our team.
            </span>{" "}
            You'll be working on cutting-edge technology and helping shape the future of our products.
          </p>
        </div>
      ),
    },
    {
      category: "Product",
      title: "Launching the new Apple Watch",
      src: "/placeholder.svg?height=500&width=500",
      content: (
        <div className="bg-[#F5F5F7] dark:bg-neutral-800 p-8 md:p-14 rounded-3xl mb-4">
          <p className="text-neutral-600 dark:text-neutral-400 text-base md:text-2xl font-sans max-w-3xl mx-auto">
            <span className="font-bold text-neutral-700 dark:text-neutral-200">
              The most personal device we've ever made.
            </span>{" "}
            Track your health, stay connected, and express your style with the new Apple Watch Series.
          </p>
        </div>
      ),
    },
    {
      category: "iOS",
      title: "Maps for your iPhone 15 Pro Max.",
      src: "/placeholder.svg?height=500&width=500",
      content: (
        <div className="bg-[#F5F5F7] dark:bg-neutral-800 p-8 md:p-14 rounded-3xl mb-4">
          <p className="text-neutral-600 dark:text-neutral-400 text-base md:text-2xl font-sans max-w-3xl mx-auto">
            <span className="font-bold text-neutral-700 dark:text-neutral-200">Get directions like never before.</span>{" "}
            With enhanced 3D maps and real-time traffic updates, navigation has never been more intuitive.
          </p>
        </div>
      ),
    },
    {
      category: "iOS",
      title: "Safari has privacy features.",
      src: "/placeholder.svg?height=500&width=500",
      content: (
        <div className="bg-[#F5F5F7] dark:bg-neutral-800 p-8 md:p-14 rounded-3xl mb-4">
          <p className="text-neutral-600 dark:text-neutral-400 text-base md:text-2xl font-sans max-w-3xl mx-auto">
            <span className="font-bold text-neutral-700 dark:text-neutral-200">Privacy that's actually private.</span>{" "}
            Safari prevents trackers from building a profile of you based on your browsing habits.
          </p>
        </div>
      ),
    },
  ]

  return (
    <div className="w-full">
      {/* Image Slider Section */}
      <div className="h-screen w-full relative">
        {/* ✅ Navbar */}
        <nav className="absolute top-0 left-0 w-full z-50 px-6 py-4 flex items-center justify-between backdrop-blur-md bg-black/30">
          {/* Left: Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="text-white font-bold text-xl"
          >
            MyLogo
          </motion.div>

          {/* Right: Login Button */}
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-white border border-white px-4 py-1 rounded-full hover:bg-white hover:text-black transition"
          >
            Login
          </motion.button>
        </nav>

        {/* ✅ Image Slider */}
        <ImagesSlider images={images} direction="up" autoplay={true} autoplayInterval={4000} className="h-full">
          <motion.div
            initial={{ opacity: 0, y: -80 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="z-50 flex flex-col justify-center items-center"
          >
            <motion.p
              className="font-bold text-xl md:text-6xl text-center bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400 py-4"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Beautiful Image Slider
            </motion.p>
            <motion.p
              className="font-normal text-base md:text-lg text-neutral-300 max-w-lg text-center mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              Experience smooth transitions and beautiful animations with this enhanced fade transition slider.
            </motion.p>
          </motion.div>
        </ImagesSlider>
      </div>

      {/* Apple Cards Carousel Section */}
      <div className="w-full py-20">
        <h2 className="max-w-7xl pl-4 mx-auto text-xl md:text-5xl font-bold text-neutral-800 dark:text-neutral-200 font-sans">
          Get to know your iSO 18 experience.
        </h2>
        <AppleCardsCarousel items={cards} />
      </div>
    </div>
  )
}
